# Agentic Appointment Scheduling App

This repository contains a proof‑of‑concept implementation of a multi‑tenant appointment scheduling application powered by OpenAI’s Realtime API, Twilio Voice Media Streams and Firebase.  The application is designed for small businesses that want to automate inbound phone calls, collect booking details via a conversational agent and persist the results to Firestore.  A React web interface allows business owners to review calls, manage appointments, configure their services and connect their own Twilio number when on a premium plan.

## Architecture Overview

The application is composed of two major pieces:

1. **Backend (Node.js)** — Hosts webhooks for Twilio, a WebSocket bridge to OpenAI Realtime, and REST endpoints for validating Twilio credentials and performing CRUD operations on calls/appointments.  It uses the [OpenAI Agents SDK](https://platform.openai.com/docs/guides/realtime-agents) to stream audio between Twilio and the model.  When the model calls the `create_appointment` tool it writes the resulting appointment to Firestore using the Firebase Admin SDK【671551374085659†L808-L865】.  All Twilio credentials are stored in environment variables (one per business) rather than persisted in Firestore for security.

2. **Frontend (React)** — Provides a responsive web application that owners and staff use to log in with Firebase Authentication, view calls and appointments for their business, filter and sort call status, and configure their Twilio integration.  The client uses the modular Firebase JS SDK to authenticate users and query Firestore collections.  It also has a settings page that allows premium users to submit their Twilio credentials, which are then validated server‑side and stored securely on the backend.

The data model uses the following Firestore collections:

- `/businesses/{businessId}` — Document describing each business including plan (`basic` or `premium`), default timezone and other metadata.
- `/businesses/{businessId}/calls/{callSid}` — Documents for each inbound call containing caller/recipient numbers, status (`booked`, `needs_follow_up`, `missed`, etc.), timestamps and the structured fields extracted by the agent.
- `/businesses/{businessId}/appointments/{appointmentId}` — Persisted appointments including customer details, service, start and end times, notes and a link to the originating call.
- `/phoneRoutes/{toNumber}` — Simple mapping of Twilio phone numbers to business IDs for “basic” plans.  Premium businesses pass their `businessId` directly in the Media Stream URL.

For a more detailed explanation of the multi‑tenant routing strategy, premium vs. basic plans and Twilio configuration flows see the conversation notes.  This repository includes the skeleton code for these flows; further enhancements such as pagination, caching and comprehensive error handling can be added as needed.

## Running the Backend

1. Install dependencies (requires Node.js 22+):

```sh
cd backend
npm install
```

2. Copy `.env.example` to `.env` and fill in your OpenAI key, Firebase service account JSON (as a base64 string) and any per‑business Twilio credentials.  Each premium business should have its own environment variable named `TWILIO_BUSINESS_<BUSINESS_ID>` containing a JSON object with its `accountSid`, `authToken` and `phoneNumber`.  Example:

```env
OPENAI_API_KEY=sk-...
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64‑encoded serviceAccountKey.json>
TWILIO_BUSINESS_abc123={"accountSid":"AC...","authToken":"...","phoneNumber":"+15551234567"}
```

3. Start the server:

```sh
npm run dev
```

4. Expose your server publicly (e.g. with ngrok) and configure your Twilio phone number’s Voice webhook to point at `/voice`.  For premium businesses, pass the `businessId` as a query parameter, for example: `https://your.ngrok.io/voice?businessId=abc123`.  For basic businesses, simply use `https://your.ngrok.io/voice` and ensure the number is mapped in `/phoneRoutes`.

## Running the Frontend

1. Install dependencies:

```sh
cd frontend
npm install
```

2. Copy `.env.example` to `.env` and fill in your Firebase web app configuration.  These values can be found in the Firebase console under Project Settings.  Example:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

3. Start the development server:

```sh
npm run dev
```

4. Sign in with a Firebase account that has a `businessId` custom claim.  The application will automatically scope all Firestore queries to that business.

## Disclaimer

This project is a simplified prototype designed to illustrate how to stitch together Twilio, OpenAI Realtime, Firebase and a modern web frontend.  It is not production ready and omits many concerns such as rate limiting, message retries, error handling, unit tests and full UI polish.  See the inline TODOs throughout the code for places where you may want to extend functionality.