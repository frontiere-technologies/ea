#!/bin/bash

# Script per il deploy dell'ambiente EA su k3d
set -e

NAMESPACE="ns-ea"
CLUSTER_NAME="ea-cluster"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HELM_DIR="$SCRIPT_DIR/../helm"

echo "=== Deploy EA Environment ==="
echo ""

# 1. Verifica se il cluster esiste, altrimenti crealo
if ! k3d cluster list | grep -q "$CLUSTER_NAME"; then
    echo "📦 Creazione cluster k3d..."
    k3d cluster create $CLUSTER_NAME
else
    echo "✅ Cluster $CLUSTER_NAME già esistente"
fi

# Verifica che il cluster sia attivo
echo "🔍 Verifica nodi del cluster..."
kubectl get nodes

# 2. Crea il namespace se non esiste
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "📁 Creazione namespace $NAMESPACE..."
    kubectl create namespace $NAMESPACE
else
    echo "✅ Namespace $NAMESPACE già esistente"
fi

# 3. Installa PostgreSQL
echo ""
echo "🐘 Installazione PostgreSQL..."
if helm status postgresql -n $NAMESPACE &> /dev/null; then
    echo "⚠️  PostgreSQL già installato, aggiornamento..."
    helm upgrade postgresql bitnami/postgresql \
        --namespace $NAMESPACE \
        --version 18.1.13 \
        -f "$HELM_DIR/charts/postgresql/values-local.yaml"
else
    helm repo add bitnami https://charts.bitnami.com/bitnami &> /dev/null || true
    helm repo update
    helm install postgresql bitnami/postgresql \
        --namespace $NAMESPACE \
        --version 18.1.13 \
        -f "$HELM_DIR/charts/postgresql/values-local.yaml"
fi

# 4. Installa Neo4j
echo ""
echo "🔵 Installazione Neo4j..."
if helm status neo4j -n $NAMESPACE &> /dev/null; then
    echo "⚠️  Neo4j già installato, aggiornamento..."
    helm upgrade neo4j neo4j-helm-charts/neo4j \
        --namespace $NAMESPACE \
        --version 2025.10.1 \
        -f "$HELM_DIR/charts/neo4j/values-local.yaml"
else
    helm repo add neo4j-helm-charts https://neo4j.github.io/helm-charts/ &> /dev/null || true
    helm repo update
    helm install neo4j neo4j-helm-charts/neo4j \
        --namespace $NAMESPACE \
        --version 2025.10.1 \
        -f "$HELM_DIR/charts/neo4j/values-local.yaml"
fi

# 5. Attendi che i database siano pronti
echo ""
echo "⏳ Attesa avvio dei database..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgresql -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=neo4j-local -n $NAMESPACE --timeout=300s

# 6. Build e push immagine Web App
echo ""
echo "🔨 Build e push immagine Web App..."
cd "$SCRIPT_DIR/../project/components/web-app"
bash ./docker/deploy-k3d.sh
cd "$SCRIPT_DIR"

# 7. Installa Web App
echo ""
echo "🌐 Installazione Web App..."
if helm status web-app -n $NAMESPACE &> /dev/null; then
    echo "⚠️  Web App già installata, aggiornamento..."
    helm upgrade web-app "$HELM_DIR/charts/web-app" \
        -f "$HELM_DIR/charts/web-app/values-local.yaml" \
        --namespace $NAMESPACE
else
    helm install web-app "$HELM_DIR/charts/web-app" \
        -f "$HELM_DIR/charts/web-app/values-local.yaml" \
        --namespace $NAMESPACE
fi

# 8. Attendi che la web app sia pronta
echo ""
echo "⏳ Attesa avvio Web App..."
kubectl wait --for=condition=ready pod -l app=web-app -n $NAMESPACE --timeout=300s

# 9. Mostra lo stato dei pod
echo ""
echo "📊 Stato dei pod:"
kubectl get pods -n $NAMESPACE

echo ""
echo "📊 Stato dei servizi:"
kubectl get svc -n $NAMESPACE

echo ""
echo "✅ Deploy completato con successo!"
echo ""
echo "Per accedere ai servizi, esegui i seguenti comandi in terminali separati:"
echo ""
echo "  # PostgreSQL"
echo "  kubectl port-forward -n $NAMESPACE svc/postgresql 5432:5432"
echo ""
echo "  # Neo4j"
echo "  kubectl port-forward -n $NAMESPACE svc/neo4j 7687:7687 7474:7474"
echo ""
echo "  # Web App"
echo "  kubectl port-forward -n $NAMESPACE svc/web-app 3000:80"
echo ""
echo "Oppure esegui: $SCRIPT_DIR/port-forward-k3d.sh"
