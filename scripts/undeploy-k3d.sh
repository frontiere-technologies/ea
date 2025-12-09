#!/bin/bash

# Script per la rimozione dell'ambiente EA da k3d
set -e

NAMESPACE="ns-ea"
CLUSTER_NAME="ea-cluster"

echo "=== Undeploy EA Environment ==="
echo ""

# Chiedi conferma
read -p "⚠️  Sei sicuro di voler rimuovere l'intero ambiente? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operazione annullata"
    exit 0
fi

# 1. Rimuovi Web App
echo "🗑️  Rimozione Web App..."
if helm status web-app -n $NAMESPACE &> /dev/null; then
    helm uninstall web-app -n $NAMESPACE
    echo "✅ Web App rimossa"
else
    echo "⚠️  Web App non trovata"
fi

# 2. Rimuovi Neo4j
echo ""
echo "🗑️  Rimozione Neo4j..."
if helm status neo4j -n $NAMESPACE &> /dev/null; then
    helm uninstall neo4j -n $NAMESPACE
    echo "✅ Neo4j rimosso"
else
    echo "⚠️  Neo4j non trovato"
fi

# 3. Rimuovi PostgreSQL
echo ""
echo "🗑️  Rimozione PostgreSQL..."
if helm status postgresql -n $NAMESPACE &> /dev/null; then
    helm uninstall postgresql -n $NAMESPACE
    echo "✅ PostgreSQL rimosso"
else
    echo "⚠️  PostgreSQL non trovato"
fi

# 4. Attendi che i pod siano terminati
echo ""
echo "⏳ Attesa terminazione pod..."
sleep 5

# 5. Rimuovi il namespace
echo ""
echo "🗑️  Rimozione namespace $NAMESPACE..."
if kubectl get namespace $NAMESPACE &> /dev/null; then
    kubectl delete namespace $NAMESPACE
    echo "✅ Namespace rimosso"
else
    echo "⚠️  Namespace non trovato"
fi

# 6. Chiedi se rimuovere il cluster
echo ""
read -p "🗑️  Vuoi rimuovere anche il cluster k3d '$CLUSTER_NAME'? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if k3d cluster list | grep -q "$CLUSTER_NAME"; then
        echo "🗑️  Rimozione cluster k3d..."
        k3d cluster delete $CLUSTER_NAME
        echo "✅ Cluster rimosso"
    else
        echo "⚠️  Cluster non trovato"
    fi
fi

echo ""
echo "✅ Undeploy completato!"
