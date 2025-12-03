name: Task Design / UI
description: Task di design, UX o prototipazione
title: "[Design] "
labels: ["type: design", "status: to do"]
body:
  - type: input
    attributes:
      label: Titolo
      placeholder: "Esempio: Nuova schermata di salvataggio disegni"
  - type: textarea
    attributes:
      label: Obiettivo
      placeholder: "Cosa vogliamo ottenere dal design / UX"
  - type: textarea
    attributes:
      label: Dettagli / Passaggi
      placeholder: |
        - Analisi UX esistente
        - Wireframe / Mockup
        - Feedback utenti / revisione
        - Documentazione / handoff agli sviluppatori
  - type: textarea
    attributes:
      label: Checklist
      value: |
        - [ ] Analisi UX
        - [ ] Wireframe / Mockup
        - [ ] Review interna
        - [ ] Documentazione
  - type: dropdown
    attributes:
      label: Priority
      options:
        - High
        - Medium
        - Low
  - type: assignees
    attributes:
      label: Owner
  - type: date
    attributes:
      label: Due date
  - type: textarea
    attributes:
      label: Note / Risorse
