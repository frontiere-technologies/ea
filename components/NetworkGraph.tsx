"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Network } from "vis-network";
import { executeQuery } from "@/lib/neo4j";
import { AppWindow, Link as Line, Magnet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ApplicationForm } from "./ApplicationForm";
import { FlowForm } from "./FlowForm";
import { ConfirmModal } from "./ConfirmModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { QueryInput } from "@/components/QueryInput";
import {
  deleteApplication,
  deleteFlow,
  editApplication,
  editFlow,
  getConnectedApplicationLabels,
  saveApplication,
  saveFlow,
  getFlowLabels, 
  getApplicationLabels
} from "@/lib/neo4jUtils";
import { MultiselectDropdown } from "./MultiselectDropdown";

interface NetworkWithBody extends Network {
  body: {
    data: {
      nodes: {
        add: (node: any) => void;
        remove: (node: any) => void;
        update: (node: any) => void;
        get: (id?: string) => any;
      };
      edges: {
        add: (edge: any) => void;
        remove: (edge: any) => void;
        update: (edge: any) => void;
        get: (id?: string) => any;
      };
    };
  };
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

type TableData = {
  id: string;
  [key: string]: any;
};

const options = {
  nodes: {
    shape: "box",
    font: { 
      size: 16,
      color: "#333333"
    },
    shadow: true,
    margin: 10,
    borderWidth: 2,
  },
  edges: {
    font: { 
      size: 12, 
      align: "middle"
    },
    color: { 
      color: "#848484", 
      highlight: "#2196F3"
    },
    width: 2,
    arrowStrikethrough: false,
    arrows: { 
      to: { 
        enabled: true, 
        scaleFactor: 0.8
      } 
    },
    smooth: {
      enabled: true,
      type: "dynamic",
      roundness: 0.2
    },
    length: 300,
    selectionWidth: 3,
  },
  physics: {
    enabled: false,
    barnesHut: {
      gravitationalConstant: -4000,
      centralGravity: 0.1,
      springLength: 300,
      springConstant: 0.04,
      damping: 0.95,
      avoidOverlap: 1
    },
    maxVelocity: 30,
    minVelocity: 0.1,
    solver: "barnesHut",
    stabilization: {
      enabled: true,
      iterations: 1500,
      updateInterval: 50,
      onlyDynamicEdges: false,
      fit: true
    },
    timestep: 0.5
  },
  layout: {
    improvedLayout: true
  },
  groups: {
    application: {
      color: { 
        background: "#74b9ff", 
        border: "#0984e3",
        highlight: {
          background: "#5faef7",
          border: "#0770c7"
        }
      },
      shape: "box",
      margin: 15,
    },
    flow: {
      color: { 
        background: "#ffeaa7", 
        border: "#fdcb6e",
        highlight: {
          background: "#ffe082",
          border: "#ffb74d"
        }
      },
      shape: "triangle",
      margin: 15,
    },
  },
  interaction: {
    hover: true,
    hoverConnectedEdges: true,
    selectConnectedEdges: false,
    tooltipDelay: 300,
    zoomView: true,
    dragView: true
  }
};

// Improved edge curvature calculation with better distribution
function calculateEdgeCurvature(fromId: string, toId: string, allEdges: any[], edgeIndex: number): number {
  // Find all edges between the same nodes (in both directions)
  const relatedEdges = allEdges.filter(edge => 
    (edge.from === fromId && edge.to === toId) || 
    (edge.from === toId && edge.to === fromId)
  );
  
  const totalEdges = relatedEdges.length;
  
  if (totalEdges === 1) {
    return 0; // No curvature for single edges
  }
  
  // Improved curvature calculation for better visual distribution
  const baseRoundness = 0.2;
  const maxRoundness = 1.0;
  const step = (maxRoundness - baseRoundness) / Math.max(totalEdges - 1, 1);
  
  // Distribute edges symmetrically around center
  const centerIndex = (totalEdges - 1) / 2;
  const offset = edgeIndex - centerIndex;
  
  // Apply alternating positive/negative curvature for better separation
  const curvature = baseRoundness + Math.abs(offset) * step;
  return offset > 0 ? curvature : -curvature;
}

// Enhanced intelligent edge routing with performance optimization
function applyIntelligentEdgeRouting(edges: any[]): any[] {
  const edgeGroups = new Map<string, any[]>();
  
  // Group edges by node pairs
  edges.forEach(edge => {
    const key = [edge.from, edge.to].sort().join('-');
    if (!edgeGroups.has(key)) {
      edgeGroups.set(key, []);
    }
    edgeGroups.get(key)!.push(edge);
  });
  
  // Apply different curvatures for each group
  const processedEdges: any[] = [];
  
  edgeGroups.forEach((groupEdges) => {
    groupEdges.forEach((edge, index) => {
      const curvature = calculateEdgeCurvature(edge.from, edge.to, groupEdges, index);
      
      processedEdges.push({
        ...edge,
        smooth: {
          enabled: Math.abs(curvature) > 0.01, // Only enable smooth for curved edges
          type: "dynamic",
          roundness: curvature
        }
      });
    });
  });
  
  return processedEdges;
}

// Optimized edge repositioning with debouncing
function repositionConnectedEdges(network: NetworkWithBody, movedNodeId: string) {
  try {
    const allEdges = network.body.data.edges.get();
    const connectedEdges = allEdges.filter((edge: any) => 
      edge.from === movedNodeId || edge.to === movedNodeId
    );

    if (connectedEdges.length === 0) return;

    // Group edges by node pairs
    const edgeGroups = new Map<string, any[]>();
    
    connectedEdges.forEach((edge: any) => {
      const key = [edge.from, edge.to].sort().join('-');
      if (!edgeGroups.has(key)) {
        edgeGroups.set(key, []);
      }
      edgeGroups.get(key)!.push(edge);
    });

    // Reposition each group with improved curvatures
    const updatedEdges: any[] = [];
    
    edgeGroups.forEach((groupEdges) => {
      groupEdges.forEach((edge: any, index: number) => {
        const curvature = calculateEdgeCurvature(edge.from, edge.to, groupEdges, index);
        
        updatedEdges.push({
          ...edge,
          smooth: {
            enabled: Math.abs(curvature) > 0.01,
            type: "dynamic",
            roundness: curvature
          }
        });
      });
    });

    // Batch update for better performance
    if (updatedEdges.length > 0) {
      network.body.data.edges.update(updatedEdges);
    }
  } catch (error) {
    console.error("Error repositioning connected edges:", error);
  }
}

// Enhanced data transformation with better error handling
function transformData(data: any) {
  const result: any = {};

  if (!Array.isArray(data)) {
    console.warn("transformData received non-array data:", data);
    return result;
  }

  data.forEach((row: any) => {
    if (!row || typeof row !== 'object') {
      console.warn("Invalid row data:", row);
      return;
    }

    for (const key in row) {
      const item = row[key];
      if (!item || !item.elementId) continue;

      const {
        elementId,
        properties = {},
        labels,
        type,
        startNodeElementId,
        endNodeElementId,
      } = item;

      // Enhanced property cleaning with better JSON parsing
      const cleanedProperties = Object.fromEntries(
        Object.entries(properties).map(([k, v]) => {
          if (typeof v === "string" && v.trim()) {
            try {
              const parsed = JSON.parse(v);
              if (Array.isArray(parsed)) {
                // Handle empty arrays and filter out invalid entries
                if (parsed.length === 0 || (parsed.length === 1 && parsed[0] === "[]")) {
                  return [k, ""];
                }
                // Clean and join array values
                const cleanArray = parsed
                  .filter(item => item !== null && item !== undefined && item !== "")
                  .map(item => String(item).trim())
                  .filter(item => item.length > 0);
                return [k, cleanArray.join(", ")];
              }
            } catch (e) {
              // Not JSON, keep as string
            }
          }

          if (Array.isArray(v)) {
            return [k, v.length > 0 ? v.join(", ") : ""];
          }

          return [k, v ?? ""];
        })
      );

      result[elementId] = {
        ...(labels && labels.length > 0 ? { labels: labels[0] } : {}),
        ...(type ? { type } : {}),
        ...(startNodeElementId ? { initiator_application: startNodeElementId } : {}),
        ...(endNodeElementId ? { target_application: endNodeElementId } : {}),
        ...cleanedProperties,
      };
    }
  });

  return result;
}

// Enhanced tooltip creation with better formatting
function createNodeTooltip(properties: Record<string, any>): string {
  const excludedFields = ["elementId", "labels"];
  const fields = Object.entries(properties)
    .filter(([key, value]) =>
      !excludedFields.includes(key) &&
      value !== null &&
      value !== "" &&
      value !== undefined
    )
    .map(([key, value]) => {
      const formattedKey = formatKey(key);
      if (Array.isArray(value)) {
        return `<strong>${formattedKey}</strong>: ${value.join(", ")}`;
      }
      // Truncate long values for better tooltip display
      const displayValue = String(value).length > 100 
        ? String(value).substring(0, 100) + "..." 
        : String(value);
      return `<strong>${formattedKey}</strong>: ${displayValue}`;
    });

  if (fields.length === 0) {
    return `<div style="padding: 8px;">No additional information available</div>`;
  }

  return `<div style="max-width: 350px; padding: 12px; background: rgba(255,255,255,0.98); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 13px; line-height: 1.4;">
    ${fields.join("<br>")}
  </div>`;
}

function createEdgeTooltip(properties: Record<string, any>): string {
  if (!properties || Object.keys(properties).length === 0) {
    return "";
  }

  const fields = Object.entries(properties)
    .filter(([_, value]) => value !== null && value !== "" && value !== undefined)
    .map(([key, value]) => {
      const formattedKey = formatKey(key);
      if (Array.isArray(value)) {
        return `<strong>${formattedKey}</strong>: ${value.join(", ")}`;
      }
      const displayValue = String(value).length > 80 
        ? String(value).substring(0, 80) + "..." 
        : String(value);
      return `<strong>${formattedKey}</strong>: ${displayValue}`;
    });

  return `<div style="max-width: 300px; padding: 12px; background: rgba(255,255,255,0.98); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 13px; line-height: 1.4;">
    ${fields.join("<br>")}
  </div>`;
}

function formatKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function NetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const currentDataRef = useRef<{
    nodes: Map<string, any>;
    edges: Map<string, any>;
  }>({
    nodes: new Map(),
    edges: new Map(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(false);
  const physicsStateRef = useRef(isPhysicsEnabled);
  const [graphData, setGraphData] = useState<{
    nodes: any[];
    edges: any[];
  } | null>({ nodes: [], edges: [] });
  const [dataTransformed, setDataTransformed] = useState<any>([]);
  const dataTransformedRef = useRef(dataTransformed);
  const [applicationData, setApplicationData] = useState<any>({});
  const [flowData, setFlowData] = useState<any>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState({
    show: false,
    data: {},
    type: "",
  });
  const [appLabels, setAppLabels] = useState<string[]>([]);
  const [flowLabels, setFlowLabels] = useState<string[]>([]);

  // Enhanced query results handler with better error handling
  const handleQueryResults = useCallback((results: any[]) => {
    try {
      if (!Array.isArray(results)) {
        console.error("Invalid query results format:", results);
        toast.error("Invalid query results format");
        return;
      }

      const nodes = new Map();
      const edges: any = [];

      const transformedData = transformData(results);
      setDataTransformed(transformedData);

      results.forEach((record) => {
        try {
          const nodeA = record.a;
          const nodeB = record.b;
          const relationship = record.e;

          // Enhanced node processing with validation
          if (nodeA && nodeA.elementId && !nodes.has(nodeA.elementId)) {
            const label = nodeA.properties?.name || 
                         nodeA.properties?.nickname || 
                         `Node ${nodeA.elementId.slice(-8)}`;
            nodes.set(nodeA.elementId, {
              id: nodeA.elementId,
              label: label,
              title: createNodeTooltip(nodeA.properties || {}),
              group: nodeA.labels?.[0]?.toLowerCase() || "default",
            });
          }

          if (nodeB && nodeB.elementId && !nodes.has(nodeB.elementId)) {
            const label = nodeB.properties?.name || 
                         nodeB.properties?.nickname || 
                         `Node ${nodeB.elementId.slice(-8)}`;
            nodes.set(nodeB.elementId, {
              id: nodeB.elementId,
              label: label,
              title: createNodeTooltip(nodeB.properties || {}),
              group: nodeB.labels?.[0]?.toLowerCase() || "default",
            });
          }

          // Enhanced relationship processing
          if (relationship && 
              relationship.elementId &&
              relationship.startNodeElementId && 
              relationship.endNodeElementId) {
            edges.push({
              id: relationship.elementId,
              from: relationship.startNodeElementId,
              to: relationship.endNodeElementId,
              label: relationship.properties?.name || relationship.type || "Connection",
              arrows: "to",
              title: createEdgeTooltip(relationship.properties || {}),
            });
          }
        } catch (error) {
          console.error("Error processing record:", record, error);
        }
      });

      // Apply intelligent edge routing
      const processedEdges = applyIntelligentEdgeRouting(edges);

      setGraphData({
        nodes: Array.from(nodes.values()),
        edges: processedEdges,
      });
    } catch (error) {
      console.error("Error in handleQueryResults:", error);
      toast.error("Error processing query results");
    }
  }, []);

  const handleApplicationSubmit = async (data: any) => {
    try {
      const transformedData = {
        ...data,
        ams_contact_phone: data.ams_contact_phone || "",
        ams_expire_date: data.ams_expire_date || null,
        ams_supplier: data.ams_supplier || "",
        ams_portal: data.ams_portal || "",
        links_to_documentation: data.links_to_documentation || "",
        ams_type: data.ams_type || "",
        decommission_date: data.decommission_date || null,
      };

      await handleSaveApplication(transformedData);
    } catch (error) {
      console.error("Error transforming data:", error);
      toast.error("Invalid format in one or more fields");
    }
  };

  const handleFlowSubmit = async (data: any) => {
    try {
      const transformedData = {
        ...data,
        release_date: data.release_date || null,
      };

      await handleSaveFlow(transformedData);
    } catch (error) {
      console.error("Error transforming data:", error);
      toast.error("Invalid format in one or more fields");
    }
  };

  const handleSaveApplication = async (data: any) => {
    if (!data) return;
    setIsLoading(true);

    try {
      if (Object.keys(applicationData).length === 0) {
        const result = await saveApplication(data);
        if (result && result.length > 0) {
          const newNode = result[0].a;

          if (networkRef.current) {
            const nodeData = {
              id: newNode.elementId,
              label: newNode.properties.name,
              title: createNodeTooltip(newNode.properties),
              group: "application",
            };

            const network = networkRef.current as NetworkWithBody;
            network.body.data.nodes.add(nodeData);
            currentDataRef.current.nodes.set(newNode.elementId, nodeData);
          }

          const newApp = transformData(result);
          const newAppKey = newNode.elementId;

          setDataTransformed((prev: any) => ({
            ...prev,
            [newAppKey]: newApp[newNode.elementId],
          }));

          toast.success("Application added successfully");
        } else {
          toast.error("Failed to save application");
        }
      } else {
        const result = await editApplication(data);
        if (result && result.length > 0) {
          toast.success("Application edited successfully");
        } else {
          toast.error("Failed to edit application");
        }
      }
    } catch (error) {
      console.error("Error saving application:", error);
      toast.error("Failed to save application");
    } finally {
      setIsApplicationDialogOpen(false);
      setIsLoading(false);
    }
  };

  const handleSaveFlow = async (data: any) => {
    if (!data) return;
    setIsLoading(true);

    try {
      if (Object.keys(flowData).length === 0) {
        const result = await saveFlow(data);
        if (result && result.length > 0) {
          const newNode = result[0].f;

          if (networkRef.current) {
            const edgeData = {
              id: newNode.elementId,
              from: newNode.startNodeElementId,
              to: newNode.endNodeElementId,
              label: newNode.properties.name || newNode.type,
              arrows: "to",
              title: createEdgeTooltip(newNode.properties),
            };

            const network = networkRef.current as NetworkWithBody;
            
            // Apply intelligent routing for the new edge
            const allCurrentEdges = network.body.data.edges.get();
            const processedEdges = applyIntelligentEdgeRouting([...allCurrentEdges, edgeData]);
            const newEdgeProcessed = processedEdges.find(edge => edge.id === edgeData.id);
            
            network.body.data.edges.add(newEdgeProcessed || edgeData);
            currentDataRef.current.edges.set(newNode.elementId, newEdgeProcessed || edgeData);
          }

          const newApp = transformData(result);
          const newAppKey = newNode.elementId;

          setDataTransformed((prev: any) => ({
            ...prev,
            [newAppKey]: newApp[newNode.elementId],
          }));

          toast.success("Flow added successfully");
        } else {
          toast.error("Failed to save flow");
        }
      } else {
        const result = await editFlow(data);
        if (result && result.length > 0) {
          toast.success("Flow edited successfully");
        } else {
          toast.error("Failed to edit flow");
        }
      }
    } catch (error) {
      console.error("Error saving flow:", error);
      toast.error("Failed to save flow");
    } finally {
      setIsFlowDialogOpen(false);
      setIsLoading(false);
    }
  };

  const handleDeleteButton = async (data: any) => {
    if (!data) return;

    const { elementId, type } = data;
    const network = networkRef.current as NetworkWithBody;

    setIsLoading(true);

    try {
      if (type === "flow") {
        const result = await deleteFlow(data);
        if (result) {
          toast.success("Flow deleted successfully");
          if (networkRef.current) {
            network.body.data.edges.remove(elementId);
          }
        } else {
          toast.error("Error deleting the flow");
        }
      } else if (type === "application") {
        const result = await deleteApplication(data);
        if (result) {
          toast.success("Application deleted successfully");
          if (networkRef.current) {
            network.body.data.nodes.remove(elementId);
          }
        } else {
          toast.error("Error deleting the application");
        }
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(`Error deleting the ${type}`);
    } finally {
      setIsConfirmModalOpen({ show: false, data: {}, type: "" });
      setIsLoading(false);
    }
  };

  const togglePhysics = useCallback(() => {
    if (networkRef.current) {
      const newPhysicsState = !isPhysicsEnabled;
      setIsPhysicsEnabled(newPhysicsState);
      physicsStateRef.current = newPhysicsState;

      networkRef.current.setOptions({
        physics: {
          enabled: newPhysicsState,
          barnesHut: {
            gravitationalConstant: -4000,
            centralGravity: 0.1,
            springLength: 300,
            springConstant: 0.04,
            damping: 0.95,
            avoidOverlap: 1
          },
          maxVelocity: 30,
          minVelocity: 0.1,
          stabilization: {
            enabled: newPhysicsState,
            iterations: 1500,
            updateInterval: 50,
            onlyDynamicEdges: false,
            fit: true
          },
          timestep: 0.5
        },
      });

      if (newPhysicsState) {
        toast.success("Physics enabled - Graph will stabilize");
      } else {
        toast.success("Physics disabled - Graph is now static");
      }
    }
  }, [isPhysicsEnabled]);

  // Enhanced node expansion with better error handling and performance
  const expandNode = async (nodeId: string) => {
    if (!networkRef.current) return;
    const network = networkRef.current as NetworkWithBody;

    setIsLoading(true);
    try {
      networkRef.current.setOptions({ physics: { enabled: false } });

      const sourceNodePosition = networkRef.current.getPosition(nodeId);

      const results = await executeQuery(
        `
        MATCH (source)-[r]-(target)
        WHERE elementId(source) = $nodeId
        AND (target:Application OR target:Flow)
        RETURN source as a, r as e, target as b
        UNION
        MATCH (source)-[r]-(target)
        WHERE elementId(target) = $nodeId
        AND (source:Application OR source:Flow)
        RETURN source as a, r as e, target as b
        `,
        { nodeId },
        new AbortController().signal
      );

      if (!results || results.length === 0) {
        toast.info("No connected nodes found");
        return;
      }

      const newNodes: any = [];
      const newEdges: any = [];

      const radius = 350;
      const angleStep = (2 * Math.PI) / Math.max(results.length, 1);

      const newData = transformData(results);

      setDataTransformed((prev: any) => ({
        ...prev,
        ...newData,
      }));

      results.forEach((record: any, index: any) => {
        try {
          const nodeA = record.a;
          const nodeB = record.b;
          const relationship = record.e;

          [nodeA, nodeB].forEach((node) => {
            if (node && node.elementId && !currentDataRef.current.nodes.has(node.elementId)) {
              const angle = angleStep * index;
              const x = sourceNodePosition.x + radius * Math.cos(angle);
              const y = sourceNodePosition.y + radius * Math.sin(angle);

              const nodeData = {
                id: node.elementId,
                label: node.properties?.name || 
                       node.properties?.nickname || 
                       `Node ${node.elementId.slice(-8)}`,
                title: createNodeTooltip(node.properties || {}),
                group: node.labels?.[0]?.toLowerCase() || "default",
                x: x,
                y: y,
              };
              currentDataRef.current.nodes.set(node.elementId, nodeData);
              newNodes.push(nodeData);
            }
          });

          if (relationship && 
              relationship.elementId &&
              !currentDataRef.current.edges.has(relationship.elementId)) {
            const edgeData = {
              id: relationship.elementId,
              from: relationship.startNodeElementId,
              to: relationship.endNodeElementId,
              label: relationship.properties?.name || relationship.type || "Connection",
              arrows: "to",
              title: createEdgeTooltip(relationship.properties || {}),
            };
            currentDataRef.current.edges.set(relationship.elementId, edgeData);
            newEdges.push(edgeData);
          }
        } catch (error) {
          console.error("Error processing expansion record:", record, error);
        }
      });

      if (newNodes.length > 0) {
        network.body.data.nodes.add(newNodes);
      }
      if (newEdges.length > 0) {
        // Apply intelligent routing for new edges
        const allCurrentEdges = Array.from(currentDataRef.current.edges.values());
        const processedNewEdges = applyIntelligentEdgeRouting([...allCurrentEdges, ...newEdges]);
        
        // Update only the new edges with intelligent routing
        const finalNewEdges = processedNewEdges.filter(edge => 
          newEdges.some(newEdge => newEdge.id === edge.id)
        );
        
        network.body.data.edges.add(finalNewEdges);
      }

      if (newNodes.length > 0 || newEdges.length > 0) {
        setTimeout(() => {
          if (networkRef.current) {
            networkRef.current.setOptions({
              physics: {
                enabled: physicsStateRef.current,
                barnesHut: {
                  gravitationalConstant: -4000,
                  centralGravity: 0.1,
                  springLength: 300,
                  springConstant: 0.04,
                  damping: 0.95,
                  avoidOverlap: 1
                },
                maxVelocity: 30,
                minVelocity: 0.1,
                stabilization: {
                  enabled: physicsStateRef.current,
                  iterations: 800,
                  updateInterval: 25,
                  onlyDynamicEdges: false,
                  fit: false
                },
                timestep: 0.5
              },
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error expanding node:", error);
      toast.error("Failed to expand node");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced network initialization with better error handling
  const initializeNetwork = useCallback(() => {
    if (!containerRef.current || !graphData) return;

    try {
      if (networkRef.current) {
        networkRef.current.destroy();
      }

      currentDataRef.current.nodes = new Map(
        graphData.nodes.map((node) => [node.id, node])
      );
      currentDataRef.current.edges = new Map(
        graphData.edges.map((edge) => [edge.id, edge])
      );

      networkRef.current = new Network(
        containerRef.current,
        graphData,
        options
      );

      // Enhanced event listeners with better error handling
      networkRef.current.on("dragStart", (params) => {
        try {
          networkRef.current?.setOptions({ physics: { enabled: false } });
        } catch (error) {
          console.error("Error in dragStart:", error);
        }
      });

      networkRef.current.on("dragging", (params) => {
        try {
          if (params.nodes.length > 0) {
            const draggedNodeId = params.nodes[0];
            const network = networkRef.current as NetworkWithBody;
            repositionConnectedEdges(network, draggedNodeId);
          }
        } catch (error) {
          console.error("Error in dragging:", error);
        }
      });

      networkRef.current.on("dragEnd", (params) => {
        try {
          if (params.nodes.length > 0) {
            const draggedNodeId = params.nodes[0];
            const network = networkRef.current as NetworkWithBody;
            repositionConnectedEdges(network, draggedNodeId);
          }
          
          networkRef.current?.setOptions({
            physics: { enabled: physicsStateRef.current },
          });
        } catch (error) {
          console.error("Error in dragEnd:", error);
        }
      });

      networkRef.current.on("doubleClick", (params) => {
        try {
          if (params.nodes.length > 0) {
            expandNode(params.nodes[0]);
          }
        } catch (error) {
          console.error("Error in doubleClick:", error);
        }
      });

      networkRef.current.on("oncontext", (params) => {
        try {
          params.event.preventDefault();
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const nodeData = dataTransformedRef.current[nodeId];
            if (nodeData) {
              nodeData["elementId"] = nodeId;
              nodeData["type"] = "application";
              const appData = {
                nodeData,
                hasRelationship: params.edges.length > 0,
              };
              setApplicationData(appData);
              setIsApplicationDialogOpen(true);
            }
          }

          if (params.edges.length > 0 && params.nodes.length === 0) {
            const edgeId = params.edges[0];
            const edgeData = dataTransformedRef.current[edgeId];
            if (edgeData) {
              edgeData["elementId"] = edgeId;
              setFlowData(edgeData);
              setIsFlowDialogOpen(true);
            }
          }
        } catch (error) {
          console.error("Error in oncontext:", error);
        }
      });

      networkRef.current.once("afterDrawing", () => {
        try {
          networkRef.current?.fit();
        } catch (error) {
          console.error("Error in afterDrawing:", error);
        }
      });

      // Enhanced stabilization listeners
      networkRef.current.on("stabilizationProgress", (params) => {
        const progress = Math.round((params.iterations / params.total) * 100);
        if (progress % 25 === 0) {
          console.log(`Stabilization progress: ${progress}%`);
        }
      });

      networkRef.current.on("stabilizationIterationsDone", () => {
        console.log("Network stabilization completed");
        toast.success("Graph layout stabilized");
      });

    } catch (error) {
      console.error("Error initializing network:", error);
      toast.error("Failed to initialize network graph");
    }
  }, [graphData]);

  // Enhanced useEffect hooks with better cleanup
  useEffect(() => {
    if (!isApplicationDialogOpen) {
      setApplicationData({});
    }
  }, [isApplicationDialogOpen]);

  useEffect(() => {
    if (!isFlowDialogOpen) {
      setFlowData({});
    }
  }, [isFlowDialogOpen]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        await initializeNetwork();
      } catch (error) {
        console.error("Error in network setup:", error);
        toast.error("Failed to setup network");
      } finally {
        setIsLoading(false);
      }
    };
    setup();
  }, [initializeNetwork]);

  useEffect(() => {
    return () => {
      if (networkRef.current) {
        try {
          networkRef.current.destroy();
          networkRef.current = null;
        } catch (error) {
          console.error("Error destroying network:", error);
        }
      }
    };
  }, []);

  // Enhanced label fetching with better error handling
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const [appLabelsResult, flowLabelsResult] = await Promise.all([
          getConnectedApplicationLabels(),
          getFlowLabels()
        ]);

        if (appLabelsResult && appLabelsResult.length > 0) {
          setAppLabels(appLabelsResult);
        }

        if (flowLabelsResult && flowLabelsResult.length > 0) {
          setFlowLabels(flowLabelsResult);
        }
      } catch (error) {
        console.error("Error fetching labels:", error);
        toast.error("Failed to load filter options");
      }
    };

    fetchLabels();
  }, []);

  useEffect(() => {
    dataTransformedRef.current = dataTransformed;
  }, [dataTransformed]);

  /* Enhanced Dropdown Management */
  const [query, setQuery] = useState("MATCH (a)-[e:flow]->(b) RETURN a, e, b");
  const [selectedInitiators, setSelectedInitiators] = useState<string[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [initiatorTargetOperator, setInitiatorTargetOperator] = useState<"AND" | "OR">("AND");

  // Enhanced query building with better validation
  function updateQueryWithFilters(
    baseQuery: string,
    initiators: string[],
    targets: string[],
    labels: string[],
    operator: "AND" | "OR"
  ): string {
    try {
      const filters: string[] = [];

      const initiatorParts = initiators.length > 0
        ? initiators.map((i) => `a.name CONTAINS "${i.replace(/"/g, '\\"')}"`).join(" OR ")
        : "";
      const targetParts = targets.length > 0
        ? targets.map((t) => `b.name CONTAINS "${t.replace(/"/g, '\\"')}"`).join(" OR ")
        : "";

      if (initiatorParts && targetParts) {
        filters.push(`(${initiatorParts}) ${operator} (${targetParts})`);
      } else if (initiatorParts) {
        filters.push(`(${initiatorParts})`);
      } else if (targetParts) {
        filters.push(`(${targetParts})`);
      }

      if (labels.length > 0) {
        const labelFilter = labels.map(l => `e.labels CONTAINS "${l.replace(/"/g, '\\"')}"`).join(" OR ");
        filters.push(`(${labelFilter})`);
      }

      // Enhanced regex for better query parsing
      const matchPart = baseQuery.match(/MATCH[\s\S]*?(?=RETURN|WHERE)/i)?.[0]?.trim() || '';
      const returnPart = baseQuery.match(/RETURN[\s\S]*$/i)?.[0]?.trim() || '';

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : '';

      return [matchPart, whereClause, returnPart].filter(Boolean).join(" ");
    } catch (error) {
      console.error("Error building query:", error);
      return baseQuery; // Return original query on error
    }
  }

  useEffect(() => {
    setQuery(q =>
      updateQueryWithFilters(
        q,
        selectedInitiators,
        selectedTargets,
        selectedLabels,
        initiatorTargetOperator
      )
    );
  }, [selectedInitiators, selectedTargets, selectedLabels, initiatorTargetOperator]);

  return (
    <div className="w-full h-full border rounded-lg bg-card flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        {/* Button group */}
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsApplicationDialogOpen(true)}
                  disabled={isLoading}
                >
                  <AppWindow className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add application</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFlowDialogOpen(true)}
                  disabled={isLoading}
                >
                  <Line className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add flow</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPhysicsEnabled ? "default" : "outline"}
                  size="icon"
                  onClick={togglePhysics}
                  disabled={isLoading}
                >
                  <Magnet className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPhysicsEnabled ? "Disable" : "Enable"} physics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex gap-4">
          <MultiselectDropdown
            options={appLabels || []}
            onChange={setSelectedInitiators}
            placeholder="Initiator Application"
          />
          <Button
            variant="outline"
            onClick={() =>
              setInitiatorTargetOperator((op) => (op === "AND" ? "OR" : "AND"))
            }
            disabled={isLoading}
          >
            {initiatorTargetOperator}
          </Button>
          <MultiselectDropdown
            options={appLabels || []}
            onChange={setSelectedTargets}
            placeholder="Target Application"
          />
          <MultiselectDropdown
            options={flowLabels || []}
            onChange={setSelectedLabels}
            placeholder="Labels"
          />
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      <div className="mt-4 px-4 pb-4">
        <QueryInput
          onQueryResults={handleQueryResults}
          query={query}
          setQuery={setQuery}
          showHistory={true}
        />
      </div>

      <Dialog
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
      >
        <DialogContent
          className="sm:max-w-[800px] h-[90vh] flex flex-col z-[700]"
          aria-describedby="dialog-description"
        >
          <DialogHeader>
            <DialogTitle>
              {Object.keys(applicationData).length === 0
                ? "Add new application"
                : "Edit application"}
            </DialogTitle>
          </DialogHeader>
          <p id="dialog-description" className="sr-only">
            Use this form to create a new application and add it to the network
            graph.
          </p>
          <ScrollArea className="flex-1 px-4">
            <div className="py-4">
              <ApplicationForm
                onSubmit={handleApplicationSubmit}
                data={applicationData.nodeData}
              />
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4 w-full">
            <div className="flex w-full justify-between items-center">
              {Object.keys(applicationData).length > 0 &&
              applicationData.hasRelationship === false ? (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsConfirmModalOpen({
                      show: true,
                      data: applicationData.nodeData,
                      type: applicationData.nodeData.type,
                    });
                    setIsApplicationDialogOpen(false);
                  }}
                  disabled={isLoading}
                >
                  Delete application
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsApplicationDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="application-form"
                  disabled={isLoading}
                >
                  Save application
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFlowDialogOpen} onOpenChange={setIsFlowDialogOpen}>
        <DialogContent
          className="sm:max-w-[800px] h-[90vh] flex flex-col z-[700]"
          aria-describedby="dialog-description"
        >
          <DialogHeader>
            <DialogTitle>
              {Object.keys(flowData).length === 0
                ? "Add new flow"
                : "Edit flow"}
            </DialogTitle>
          </DialogHeader>
          <p id="dialog-description" className="sr-only">
            Use this form to create a new flow.
          </p>
          <ScrollArea className="flex-1 px-4">
            <div className="py-4">
              <FlowForm onSubmit={handleFlowSubmit} data={flowData} />
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4 w-full">
            <div className="flex w-full justify-between items-center">
              {Object.keys(flowData).length > 0 ? (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsConfirmModalOpen({
                      show: true,
                      data: flowData,
                      type: flowData.type,
                    });
                    setIsFlowDialogOpen(false);
                  }}
                  disabled={isLoading}
                >
                  Delete flow
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFlowDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" form="flow-form" disabled={isLoading}>
                  Save flow
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={isConfirmModalOpen.show}
        onClose={() =>
          setIsConfirmModalOpen({ show: false, data: {}, type: "" })
        }
        onConfirm={() => handleDeleteButton(isConfirmModalOpen.data)}
        title={`Delete ${isConfirmModalOpen.type}`}
        description={`Are you sure you want to delete this ${isConfirmModalOpen.type}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}