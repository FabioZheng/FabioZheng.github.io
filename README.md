# FabioZheng.github.io

Birthday celebration site with an interactive Three.js 3D viewer.

## Where to put your GLB file

Use this exact location and name for the default setup:

- **Folder:** `models/` (at the repo root, next to `index.html`)
- **Filename:** `cake.glb`
- **Final path:** `models/cake.glb`

So your tree should look like:

```text
FabioZheng.github.io/
├─ index.html
├─ cake-scene.js
├─ styles.css
└─ models/
   └─ cake.glb
```

## If you want another name

You can use any filename, just update `data-model-url` in `index.html`:

```html
<div id="cake-3d-container" data-model-url="models/my-birthday-model.glb"></div>
```

If the file is hosted elsewhere, use the full URL in `data-model-url`.
