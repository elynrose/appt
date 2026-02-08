import Fastify from 'fastify';
import fastifyFormBody from '@fastify/formbody';
import fastifyCors from '@fastify/cors';
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents/realtime';
import { TwilioRealtimeTransportLayer } from '@openai/agents-extensions';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { WebSocketServer } from 'ws';
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
const adminAuth = adminCredential ? getAuth() : null;

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
      'You are a friendly and efficient scheduling assistant. Start every call by asking which language the caller prefers to speak. After they choose a language, continue the rest of the conversation in that language. Collect the caller’s name, contact details, the service they want, the desired appointment date and time, and any relevant notes. Confirm the details with the caller before calling the create_appointment tool.',
    tools: [createAppointmentTool],
  });
  return agent;
}

// Create and configure Fastify instance
const fastify = Fastify();

fastify.register(fastifyCors, {
  origin: true, // Allow all origins in development
  credentials: true,
});
fastify.register(fastifyFormBody);

// Dedicated WebSocket server for Twilio Media Streams to ensure a clean 101 upgrade.
const wss = new WebSocketServer({ noServer: true, maxPayload: 1048576 });

/**
 * Twilio Voice webhook.  Responds with TwiML instructing Twilio to connect
 * the caller to a WebSocket media stream.  If a `businessId` query param is
 * supplied the request is considered “premium”; otherwise we resolve the
 * businessId by the called number for “basic” routing.
 */
fastify.all('/voice', async (request, reply) => {
  try {
    // Log raw request for debugging
    console.log(`[Voice Webhook] Raw request - Method: ${request.method}, URL: ${request.url}`);
    console.log(`[Voice Webhook] Raw body:`, JSON.stringify(request.body));
    console.log(`[Voice Webhook] Raw query:`, JSON.stringify(request.query));
    console.log(`[Voice Webhook] Content-Type:`, request.headers['content-type']);
    
    // Twilio sends form-encoded data in the body
    // The form body parser should have parsed it into request.body
    // Access the fields directly from the parsed body
    const callSid = request.body?.CallSid || request.query?.CallSid || '';
    const toNumber = request.body?.To || request.query?.To || '';
    const fromNumber = request.body?.From || '';
    let businessId = request.query?.businessId || request.body?.businessId;
    let plan = 'premium';
    
    console.log(`[Voice Webhook] Parsed - CallSid: ${callSid}, To: ${toNumber}, From: ${fromNumber}, businessId param: ${businessId}`);
    
    // Debug: Log body keys to see what's available
    if (request.body && typeof request.body === 'object') {
      console.log(`[Voice Webhook] Body keys:`, Object.keys(request.body));
    }
    
    if (!businessId) {
      plan = 'basic';
      if (toNumber) {
        businessId = await resolveBusinessId(toNumber);
        console.log(`[Voice Webhook] Resolved businessId for basic plan: ${businessId}`);
      } else {
        console.warn(`[Voice Webhook] No To number provided, cannot resolve businessId for basic plan`);
      }
    }
    
    if (!businessId) {
      console.error(`[Voice Webhook] No businessId found. To: ${toNumber}, Query businessId: ${request.query?.businessId}`);
      const failure = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say>Sorry, this number is not configured.</Say>\n</Response>`;
      reply.type('text/xml').send(failure);
      return;
    }
    
    // Ensure we have CallSid and To (should be in body from Twilio)
    const finalCallSid = callSid || `CA${Date.now()}`;
    const finalToNumber = toNumber || request.body?.Called || '';

    // Persist the call record for the business (if Firestore is available)
    if (db) {
      try {
        await db
          .collection('businesses')
          .doc(businessId)
          .collection('calls')
          .doc(finalCallSid)
          .set(
            {
              callSid: finalCallSid,
              businessId,
              from: fromNumber || null,
              to: finalToNumber || null,
              status: request.body?.CallStatus || 'ringing',
              plan,
              source: 'twilio_voice',
              startedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
      } catch (err) {
        console.error('[Voice Webhook] Failed to persist call record:', err);
      }
    } else {
      console.warn('[Voice Webhook] Firestore not initialised; skipping call persistence.');
    }
    
    // Provide a simple greeting.  This could be customised per business.
    const greeting = 'Thank you for calling. Please wait while I connect you to our scheduling assistant.';
    
    // Get the public URL from environment or use the request host
    // For ngrok, use the public URL; for local dev, use request host
    const publicUrl = process.env.PUBLIC_URL || `https://${request.headers.host}`;
    const streamPath = `/twilio-media/${encodeURIComponent(businessId)}/${encodeURIComponent(
      finalCallSid,
    )}`;
    const streamUrl = `${publicUrl.replace('https://', 'wss://').replace('http://', 'ws://')}${streamPath}?plan=${plan}&to=${encodeURIComponent(
      finalToNumber,
    )}`;
    
    console.log(`[Voice Webhook] Call ${finalCallSid} from ${fromNumber} to ${finalToNumber}, business: ${businessId}, plan: ${plan}`);
    console.log(`[Voice Webhook] PUBLIC_URL env: ${process.env.PUBLIC_URL || 'NOT SET'}`);
    console.log(`[Voice Webhook] Request host: ${request.headers.host}`);
    console.log(`[Voice Webhook] Stream URL: ${streamUrl}`);
    
    const xmlEscape = (value) =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say>${xmlEscape(
      greeting,
    )}</Say>\n  <Connect>\n    <Stream url="${xmlEscape(
      streamUrl,
    )}" />\n  </Connect>\n</Response>`;
    reply.type('text/xml').send(twiml);
  } catch (err) {
    console.error('[Voice Webhook] Error processing webhook:', err);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say>We're sorry, an error occurred. Please try again later.</Say>\n</Response>`;
    reply.type('text/xml').send(errorTwiml);
  }
});

