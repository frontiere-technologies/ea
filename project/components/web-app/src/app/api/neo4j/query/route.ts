import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/neo4j";

// Force dynamic rendering to ensure environment variables are read at runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { cypher, params } = await request.json();
    
    if (!cypher) {
      return NextResponse.json(
        { error: "cypher query is required" },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(cypher, params || {});
    return NextResponse.json(result || []);
  } catch (error: any) {
    console.error("Error executing query:", error.message);
    return NextResponse.json(
      { error: "Failed to execute query", details: error.message },
      { status: 500 }
    );
  }
}
