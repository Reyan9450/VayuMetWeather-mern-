## Quick orientation

This repository contains a small Node/Express backend that uses Mongoose to talk to MongoDB. The code is organized by responsibility:

- `index.js` — app entrypoint (sets up Express, connects DB via `config/db.js`).
- `config/` — persistent configuration; `config/db.js` connects using `process.env.MONGO_URI`.
- `controllers/` — HTTP handler logic (one file per resource, e.g. `metar.controller.js`).
- `routes/` — Express Router files. Mount these in `index.js` (not yet wired).
- `models/` — Mongoose schemas (e.g. `metar.model.js`).
- `service/` — background or external integration code (e.g. `weatherFetcher.js`).
- `scripts/` — one-off scripts (eg `seedDatabase.js`).

Treat Frontend as a separate folder; this file focuses on `Backend/`.

## Big-picture architecture & data flow

- External weather data is fetched by code in `service/weatherFetcher.js` and persisted using models under `models/`.
- Controllers mediate between HTTP requests and models/services. Typical flow:
  1. Route -> controller (in `routes/` -> `controllers/`)
  2. Controller may call a service (e.g. `weatherFetcher`) or model methods
  3. Models (Mongoose) read/write MongoDB via the connection in `config/db.js`

Example: when implementing METAR endpoints, add routes in `routes/metar.routes.js`, handler logic in `controllers/metar.controller.js`, and persist to `models/metar.model.js`.

## Developer workflows (concrete commands)

- Install dependencies (run from `Backend/`):

```powershell
cd Backend
npm install
```

- Start server (development):

```powershell
# either
npx nodemon index.js
# or
node index.js
```

- Environment: the server expects `MONGO_URI` (and optionally `PORT`) in environment or `.env` at the `Backend/` root. `config/db.js` calls `mongoose.connect(process.env.MONGO_URI)` and will exit on error.

- Tests: there are no test scripts yet; `package.json` has a placeholder for `test`.

## Project-specific conventions & patterns

- File responsibility: one resource -> one controller + one route + one model. Follow existing names: `metar.*`, `taf.*`, `sigmet.*`, `airport.*`.
- Route mounting is currently not present in `index.js`. When adding a new resource, register it like:

```js
// index.js (example)
app.use('/api/metar', require('./routes/metar.routes'));
```

- Controllers should export functions that accept `(req, res)` and handle JSON responses. `index.js` already uses `app.use(express.json())`.
- Use `async/await` for DB and service calls and return JSON with proper status codes. If `config/db.js` throws, the process exits (so catch errors in controllers and services to avoid crashing on recoverable errors).

## Integration points & external dependencies

- MongoDB: `mongoose` (see `config/db.js`). Provide `MONGO_URI` pointing to your DB (Atlas/local).
- dotenv: loaded in `index.js` and `config/db.js`—use a `.env` file for local development.
- External weather APIs: expected to be implemented inside `service/weatherFetcher.js` (file exists but is currently empty). Controllers likely call this service to fetch and persist live data.

## When editing the codebase (advice for an AI agent)

- Keep changes localized: add new route/controller/model files rather than modifying unrelated resources.
- When adding routes, update `index.js` to mount them. Keep routes under `routes/` and export an Express Router.
- Seed data should live in `scripts/seedDatabase.js` and can be executed as `node scripts/seedDatabase.js` from `Backend/`.

## Useful file examples to inspect

- `index.js` — app bootstrap and middleware
- `config/db.js` — MongoDB connect behaviour (exits on error)
- `package.json` — dependencies: express, mongoose, dotenv, cors; devDependency `nodemon`

## Do-not-touch / caution

- `config/db.js` calls `process.exit(1)` on connection errors—avoid editing that behavior unless you account for restart/retry.
- There are empty files (`service/weatherFetcher.js`, controllers, some routes and models). Look for intended behavior in naming (e.g., `metar.*`) and wire them consistently.

## Quick checklist for new API work

1. Add/extend model in `models/`.
2. Add controller in `controllers/` (use async/await and explicit JSON responses).
3. Add router in `routes/` and export Router.
4. Mount router in `index.js`.
5. If external API needed, implement in `service/` and unit-test it locally.

---

If any of these sections are unclear or you'd like me to include examples (route file template, controller template, or a `start` script for `package.json`), tell me which one and I will update this file.
