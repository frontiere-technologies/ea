import neo4j, { Driver } from 'neo4j-driver';

let driver: Driver | null = null;

export function getNeo4jDriver() {
  // Never initialize driver during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Build phase detected - skipping Neo4j connection');
    return null;
  }

  // During build time, environment variables might not be available
  // Return null to prevent connection attempts during static generation
  if (!process.env.NEO4J_URI || 
      !process.env.NEO4J_USERNAME || 
      !process.env.NEO4J_PASSWORD) {
    console.warn('Neo4j environment variables not configured - skipping connection');
    return null;
  }

  if (!driver) {
    try {
      console.log('Initializing Neo4j driver with URI:', process.env.NEO4J_URI);
      driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(
          process.env.NEO4J_USERNAME,
          process.env.NEO4J_PASSWORD
        ),
        {
          maxConnectionPoolSize: 10,
          connectionTimeout: 30000,
          maxTransactionRetryTime: 30000
        }
      );

      // Test the connection (async, don't block)
      driver.verifyConnectivity()
        .then(() => {
          console.log('Successfully connected to Neo4j database');
        })
        .catch((error) => {
          console.error('Failed to connect to Neo4j:', error);
          driver = null;
        });
    } catch (error) {
      console.error('Failed to create Neo4j driver:', error);
      driver = null;
      return null;
    }
  }
  return driver;
}

export async function executeQuery(cypher: string, params = {}, signal?: AbortSignal) {
  const driver = getNeo4jDriver();
  
  if (!driver) {
    throw new Error('Neo4j driver not available - check environment variables');
  }
  
  const session = driver.session({
    defaultAccessMode: neo4j.session.WRITE,
    database: 'neo4j'
  });

  try {
    if (signal) {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      
      const abortPromise = new Promise((_, reject) => {
        signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
      });

      const result : any = await Promise.race([
        session.run(cypher, params),
        abortPromise
      ]);

      return result.records.map((record: { keys: any[]; get: (arg0: any) => any; }) => {
        const obj: any = {};
        record.keys.forEach(key => {
          obj[key] = record.get(key);
        });
        return obj;
      });
    } else {
      const result = await session.run(cypher, params);
      return result.records.map(record => {
        const obj: any = {};
        record.keys.forEach(key => {
          obj[key] = record.get(key);
        });
        return obj;
      });
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('Query execution error:', error);
    throw new Error(`Failed to execute Neo4j query: ${error.message}`);
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}