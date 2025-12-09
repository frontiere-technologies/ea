# Sviluppo e Deploy in Locale

Questa guida descrive il processo per lo sviluppo e il deploy in locale dei componenti del progetto utilizzando Kubernetes (k3d).

## Prerequisiti

Prima di procedere, assicurati di aver completato l'installazione dell'ambiente locale seguendo la guida [Local Installation](./local-installation.md).

## Processo di Deploy

### 1. Navigare nel Componente

Posizionati nella directory del componente che vuoi deployare. Ad esempio, per la web-app:

```bash
cd project/components/web-app
```

### 2. Eseguire lo Script di Deploy

Lancia lo script di deploy per k3d:

```bash
./docker/deploy-k3d.sh
```

Lo script eseguirà automaticamente:
- Build dell'immagine Docker
- Tag dell'immagine per il registry locale
- Push dell'immagine nel registry k3d
- Deploy del componente nel cluster Kubernetes

### 3. Verifica del Deploy

Dopo il deploy, puoi verificare che il componente sia stato deployato correttamente:

```bash
kubectl get pods
kubectl get services
```

Per visualizzare i log del pod:

```bash
kubectl logs -f <pod-name>
```

## Workflow di Sviluppo

1. **Modifica il codice** nel componente su cui stai lavorando
2. **Testa localmente** (opzionale) utilizzando gli script di sviluppo
3. **Deploy in k3d** utilizzando `./docker/deploy-k3d.sh`
4. **Verifica le modifiche** accedendo all'applicazione tramite port-forward

## Note

- Ogni componente ha il proprio script `deploy-k3d.sh` nella directory `docker/`
- Le configurazioni specifiche per l'ambiente locale sono definite nei file `values-local.yaml` in `helm/charts/`
- Per accedere ai servizi deployati, utilizza lo script di port-forwarding: `/scripts/port-forward-k3d.sh`

## Troubleshooting

Se il deploy fallisce:
1. Verifica che il cluster k3d sia in esecuzione: `k3d cluster list`
2. Controlla i log del pod per eventuali errori
3. Verifica le configurazioni in `helm/charts/`
4. Assicurati che tutte le dipendenze siano soddisfatte (database, servizi esterni, ecc.)
