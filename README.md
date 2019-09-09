# PlasmaFractal
Old-school plasma fractal with palette animation effect running in a browser. Pure JavaScript, no WebGL.

Basic algorithm:
- Grayscale image is generated once using Perlin Noise algorithm (multiple iterations per pixel to produce fractal).
- For each frame:
  - Palette is animated by rotating the palette entries and by blending between random colors.
  - Grayscale image is mapped to RGB by using pixel values as palette indices.

Multithreading:
  - Two threads ([Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)) render differently seeded plasma fractals to their own canvas.
  - The two canvases are cross-faded from time to time to generate ever-changing structures (see Options > Animation > Noise Transition).

## [Live demo](https://zett42.github.io/PlasmaFractal2/)
- Double-click to toggle fullscreen.
- Press the "gear" button in the top-left corner to adjust plasma options.
- When you are happy with your settings, share the Permalink with your friends.

### Requirements and browser support:
- Requires [Offscreen Canvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) (experimental API) support by browser.
- :white_check_mark: Tested successfully with Chrome v76.0.3809.100 and Opera v63.0.3368.71.
- :warning: Firefox currently not supported (tested with v69.0, which is still [missing 2D-OffscreenCanvas support](https://bugzilla.mozilla.org/show_bug.cgi?id=801176)). 
  - Note that the [old version of the PlasmaFractal](https://zett42.github.io/PlasmaFractal/) still works with Firefox!

## Credits
This project uses the following open source libraries. Each library comes with its own license terms, which can be found in the source code included in this project.

- [noisejs](https://github.com/josephg/noisejs) - A speed-improved perlin and simplex noise algorithms for 2D. 
  - Based on example code by Stefan Gustavson (stegu@itn.liu.se). 
  - Optimisations by Peter Eastman (peastman@drizzle.stanford.edu). 
  - Better rank ordering method by Stefan Gustavson in 2012. 
  - Converted to Javascript by Joseph Gentle. 

- [Bootstrap](https://getbootstrap.com/) 
  - Copyright (c) 2011-2019 Twitter, Inc.
  - Copyright (c) 2011-2019 The Bootstrap Authors
  
- [Vue.js](https://vuejs.org/)
  - Copyright (c) 2013-present, Yuxi (Evan) You 
  
- [Bootstrap-Vue](https://bootstrap-vue.js.org/)
  - Copyright (c) 2016-2019 - BootstrapVue
  
- [Bootswatch](https://bootswatch.com/)
  - Copyright (c) 2013 Thomas Park
  
- [Popper.js](https://popper.js.org/)
  - Copyright © 2016 Federico Zivolo and contributors

- [jQuery](https://jquery.org/) 
  - Copyright jQuery Foundation and other contributors. 
  
- [jQuery Easing](http://gsgd.co.uk/sandbox/jquery/easing/)
  - Copyright © 2008 George McGinley Smith. All rights reserved.

- [Spectrum Colorpicker](http://briangrinstead.com)
  - Copyright (c) 2014, Brian Grinstead 

- [mersennetwister](https://github.com/pigulla/mersennetwister)
  - Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura, All rights reserved.
  - This implementation by Raphael Pigulla is based on Sean McCullough's port of the original C code written by Makato Matsumoto and Takuji Nishimura.
  
- [tinycolor](https://github.com/bgrins/TinyColor)
  - Copyright (c), Brian Grinstead, http://briangrinstead.com
  
- [nouislider](https://refreshless.com/nouislider/)
  - Copyright (c) 2018 Léon Gersen
  
- [lodash](https://lodash.com/)
  - Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
  - Based on Underscore.js, copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>
  
## Special thanks to
- [stackoverflow](https://stackoverflow.com)
  - So many helpful answers, too many to credit them individually. Kudos to this awesome community!
