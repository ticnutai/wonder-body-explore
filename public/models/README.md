Place your premium anatomy model at:

- public/models/human-anatomy.glb

Recommended authoring conventions for automatic organ mapping:

- Mesh names should include one of these keywords:
  - brain
  - eyes / eye
  - ears / ear
  - heart
  - lungs / lung
  - stomach
  - hands / hand / finger
  - legs / leg / femur / tibia / foot

If mesh names differ, update mapping patterns in:

- src/data/organModelMap.ts
