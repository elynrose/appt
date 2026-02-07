import Fastify from 'fastify';
import fastifyFormBody from '@fastify/formbody';
import fastifyWs from '@fastify/websocket';
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents/realtime';
import { TwilioRealtimeTransportLayer } from '@openai/agents-extensions';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import z from 'zod';
import { Buffer } from 'buffer';

/*
 * Backend entry point for the agentic appointment scheduling application.
 *
 * This server hosts three endpoints:
 *   1.  `POST/GET /voice` — Twilio voice webhook that returns TwiML containing a media stream.
 *   2.  `WS /twilio-media` — WebSocket endpoint that bridges Twilio’s media stream to OpenAI’s Realtime API.
 *   3.  `POST /integrations/twilio/validate` — Validate Twilio credentials on behalf of a premium customer.
 *
 * See README.md for a high level overview.  Throughout this file you’ll find
 * inline comments and TODOs for further enhancements.
 */

// Load environment variables
dotenv.config();

// Initialise Firebase Admin SDK
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!serviceAccountBase64) {
  console.warn('Warning: FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Firestore writes will fail.');
}
let adminCredential;
try {
  const jsonString = Buffer.from(serviceAccountBase64 || '', 'base64').toString('utf8');
  adminCredential = JSON.parse(jsonString);
} catch (err) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', err);
  adminCredential = null;
}

if (adminCredential) {
  initializeApp({ credential: cert(adminCredential) });
}
const db = adminCredential ? getFirestore() : null;

/**
 * Retrieve Twilio credentials for a premium business from environment variables.
 * Each premium business should have an env variable named `TWILIO_BUSINESS_<BUSINESS_ID>`
 * containing a JSON string with `accountSid`, `authToken` and `phoneNumber`.
 *
 * @param {string} businessId
 * @returns {object|null}
 */
function getTwilioConfig(businessId) {
  const varName = `TWILIO_BUSINESS_${businessId}`;
  const raw = process.env[varName];
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error parsing Twilio config for', businessId, err);
    return null;
  }
}

/**
 * Resolve a businessId for a “basic” plan call by looking up the destination number
 * in the `/phoneRoutes/{toNumber}` collection.  Returns null if not found.
 *
 * @param {string} toNumber
 * @returns {Promise<string|null>}
 */
async function resolveBusinessId(toNumber) {
  if (!db) return null;
  const doc = await db.collection('phoneRoutes').doc(toNumber).get();
  return doc.exists ? doc.data().businessId : null;
}

/**
 * Construct a new RealtimeAgent for a given business.  The tool defined here
 * writes appointments into Firestore and can access the outer `businessId` and
 * `callSid` via closure.  If Firestore is not initialised the tool will throw.
 *
 * @param {string} businessId
 * @param {string} callSid
 */
function createAgent(businessId, callSid) {
  // Define the appointment scheduling tool.  zod provides runtime validation
  // similar to the example in Twilio’s tutorial【671551374085659†L952-L974】.
  const createAppointmentTool = tool({
    name: 'create_appointment',
    description: 'Create an appointment in Firestore for the caller with the specified details.',
    // Input schema validated at runtime.  Add fields as required.
    parameters: z.object({
      name: z.string().describe('Name of the customer scheduling the appointment'),
      phone: z.string().optional().describe('Phone number of the customer'),
      email: z.string().optional().describe('Email address of the customer'),
      service: z.string().describe('Name of the service being booked'),
      startTime: z.string().describe('ISO‑8601 start time for the appointment'),
      endTime: z.string().optional().describe('ISO‑8601 end time for the appointment'),
      timezone: z.string().optional().describe('IANA timezone for the appointment'),
      notes: z.string().optional().describe('Additional notes provided by the caller'),
    }),
    /**
     * Execute is called when the model decides to call this tool.  It writes
     * the appointment to Firestore and returns a confirmation string to the
     * model.  Because Firestore writes depend on the Admin SDK, ensure that
     * `db` is initialised before attempting to persist data.
     */
    execute: async (input) => {
      if (!db) {
        throw new Error('Firestore is not initialised');
      }
      const appointmentsRef = db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments');
      const docRef = appointmentsRef.doc();
      const appointment = {
        ...input,
        businessId,
        callSid,
        source: 'twilio_voice',
        status: 'pending_confirmation',
        createdAt: FieldValue.serverTimestamp(),
      };
      await docRef.set(appointment);
      // Return a confirmation message.  The agent will read this back to the caller.
      return `I have saved your appointment for ${input.service} on ${input.startTime}.`;
    },
  });

  // Create the agent with a concise set of instructions.  The instructions
  // emphasise collecting all required details and confirming before calling the
  // tool.  They can be adjusted per business for custom workflows.
  const agent = new RealtimeAgent({
    name: 'Scheduling Assistant',
    instructions:
      'You are a friendly and efficient scheduling assistant. Collect the caller’s name, contact details, the service they want, the desired appointment date and time, and any relevant notes. Confirm the details with the caller before calling the create_appointment tool.',
    tools: [createAppointmentTool],
  });
  return agent;
}

