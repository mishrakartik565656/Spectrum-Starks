# CleanCity

Smart Waste Management web platform for cities, colleges, and residential societies.

## Features & Problem Solving

1. **Overflowing bins**: Handled by the background bin fill simulator and real-time WebSocket alerts to the admin panel.
2. **Missed or delayed collection**: Tracked through the complaint lifecycle and SLA monitoring.
3. **Poor waste segregation**: Addressed via the Claude AI category suggestion when uploading a photo.
4. **No central place to report**: The unified Citizen App with a 3-step Quick Report wizard.
5. **No consolidated data**: The Admin Panel provides live KPIs, map clusters, and a searchable complaints table.
6. **Low citizen awareness**: Addressed by the Awareness Hub (stubbed in routing) and eco-points.

## Architecture Summary

- **Frontend**: Vanilla HTML/CSS/JS (no framework) utilizing modern CSS (custom properties, fluid typography) and native Web Components (`<cc-button>`, `<cc-card>`, `<cc-input>`). Contains an offline-capable Service Worker (stubbed IndexedDB sync).
- **Backend**: Hono running on Bun.
- **Database**: PostgreSQL with PostGIS (via Docker Compose) and Drizzle ORM.
- **Real-time**: Bun's native WebSocket (`hono/bun`) for pushing bin overflow alerts and new complaints.
- **AI**: Integration with Anthropic Claude API for image-based waste classification.

## Setup Instructions

1. Clone the repository.
2. Ensure you have [Bun](https://bun.sh/) and Docker installed.
3. Start the database and storage services:
   ```bash
   docker compose up -d
   ```
4. Install dependencies:
   ```bash
   cd server
   bun install
   ```
5. Configure environment variables in `server/.env` (copy from `.env.example`):
   - Add your `GOOGLE_MAPS_API_KEY`
   - Add your `ANTHROPIC_API_KEY`
6. Run database migrations and seed data:
   ```bash
   bun run db:push
   bun run seed
   ```
7. Start the dev server:
   ```bash
   bun run dev
   ```
8. Open your browser to `http://localhost:3000`.

## Demo Credentials

- **Admin**: `admin@cleancity.com` / `password`
- **Supervisor**: `supervisor@cleancity.com` / `password`
- **Worker**: `worker1@cleancity.com` / `password`
- **Citizen**: `citizen1@cleancity.com` / `password`

(You can also use the handy demo chips on the login screen!)