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

type EntityType = "Application" | "Flow";

interface TabState {
  selectedField: AppFieldConfig | FlowFieldConfig | null;
  colorConfig: Record<string, { background: string; border: string }>;
  textInputValue: string;
}

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
  onReset?: () => void;
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

const ColorConfigModal: React.FC<ColorConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onReset,
  initialConfig,
}) => {
  const [entityType, setEntityType] = useState<EntityType>("Application");

  const [tabsState, setTabsState] = useState<{
    Application: TabState;
    Flow: TabState;
  }>({
    Application: {
      selectedField: null,
      colorConfig: {},
      textInputValue: "",
    },
    Flow: {
      selectedField: null,
      colorConfig: {},
      textInputValue: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setTabsState({
        Application: { selectedField: null, colorConfig: {}, textInputValue: "" },
        Flow: { selectedField: null, colorConfig: {}, textInputValue: "" },
      });
      setEntityType("Application");
    } else if (initialConfig) {
      setTabsState({
        Application: {
          selectedField: initialConfig.Application
            ? applicationFields.find((f) => f.name === initialConfig.Application!.fieldName) || null
            : null,
          colorConfig: initialConfig.Application?.colorConfig || {},
          textInputValue: "",
        },
        Flow: {
          selectedField: initialConfig.Flow
            ? flowFields.find((f) => f.name === initialConfig.Flow!.fieldName) || null
            : null,
          colorConfig: initialConfig.Flow?.colorConfig || {},
          textInputValue: "",
        },
      });
      setEntityType("Application");
    }
  }, [isOpen, initialConfig]);

  const fields = entityType === "Application" ? applicationFields : flowFields;

  const currentTabState = tabsState[entityType];

  const onFieldChange = (fieldName: string) => {
    const field = fields.find((f) => f.name === fieldName) || null;
    setTabsState((prev) => ({
      ...prev,
      [entityType]: {
        selectedField: field,
        colorConfig: {},
        textInputValue: "",
      },
    }));
  };

  const onColorChange = (
    value: string,
    colorType: "background" | "border",
    color: string
  ) => {
    setTabsState((prev) => {
      const current = prev[entityType];
      return {
        ...prev,
        [entityType]: {
          ...current,
          colorConfig: {
            ...current.colorConfig,
            [value]: {
              ...current.colorConfig[value],
              [colorType]: color,
            },
          },
        },
      };
    });
  };

  const handleReset = () => {
    setTabsState((prev) => ({
      ...prev,
      [entityType]: {
        selectedField: null,
        colorConfig: {},
        textInputValue: "",
      },
    }));
    if (onReset) onReset();
  };

  const handleSave = () => {
    const result: any = {};
    if (tabsState.Application.selectedField) {
      result.Application = {
        fieldName: tabsState.Application.selectedField.name,
        colorConfig: tabsState.Application.colorConfig,
      };
    }
    if (tabsState.Flow.selectedField) {
      result.Flow = {
        fieldName: tabsState.Flow.selectedField.name,
        colorConfig: tabsState.Flow.colorConfig,
      };
    }
    onSave(result);
    onClose();
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
          <div className="flex gap-4 border-b">
            {(["Application", "Flow"] as EntityType[]).map((type) => (
              <button
                key={type}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  entityType === type
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setEntityType(type)}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>

          <div>
            <label className="block mb-1 font-medium">Field</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={currentTabState.selectedField?.name || ""}
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

          {currentTabState.selectedField && (
            <div>
              {currentTabState.selectedField.type === "select" &&
              currentTabState.selectedField.options ? (
                <div className="space-y-2 max-h-48 overflow-auto border p-2 rounded">
                  {currentTabState.selectedField.options.map(({ value, label }) => (
                    <div key={value} className="flex items-center justify-between gap-4">
                      <div className="flex-1">{label}</div>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          title="Background"
                          value={currentTabState.colorConfig[value]?.background || "#000000"}
                          onChange={(e) => onColorChange(value, "background", e.target.value)}
                          className="w-8 h-7"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentTabState.selectedField.type === "text" ||
                currentTabState.selectedField.type === "rich-text" ? (
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Enter value"
                    value={currentTabState.textInputValue}
                    onChange={(e) =>
                      setTabsState((prev) => ({
                        ...prev,
                        [entityType]: {
                          ...prev[entityType],
                          textInputValue: e.target.value,
                        },
                      }))
                    }
                    className="flex-1 border rounded px-3 py-2"
                  />
                  <input
                    type="color"
                    title="Background"
                    value={
                      currentTabState.colorConfig[currentTabState.textInputValue]?.background || "#000000"
                    }
                    onChange={(e) =>
                      onColorChange(currentTabState.textInputValue, "background", e.target.value)
                    }
                    className="w-8 h-7"
                  />
                </div>
              ) : currentTabState.selectedField.type === "switch" ? (
                <div className="space-y-2 max-h-48 overflow-auto border p-2 rounded">
                  {["true", "false"].map((val) => (
                    <div key={val} className="flex items-center justify-between gap-4">
                      <div className="flex-1">{val === "true" ? "True" : "False"}</div>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          title="Background"
                          value={currentTabState.colorConfig[val]?.background || "#000000"}
                          onChange={(e) => onColorChange(val, "background", e.target.value)}
                          className="w-8 h-7"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentTabState.selectedField.type === "date" ? (
                <div className="space-y-2 max-h-48 overflow-auto border p-2 rounded">
                  {["before", "at", "after"].map((comparison) => (
                    <div key={comparison} className="flex items-center gap-2">
                      <div className="w-20 capitalize">{comparison}</div>
                      <input
                        type="date"
                        value={
                          (() => {
                            const key = Object.keys(currentTabState.colorConfig).find((k) =>
                              k.startsWith(`${comparison}:`)
                            );
                            return key?.split(":")[1] || "";
                          })()
                        }
                        onChange={(e) => {
                          const dateKey = `${comparison}:${e.target.value}`;
                          onColorChange(dateKey, "background", currentTabState.colorConfig[dateKey]?.background || "#000000");
                        }}
                        className="flex-1 border rounded px-2 py-1"
                      />
                      <input
                        type="color"
                        value={
                          (() => {
                            const key = Object.keys(currentTabState.colorConfig).find((k) =>
                              k.startsWith(`${comparison}:`)
                            );
                            return key ? currentTabState.colorConfig[key]?.background || "#000000" : "#000000";
                          })()
                        }
                        onChange={(e) => {
                          const existingKey = Object.keys(currentTabState.colorConfig).find((k) =>
                            k.startsWith(`${comparison}:`)
                          );
                          const datePart = existingKey?.split(":")[1] || "";
                          const newKey = `${comparison}:${datePart}`;
                          onColorChange(newKey, "background", e.target.value);
                        }}
                        className="w-8 h-7"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Color configuration available only for text, rich-text, select, switch, or date fields.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-between items-center w-full px-4">
          <div>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button
              disabled={
                !tabsState.Application.selectedField &&
                !tabsState.Flow.selectedField
              }
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColorConfigModal;
