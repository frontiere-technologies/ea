import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { eaDrawings } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const [drawing] = await db.update(eaDrawings)
      .set({
        filename: data.name || null,
        drawings: data.content || null,
        version: data.version || null,
      })
      .where(eq(eaDrawings.id, parseInt(params.id)))
      .returning();
    
    return NextResponse.json(drawing);
  } catch (error: any) {
    console.error("Error updating drawing:", error.message);
    return NextResponse.json(
      { error: "Failed to update drawing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(eaDrawings)
      .where(eq(eaDrawings.id, parseInt(params.id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting drawing:", error.message);
    return NextResponse.json(
      { error: "Failed to delete drawing" },
      { status: 500 }
    );
  }
}
