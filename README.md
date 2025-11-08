# PawPal

A service-oriented architecture (SOA) practice project — pet product and service management system.

## Purpose of this file

A quick guide to installing and running the entire application (client + server) on Windows (PowerShell). The README focuses on the installation and running steps and some common notes/self-checks.

## Prerequisites

- Node.js (v16+ recommended) and npm
- MongoDB (run locally or the connection URL can be set via environment variable)
- Local network for default ports (5173 for client, 5000..5003 for server microservices)

## Main structure

- `client/` — React (Vite) front-end
- `server/` — Node.js gateway + multiple workspace services

## Install dependencies

Open PowerShell in the project root directory (`PawPal`) and run in order:

```powershell
# 1) Install dependencies for root
npm run install

# 2) Install more on client
cd .\client
npm install

# Return to root
cd ..
```

Note: there are some scripts in the root `package.json` that use `concurrently` to run multiple commands simultaneously. If you like, you can use the built-in script to run both client and server (see the run section below).

## Setting environment variables (optional)

The server reads environment variables from `server/.env` (if present). Some variables that are often needed or may want to be configured:

- `JWT_SECRET` — secret for JSON Web Token
- `BLOB_READ_WRITE_TOKEN` — (if using blob storage)
- `GATEWAY_PORT` — port for gateway (default: 5000)
- `INDENTITY_PORT`, `USER_PORT`, `SHOPPING_PORT` — port for each service (default: 5001, 5002, 5003)
- `MONGO_INDENTITY_URI`, `MONGO_USER_URI`, `MONGO_SHOPPING_URI` — connection strings to MongoDB (by default the project uses mongodb://localhost:27017/...)

You can create a `server/.env` file and set the corresponding values. If there is no `.env`, the default values ​​in `server/configs/config.js` will be used.

## Run the application

You have 2 options: (A) run both client + server simultaneously from root, or (B) run each part separately for debugging.

1. Run both (existing script)

```powershell
# In root directory
npm run web
```

Script `web` (defined in root `package.json`) uses `concurrently` to:

- run `cd server && npm run start:all` (enable gateway + all services)
- run `cd client && npm run dev` (enable Vite dev server)

2. Run each part separately (good for debugging)

Server (microservices) — open a new terminal for the server:

```powershell
cd .\server
npm run start:all
```

Client (React / Vite) — open another terminal:

```powershell
cd .\client
npm run dev
```

After both run, the front-end will usually run at `http://localhost:5173` (according to Vite configuration). The default gateway listens to `http://localhost:5000`.

## Quick Check / Troubleshooting

- If the front-end fails to connect to the API: check if the gateway and microservices are running.

- If MongoDB fails to connect: check if the MongoDB service is started and `MONGO_*_URI` in `.env` if you use a custom URI.

- Port conflict: change the environment variables (`GATEWAY_PORT`, `INDENTITY_PORT`, `USER_PORT`, `SHOPPING_PORT`) in `server/.env`.

- If you get a missing package error when running `npm run web`, manually run `npm install` in each directory (`.`, `client`, `server`) and try again.

## Useful scripts (summary)

- `npm install` — install dependencies for root (with workspaces, install workspace packages)
- `npm run web` — run client + server simultaneously (original script uses `concurrently`)
- `cd client && npm run dev` — run Vite dev server
- `cd server && npm run start:all` — run gateway and services (script `start:all` in `server/package.json`)
