"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";

interface MultiselectDropdownProps {
  options: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiselectDropdown({
  options,
  onChange,
  placeholder = "Select...",
}: MultiselectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    const updated = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option];
    setSelectedOptions(updated);
    onChange(updated);
  };

  const clearAll = () => {
    setSelectedOptions([]);
    onChange([]);
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border rounded-md shadow-sm bg-white w-[220px] relative">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex justify-between items-center px-4 py-2 w-full text-sm font-medium cursor-pointer select-none">
          <span className="truncate">{placeholder}</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent
          className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-md w-full z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pt-3 pb-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="px-4 max-h-[160px] overflow-y-auto space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="text-gray-500 text-center text-sm py-2">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={`flex justify-between items-center px-3 py-2 rounded cursor-pointer text-sm select-none ${
                      isSelected
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 pt-2 pb-3">
            <Button
              onClick={clearAll}
              disabled={selectedOptions.length === 0}
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 disabled:text-gray-400 p-0 h-auto hover:bg-transparent hover:text-blue-600"
            >
              Clear all
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
