import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './drizzle/schema';

const connectionString = process.env.DATABASE_URL!;

// For query purposes
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// For migration purposes
export const migrationClient = postgres(connectionString, { max: 1 });
