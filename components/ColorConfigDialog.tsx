"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ColorRule {
  field: string;
  value: string;
  color: string;
}

interface FieldOption {
  value: string;
  label: string;
  values: string[];
}

const nodeFieldOptions: FieldOption[] = [
  {
    value: "application_type",
    label: "Application type",
    values: [
      "Mobile Application",
      "Web Application",
      "Desktop Application",
      "BackEnd Application",
      "Other",
    ],
  },
  {
    value: "complexity",
    label: "Complexity",
    values: ["High", "Medium", "Low", "Critical", "Unknown"],
  },
  {
    value: "criticality",
    label: "Criticality",
    values: ["High", "Medium", "Low", "Critical", "Unknown"],
  },
  {
    value: "effort",
    label: "Effort",
    values: ["High", "Medium", "Low", "Critical", "Unknown"],
  },
  {
    value: "hosting",
    label: "Hosting",
    values: [
      "Engineering Data Center",
      "GCP (Go Reply)",
      "Standalone",
      "Azure (Arcese)",
      "Supplier Private Cloud",
      "Azure (Microsoft)",
    ],
  },
  {
    value: "bi",
    label: "BI",
    values: [
      "Unknown",
      "Actual BI",
      "To manage",
      "Partial BI",
      "Data Platform",
    ],
  },
  {
    value: "user_license_type",
    label: "User license type",
    values: [
      "Licenza concorrente",
      "Licenza nominale",
      "Licenza non applicata all'utente",
      "Nessuna licenza",
    ],
  },
  {
    value: "ams_service",
    label: "AMS service",
    values: ["No", "On Demand"],
  },
];

const edgeFieldOptions: FieldOption[] = [
  {
    value: "communication_mode",
    label: "Communication mode",
    values: ["Synchronous", "Asynchronous"],
  },
  {
    value: "message_format",
    label: "Message format",
    values: [
      "binary",
      "csv",
      "doc",
      "image",
      "json",
      "pdf",
      "text",
      "xml",
      "multiple-formats",
      "unknown",
    ],
  },
  {
    value: "protocol",
    label: "Protocol",
    values: [
      "api",
      "cdc:debezium",
      "db",
      "db:stored-procedure",
      "edi:generic",
      "email",
      "folder",
      "ftp",
      "http",
      "http:azure-blob-storage",
      "human-manual-task",
      "ldap",
      "queue",
      "queue:azure-service-bus",
      "soap",
      "topic",
      "topic:kafka",
      "wcf",
      "web-api",
      "unknown",
    ],
  },
  {
    value: "intent",
    label: "Intent",
    values: [
      "read",
      "write",
      "read:query",
      "read:dequeue",
      "read:subscribe",
      "write:command",
      "write:insert",
      "write:enqueue",
      "write:publish",
      "unknown",
    ],
  },
  {
    value: "data_flow",
    label: "Data flow",
    values: ["in", "out"],
  },
];

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
  fieldOptions,
}: {
  title: string;
  rules: ColorRule[];
  setRules: (rules: ColorRule[]) => void;
  fieldOptions: FieldOption[];
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
      {rules.map((rule, idx) => {
        const values = fieldOptions.find((f) => f.value === rule.field)?.values || [];
        return (
          <div key={idx} className="grid grid-cols-4 gap-2 items-center">
            <Select
              value={rule.field}
              onValueChange={(v) => updateRule(idx, "field", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                {fieldOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={rule.value}
              onValueChange={(v) => updateRule(idx, "value", v)}
              disabled={!rule.field}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent>
                {values.map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        );
      })}
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
          <RuleSection
            title="Applications"
            rules={nodeRules}
            setRules={setNodeRules}
            fieldOptions={nodeFieldOptions}
          />
          <RuleSection
            title="Flows"
            rules={edgeRules}
            setRules={setEdgeRules}
            fieldOptions={edgeFieldOptions}
          />
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

