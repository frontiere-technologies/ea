import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const drawing = await prisma.eaDrawing.update({
      where: { id: parseInt(params.id) },
      data: {
        filename: data.name || null,
        drawings: data.content || null,
        version: data.version || null,
      },
    });
    
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
    await prisma.eaDrawing.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting drawing:", error.message);
    return NextResponse.json(
      { error: "Failed to delete drawing" },
      { status: 500 }
    );
  }
}
