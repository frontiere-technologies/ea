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

// Funzione per calcolare la curvatura dinamica degli archi
function calculateEdgeCurvature(fromId: string, toId: string, allEdges: any[], edgeIndex: number): number {
  // Trova tutti gli archi tra gli stessi nodi (in entrambe le direzioni)
  const relatedEdges = allEdges.filter(edge => 
    (edge.from === fromId && edge.to === toId) || 
    (edge.from === toId && edge.to === fromId)
  );
  
  const totalEdges = relatedEdges.length;
  
  if (totalEdges === 1) {
    return 0; // Nessuna curvatura per archi singoli
  }
  
  // Calcola la curvatura crescente per archi multipli
  const baseRoundness = 0.3;
  const maxRoundness = 1.2;
  const step = (maxRoundness - baseRoundness) / Math.max(totalEdges - 1, 1);
  
  // Distribuisci gli archi simmetricamente
  const centerIndex = (totalEdges - 1) / 2;
  const offset = edgeIndex - centerIndex;
  
  return baseRoundness + Math.abs(offset) * step * (offset > 0 ? 1 : -1);
}

// Funzione per applicare il routing intelligente degli archi
function applyIntelligentEdgeRouting(edges: any[]): any[] {
  const edgeGroups = new Map<string, any[]>();
  
  // Raggruppa gli archi per coppia di nodi
  edges.forEach(edge => {
    const key = [edge.from, edge.to].sort().join('-');
    if (!edgeGroups.has(key)) {
      edgeGroups.set(key, []);
    }
    edgeGroups.get(key)!.push(edge);
  });
  
  // Applica curvature diverse per ogni gruppo
  const processedEdges: any[] = [];
  
  edgeGroups.forEach((groupEdges, key) => {
    groupEdges.forEach((edge, index) => {
      const curvature = calculateEdgeCurvature(edge.from, edge.to, groupEdges, index);
      
      processedEdges.push({
        ...edge,
        smooth: {
          enabled: curvature !== 0,
          type: "dynamic",
          roundness: curvature
        }
      });
    });
  });
  
  return processedEdges;
}

// Funzione per riposizionare dinamicamente gli archi quando un nodo viene mosso
function repositionConnectedEdges(network: NetworkWithBody, movedNodeId: string) {
  try {
    const allEdges = network.body.data.edges.get();
    const connectedEdges = allEdges.filter((edge: any) => 
      edge.from === movedNodeId || edge.to === movedNodeId
    );

    if (connectedEdges.length === 0) return;

    // Raggruppa gli archi per coppie di nodi connessi
    const edgeGroups = new Map<string, any[]>();
    
    connectedEdges.forEach((edge: any) => {
      const key = [edge.from, edge.to].sort().join('-');
      if (!edgeGroups.has(key)) {
        edgeGroups.set(key, []);
      }
      edgeGroups.get(key)!.push(edge);
    });

    // Riposiziona ogni gruppo di archi con curvature diverse
    const updatedEdges: any[] = [];
    
    edgeGroups.forEach((groupEdges, key) => {
      groupEdges.forEach((edge: any, index: number) => {
        const curvature = calculateEdgeCurvature(edge.from, edge.to, groupEdges, index);
        
        updatedEdges.push({
          ...edge,
          smooth: {
            enabled: curvature !== 0,
            type: "dynamic",
            roundness: curvature
          }
        });
      });
    });

    // Aggiorna gli archi nel network
    if (updatedEdges.length > 0) {
      network.body.data.edges.update(updatedEdges);
    }
  } catch (error) {
    console.error("Error repositioning connected edges:", error);
  }
}

