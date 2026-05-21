# Cravings

AI-powered restaurant discovery app. Describe what you're craving in plain English and get back a ranked list of restaurant recommendations tailored to your mood.

## Team Members

| Name | Role | Primary Contributions |
|------|------|----------------------|
| Hector Nunez | Backend & AI integration | Built the `cravings_api` server, ShapeShyft AI integration, and search route |
| Roshaun Gregory | HTTP client SDK & Map view | Built the search SDK (`cravings_client`, `cravings_lib`), map view with geocoding, and UI/UX redesign |
| Ronnie Ferrufino | Frontend & State management | Built the initial search page UI, navigation, and `cravings_lib` state management |

**Sponsor:** John Huang

## Technology Stack

| Technology | Version |
|------------|---------|
| Runtime | Bun 1.3.9 |
| Backend framework | Hono 4.7 |
| Frontend framework | React 19 |
| Build tool | Vite 6 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router 7.13 |
| Data fetching | TanStack Query 5.90 |
| State management | Zustand (via `cravings_lib`) |
| Maps | @vis.gl/react-google-maps 1.8 |
| i18n | i18next 25 |
| AI Search | ShapeShyft (GPT-4o-mini) |
| CI/CD | GitHub Actions (npm publish) |

## Prerequisites

- [Bun](https://bun.sh) installed (v1.3.9 or later)
- A ShapeShyft API key — [api.shapeshyft.ai](https://api.shapeshyft.ai)
- A Google Maps API key — enable Maps JavaScript API in [Google Cloud Console](https://console.cloud.google.com)
- A Firebase project with Authentication enabled

## Installation

Clone both repos:

```bash
git clone https://github.com/sudobility-usf/cravings_api.git
git clone https://github.com/sudobility-usf/cravings_app.git
```

Install dependencies:

```bash
cd cravings_api && bun install
cd ../cravings_app && bun install
```

Set up environment variables:

```bash
# cravings_api
cd cravings_api
cp .env.example .env
# Fill in SHAPESHYFT_API_KEY, DATABASE_URL, and Firebase credentials

# cravings_app
cd ../cravings_app
cp .env.example .env
# Fill in VITE_GOOGLE_MAPS_API_KEY and VITE_FIREBASE_* credentials
```

## Build & Run

Open two terminals:

```bash
# Terminal 1 — API server (port 8023)
cd cravings_api && bun run dev

# Terminal 2 — Web app (port 5129)
cd cravings_app && bun run dev
```

Open [http://localhost:5129](http://localhost:5129) in your browser.

**When running correctly:**
- The Cravings home page loads at http://localhost:5129
- Entering a location and dish on the Search page returns a list of restaurant results
- Toggling to Map view plots results as pins on the map
- The API health check responds at http://localhost:8023/health

**Run tests (cravings_api only):**

```bash
cd cravings_api && bun test
```

**Other commands:**

```bash
bun run build       # Production build
bun run lint        # ESLint
bun run typecheck   # TypeScript check
bun run verify      # All checks + build
```

## Deployment

No live deployment. Runs locally following the instructions above.

For production: deploy `cravings_api` to any Bun-compatible host (Railway, Fly.io) and `cravings_app` as a static Vite build (Vercel, Netlify). Update `VITE_API_URL` in `cravings_app/.env` to point to the deployed API URL.

## Usage

1. Open the app and go to the **Search** page
2. Enter your location and what you're craving — e.g. "ramen" or "pizza"
3. Results appear as ranked cards with name, address, and distance
4. Use **Sort** controls to reorder by distance or name
5. Toggle **Map view** to see results plotted on Google Maps
6. Click **Open in Google Maps** on any card or pin for directions
7. View past searches in the **Histories** page

## Repository Structure

| Repo | Description |
|------|-------------|
| [cravings_api](https://github.com/sudobility-usf/cravings_api) | Hono/Bun backend API server |
| [cravings_app](https://github.com/sudobility-usf/cravings_app) | React/Vite web frontend |
| [cravings_client](https://github.com/sudobility-usf/cravings_client) | HTTP client SDK with TanStack Query hooks |
| [cravings_lib](https://github.com/sudobility-usf/cravings_lib) | Business logic and Zustand state management |
| [cravings_types](https://github.com/sudobility-usf/cravings_types) | Shared TypeScript type definitions |

## License

BUSL-1.1
