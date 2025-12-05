# Installazione Locale su Kubernetes (k3d)

Questa guida descrive il processo completo per l'installazione e la gestione dell'ambiente EA in locale utilizzando Kubernetes con k3d.

## Prerequisiti

Prima di iniziare, assicurati di avere installati i seguenti strumenti:

- **Docker**: per la containerizzazione
- **kubectl**: client a riga di comando per Kubernetes
- **Helm 3**: gestore di pacchetti per Kubernetes
- **k3d**: wrapper per eseguire k3s (Kubernetes leggero) in Docker
  - Installazione: https://k3d.io/stable/#installation

## Architettura

L'ambiente locale è composto da tre componenti principali:

1. **PostgreSQL**: database relazionale per i dati applicativi
2. **Neo4j**: database a grafo per le relazioni tra entità
3. **Web App**: applicazione Next.js che espone l'interfaccia utente

Tutti i componenti vengono deployati nel namespace `ns-ea` su un cluster k3d chiamato `ea-cluster`.

## Installazione Rapida

### Utilizzo degli Script Automatici

Per semplificare il processo di installazione, sono disponibili degli script bash nella cartella `scripts/`:

#### 1. Deploy Completo

```bash
./scripts/deploy-k3d.sh
```

Questo script esegue automaticamente:
- Creazione del cluster k3d (se non esiste)
- Creazione del namespace `ns-ea`
- Installazione di PostgreSQL con configurazione locale
- Installazione di Neo4j con configurazione locale
- Installazione della Web App
- Verifica dello stato dei servizi

#### 2. Port Forwarding

Dopo il deploy, per accedere ai servizi:

```bash
./scripts/port-forward-k3d.sh
```

Questo script avvia tutti i port-forward necessari:
- PostgreSQL: `localhost:5432`
- Neo4j Bolt: `localhost:7687`
- Neo4j Browser: `http://localhost:7474`
- Web App: `http://localhost:3000`

Premi `Ctrl+C` per terminare tutti i port-forward.

#### 3. Rimozione dell'Ambiente

Per rimuovere completamente l'ambiente:

```bash
./scripts/undeploy-k3d.sh
```

Lo script chiederà conferma prima di procedere alla rimozione e ti permetterà di scegliere se eliminare anche il cluster k3d.

## Installazione Manuale

Se preferisci eseguire i passaggi manualmente, segui questa procedura:

### 1. Creazione del Cluster k3d

```bash
k3d cluster create ea-cluster
```

Verifica che il cluster sia attivo:

```bash
kubectl get nodes
```

### 2. Creazione del Namespace

```bash
kubectl create namespace ns-ea
```

### 3. Installazione PostgreSQL

Aggiungi il repository Bitnami e installa PostgreSQL:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install postgresql bitnami/postgresql \
  --namespace ns-ea \
  --version 18.1.13 \
  -f ./helm/charts/postgresql/values-local.yaml
```

### 4. Installazione Neo4j

Aggiungi il repository Neo4j e installa il database grafo:

```bash
helm repo add neo4j-helm-charts https://neo4j.github.io/helm-charts/
helm repo update
helm install neo4j neo4j-helm-charts/neo4j \
  --namespace ns-ea \
  --version 2025.10.1 \
  -f ./helm/charts/neo4j/values-local.yaml
```

### 5. Port Forwarding per i Database

Esponi i servizi dei database sulla macchina locale:

```bash
kubectl port-forward -n ns-ea svc/postgresql 5432:5432 &
kubectl port-forward -n ns-ea svc/neo4j 7687:7687 7474:7474 &
```

### 6. Installazione Web App

Installa l'applicazione web:

```bash
helm install web-app ./helm/charts/web-app \
  -f ./helm/charts/web-app/values-local.yaml \
  --namespace ns-ea
```

### 7. Accesso all'Applicazione

Esponi il servizio web sulla macchina locale:

```bash
kubectl port-forward -n ns-ea svc/web-app 3000:80
```

L'applicazione sarà disponibile su http://localhost:3000

## Gestione dell'Ambiente

### Verifica dello Stato

#### Visualizzare i pod

```bash
kubectl get pods -n ns-ea
```

Output atteso:
```
NAME                       READY   STATUS    RESTARTS   AGE
neo4j-0                    1/1     Running   0          5m
postgresql-0               1/1     Running   0          5m
web-app-xxxxxxxxxx-xxxxx   1/1     Running   0          3m
```

#### Visualizzare i servizi

```bash
kubectl get svc -n ns-ea
```

#### Visualizzare i volumi persistenti

```bash
kubectl get pvc -n ns-ea
```

### Log dei Servizi

Per visualizzare i log di un pod:

```bash
kubectl logs -n ns-ea <pod-name>
```

Per seguire i log in tempo reale:

```bash
kubectl logs -n ns-ea <pod-name> -f
```

### Riavvio di un Servizio

Per riavviare un deployment:

```bash
kubectl rollout restart deployment/<deployment-name> -n ns-ea
```

Ad esempio, per riavviare la web app:

```bash
kubectl rollout restart deployment/web-app -n ns-ea
```

### Aggiornamento di un Chart

Se hai modificato i file di configurazione, puoi aggiornare un chart con:

```bash
helm upgrade <release-name> <chart-path> \
  -f <values-file> \
  --namespace ns-ea
