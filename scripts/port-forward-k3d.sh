#!/bin/bash

# Script per avviare i port-forward dei servizi EA
set -e

NAMESPACE="ns-ea"

echo "=== Port Forwarding EA Services ==="
echo ""

# Verifica che i servizi esistano
if ! kubectl get svc -n $NAMESPACE &> /dev/null; then
    echo "❌ Namespace $NAMESPACE non trovato o non ci sono servizi"
    exit 1
fi

echo "🔌 Avvio port-forward per i servizi..."
echo ""

# Funzione per cleanup dei port-forward alla chiusura
cleanup() {
    echo ""
    echo "🛑 Interruzione port-forward..."
    jobs -p | xargs -r kill 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# PostgreSQL
echo "📦 PostgreSQL: localhost:5432"
kubectl port-forward -n $NAMESPACE svc/postgresql 5432:5432 > /dev/null 2>&1 &

# Neo4j
echo "📦 Neo4j Bolt: localhost:7687"
echo "📦 Neo4j Browser: http://localhost:7474"
kubectl port-forward -n $NAMESPACE svc/neo4j 7687:7687 7474:7474 > /dev/null 2>&1 &

# Web App
echo "📦 Web App: http://localhost:3000"
kubectl port-forward -n $NAMESPACE svc/web-app 3000:80 > /dev/null 2>&1 &

echo ""
echo "✅ Port-forward attivi!"
echo ""
echo "Servizi disponibili:"
echo "  - PostgreSQL:    localhost:5432"
echo "  - Neo4j Bolt:    localhost:7687"
echo "  - Neo4j Browser: http://localhost:7474"
echo "  - Web App:       http://localhost:3000"
echo ""
echo "Premi Ctrl+C per fermare tutti i port-forward"
echo ""

# Mantieni lo script attivo
wait
