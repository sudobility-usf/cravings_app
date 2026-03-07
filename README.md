# @sudobility/cravings_app

Web application for the Cravings project. Built with React 19, Vite, Tailwind CSS, and Firebase Auth.

## Setup

```bash
bun install
cp .env.example .env   # Configure environment variables
bun run dev            # Start Vite dev server
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8022` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | required |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | required |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | required |
| `VITE_APP_NAME` | Application name | `Cravings` |
| `VITE_APP_DOMAIN` | Application domain | `localhost` |

## Features

- Language-prefixed routing (`/:lang/*`) with 16 languages and RTL support
- Lazy-loaded pages with React Suspense
- Light/dark theme switching
- Firebase authentication with protected routes
- Shared UI shell via `@sudobility/building_blocks`

## Commands

```bash
bun run dev            # Vite dev server
bun run build          # TypeScript check + Vite production build
bun run preview        # Preview production build
bun run typecheck      # TypeScript check
bun run lint           # ESLint
bun run format         # Prettier format
bun run verify         # typecheck + lint + format:check
```

## Related Packages

- **cravings_types** -- Shared type definitions
- **cravings_client** -- API client SDK with TanStack Query hooks
- **cravings_lib** -- Business logic (useHistoriesManager)
- **cravings_api** -- Backend server (default port 8022)
- **cravings_app_rn** -- React Native counterpart

## License

BUSL-1.1
