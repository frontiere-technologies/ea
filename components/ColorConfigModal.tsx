import React, { useState, useEffect } from "react";
import { applicationFields, AppFieldConfig } from "@/lib/applicationFields";
import { flowFields, FlowFieldConfig } from "@/lib/flowFields";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ColorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    config: {
      Application?: {
        fieldName: string;
        colorConfig: Record<string, { background: string; border: string }>;
      };
      Flow?: {
        fieldName: string;
        colorConfig: Record<string, { background: string; border: string }>;
      };
    }
  ) => void;
  onReset?: () => void; // nuova prop opzionale per reset globale
  initialConfig?: {
    Application?: {
      fieldName: string;
      colorConfig: Record<string, { background: string; border: string }>;
    };
    Flow?: {
      fieldName: string;
      colorConfig: Record<string, { background: string; border: string }>;
    };
  };
}

type EntityType = "Application" | "Flow";

const ColorConfigModal: React.FC<ColorConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onReset,
  initialConfig,
}) => {
  const [entityType, setEntityType] = useState<EntityType>("Application");
  const [selectedField, setSelectedField] = useState<AppFieldConfig | FlowFieldConfig | null>(null);
  const [colorConfig, setColorConfig] = useState<Record<string, { background: string; border: string }>>({});
  const [textInputValue, setTextInputValue] = useState<string>("");

  // Sincronizza stato interno con config esterna (utile per reset o apertura modale)
  useEffect(() => {
    if (!isOpen) {
      setSelectedField(null);
      setEntityType("Application");
      setColorConfig({});
      setTextInputValue("");
    } else if (initialConfig) {
      // Imposta in base al tipo e campo configurato nella config iniziale
      if (initialConfig.Application) {
        setEntityType("Application");
        const field = applicationFields.find(f => f.name === initialConfig.Application!.fieldName) || null;
        setSelectedField(field);
        setColorConfig(initialConfig.Application.colorConfig || {});
      } else if (initialConfig.Flow) {
        setEntityType("Flow");
        const field = flowFields.find(f => f.name === initialConfig.Flow!.fieldName) || null;
        setSelectedField(field);
        setColorConfig(initialConfig.Flow.colorConfig || {});
      }
      setTextInputValue("");
    }
  }, [isOpen, initialConfig]);

  const fields = entityType === "Application"
    ? applicationFields
    : (flowFields as Array<AppFieldConfig | FlowFieldConfig>);

  const onFieldChange = (fieldName: string) => {
    const field = fields.find((f) => f.name === fieldName) || null;
    setSelectedField(field);
    setColorConfig({});
    setTextInputValue("");
  };

  const onColorChange = (
    value: string,
    colorType: "background" | "border",
    color: string
  ) => {
    setColorConfig((prev) => ({
      ...prev,
      [value]: {
        ...prev[value],
        [colorType]: color,
      },
    }));
  };

  const handleSave = () => {
    if (selectedField) {
      onSave({
        [entityType]: {
          fieldName: selectedField.name,
          colorConfig: colorConfig,
        },
      });
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedField(null);
    setColorConfig({});
    setTextInputValue("");
    if (onReset) {
      onReset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] z-[400]">
        <DialogHeader>
          <DialogTitle>Configure Colors</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            Select an entity, choose a field and assign colors to its values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Tab tipo entity */}
          <div className="flex gap-4 border-b">
            {(["Application", "Flow"] as EntityType[]).map((type) => (
              <button
                key={type}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  entityType === type
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => {
                  setEntityType(type);
                  setSelectedField(null);
                  setColorConfig({});
                  setTextInputValue("");
                }}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>

          {/* Select Field */}
          <div>
            <label className="block mb-1 font-medium">Field</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedField?.name || ""}
              onChange={(e) => onFieldChange(e.target.value)}
            >
              <option value="" disabled>
                Select a field
              </option>
              {fields.map((field) => (
                <option key={field.name} value={field.name}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          {/* Configurazione colori */}
          {selectedField && (
            <div>
              {selectedField.type === "select" && selectedField.options ? (
                <div className="space-y-2 max-h-48 overflow-auto border p-2 rounded">
                  {selectedField.options.map(({ value, label }) => (
                    <div
                      key={value}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex-1">{label}</div>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          title="Background"
                          value={
                            colorConfig[value]?.background || "#000000"
                          }
                          onChange={(e) =>
                            onColorChange(value, "background", e.target.value)
                          }
                          className="w-8 h-7"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedField.type === "text" ? (
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Enter value"
                    value={textInputValue}
                    onChange={(e) => setTextInputValue(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                  />
                  <input
                    type="color"
                    title="Background"
                    value={
                      colorConfig[textInputValue]?.background || "#000000"
                    }
                    onChange={(e) =>
                      onColorChange(
                        textInputValue,
                        "background",
                        e.target.value
                      )
                    }
                    className="w-8 h-7"
                  />
                </div>
              ) : selectedField.type === "switch" ? (
                <div className="space-y-2 max-h-48 overflow-auto border p-2 rounded">
                  {["true", "false"].map((val) => (
                    <div
                      key={val}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex-1">{val === "true" ? "True" : "False"}</div>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          title="Background"
                          value={
                            colorConfig[val]?.background || "#000000"
                          }
                          onChange={(e) =>
                            onColorChange(val, "background", e.target.value)
                          }
                          className="w-8 h-7"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Color configuration available only for text, select or switch fields.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!selectedField} onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColorConfigModal;