// Create and configure Fastify instance
const fastify = Fastify();
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

/**
 * Twilio Voice webhook.  Responds with TwiML instructing Twilio to connect
 * the caller to a WebSocket media stream.  If a `businessId` query param is
 * supplied the request is considered “premium”; otherwise we resolve the
 * businessId by the called number for “basic” routing.
 */
fastify.all('/voice', async (request, reply) => {
  const callSid = request.body?.CallSid || request.query?.CallSid || '';
  const toNumber = request.body?.To || request.query?.To || '';
  let businessId = request.query?.businessId;
  let plan = 'premium';
  if (!businessId) {
    plan = 'basic';
    businessId = await resolveBusinessId(toNumber);
  }
  if (!businessId) {
    const failure = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say>Sorry, this number is not configured.</Say>\n</Response>`;
    reply.type('text/xml').send(failure);
    return;
  }
  // Provide a simple greeting.  This could be customised per business.
  const greeting = 'Thank you for calling. Please wait while I connect you to our scheduling assistant.';
  const streamUrl = `wss://${request.headers.host}/twilio-media?businessId=${businessId}&callSid=${callSid}&plan=${plan}&to=${encodeURIComponent(
    toNumber,
  )}`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say>${greeting}</Say>\n  <Connect>\n    <Stream url="${streamUrl}" />\n  </Connect>\n</Response>`;
  reply.type('text/xml').send(twiml);
});

/**
 * WebSocket endpoint for Twilio Media Streams.  The query string must include
 * `businessId` and `callSid`.  When a connection is established, this handler
 * creates a RealtimeAgent for the given business and call, and then brokers
 * audio between Twilio and the OpenAI Realtime API using the TwilioRealtimeTransportLayer【671551374085659†L808-L865】.
 */
fastify.get('/twilio-media', { websocket: true }, async (connection, req) => {
  const { businessId, callSid } = req.query;
  if (!businessId || !callSid) {
    connection.socket.close();
    return;
  }
  const agent = createAgent(businessId, callSid);
  try {
    const transport = new TwilioRealtimeTransportLayer({
      twilioWebSocket: connection.socket,
    });
    const session = new RealtimeSession(agent, { transport });
    await session.connect({ apiKey: process.env.OPENAI_API_KEY });
    console.log(`Realtime session started for call ${callSid} (business ${businessId}).`);
  } catch (err) {
    console.error('Realtime session error', err);
    connection.socket.close();
  }
});

/**
 * Validate Twilio credentials.  This endpoint is called by the front end when
 * a premium user submits their Twilio Account SID, Auth Token and phone number.
 * The server uses the Twilio REST API to verify that the phone number belongs to the
 * account.  Actual storage of credentials is deferred to environment variables for
 * security; the response indicates whether validation succeeded.
 */
fastify.post('/integrations/twilio/validate', async (request, reply) => {
  const { businessId, accountSid, authToken, phoneNumber } = request.body || {};
  if (!businessId || !accountSid || !authToken || !phoneNumber) {
    reply.code(400).send({ ok: false, error: 'Missing parameters' });
    return;
  }
  try {
    const client = (await import('twilio')).default(accountSid, authToken);
    const numbers = await client.incomingPhoneNumbers.list({ phoneNumber, limit: 1 });
    if (!numbers || numbers.length === 0) {
      reply.code(400).send({ ok: false, error: 'Phone number not found in account' });
      return;
    }
    reply.send({ ok: true, message: 'Credentials verified. Add them to your backend environment.' });
  } catch (err) {
    console.error(err);
    reply.code(400).send({ ok: false, error: 'Unable to verify credentials' });
  }
});

// Start the server
const PORT = process.env.PORT || 5050;
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Backend listening on ${PORT}`);
});