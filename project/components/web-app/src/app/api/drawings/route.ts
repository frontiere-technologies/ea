import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { eaDrawings } from "@/lib/drizzle/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const drawings = await db.select().from(eaDrawings).orderBy(desc(eaDrawings.id));
    
    return NextResponse.json(drawings);
  } catch (error: any) {
    console.error("Error fetching drawings:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch drawings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const [drawing] = await db.insert(eaDrawings).values({
      userId: data.user_id || null,
      filename: data.name || null,
      version: data.version || 1,
      drawings: data.content || null,
    }).returning();
    
    return NextResponse.json(drawing, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error("Error creating drawing:", error.message);
    return NextResponse.json(
      { error: "Failed to create drawing" },
      { status: 500 }
    );
  }
}
