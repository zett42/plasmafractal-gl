# PlasmaFractal
Old-school plasma fractal with palette animation effect running in a browser. Pure JavaScript, no WebGL.

Basic algorithm:
- Grayscale image is generated once using Perlin Noise algorithm (multiple iterations per pixel to produce fractal).
- For each frame:
  - Palette is animated by rotating the palette entries and by blending between random colors.
  - Grayscale image is mapped to RGB by using pixel values as palette indices.

## [Live demo](https://zett42.github.io/PlasmaFractal/)
- Single-click to randomize fractal.
- Double-click to toggle fullscreen.
- Parameters are currently hardcoded in index.html (search for "plasmaParams").
- Tested with Chrome 76.0.3809.100 and Firefox 68.0.1 (seems to run smoother in Chrome)
