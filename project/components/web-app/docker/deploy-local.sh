#!/bin/bash

set -e

# Configuration
DOCKER_IMAGE_NAME=ea/web-app
DOCKER_IMAGE_VERSION=1.0.0-local
K3D_CLUSTER=ea-cluster
NAMESPACE=ns-ea
HELM_RELEASE=web-app

# Safety check: verify script is run from web-app directory
REQUIRED_DIR="project/components/web-app"
CURRENT_DIR=$(pwd)

if [[ ! "${CURRENT_DIR}" =~ ${REQUIRED_DIR}$ ]]; then
  echo "ERROR: This script must be run from the ${REQUIRED_DIR} directory"
  echo "Current directory: ${CURRENT_DIR}"
  echo ""
  echo "Please run:"
  echo "  cd project/components/web-app"
  echo "  bash docker/deploy-local.sh"
  exit 1
fi

echo "=================================="
echo "Deploying web-app to local K8s"
echo "=================================="

# Safety check: verify we're using k3d cluster
echo ""
echo "[0/3] Verifying k3d cluster..."
CURRENT_CONTEXT=$(kubectl config current-context)
echo "Current kubectl context: ${CURRENT_CONTEXT}"

if [[ ! "${CURRENT_CONTEXT}" =~ k3d-${K3D_CLUSTER} ]]; then
  echo "ERROR: Not connected to k3d cluster '${K3D_CLUSTER}'"
  echo "Current context is: ${CURRENT_CONTEXT}"
  echo ""
  echo "Available k3d clusters:"
  k3d cluster list
  echo ""
  echo "To switch to the correct cluster, run:"
  echo "  kubectl config use-context k3d-${K3D_CLUSTER}"
  exit 1
fi

echo "✓ Connected to k3d cluster: ${K3D_CLUSTER}"

# Step 1: Build Docker image
echo ""
echo "[1/3] Building Docker image..."
docker build --force-rm=true --rm=true \
  --build-arg SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} \
  --build-arg SENTRY_ORG=${SENTRY_ORG} \
  --build-arg SENTRY_PROJECT=${SENTRY_PROJECT} \
  -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION} .

# Step 2: Import image into k3d cluster
echo ""
echo "[2/3] Importing image into k3d cluster..."
k3d image import ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION} -c ${K3D_CLUSTER}

# Step 3: Deploy with Helm
echo ""
echo "[3/3] Deploying with Helm..."
helm upgrade --install ${HELM_RELEASE} ../../../helm/charts/web-app \
  --namespace ${NAMESPACE} \
  --create-namespace \
  -f ../../../helm/charts/web-app/values-local.yaml

echo ""
echo "=================================="
echo "Deployment completed successfully!"
echo "=================================="
echo ""
echo "To access the application, run:"
echo "  kubectl port-forward -n ${NAMESPACE} svc/${HELM_RELEASE} 3000:80"
echo ""
echo "Then open: http://localhost:3000"
echo ""
