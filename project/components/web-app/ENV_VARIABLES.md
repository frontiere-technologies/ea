# Environment Variables

This document describes all environment variables used in the web-app.

## Neo4j Configuration

These variables are **server-side only** and are not exposed to the browser. All Neo4j operations are performed through API routes.

- `NEO4J_URI`: Neo4j connection URI (e.g., `neo4j://localhost:7687`)
- `NEO4J_USERNAME`: Neo4j username
- `NEO4J_PASSWORD`: Neo4j password

## PostgreSQL Configuration

These variables are server-side only (not exposed to the browser).

- `DATABASE_URL`: PostgreSQL connection string used by Prisma (e.g., `postgresql://user:password@host:5432/database`)
- `POSTGRES_HOST`: PostgreSQL host
- `POSTGRES_PORT`: PostgreSQL port
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: PostgreSQL database name

## Development Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your local configuration

## Docker/Kubernetes Setup

For containerized deployments, set these environment variables at runtime:

- `NEO4J_URI`
- `NEO4J_USERNAME`
- `NEO4J_PASSWORD`
- `DATABASE_URL`

No build-time ARG variables are needed since all database credentials are server-side only.

## Scripts

Python scripts (e.g., `create-faker-flows-neo4j.py`) use the same variables from the `.env` file.