function transformData(data: any) {
  const result: any = {};

  data.forEach((row: any) => {
    for (const key in row) {
      const item = row[key];
      const {
        elementId,
        properties,
        labels,
        type,
        startNodeElementId,
        endNodeElementId,
      } = item;

      if (!elementId) continue;

      const cleanedProperties = Object.fromEntries(
        Object.entries(properties).map(([k, v]) => {
          if (typeof v === "string") {
            try {
              const parsed = JSON.parse(v);

              if (Array.isArray(parsed)) {
                // Se array vuoto
                if (
                  parsed.length === 0 ||
                  (parsed.length === 1 && parsed[0] === "[]")
                ) {
                  return [k, ""];
                }
                // Se array con valori
                return [k, parsed.join(", ")];
              }
            } catch (e) {
              // Non è un JSON parsabile, continua
            }
          }

          if (Array.isArray(v) && v.length === 0) {
            return [k, ""];
          }

          return [k, v];
        })
      );

      result[elementId] = {
        ...(labels ? { labels: labels[0] } : {}),
        ...(type ? { type } : {}),
        ...(startNodeElementId
          ? { initiator_application: startNodeElementId }
          : {}),
        ...(endNodeElementId ? { target_application: endNodeElementId } : {}),
        ...cleanedProperties,
      };
    }
  });

  return result;
}

function createNodeTooltip(properties: Record<string, any>): string {
  const excludedFields = ["elementId", "labels"];
  const fields = Object.entries(properties)
    .filter(
      ([key]) =>
        !excludedFields.includes(key) &&
        properties[key] !== null &&
        properties[key] !== ""
    )
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `<strong>${formatKey(key)}</strong>: ${value.join(", ")}`;
      }
      return `<strong>${formatKey(key)}</strong>: ${value}`;
    });

  return `<div style="max-width: 300px; padding: 12px; background: rgba(255,255,255,0.95); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    ${fields.join("<br>")}
  </div>`;
}

