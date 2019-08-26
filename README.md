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
- Press the "gear" button in the top-left corner to adjust plasma parameters and palette.
- Tested with Chrome 76.0.3809.100 and Firefox 68.0.2 (seems to run smoother in Chrome).

### Experimental Versions
- [**NoiseTransitions Demo**](https://zett42.github.io/PlasmaFractal/experimental/NoiseTransition/index.html)
  - Renders two differently seeded plasma fractals in separate threads ([Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)) and cross-fades between them to generate ever-changing structures (see Options > Animation > Noise Transition).
  - Requires [Offscreen Canvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) (experimental API) support by browser.
  - Tested successfully with Chrome 76.0.3809.100, but fails with Firefox 68.0.2 (it is [missing 2D-OffscreenCanvas support](https://bugzilla.mozilla.org/show_bug.cgi?id=801176)). 

## Credits
This project uses the following open source libraries. Each library comes with its own license terms, which can be found in the source code included in this project.

- [noisejs](https://github.com/josephg/noisejs) - A speed-improved perlin and simplex noise algorithms for 2D. 
  - Based on example code by Stefan Gustavson (stegu@itn.liu.se). 
  - Optimisations by Peter Eastman (peastman@drizzle.stanford.edu). 
  - Better rank ordering method by Stefan Gustavson in 2012. 
  - Converted to Javascript by Joseph Gentle. 

- [jQuery and jQuery UI](https://jquery.org/) 
  - Copyright jQuery Foundation and other contributors. 
  
- [jQuery UI dialogOptions](https://github.com/jasonday/jQuery-UI-Dialog-extended)
  - Copyright (c) Jason Day 2014
  
- [jQuery UI Touch Punch](http://touchpunch.furf.com/)
  - Copyright 2011–2014, Dave Furfero

- [jQuery Easing](http://gsgd.co.uk/sandbox/jquery/easing/)
  - Copyright © 2008 George McGinley Smith. All rights reserved.
  
- [jQuery BBQ](http://benalman.com/projects/jquery-bbq-plugin/)
  - Copyright (c) 2010 "Cowboy" Ben Alman

- [Spectrum Colorpicker](http://briangrinstead.com)
  - Copyright (c) 2014, Brian Grinstead 

- [mersennetwister](https://github.com/pigulla/mersennetwister)
  - Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura, All rights reserved.
  - This implementation by Raphael Pigulla is based on Sean McCullough's port of the original C code written by Makato Matsumoto and Takuji Nishimura.

- [stackoverflow](https://stackoverflow.com)
  - So many helpful answers, too many to credit them individually. Kudos to this awesome community!