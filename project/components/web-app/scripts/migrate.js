const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Starting database migrations...');
  
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('Migrations completed successfully!');
    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await migrationClient.end();
    process.exit(1);
  }
}

runMigrations();
