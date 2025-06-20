"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (query: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("queryHistory");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHistory(parsed);
          }
        } catch {
          setHistory([]);
        }
      }
    }
  }, [isOpen]);

  const handleApply = () => {
    if (selectedQuery) {
      onApply(selectedQuery);
      setSelectedQuery(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] z-[1000]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Query History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] rounded-md p-3 bg-white">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No history found.</p>
          ) : (
            <ul className="space-y-2 font-mono text-sm">
              {history.map((q, i) => (
                <li
                  key={i}
                  className={cn(
                    "cursor-pointer rounded-md border border-gray-300 px-3 py-2 break-words select-text",
                    selectedQuery === q
                      ? "bg-gray-200 border-gray-300"
                      : "hover:bg-gray-100 border-gray-300"
                  )}
                  onClick={() => setSelectedQuery(q)}
                >
                  {q}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!selectedQuery}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
