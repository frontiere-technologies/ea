"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="border border-border rounded-md shadow-sm bg-card w-[220px] relative">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex justify-between items-center px-4 py-2 w-full text-sm font-medium cursor-pointer select-none text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <span className="truncate">{placeholder}</span>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-300",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent
          className="absolute left-0 top-full mt-1 bg-card border border-border rounded-md shadow-md w-full z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pt-3 pb-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-sm transition-colors"
            />
          </div>

          <div className="px-4 max-h-[160px] overflow-y-auto space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground text-center text-sm py-2">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={cn(
                      "flex justify-between items-center px-3 py-2 rounded cursor-pointer text-sm select-none transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-accent hover:text-accent-foreground text-card-foreground"
                    )}
                  >
                    <span>{option}</span>
                    {isSelected && <Check className="w-4 h-4" />}
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
              className="text-xs p-0 h-auto hover:bg-transparent disabled:opacity-50"
            >
              Clear all
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}