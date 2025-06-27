"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ColorRule {
  field: string;
  value: string;
  color: string;
}

interface ColorConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeRules: ColorRule[];
  setNodeRules: (rules: ColorRule[]) => void;
  edgeRules: ColorRule[];
  setEdgeRules: (rules: ColorRule[]) => void;
}

function RuleSection({
  title,
  rules,
  setRules,
}: {
  title: string;
  rules: ColorRule[];
  setRules: (rules: ColorRule[]) => void;
}) {
  const updateRule = (index: number, key: keyof ColorRule, value: string) => {
    const updated = rules.map((r, i) => (i === index ? { ...r, [key]: value } : r));
    setRules(updated);
  };

  const addRule = () => {
    setRules([...rules, { field: "", value: "", color: "#ff0000" }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 mb-4">
      <h3 className="font-semibold">{title}</h3>
      {rules.map((rule, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2 items-center">
          <Input
            value={rule.field}
            onChange={(e) => updateRule(idx, "field", e.target.value)}
            placeholder="Field"
          />
          <Input
            value={rule.value}
            onChange={(e) => updateRule(idx, "value", e.target.value)}
            placeholder="Value"
          />
          <input
            type="color"
            value={rule.color}
            onChange={(e) => updateRule(idx, "color", e.target.value)}
            className="h-10 w-full rounded-md border"
          />
          <Button variant="ghost" size="sm" onClick={() => removeRule(idx)}>
            Remove
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRule}>
        Add rule
      </Button>
    </div>
  );
}

export function ColorConfigDialog({
  open,
  onOpenChange,
  nodeRules,
  setNodeRules,
  edgeRules,
  setEdgeRules,
}: ColorConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col z-[700]">
        <DialogHeader>
          <DialogTitle>Color configuration</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-1 py-2">
          <RuleSection title="Applications" rules={nodeRules} setRules={setNodeRules} />
          <RuleSection title="Flows" rules={edgeRules} setRules={setEdgeRules} />
        </ScrollArea>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

