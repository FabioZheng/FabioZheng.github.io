# FabioZheng.github.io

Birthday celebration site with an interactive Three.js 3D viewer.

## FBX + texture folder layout

Place your assets in this structure:

```text
FabioZheng.github.io/
├─ index.html
├─ cake-scene.js
└─ models/
   ├─ source/
   │  └─ cake.fbx
   └─ textures/
      ├─ texture1.png
      ├─ texture2.jpg
      └─ ...
```

Default paths used by the site:

- FBX model: `models/source/cake.fbx`
- Texture folder: `models/textures/`

## Change model or texture path

Update attributes on `#cake-3d-container` in `index.html`:

```html
<div
  id="cake-3d-container"
  data-model-url="models/source/cake.fbx"
  data-texture-path="models/textures/"
></div>
```
