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
- Press the "gear" button in the top-left corner to adjust plasma parameters.
- Many parameters are still hardcoded in index.html (search for "plasmaParams").
- Tested with Chrome 76.0.3809.100 and Firefox 68.0.1 (seems to run smoother in Chrome).

## External libraries used
Each library comes with its own license terms, which can be found in the source code included in this project.

- [perlin.js](https://github.com/josephg/noisejs) - A speed-improved perlin and simplex noise algorithms for 2D. 
  - Based on example code by Stefan Gustavson (stegu@itn.liu.se). 
  - Optimisations by Peter Eastman (peastman@drizzle.stanford.edu). 
  - Better rank ordering method by Stefan Gustavson in 2012. 
  - Converted to Javascript by Joseph Gentle. 

- [jQuery and jQuery UI](https://jquery.org/) 
  - Copyright jQuery Foundation and other contributors. 

- [jQuery Easing](http://gsgd.co.uk/sandbox/jquery/easing/)
  - Copyright © 2008 George McGinley Smith. All rights reserved.
