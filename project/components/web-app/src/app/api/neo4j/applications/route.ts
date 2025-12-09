import { NextResponse } from "next/server";
import { 
  getApplications, 
  saveApplication, 
  editApplication, 
  deleteApplication 
} from "@/lib/neo4jUtils";

// Force dynamic rendering to ensure environment variables are read at runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'labels') {
      const { getApplicationLabels } = await import("@/lib/neo4jUtils");
      const labels = await getApplicationLabels();
      return NextResponse.json(labels || []);
    } else if (action === 'connected-labels') {
      const { getConnectedApplicationLabels } = await import("@/lib/neo4jUtils");
      const labels = await getConnectedApplicationLabels();
      return NextResponse.json(labels || []);
    } else {
      const applications = await getApplications();
      return NextResponse.json(applications || []);
    }
  } catch (error: any) {
    console.error("Error fetching applications:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await saveApplication(data);
    
    if (result && result.length > 0) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Failed to create application" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error creating application:", error.message);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const result = await editApplication(data);
    
    if (result && result.length > 0) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error updating application:", error.message);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    
    if (!applicationId) {
      return NextResponse.json(
        { error: "application_id is required" },
        { status: 400 }
      );
    }
    
    const result = await deleteApplication(applicationId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Error deleting application:", error.message);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
