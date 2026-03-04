# Organ GLB Models

Place downloaded GLB files here to replace the procedural organ geometries.
The app will automatically load them if they match the organ ID filename.

## Expected filenames:
- `heart.glb` — Heart model
- `brain.glb` — Brain model
- `lungs.glb` — Lungs model (both lungs in one file)
- `stomach.glb` — Stomach model
- `eyes.glb` — Eye model
- `ears.glb` — Ear model
- `hands.glb` — Hand/arm model
- `legs.glb` — Leg model

## Where to download:
- Sketchfab (free CC0/CC-BY models): https://sketchfab.com/search?features=downloadable&q=human+anatomy&type=models
- Download the **GLB** format (1k texture recommended for web performance)

## How it works:
1. Download a GLB file from Sketchfab
2. Rename it to match the organ ID (e.g., `heart.glb`)
3. Place it in this folder (`public/models/organs/`)
4. The app will automatically use it instead of the procedural geometry