/**
 * WebSocket endpoint for Twilio Media Streams. The query string must include
 * `businessId` and `callSid`. We handle the HTTP upgrade directly to avoid
 * proxy-related handshake issues and then pass the ws instance to the
 * TwilioRealtimeTransportLayer.
 */
wss.on('connection', async (ws, req) => {
  const parsedUrl = new URL(req.url, 'http://localhost');
  const { pathname, searchParams } = parsedUrl;
  let businessId = searchParams.get('businessId');
  let callSid = searchParams.get('callSid');

  if (!businessId || !callSid) {
    const match = pathname.match(/^\/twilio-media\/([^/]+)\/([^/]+)$/);
    if (match) {
      businessId = decodeURIComponent(match[1]);
      callSid = decodeURIComponent(match[2]);
    }
  }

  console.log(`[WebSocket] 🔌 Connection attempt received`);
  console.log(`[WebSocket] Query params - businessId: ${businessId}, callSid: ${callSid}`);
  console.log(`[WebSocket] Headers:`, req.headers);

  ws.on('close', (code, reason) => {
    console.log(`[WebSocket] ❌ Connection closed - code: ${code}, reason: ${reason}`);
  });

  ws.on('error', (err) => {
    console.error(`[WebSocket] ❌ Socket error:`, err);
  });

  if (!businessId || !callSid) {
    console.error(`[WebSocket] Missing required parameters - businessId: ${businessId}, callSid: ${callSid}`);
    ws.close();
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[WebSocket] OPENAI_API_KEY is not set');
    ws.close();
    return;
  }

  const agent = createAgent(businessId, callSid);
  try {
    console.log(`[WebSocket] Creating transport and session for call ${callSid}`);
    const transport = new TwilioRealtimeTransportLayer({
      twilioWebSocket: ws,
    });
    const session = new RealtimeSession(agent, { transport });
    console.log(`[WebSocket] Connecting to OpenAI Realtime API...`);
    await session.connect({ apiKey: process.env.OPENAI_API_KEY });
    let greeted = false;
    transport.on('*', (event) => {
      if (
        !greeted &&
        event.type === 'twilio_message' &&
        event.message?.event === 'start'
      ) {
        greeted = true;
        session.sendMessage('Please greet the caller now.');
      }
    });
    console.log(`[WebSocket] ✅ Realtime session started for call ${callSid} (business ${businessId}).`);
  } catch (err) {
    console.error(`[WebSocket] ❌ Realtime session error for call ${callSid}:`, err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    ws.close();
  }
});

/**
 * Onboarding endpoint. Creates a business and sets the businessId custom claim for the user.
 * Requires a valid Firebase ID token in the Authorization header.
 */
fastify.post('/onboarding', async (request, reply) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ ok: false, error: 'Missing or invalid authorization header' });
    return;
  }

  const idToken = authHeader.substring(7);
  const { businessName, timezone, plan } = request.body || {};

  if (!businessName || !timezone) {
    reply.code(400).send({ ok: false, error: 'Missing required fields: businessName, timezone' });
    return;
  }

  const selectedPlan = plan === 'premium' ? 'premium' : 'basic';

  if (!adminAuth || !db) {
    reply.code(500).send({ ok: false, error: 'Firebase Admin not initialized' });
    return;
  }

  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check if user already has a businessId
    if (decodedToken.businessId) {
      reply.code(400).send({ ok: false, error: 'User already has a businessId' });
      return;
    }

    // Generate a unique business ID
    const businessId = `business-${uid.substring(0, 8)}-${Date.now().toString(36)}`;

    // Create business document
    const businessRef = db.collection('businesses').doc(businessId);
    await businessRef.set({
      name: businessName,
      plan: selectedPlan,
      timezone,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Set custom claim
    await adminAuth.setCustomUserClaims(uid, { businessId });

    reply.send({
      ok: true,
      businessId,
      message: 'Business created successfully. Please sign out and sign in again to refresh your token.',
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    if (err.code === 'auth/argument-error') {
      reply.code(401).send({ ok: false, error: 'Invalid ID token' });
    } else {
      reply.code(500).send({ ok: false, error: err.message || 'Failed to create business' });
    }
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

// Export the Fastify app for testing
export default fastify;

// Start the server (only if not in test mode)
if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  // Listen on PORT env var (set by Render/Railway) or default to 5050
const PORT = process.env.PORT || 5050;
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  if (fastify.server) {
    fastify.server.on('upgrade', (req, socket, head) => {
      try {
        const { pathname } = new URL(req.url, 'http://localhost');
        if (pathname.startsWith('/twilio-media/')) {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
          });
          return;
        }
      } catch (err) {
        console.error('[Upgrade] Failed to parse upgrade URL', err);
      }

      socket.destroy();
    });
  }

  console.log(`Backend listening on ${address}`);
});
}
