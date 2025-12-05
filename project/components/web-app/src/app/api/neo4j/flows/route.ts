import { NextResponse } from "next/server";
import { 
  saveFlow, 
  editFlow, 
  deleteFlow,
  getFlowLabels,
  getFlowGraphByLabel,
  getFlows
} from "@/lib/neo4jUtils";

// Force dynamic rendering to ensure environment variables are read at runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const label = searchParams.get('label');
    
    if (action === 'labels') {
      const labels = await getFlowLabels();
      return NextResponse.json(labels || []);
    } else if (action === 'graph' && label) {
      const graph = await getFlowGraphByLabel(label);
      return NextResponse.json(graph || { nodes: [], edges: [] });
    } else if (action === 'list') {
      const flows = await getFlows();
      return NextResponse.json(flows || []);
    } else {
      // Default: return all flows
      const flows = await getFlows();
      return NextResponse.json(flows || []);
    }
  } catch (error: any) {
    console.error("Error fetching flows:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch flows" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await saveFlow(data);
    
    if (result && result.length > 0) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Failed to create flow" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error creating flow:", error.message);
    return NextResponse.json(
      { error: "Failed to create flow" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const result = await editFlow(data);
    
    if (result && result.length > 0) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Failed to update flow" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error updating flow:", error.message);
    return NextResponse.json(
      { error: "Failed to update flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const flowId = searchParams.get('flow_id');
    
    if (!flowId) {
      return NextResponse.json(
        { error: "flow_id is required" },
        { status: 400 }
      );
    }
    
    const result = await deleteFlow(flowId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Error deleting flow:", error.message);
    return NextResponse.json(
      { error: "Failed to delete flow" },
      { status: 500 }
    );
  }
}