```

Ad esempio, per aggiornare la web app:

```bash
helm upgrade web-app ./helm/charts/web-app \
  -f ./helm/charts/web-app/values-local.yaml \
  --namespace ns-ea
```

## Configurazione

### PostgreSQL

Le configurazioni per PostgreSQL sono definite in:
- `helm/charts/postgresql/values-local.yaml`

Credenziali di default (solo per uso locale):
- Username: configurato nel values file
- Password: configurata nel values file
- Database: configurato nel values file

### Neo4j

Le configurazioni per Neo4j sono definite in:
- `helm/charts/neo4j/values-local.yaml`

Accesso Neo4j Browser:
- URL: http://localhost:7474
- Credenziali: configurate nel values file

### Web App

Le configurazioni per la Web App sono definite in:
- `helm/charts/web-app/values-local.yaml` (environment-specific)
- `helm/charts/web-app/values.yaml` (default values)

Le variabili d'ambiente dell'applicazione sono gestite tramite ConfigMap e Secrets Kubernetes.

## Troubleshooting

### Il pod non si avvia

Controlla i log del pod:

```bash
kubectl logs -n ns-ea <pod-name>
kubectl describe pod -n ns-ea <pod-name>
```

### Problemi di connessione al database

Verifica che il port-forward sia attivo e che il servizio sia in esecuzione:

```bash
kubectl get svc -n ns-ea
kubectl get pods -n ns-ea
```

### Pulizia completa e reinstallazione

Se riscontri problemi persistenti, puoi rimuovere completamente l'ambiente e reinstallarlo:

```bash
./scripts/undeploy-k3d.sh
./scripts/deploy-k3d.sh
```

### Verifica delle risorse del cluster

Se il cluster è lento o i pod non si avviano:

```bash
kubectl top nodes
kubectl top pods -n ns-ea
```

### Reset del cluster k3d

Se necessario, puoi eliminare completamente il cluster e ricrearlo:

```bash
k3d cluster delete ea-cluster
k3d cluster create ea-cluster
```

Poi riesegui lo script di deploy.

## Sviluppo Locale

### Workflow Tipico

1. Avvia l'ambiente:
   ```bash
   ./scripts/deploy-k3d.sh
   ```

2. Avvia i port-forward:
   ```bash
   ./scripts/port-forward-k3d.sh
   ```

3. Sviluppa localmente l'applicazione (se necessario)

4. Quando hai finito, ferma i port-forward (Ctrl+C)

### Ricostruzione e Deploy della Web App

Se modifichi il codice dell'applicazione e vuoi deployare una nuova versione:

1. Ricostruisci l'immagine Docker (dal contesto appropriato)

2. Aggiorna il deployment:
   ```bash
   helm upgrade web-app ./helm/charts/web-app \
     -f ./helm/charts/web-app/values-local.yaml \
     --namespace ns-ea
   ```

3. O riavvia semplicemente il deployment per forzare il pull della nuova immagine:
   ```bash
   kubectl rollout restart deployment/web-app -n ns-ea
   ```

## Note Importanti

- **Ambiente Solo Locale**: Questa configurazione è pensata SOLO per lo sviluppo locale. Non utilizzare in produzione.
- **Dati Persistenti**: I dati dei database sono persistiti in volumi k3d. Eliminando il cluster, eliminerai anche i dati.
- **Risorse**: k3d utilizza Docker, assicurati di avere risorse sufficienti allocate a Docker (almeno 4GB di RAM consigliati).
- **Porte**: Assicurati che le porte 5432, 7687, 7474 e 3000 non siano già in uso sulla tua macchina.

## Riferimenti

- [k3d Documentation](https://k3d.io/)
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [PostgreSQL Helm Chart](https://github.com/bitnami/charts/tree/main/bitnami/postgresql)
- [Neo4j Helm Chart](https://neo4j.com/docs/operations-manual/current/kubernetes/)
