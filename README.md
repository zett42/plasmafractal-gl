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
  
### Preset Links
<p>
Click an image to open PlasmaFractal preset.
</p>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.14&o=11&g=.42&l=2.7&a=26.4&pbf=ioe2&pfb=ioe2&ps=.76&pb=1&pbg=000000&pg=0&icp=0&cp=&acp=0&prd=40.&ptde=15.&ptd=5.&ntde=5.&ntd=15.">
   <img src="/screenshots/thumbs/AbstractPaintings.jpg" alt="Abstract Paintings" title="Abstract Paintings" width="150" />
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.57&o=15&g=.5&l=2.25&a=4.19&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=0_1c008c_io2+.49_ff930f_io2+.55_000000_l+.43_fb0000_l+.31_000000_l&ntde=20.&ntd=10.&prd=40.&ptde=10.&ptd=5.">
   <img src="/screenshots/thumbs/Fiery.jpg" alt="Fiery" title="Fiery" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=1.5&o=4&g=.5&l=2&a=5&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.51_55f7ff_o3+.42_004548_i3+.6_004548_ios+.26_000000_ios+.76_000000_l&acp=1&ntde=10.&ntd=10.&prd=41.&ptde=10.&ptd=10.">
   <img src="/screenshots/thumbs/Neon1.jpg" alt="Neon" title="Neon" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.92&o=6&g=.73&l=1.36&a=10.5&pbf=ios25&pfb=oe&ps=.53&pb=.78&pbg=000000&pg=0&icp=1&cp=0_000000_l+.99_4ba7c5_l+.16_ffffff_io2&acp=0&ntde=0&ntd=21.1&prd=30.&ptde=3.&ptd=10.">
  <img src="/screenshots/thumbs/TurqoiseWhitePlastic.jpg" alt="Turquoise/White Plastic" title="Turquoise/White Plastic" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.4&o=10&g=.39&l=2&a=5&pbf=i4&pfb=oe2&ps=0&pb=1&pbg=060042&pg=0&icp=0&cp=&acp=0&prd=41.&ptde=10.&ptd=5.&ntde=3.&ntd=10.">
  <img src="/screenshots/thumbs/OceanWaves.jpg" alt="Ocean Waves" title="Ocean Waves" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.41&o=5&g=.5&l=2&a=8.87&pg=0&icp=1&pbf=ios213&pfb=oc&ps=.5&pb=.75&pbg=000000&cp=0_000000_i2+.85_ffffff_ios213&ntde=10000&ntd=10000&prd=80000&ptde=10000&ptd=5000">
  <img src="/screenshots/thumbs/GreySine2.jpg" alt="Black/White Sine2" title="Black/White Sine2" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.07&o=7&g=.5&l=2&a=9.7&pg=0&icp=0&pbf=ios&pfb=ob&ps=.69&pb=1&pbg=000000&cp=0_000000_i2+.25_00bfff_o2+.5_000000_i2+.75_dc0000_o2&acp=0&ntde=10.&ntd=10.&prd=79.&ptde=10.&ptd=10.">
  <img src="/screenshots/thumbs/LavaLamp.jpg" alt="Lava Lamp" title="Lava Lamp" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.55&o=6&g=.46&l=2&a=5.56&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.77_ffffff_ios29+1_000000_io2+.47_8000ff_io2&ntde=3000&ntd=10000&prd=80000&ptde=10000&ptd=5000">
  <img src="/screenshots/thumbs/PurpleWhiteSine2.jpg" alt="Purple/White Sine2" title="Purple/White Sine2" width="150">
</a>

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
