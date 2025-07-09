import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { applicationFields, AppFieldConfig } from "@/lib/applicationFields";
import { flowFields, FlowFieldConfig } from "@/lib/flowFields";

type EntityType = "Application" | "Flow";

interface TabState {
  selectedField: AppFieldConfig | FlowFieldConfig | null;
  colorConfig: Record<string, { background: string; border: string }>;
  textInputValue: string;
  dateInputValues: Record<string, string>;
}

interface ColorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    config: {
      Application?: { fieldName: string; colorConfig: Record<string, any> };
      Flow?: { fieldName: string; colorConfig: Record<string, any> };
    }
  ) => void;
  initialConfig?: {
    Application?: { fieldName: string; colorConfig: Record<string, any> };
    Flow?: { fieldName: string; colorConfig: Record<string, any> };
  };
}

const ColorConfigModal: React.FC<ColorConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [entityType, setEntityType] = useState<EntityType>("Application");

  // Funzione helper per ottenere lo stato iniziale di un tab dall'initialConfig
  const getInitialTabState = (et: EntityType): TabState => {
    const extractDates = (cfg: Record<string, any>) => {
      const out = { before: "", at: "", after: "" };
      Object.keys(cfg || {}).forEach((k) => {
        const [p, d] = k.split(":");
        if (p in out) out[p as keyof typeof out] = d;
      });
      return out;
    };
    if (!initialConfig) {
      return {
        selectedField: null,
        colorConfig: {},
        textInputValue: "",
        dateInputValues: { before: "", at: "", after: "" },
      };
    }
    if (et === "Application" && initialConfig.Application) {
      return {
        selectedField:
          applicationFields.find((f) => f.name === initialConfig.Application!.fieldName) || null,
        colorConfig: initialConfig.Application.colorConfig || {},
        textInputValue: "",
        dateInputValues: extractDates(initialConfig.Application.colorConfig),
      };
    }
    if (et === "Flow" && initialConfig.Flow) {
      return {
        selectedField:
          flowFields.find((f) => f.name === initialConfig.Flow!.fieldName) || null,
        colorConfig: initialConfig.Flow.colorConfig || {},
        textInputValue: "",
        dateInputValues: extractDates(initialConfig.Flow.colorConfig),
      };
    }
    return {
      selectedField: null,
      colorConfig: {},
      textInputValue: "",
      dateInputValues: { before: "", at: "", after: "" },
    };
  };

  const [tabsState, setTabsState] = useState<{
    Application: TabState;
    Flow: TabState;
  }>({
    Application: getInitialTabState("Application"),
    Flow: getInitialTabState("Flow"),
  });

  // Aggiorno stato quando la modale si apre o cambia initialConfig
  useEffect(() => {
    if (!isOpen) {
      // resetta tutto quando chiuso
      setTabsState({
        Application: {
          selectedField: null,
          colorConfig: {},
          textInputValue: "",
          dateInputValues: { before: "", at: "", after: "" },
        },
        Flow: {
          selectedField: null,
          colorConfig: {},
          textInputValue: "",
          dateInputValues: { before: "", at: "", after: "" },
        },
      });
      setEntityType("Application");
      return;
    }

    // inizializza stato da initialConfig
    setTabsState({
      Application: getInitialTabState("Application"),
      Flow: getInitialTabState("Flow"),
    });
    setEntityType("Application");
  }, [isOpen, initialConfig]);

  const fields = entityType === "Application" ? applicationFields : flowFields;
  const curr = tabsState[entityType];

  const updateState = (patch: Partial<TabState>) => {
    setTabsState((prev) => ({
      ...prev,
      [entityType]: { ...prev[entityType], ...patch },
    }));
  };

  const onColorChange = (value: string, type: "background" | "border", color: string) => {
    updateState({
      colorConfig: {
        ...curr.colorConfig,
        [value]: { ...curr.colorConfig[value], [type]: color },
      },
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
    //if (onReset) onReset();
  };

  const handleSave = () => {
    const cfg: any = {};
    (["Application", "Flow"] as EntityType[]).forEach((et) => {
      const ts = tabsState[et];
      if (ts.selectedField) {
        cfg[et] = {
          fieldName: ts.selectedField.name,
          colorConfig: ts.colorConfig,
        };
      }
    });
    onSave(cfg);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] z-[400]">
        <DialogHeader>
          <DialogTitle className="text-gray-800">Configure Colors</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Select an entity, choose a field and assign colors to its values.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            {(["Application", "Flow"] as EntityType[]).map((et) => (
              <button
                key={et}
                onClick={() => setEntityType(et)}
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  entityType === et
                    ? "border-gray-800 text-gray-800"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {et}
              </button>
            ))}
          </div>
          {/* field select */}
          <div>
            <label className="block mb-1 text-sm text-gray-700">Field</label>
            <select
              value={curr.selectedField?.name || ""}
              onChange={(e) => {
                const f = fields.find((f) => f.name === e.target.value) || null;
                updateState({
                  selectedField: f,
                  colorConfig: {},
                  textInputValue: "",
                  dateInputValues: { before: "", at: "", after: "" },
                });
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option disabled value="">
                Select a field
              </option>
              {fields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* configurator */}
          {curr.selectedField && (
            <div>
              {curr.selectedField.type === "select" && curr.selectedField.options && (
                <div className="space-y-2 border border-gray-200 p-3 rounded">
                  {curr.selectedField.options.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2">
                      <span className="flex-1 text-sm text-gray-700">{label}</span>
                      <input
                        type="color"
                        value={curr.colorConfig[value]?.background || "#000000"}
                        onChange={(e) => onColorChange(value, "background", e.target.value)}
                        className="w-8 h-7"
                      />
                    </div>
                  ))}
                </div>
              )}
              {curr.selectedField.type === "switch" && (
                <div className="space-y-2 border border-gray-200 p-3 rounded">
                  {["true", "false"].map((v) => (
                    <div key={v} className="flex items-center gap-2">
                      <span className="flex-1 text-sm text-gray-700">{v}</span>
                      <input
                        type="color"
                        value={curr.colorConfig[v]?.background || "#000000"}
                        onChange={(e) => onColorChange(v, "background", e.target.value)}
                        className="w-8 h-7"
                      />
                    </div>
                  ))}
                </div>
              )}
              {curr.selectedField.type === "date" && (
                <div className="space-y-2 border border-gray-200 p-3 rounded">
                  {(["before", "at", "after"] as const).map((cmp) => {
                    const val = curr.dateInputValues[cmp];
                    const min = cmp === "at" ? curr.dateInputValues.before || undefined : undefined;
                    const max = cmp === "at" ? curr.dateInputValues.after || undefined : undefined;
                    return (
                      <div key={cmp} className="flex items-center gap-2">
                        <span className="w-20 text-sm text-gray-700">{cmp}</span>
                        <input
                          type="date"
                          value={val}
                          min={min}
                          max={max}
                          onChange={(e) => {
                            const d = e.target.value;
                            updateState({
                              dateInputValues: { ...curr.dateInputValues, [cmp]: d },
                              colorConfig: {
                                ...curr.colorConfig,
                                [`${cmp}:${d}`]:
                                  curr.colorConfig[`${cmp}:${d}`] || { background: "#000000", border: "#000000" },
                              },
                            });
                          }}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="color"
                          value={curr.colorConfig[`${cmp}:${val}`]?.background || "#000000"}
                          onChange={(e) => onColorChange(`${cmp}:${val}`, "background", e.target.value)}
                          className="w-8 h-7"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {(curr.selectedField.type === "text" || curr.selectedField.type === "rich-text") && (
                <div className="space-y-2 border border-gray-200 p-3 rounded">
                  {Object.entries(curr.colorConfig).map(([v, cfg]) => (
                    <div key={v} className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={v}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700"
                      />
                      <input
                        type="color"
                        value={cfg.background}
                        onChange={(e) => onColorChange(v, "background", e.target.value)}
                        className="w-8 h-7"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cc = { ...curr.colorConfig };
                          delete cc[v];
                          updateState({ colorConfig: cc });
                        }}
                        className="text-gray-400 hover:text-red-500 text-sm px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div
                    className={`flex items-center gap-2 pt-2 mt-2 ${
                      Object.keys(curr.colorConfig).length > 0 ? "border-t border-gray-200" : ""
                    }`}
                  >
                    <input
                      type="text"
                      placeholder="Add value"
                      value={curr.textInputValue}
                      onChange={(e) => updateState({ textInputValue: e.target.value })}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nv = curr.textInputValue.trim();
                        if (!nv || curr.colorConfig[nv]) return;
                        updateState({
                          colorConfig: { ...curr.colorConfig, [nv]: { background: "#000000", border: "#000000" } },
                          textInputValue: "",
                        });
                      }}
                      disabled={curr.textInputValue.trim() === ""}
                      className={`px-3 py-1 border border-gray-300 rounded text-sm ${
                        curr.textInputValue.trim() === ""
                          ? "text-gray-400 cursor-not-allowed bg-gray-100"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset pulsante */}
          <div className="flex justify-start mt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="text-sm border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Reset
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-sm border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="text-sm bg-gray-800 text-white hover:bg-gray-700"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColorConfigModal;
