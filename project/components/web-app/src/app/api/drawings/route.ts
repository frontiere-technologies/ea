import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const drawings = await prisma.eaDrawing.findMany({
      orderBy: {
        id: 'desc'
      }
    });
    
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
    const drawing = await prisma.eaDrawing.create({
      data: {
        user_id: data.user_id || null,
        filename: data.name || null,
        version: data.version || 1,
        drawings: data.content || null,
      },
    });
    
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
