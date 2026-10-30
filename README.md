# Promptly — Foundation V5

This is the first development foundation for the approved Promptly V4 design.
The visual design is intentionally preserved; this phase focuses on project structure
and a secure server-side API boundary.

## What's included
- Existing light-theme Promptly website and bold typography.
- Main prompt tools and generator UI from the approved design.
- Same-origin `/api/prompt` serverless endpoint.
- `/api/health` endpoint for deployment checks.
- Server-side AI provider configuration through environment variables.
- `.env.example` template; no real API keys are included.

## Current limitations (important)
- AI is **not active** until `AI_API_KEY` and `AI_MODEL` are configured on the hosting provider.
- Until then, the website falls back to its local structured prompt templates. These are not AI model responses.
- Login / Sign up remains interface-only in this phase. Do not enter real passwords into this prototype.
- Supabase authentication and user history are planned for Phase 2.
- The website copies prompts and opens third-party AI websites; it cannot force text into another app's input box.

## Run locally
1. Install Node.js and the Vercel CLI.
2. Open this project folder in a terminal.
3. Run `npm run dev`.
4. Open the local URL shown by the development server.

## Deploy
1. Create a GitHub repository and upload this project.
2. Import the repository into Vercel.
3. Add `AI_API_KEY` and `AI_MODEL` as server-side Environment Variables only after choosing an AI provider.
4. Redeploy after changing environment variables.

## Development roadmap
- Phase 1: foundation and API boundary (this package).
- Phase 2: Supabase Auth, profiles, protected sessions and user data.
- Phase 3: select and connect an AI provider with a verified free quota, if available.
- Phase 4: complete prompt tools, prompt history and usage controls.
- Phase 5: security review, accessibility and mobile testing.
- Phase 6: launch and monitoring.

## Cost note
Hosting, authentication and AI providers can change their free-tier limits. A permanently free,
unlimited AI API should not be assumed. Check the provider's current terms before enabling usage.
