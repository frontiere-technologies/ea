import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/neo4j";

export async function GET() {
  try {
    // Fetch all applications and their relationships
    const query = `
      MATCH (a:Application)
      OPTIONAL MATCH (a)-[e]-(b:Application)
      RETURN a, e, b
    `;
    
    const result = await executeQuery(query, {});
    return NextResponse.json(result || []);
  } catch (error: any) {
    console.error("Error fetching nodes and relationships:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch nodes and relationships" },
      { status: 500 }
    );
  }
}
