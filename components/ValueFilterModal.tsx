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
import { Plus } from "lucide-react";

type EntityType = "Application" | "Flow";

interface TabState {
  selectedField: AppFieldConfig | FlowFieldConfig | null;
  selectedValues: string[];
  textInputValue: string;
  dateInputValues: Record<"before" | "at" | "after", string>;
}

interface ValueFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cypherQuery: string) => void;
}

const ValueFilterModal: React.FC<ValueFilterModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [entityType, setEntityType] = useState<EntityType>("Application");

  const getInitialTabState = (): TabState => ({
    selectedField: null,
    selectedValues: [],
    textInputValue: "",
    dateInputValues: { before: "", at: "", after: "" },
  });

  const [tabsState, setTabsState] = useState<{
    Application: TabState;
    Flow: TabState;
  }>({
    Application: getInitialTabState(),
    Flow: getInitialTabState(),
  });

  useEffect(() => {
    if (!isOpen) {
      setTabsState({
        Application: getInitialTabState(),
        Flow: getInitialTabState(),
      });
      setEntityType("Application");
    }
  }, [isOpen]);

  const fields = entityType === "Application" ? applicationFields : flowFields;
  const curr = tabsState[entityType];

  const updateState = (patch: Partial<TabState>) => {
    setTabsState((prev) => ({
      ...prev,
      [entityType]: { ...prev[entityType], ...patch },
    }));
  };

  const handleReset = () => {
    setTabsState((prev) => ({
      ...prev,
      [entityType]: getInitialTabState(),
    }));
  };

  const handleSave = () => {
  const buildFilters = (tab: TabState, nodeAlias: string): string[] => {
    const filters: string[] = [];
    const fieldName = tab.selectedField?.name;
    if (!tab.selectedField || !fieldName) return filters;

    if (
      ["select", "text", "rich-text"].includes(tab.selectedField.type) &&
      tab.selectedValues.length > 0
    ) {
      tab.selectedValues.forEach((val) => {
        filters.push(
          `${nodeAlias}.${fieldName} CONTAINS "${val.toLowerCase()}"`
        );
      });
    }

    if (tab.selectedField.type === "switch") {
      const isTrue = tab.selectedValues.includes("true");
      filters.push(`${nodeAlias}.${fieldName} = ${isTrue}`);
    }

    if (tab.selectedField.type === "date") {
      const { before, at, after } = tab.dateInputValues;
      if (before) filters.push(`${nodeAlias}.${fieldName} < "${before}"`);
      if (at) filters.push(`${nodeAlias}.${fieldName} = "${at}"`);
      if (after) filters.push(`${nodeAlias}.${fieldName} > "${after}"`);
    }

    return filters;
  };

  const appFilters = buildFilters(tabsState.Application, "a");
  const flowFilters = buildFilters(tabsState.Flow, "e");

  if (appFilters.length === 0 && flowFilters.length === 0) return;

  const whereClauses: string[] = [];
  if (appFilters.length > 0) whereClauses.push(`(${appFilters.join(" OR ")})`);
  if (flowFilters.length > 0) whereClauses.push(`(${flowFilters.join(" OR ")})`);

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const cypherQuery = `MATCH (a)-[e:flow]->(b) ${whereClause} RETURN a, e, b`;

  onSave(cypherQuery.trim());
  onClose();
};





  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] z-[400]">
        <DialogHeader>
          <DialogTitle className="text-gray-800">Filter by field</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Select an entity, choose a field and filter its values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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

          <div>
            <label className="block mb-1 text-sm text-gray-700">Field</label>
            <select
              value={curr.selectedField?.name || ""}
              onChange={(e) => {
                const f = fields.find((f) => f.name === e.target.value) || null;
                updateState({
                  selectedField: f,
                  selectedValues: [],
                  textInputValue: "",
                  dateInputValues: { before: "", at: "", after: "" },
                });
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800"
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

          {curr.selectedField && (
            <div>
              {/* Boolean Switch */}
              {curr.selectedField.type === "switch" && (
                <div className="flex items-center gap-2 border border-gray-200 p-3 rounded">
                  <input
                    type="checkbox"
                    checked={curr.selectedValues.includes("true")}
                    onChange={() => {
                      const newValue = curr.selectedValues.includes("true") ? [] : ["true"];
                      updateState({ selectedValues: newValue });
                    }}
                  />
                  <span className="text-sm text-gray-700">
                    {curr.selectedField.label}
                  </span>
                </div>
              )}

              {/* Select Field */}
              {curr.selectedField.type === "select" &&
                curr.selectedField.options?.map(({ value, label }) => (
                  <div
                    key={value}
                    className="flex items-center gap-2 border border-gray-200 p-2 rounded mb-1"
                  >
                    <input
                      type="checkbox"
                      checked={curr.selectedValues.includes(value)}
                      onChange={() => {
                        const selected = curr.selectedValues.includes(value)
                          ? curr.selectedValues.filter((v) => v !== value)
                          : [...curr.selectedValues, value];
                        updateState({ selectedValues: selected });
                      }}
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                ))}

              {/* Text Fields */}
              {["text", "rich-text"].includes(curr.selectedField.type) && (
                <div className="space-y-2 border border-gray-200 p-3 rounded">
                  {curr.selectedValues.map((val) => (
                    <div key={val} className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={val}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700"
                      />
                      <button
                        onClick={() =>
                          updateState({
                            selectedValues: curr.selectedValues.filter((v) => v !== val),
                          })
                        }
                        className="text-gray-400 hover:text-red-500 text-sm px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div
                    className={`flex items-center gap-2 pt-2 mt-2 ${
                      curr.selectedValues.length > 0 ? "border-t border-gray-200" : ""
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
                        if (!nv || curr.selectedValues.includes(nv)) return;
                        updateState({
                          selectedValues: [...curr.selectedValues, nv],
                          textInputValue: "",
                        });
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Date Field */}
              {curr.selectedField.type === "date" && (
                <div className="space-y-2 border border-gray-200 p-3 rounded">
                  {(["before", "at", "after"] as const).map((cmp) => (
                    <div key={cmp} className="flex items-center gap-2">
                      <span className="w-20 text-sm text-gray-700">{cmp}</span>
                      <input
                        type="date"
                        value={curr.dateInputValues[cmp]}
                        onChange={(e) =>
                          updateState({
                            dateInputValues: {
                              ...curr.dateInputValues,
                              [cmp]: e.target.value,
                            },
                          })
                        }
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

export default ValueFilterModal;
