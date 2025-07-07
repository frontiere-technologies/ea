"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface ColorSettings {
  nodeProperty: string | null;
  nodeColors: Record<string, string>;
  edgeProperty: string | null;
  edgeColors: Record<string, string>;
}

interface ColorSettingsModalProps {
  open: boolean;
  onClose: () => void;
  data: Record<string, any>;
  onApply: (settings: ColorSettings) => void;
}

export function ColorSettingsModal({
  open,
  onClose,
  data,
  onApply,
}: ColorSettingsModalProps) {
  const [nodeProperty, setNodeProperty] = useState<string | null>(null);
  const [edgeProperty, setEdgeProperty] = useState<string | null>(null);
  const [nodeColors, setNodeColors] = useState<Record<string, string>>({});
  const [edgeColors, setEdgeColors] = useState<Record<string, string>>({});

  const nodeProperties = useMemo(() => {
    const props = new Set<string>();
    Object.values(data).forEach((item: any) => {
      if (item.labels) {
        Object.keys(item).forEach((k) => {
          if (!["labels", "elementId", "type"].includes(k)) props.add(k);
        });
      }
    });
    return Array.from(props);
  }, [data]);

  const edgeProperties = useMemo(() => {
    const props = new Set<string>();
    Object.values(data).forEach((item: any) => {
      if (item.type) {
        Object.keys(item).forEach((k) => {
          if (!["type", "initiator_application", "target_application"].includes(k))
            props.add(k);
        });
      }
    });
    return Array.from(props);
  }, [data]);

  const nodeValues = useMemo(() => {
    if (!nodeProperty) return [] as string[];
    const vals = new Set<string>();
    Object.values(data).forEach((item: any) => {
      if (item.labels && item[nodeProperty] !== undefined) {
        vals.add(String(item[nodeProperty]));
      }
    });
    return Array.from(vals);
  }, [data, nodeProperty]);

  const edgeValues = useMemo(() => {
    if (!edgeProperty) return [] as string[];
    const vals = new Set<string>();
    Object.values(data).forEach((item: any) => {
      if (item.type && item[edgeProperty] !== undefined) {
        vals.add(String(item[edgeProperty]));
      }
    });
    return Array.from(vals);
  }, [data, edgeProperty]);

  useEffect(() => {
    const colors: Record<string, string> = {};
    nodeValues.forEach((v) => {
      colors[v] = nodeColors[v] || "#ff0000";
    });
    setNodeColors(colors);
  }, [nodeValues]);

  useEffect(() => {
    const colors: Record<string, string> = {};
    edgeValues.forEach((v) => {
      colors[v] = edgeColors[v] || "#ff0000";
    });
    setEdgeColors(colors);
  }, [edgeValues]);

  const handleApply = () => {
    onApply({ nodeProperty, nodeColors, edgeProperty, edgeColors });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] z-[700]">
        <DialogHeader>
          <DialogTitle>Color settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h3 className="font-semibold mb-2">Applications</h3>
            <Select value={nodeProperty || undefined} onValueChange={setNodeProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {nodeProperties.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {nodeProperty && (
              <div className="mt-4 space-y-2">
                {nodeValues.map((val) => (
                  <div key={val} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">{val}</span>
                    <input
                      type="color"
                      value={nodeColors[val]}
                      onChange={(e) =>
                        setNodeColors((prev) => ({ ...prev, [val]: e.target.value }))
                      }
                      className="w-8 h-8 p-0 border rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Flows</h3>
            <Select value={edgeProperty || undefined} onValueChange={setEdgeProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {edgeProperties.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {edgeProperty && (
              <div className="mt-4 space-y-2">
                {edgeValues.map((val) => (
                  <div key={val} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">{val}</span>
                    <input
                      type="color"
                      value={edgeColors[val]}
                      onChange={(e) =>
                        setEdgeColors((prev) => ({ ...prev, [val]: e.target.value }))
                      }
                      className="w-8 h-8 p-0 border rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