function createEdgeTooltip(properties: Record<string, any>): string {
  if (!properties || Object.keys(properties).length === 0) {
    return "";
  }

  const fields = Object.entries(properties)
    .filter(([_, value]) => value !== null && value !== "")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `<strong>${formatKey(key)}</strong>: ${value.join(", ")}`;
      }
      return `<strong>${formatKey(key)}</strong>: ${value}`;
    });

  return `<div style="max-width: 300px; padding: 12px; background: rgba(255,255,255,0.95); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
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
  const [appLabels, setAppLabels] = useState([]);
  const [flowLabels, setFlowLabels] = useState([]);

  const handleQueryResults = useCallback((results: any[]) => {
    const nodes = new Map();
    const edges: any = [];

    setDataTransformed(transformData(results));

    results.forEach((record) => {
      const nodeA = record.a;
      const nodeB = record.b;
      const relationship = record.e;

      if (nodeA && !nodes.has(nodeA.elementId)) {
        const label =
          nodeA.properties.name || nodeA.properties.nickname || "Unnamed";
        nodes.set(nodeA.elementId, {
          id: nodeA.elementId,
          label: label,
          title: createNodeTooltip(nodeA.properties),
          group: nodeA.labels[0].toLowerCase(),
        });
      }

      if (nodeB && !nodes.has(nodeB.elementId)) {
        const label =
          nodeB.properties.name || nodeB.properties.nickname || "Unnamed";
        nodes.set(nodeB.elementId, {
          id: nodeB.elementId,
          label: label,
          title: createNodeTooltip(nodeB.properties),
          group: nodeB.labels[0].toLowerCase(),
        });
      }

      if (
        relationship &&
        relationship.startNodeElementId &&
        relationship.endNodeElementId
      ) {
        edges.push({
          id: relationship.elementId,
          from: relationship.startNodeElementId,
          to: relationship.endNodeElementId,
          label: relationship.properties?.name || relationship.type,
          arrows: "to",
          title: createEdgeTooltip(relationship.properties),
        });
      }
    });

    // Applica il routing intelligente degli archi
    const processedEdges = applyIntelligentEdgeRouting(edges);

    setGraphData({
      nodes: Array.from(nodes.values()),
      edges: processedEdges,
    });
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

    if (Object.keys(applicationData).length === 0) {
      saveApplication(data).then((result) => {
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
      });
    } else {
      editApplication(data).then((result) => {
        if (result && result.length > 0) {
          toast.success("Application edited successfully");
        } else {
          toast.error("Failed to edit application");
        }
      });
    }

    setIsApplicationDialogOpen(false);
    setIsLoading(false);
  };

  const handleSaveFlow = async (data: any) => {
    if (!data) return;
    setIsLoading(true);

    if (Object.keys(flowData).length === 0) {
      saveFlow(data).then((result) => {
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
            
            // Applica il routing intelligente per il nuovo arco
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
      });
    } else {
      editFlow(data).then((result) => {
        if (result && result.length > 0) {
          toast.success("Flow edited successfully");
        } else {
          toast.error("Failed to edit flow");
        }
      });
    }

    setIsFlowDialogOpen(false);
    setIsLoading(false);
  };

  const handleDeleteButton = async (data: any) => {
    if (!data) return;

    const { elementId, type } = data;
    const network = networkRef.current as NetworkWithBody;

    setIsLoading(true);

    if (type == "flow") {
      deleteFlow(data).then((result) => {
        if (result) {
          toast.success("Flow deleted successfully");
          if (networkRef.current) {
            network.body.data.edges.remove(elementId);
          }
        } else {
          toast.error("Error deleting the flow");
        }
      });
    } else if (type == "application") {
      deleteApplication(data).then((result) => {
        if (result) {
          toast.success("Application deleted successfully");
          if (networkRef.current) {
            network.body.data.nodes.remove(elementId);
          }
        } else {
          toast.error("Error deleting the application");
        }
      });
    }

    setIsConfirmModalOpen({ show: false, data: {}, type: "" });
    setIsLoading(false);
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

      const newNodes: any = [];
      const newEdges: any = [];

      const radius = 350; // Aumentato per maggiore distanza
      const angleStep = (2 * Math.PI) / Math.max(results.length, 1);

      const newData = transformData(results);

      setDataTransformed((prev: any) => ({
        ...prev,
        ...newData,
      }));

      results.forEach((record: any, index: any) => {
        const nodeA = record.a;
        const nodeB = record.b;
        const relationship = record.e;

        [nodeA, nodeB].forEach((node) => {
          if (node && !currentDataRef.current.nodes.has(node.elementId)) {
            const angle = angleStep * index;
            const x = sourceNodePosition.x + radius * Math.cos(angle);
            const y = sourceNodePosition.y + radius * Math.sin(angle);

            const nodeData = {
              id: node.elementId,
              label:
                node.properties.name || node.properties.nickname || "Unnamed",
              title: createNodeTooltip(node.properties),
              group: node.labels[0].toLowerCase(),
              x: x,
              y: y,
            };
            currentDataRef.current.nodes.set(node.elementId, nodeData);
            newNodes.push(nodeData);
          }
        });

        if (
          relationship &&
          !currentDataRef.current.edges.has(relationship.elementId)
        ) {
          const edgeData = {
            id: relationship.elementId,
            from: relationship.startNodeElementId,
            to: relationship.endNodeElementId,
            label: relationship.properties.name || relationship.type,
            arrows: "to",
            title: createEdgeTooltip(relationship.properties),
          };
          currentDataRef.current.edges.set(relationship.elementId, edgeData);
          newEdges.push(edgeData);
        }
      });

      if (newNodes.length > 0) {
        network.body.data.nodes.add(newNodes);
      }
      if (newEdges.length > 0) {
        // Applica il routing intelligente anche per i nuovi archi
        const allCurrentEdges = Array.from(currentDataRef.current.edges.values());
        const processedNewEdges = applyIntelligentEdgeRouting([...allCurrentEdges, ...newEdges]);
        
        // Aggiorna solo i nuovi archi con il routing intelligente
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
                  iterations: 800, // Iterazioni ridotte post-espansione
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

      // Listener per il drag dei nodi - ridirezione dinamica degli archi
      networkRef.current.on("dragStart", (params) => {
        networkRef.current?.setOptions({ physics: { enabled: false } });
      });

      networkRef.current.on("dragging", (params) => {
        if (params.nodes.length > 0) {
          const draggedNodeId = params.nodes[0];
          const network = networkRef.current as NetworkWithBody;
          
          // Riposiziona dinamicamente gli archi connessi durante il drag
          repositionConnectedEdges(network, draggedNodeId);
        }
      });

      networkRef.current.on("dragEnd", (params) => {
        if (params.nodes.length > 0) {
          const draggedNodeId = params.nodes[0];
          const network = networkRef.current as NetworkWithBody;
          
          // Riposiziona definitivamente gli archi connessi alla fine del drag
          repositionConnectedEdges(network, draggedNodeId);
        }
        
        networkRef.current?.setOptions({
          physics: { enabled: physicsStateRef.current },
        });
      });

      networkRef.current.on("doubleClick", (params) => {
        if (params.nodes.length > 0) {
          expandNode(params.nodes[0]);
        }
      });

      networkRef.current.on("oncontext", (params) => {
        params.event.preventDefault();
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const nodeData = dataTransformedRef.current[nodeId];
          nodeData["elementId"] = nodeId;
          nodeData["type"] = "application";
          const appData = {
            nodeData,
            hasRelationship: params.edges.length > 0 ? true : false,
          };
          setApplicationData(appData);
          setIsApplicationDialogOpen(true);
        }

        if (params.edges.length > 0 && params.nodes.length === 0) {
          const edgeId = params.edges[0];
          const edgeData = dataTransformedRef.current[edgeId];
          edgeData["elementId"] = edgeId;
          setFlowData(edgeData);
          setIsFlowDialogOpen(true);
        }
      });

      networkRef.current.once("afterDrawing", () => {
        networkRef.current?.fit();
      });

      // Aggiungi listener per stabilizzazione
      networkRef.current.on("stabilizationProgress", (params) => {
        const progress = Math.round((params.iterations / params.total) * 100);
        if (progress % 20 === 0) { // Log ogni 20%
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
      await initializeNetwork();
      setIsLoading(false);
    };
    setup();
  }, [initializeNetwork]);

  useEffect(() => {
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    getConnectedApplicationLabels().then((result) => {
      if (result && result.length > 0) {
        setAppLabels(result);
      } else {
        toast.error("Failed to load applications labels");
      }
    });

    getFlowLabels().then((result) => {
      if (result && result.length > 0) {
        setFlowLabels(result);
      } else {
        toast.error("Failed to load flow labels");
      }
    });
  }, []);

  useEffect(() => {
    dataTransformedRef.current = dataTransformed;
  }, [dataTransformed]);

  /* Gestione Dropdown */

  const [query, setQuery] = useState("MATCH (a)-[e:flow]->(b) RETURN a, e, b");
  const [selectedInitiators, setSelectedInitiators] = useState<string[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [initiatorTargetOperator, setInitiatorTargetOperator] =
    useState<"AND" | "OR">("AND");

  function updateQueryWithFilters(
  baseQuery: string,
  initiators: string[],
  targets: string[],
  labels: string[],
  operator: "AND" | "OR"
): string {
  const filters: string[] = [];

  const initiatorParts =
    initiators.length > 0
      ? initiators.map((i) => `a.name CONTAINS "${i}"`).join(" OR ")
      : "";
  const targetParts =
    targets.length > 0
      ? targets.map((t) => `b.name CONTAINS "${t}"`).join(" OR ")
      : "";

  if (initiatorParts && targetParts) {
    filters.push(`(${initiatorParts}) ${operator} (${targetParts})`);
  } else if (initiatorParts) {
    filters.push(`(${initiatorParts})`);
  } else if (targetParts) {
    filters.push(`(${targetParts})`);
  }

  if (labels.length > 0) {
    const labelFilter = labels.map(l => `e.labels CONTAINS "${l}"`).join(" OR ");
    filters.push(`(${labelFilter})`);
  }

  // Regex per estrarre le parti principali della query
  const matchPart = baseQuery.match(/MATCH[\s\S]*?(?=RETURN|WHERE)/i)?.[0].trim() || '';
  const returnPart = baseQuery.match(/RETURN[\s\S]*$/i)?.[0].trim() || '';

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : '';

  return [matchPart, whereClause, returnPart].filter(Boolean).join(" ");
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
        {/* Gruppo pulsanti */}
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsApplicationDialogOpen(true)}
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
              applicationData.hasRelationship == false ? (
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
                    console.log(flowData);
                    setIsFlowDialogOpen(false);
                  }}
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