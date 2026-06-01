# HireMate Interview Bot (Frontend + Backend)

Modern AI-powered interview coaching platform. Frontend built with React + Vite; backend (in `backend/`) provides chat, resume parsing, payment, and session management APIs.

## Monorepo Structure

```
/.gitignore
/.env.example            # Frontend env sample (VITE_*)
/backend/.env.example    # Backend env sample (server secrets)
/backend/server.js       # Express entrypoint
/src                     # Frontend React source (main App)
```

## Prerequisites

- Node.js 18+ (recommended)
- MongoDB (local or Atlas)
- Stripe account (optional if you test payments)
- Groq / OpenAI API key (for AI responses)

## Environment Setup

Frontend variables (copy `.env.example` to `.env` at repo root):

```
VITE_API_BASE_URL=http://localhost:5001/api
```

Backend variables (copy `backend/.env.example` to `backend/.env` and fill):

```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hiremate_db
JWT_SECRET=replace_me
GROQ_API_KEY=your_groq_key
STRIPE_SECRET_KEY=sk_live_or_test
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

Never commit real secrets—only the `.env.example` files are tracked.

## Install Dependencies

Root (frontend):
```bash
npm install
```

Backend:
```bash
cd backend
npm install
```

## Run Development

Backend (port 5001):
```bash
cd backend
npm run dev
```

Frontend (Vite default 5173):
```bash
npm run dev
```

Visit: `http://localhost:5173`

## Build Frontend
```bash
npm run build
```
Artifacts output to `dist/` (ignored by git).

## Git Hygiene

- `.gitignore` excludes `node_modules`, build outputs, logs, uploads, and `.env` files.
- `backend/uploads/.gitkeep` preserves empty uploads directory.
- Add only sanitized examples for env vars.

## Initial Git Push (PowerShell)

Replace `<remote-url>` with your repo (e.g. `https://github.com/youruser/hiremate.git`).

```powershell
git init
git remote add origin <remote-url>
git add .
git commit -m "chore: initial hiremate setup"
git branch -M main
git push -u origin main
```

If repository already initialized online with a different default branch (e.g. `master`), adapt branch name.

## Common Scripts

Frontend:
- `npm run dev` – start Vite
- `npm run build` – production build
- `npm run preview` – preview built site

Backend (in `backend/`):
- `npm run dev` – nodemon server
- `npm start` – production start

## Linting
Run ESLint:
```bash
npm run lint
```

## Next Steps / Improvements
- Add automated tests
- Add Dockerfile & docker-compose
- CI workflow for lint + build
- TypeScript migration for stronger type safety
- Queue-based resume analysis (BullMQ / Redis) for async skill extraction
- Vector store (e.g. Pinecone) to persist conversation & resume embeddings
- Token budgeting: truncate history to last 8 turns (already implemented in controller) and summarize older context
- Observability: add request/AI latency metrics and structured error codes

## Backend Best Practices (Implemented / Planned)
1. Controller-Service Pattern: chat logic moved to `backend/controllers/chatController.js` for testability.
2. Timeouts: `requestTimeout` middleware aborts long requests (default 30s configurable via `REQUEST_TIMEOUT_MS`).
3. AI Resilience: Mock fallbacks when `GROQ_API_KEY` or `STRIPE_SECRET_KEY` are missing let dev environment run without secrets.
4. Streaming: SSE endpoint preserved (`/api/chat/stream`) with timeout guard and graceful fallback to non-stream.
5. Error Consistency: Central error handler + future `ApiError` usage pattern (see `backend/utils/ApiError.js`).
6. Conversation State: History trimming to last 8 messages prevents token bloat while retaining context.
7. Resume Analysis Roadmap: New placeholder endpoints under `/api/resume` for queued PDF skill extraction; existing upload flow unchanged.
8. Security: Helmet CSP, rate limiting (general + auth), file size limits, JWT validation, mock Stripe to avoid runtime crash.
9. Extensibility: Domain + level parameters passed through chat controller for future specialized prompting.
10. Performance: Compression, minimal prompt size, truncated history, selective streaming, early keyword gating for non-interview queries.

## Scalability Suggestions
- Use Redis for: rate limit persistence, job queue (BullMQ), session state caching.
- Externalize prompt templates into a `prompts/` directory with versioning.
- Add OpenTelemetry tracing for AI call latency and token usage distribution.
- Introduce circuit breaker (e.g. `opossum`) around external AI provider.
- Maintain a rolling summary of conversation beyond 8 turns to further compress context.

## Token Optimization Tips
- Track tokens per request; if > threshold (e.g. 3K), summarize oldest messages into a single system note.
- Prefer short system prompt variants for routine technical Q&A vs full interview guidance.
- Cache classification results for interview-related gating (avoid repeated model calls for similar queries).

## Conversation State Strategy
Structure (example):
```json
{
	"phase": "interview",
	"selectedDomain": "frontend",
	"selectedLevel": "mid",
	"history": [ { "role": "user", "content": "Question..." } ],
	"summary": "<compressed older turns>"
}
```
Rotate older messages into `summary` when history length > 12.


## Backend Architecture & Best Practices (Added)

### Chat Flow Enhancements
Refactored into controller (`backend/controllers/chatController.js`) + services for:
- Interview-only gating (rejects unrelated queries politely)
- Concise, human-like answers with adaptive length
- Conversation history trimming (last 8 messages, per-message length cap for token savings)
- SSE streaming kept compatible with previous frontend
- Timeouts (`withTimeout`) & global request timeout middleware (`requestTimeout.js`)

### Error Handling
- Central `ApiError` class for structured errors
- `asyncHandler` wrapper removes repetitive try/catch
- Global error handler in `server.js` still active
- Mock fallbacks: AI (when `GROQ_API_KEY` missing), Stripe (when `STRIPE_SECRET_KEY` missing) to avoid local crashes

### Resume Analysis Future Endpoint
- New placeholder endpoints under `/api/resume` (`resumeController.js` & `routes/resume.js`) with queued job stub.
- Existing upload route (`/api/interview/upload-resume`) untouched.

### Token & Cost Optimization Strategies
- Keep system prompt minimal and focused; avoid large preambles
- Limit history depth & truncate long messages
- Use lower `temperature` for deterministic technical/HR answers
- Adjust `max_tokens` dynamically by question length (see controller)

### Scalability Recommendations
- Introduce a queue (BullMQ / Redis) for heavy resume parsing + batch AI tasks
- Cache classification results for repeated interview-related queries
- Add rate limits per user for AI-heavy endpoints beyond global IP limits
- Separate AI calls behind a service that can round-robin multiple provider keys

### Conversation State Persistence
- Short-term: client supplies history in request body
- Future: Persist minimal structured transcript (role, text, ts) in Redis keyed by session/user
- Consider summarization after N turns to keep token usage flat

### Security & Reliability
- Stripe guarded by environment presence; mock prevents accidental key leakage
- Request timeout kills hung AI calls (default 30s; configurable via `REQUEST_TIMEOUT_MS`)
- Input validation to be expanded (recommend Joi schemas for chat/resume endpoints)

### Suggested Future Tasks
- Add unit tests for controllers (Jest)
- Add integration test for `/api/chat/ask` with history
- Implement health sub-endpoint for AI provider latency metrics
- Add `X-Request-ID` and structured request logging for tracing
- Introduce circuit breaker for AI provider downtime

### Monitoring & Metrics (Future)
- Track tokens/latency per model usage
- Store classification decisions for audit
- Alert on sustained timeout rates or error spikes

---

## License
ISC (see backend for details). Update if you change distribution terms.

# Interwiew Chat Bot (Repository Footer)
