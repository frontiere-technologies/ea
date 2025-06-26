"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

export function HelpPage() {
  return (
    <div className="w-full h-full border rounded-lg bg-card p-6">
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Guida rapida</h1>
          <p>
            Questa applicazione permette di consultare e aggiornare il catalogo
            applicativo aziendale. Le informazioni sono archiviate in Neo4j e i
            disegni vengono salvati su Supabase.
          </p>
          <h2>Sezioni principali</h2>
          <ul>
            <li>
              <strong>Graph</strong> – visualizza le applicazioni come grafo e ne
              mostra le relazioni.
            </li>
            <li>
              <strong>Table</strong> – elenca applicazioni e flussi in una
              tabella filtrabile ed esportabile.
            </li>
            <li>
              <strong>Draw</strong> – un editor per creare semplici diagrammi.
            </li>
          </ul>
          <h2>Gestione dati</h2>
          <p>
            Puoi aggiungere o modificare record direttamente dalle tabelle. I
            cambiamenti sono salvati in tempo reale nel database.
          </p>
          <h2>Supporto</h2>
          <p>
            Per dubbi o problemi apri una issue nel repository o contatta il team
            di sviluppo.
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}
