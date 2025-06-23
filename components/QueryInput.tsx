"use client";

import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { executeQuery } from "@/lib/neo4j";
import { toast } from "sonner";
import { HistoryModal } from "./HistoryModal";

interface QueryInputProps {
  query: string;
  setQuery: (newQuery: string) => void;
  onQueryResults: (results: any[]) => void;
  showHistory: Boolean
}

export function QueryInput({
  query,
  setQuery,
  onQueryResults,
  showHistory
}: QueryInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const saveQueryToHistory = (newQuery: string) => {
    if (!newQuery.trim()) return;

    const stored = localStorage.getItem("queryHistory");
    let history: string[] = stored ? JSON.parse(stored) : [];

    // Rimuovi duplicati e metti la query in cima
    history = [newQuery, ...history.filter((q) => q !== newQuery)].slice(0, 5);
    localStorage.setItem("queryHistory", JSON.stringify(history));
  };

  const handleExecute = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      saveQueryToHistory(query);
      const results = await executeQuery(
        query,
        {},
        abortControllerRef.current.signal
      );
      onQueryResults(results);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Query error:", error);
        toast.error("Failed to execute query: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold">Cypher query</h2>
        {showHistory && <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(true)}>
          <Clock className="w-4 h-4" />
        </Button>}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your Cypher query here..."
          className="font-mono flex-1"
          rows={4}
        />
        <Button
          onClick={handleExecute}
          className="h-auto"
          variant="secondary"
          disabled={isLoading}
        >
          <Play className="w-4 h-4" />
        </Button>
      </div>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onApply={(selectedQuery) => setQuery(selectedQuery)}
      />
    </div>
  );
}
