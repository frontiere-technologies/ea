name: Bug / Issue
description: Segnalazione di bug o malfunzionamento
title: "[Bug] "
labels: ["type: bug", "status: to do"]
body:
  - type: input
    attributes:
      label: Titolo
      placeholder: "Esempio: Errore salvataggio file multiplo"
  - type: textarea
    attributes:
      label: Descrizione
      placeholder: "Descrivi il problema, passi per riprodurlo, ambiente"
  - type: textarea
    attributes:
      label: Expected Behavior
      placeholder: "Cosa dovrebbe succedere"
  - type: textarea
    attributes:
      label: Actual Behavior
      placeholder: "Cosa succede realmente"
  - type: textarea
    attributes:
      label: Steps to Reproduce
      placeholder: |
        1. Apri X
        2. Esegui Y
        3. Osserva Z
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
