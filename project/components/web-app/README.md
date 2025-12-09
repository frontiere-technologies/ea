# EA Application

This project is a Next.js application written in TypeScript. It uses the App Router and integrates with **Neo4j** for graph storage and **Supabase** for storing drawings. The UI components are built with [shadcn/ui](https://ui.shadcn.com/) and styled with Tailwind CSS.

## Setup

1. Install dependencies (Node.js 18+ is recommended):
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root and define the environment variables listed below.
3. Start the development server:
   ```bash
   npm run dev
   ```

A browser window should open at `http://localhost:3000` with hot‑reloading enabled.

## Architecture Overview

- **app/** – application entry points using the Next.js App Router. The main layout lives in `app/layout.tsx` and the default route is implemented in `app/page.tsx`.
- **components/** – React components including UI primitives from shadcn/ui as well as higher level components such as `NetworkGraph` and `DrawingEditor`.
- **lib/** – helper libraries for database access and utilities. `neo4j.ts` provides a connection helper and `supabase.ts` initializes the Supabase client.
- **hooks/** – custom React hooks used throughout the application.
- **public/** and **assets/** – static assets and icons used by the UI.

## Environment Variables

Create a `.env` file with the following variables:

```bash
NEXT_PUBLIC_NEO4J_URI=<neo4j connection string>
NEXT_PUBLIC_NEO4J_USERNAME=<neo4j username>
NEXT_PUBLIC_NEO4J_PASSWORD=<neo4j password>
NEXT_PUBLIC_SUPABASE_URL=<supabase project URL>
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=<supabase service key>
# Optional: enable bundle analyzer
ANALYZE=true
```

`NEXT_PUBLIC_` variables are exposed to the browser by Next.js. The optional `ANALYZE` flag runs the bundle analyzer when set to `true`.

## Development Scripts

The `package.json` defines several scripts to aid development:

| Command           | Description                               |
|-------------------|-------------------------------------------|
| `npm run dev`     | Start the development server              |
| `npm run build`   | Create an optimized production build      |
| `npm run start`   | Run the production build                  |
| `npm run lint`    | Lint the project using Next.js ESLint     |
| `npm run analyze` | Build with bundle analyzer enabled        |

Run any of these scripts with `npm run <name>`.

