# Installazione locale

https://k3d.io/stable/#installation

k3d cluster create ea-cluster

kubectl get nodes

kubectl create namespace ns-ea

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install postgresql bitnami/postgresql --namespace ns-ea --version 18.1.13 -f ./charts/postgresql/values-local.yaml

helm repo add neo4j-helm-charts https://neo4j.github.io/helm-charts/
helm repo update

helm install neo4j neo4j-helm-charts/neo4j --namespace ns-ea --version 2025.10.1 -f ./charts/neo4j/values-local.yaml

kubectl port-forward -n ns-ea svc/postgresql 5432:5432 &
kubectl port-forward -n ns-ea svc/neo4j 7687:7687 7474:7474 &

helm install web-app ./charts/web-app -f ./charts/web-app/values-local.yaml --namespace ns-ea

kubectl port-forward -n ns-ea svc/ea-web-app 3000:3000