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
<a href="https://zett42.github.io/PlasmaFractal2/?f=3.03&o=8&g=.4&l=2&a=2&pg=0&icp=0&pbf=i3&pfb=o3&ps=.5&pb=.75&pbg=000000&cp=&acp=0&ntde=3.&ntd=10.&prd=80.&ptde=10.&ptd=5.">
   <img src="/screenshots/thumbs/freq2_oct8_gain0.4.jpg" alt="Classic Octaves 8" title="Classic Octaves 8" width="150" />
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=10.01&o=1&g=.4&l=2&a=1.5&pg=0&icp=1&pbf=i3&pfb=o3&ps=.5&pb=.75&pbg=000000&cp=0_000000_i3+.5_77e6ee_o3&acp=1&ntde=10.&ntd=10.&prd=50.&ptde=5.&ptd=15.">
   <img src="/screenshots/thumbs/freq10_oct1_gain0.4.jpg" alt="Classic Octaves 1" title="Classic Octaves 1" width="150" />
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.14&o=11&g=.42&l=2.7&a=26.4&pbf=ioe2&pfb=ioe2&ps=.76&pb=1&pbg=000000&pg=0&icp=0&cp=&acp=0&prd=40.&ptde=15.&ptd=5.&ntde=5.&ntd=15.">
   <img src="/screenshots/thumbs/AbstractPaintings.jpg" alt="Abstract Paintings" title="Abstract Paintings" width="150" />
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.09&o=12&g=.57&l=2.13&a=5.5&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.14_000000_io2+.7_8a0000_l+.84_f0c000_l+.62_000000_l+.99_8a0000_ios+.77_ff0000_ios+.92_f90000_l&acp=0&ntde=10.&ntd=10.&prd=16.&ptde=10.&ptd=10">
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
<a href="https://zett42.github.io/PlasmaFractal2/?f=.2&o=10&g=.53&l=1.79&a=28&pg=0&icp=1&pbf=ios213&pfb=oc&ps=.5&pb=.75&pbg=000000&cp=0_ffffff_i2+.46_ffffff_io2+.51_808000_o3+.97_ffffff_l+.79_af9e23_ios&acp=1&ntde=10.&ntd=10.&prd=50.&ptde=6.5&ptd=13.5">
  <img src="/screenshots/thumbs/Ink.jpg" alt="Ink - by Nickelartist" title="Ink - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.25&o=12&g=.53&l=1.79&a=4.8&pg=0&icp=1&pbf=ios213&pfb=oc&ps=.5&pb=.75&pbg=000000&cp=0_ffffff_i2+.41_ffffff_io2+.43_3c0000_o3+.84_710000_l+.57_2e1701_ios&acp=0&ntde=10.&ntd=10.&prd=60.&ptde=10.&ptd=5.">
  <img src="/screenshots/thumbs/Dexter.jpg" alt="Dexter" title="Dexter" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.21&o=11&g=.5&l=2&a=5.1&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.47_000000_l+.48_b9faff_l+.48_000000_l&acp=1&ntde=1.&ntd=1.5&prd=3.&ptde=1.&ptd=1.5">
  <img src="/screenshots/thumbs/Elektro.jpg" alt="Elektro - by Nickelartist" title="Elektro - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.49&o=11&g=.5&l=2&a=7.4&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.47_000000_l+.48_b9faff_l+.48_000000_l+.56_dd2ff0_ios25+.87_000000_l+.05_000000_l+.07_1ab4ce_l+.09_000000_l&acp=1&ntde=3.&ntd=10.&prd=21.&ptde=10.&ptd=5.">
  <img src="/screenshots/thumbs/Lines-n-clouds.jpg" alt="Lines and Clouds - by Nickelartist" title="Lines and Clouds - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=15&o=1&g=.4&l=2&a=3.3&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.47_000000_l+.5_77e0ff_l+.57_000000_l&acp=1&ntde=5.&ntd=10.&prd=30.&ptde=5.&ptd=10.">
  <img src="/screenshots/thumbs/Maze.jpg" alt="The Maze" title="The Maze" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.96&o=1&g=.44&l=1.96&a=9.9&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.5_000000_l+.5_86f0f0_l+.65_fdffff_l+.65_000000_l&acp=1&ntde=0&ntd=15.&prd=25.&ptde=0&ptd=15.">
  <img src="/screenshots/thumbs/Tapes.jpg" alt="Tapes" title="Tapes" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.16&o=3&g=.5&l=6.11&a=4.4&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.2_6d0b86_ios213+.1_ffffff_io2+.62_ba0c9f_o2+.49_faa3f8_i2&acp=1&ntde=10.&ntd=10.&prd=30.&ptde=10.&ptd=10.">
  <img src="/screenshots/thumbs/DirtyContrastOnWhite.jpg" alt="Dirty Contrast on White - by Nickelartist" title="Dirty Contrast on White - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.47&o=7&g=.5&l=2.31&a=4.4&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.2_6d0b86_ios213+.1_ffffff_io2+.62_ba0c9f_o2+.49_faa3f8_i2&acp=1&ntde=10.&ntd=10.&prd=30.&ptde=10.&ptd=10.">
  <img src="/screenshots/thumbs/SeethingOnWhite.jpg" alt="Seething Colors on White - by Nickelartist" title="Seething Colors on White - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.55&o=15&g=.79&l=2&a=1.1&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.29_005662_l+0_000000_l+.69_ffae55_l+.76_000000_l+.63_000000_l&acp=0&ntde=0&ntd=10.&prd=120.&ptde=10.&ptd=5">
  <img src="/screenshots/thumbs/GoldIslands.jpg" alt="Gold Islands" title="Gold Islands" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.73&o=10&g=.68&l=1.86&a=1&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.23_000000_ioc+.13_ffffff_ios25+.42_cc092b_iob+.9_000000_l&acp=0&ntde=10.&ntd=10.&prd=30.&ptde=10.&ptd=10.">
  <img src="/screenshots/thumbs/BlackWhiteRed.jpg" alt="Black/White/Red - by Nickelartist" title="Black/White/Red - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=1&o=8&g=.67&l=1.5&a=1&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.19_c1925e_ios+.7_c1925e_io5+.27_8b531b_ios+.72_ffffff_ios25+.78_723e03_io5+.22_ffffff_ios25&acp=0&ntde=12.&ntd=12.&prd=40.&ptde=10.&ptd=5">
  <img src="/screenshots/thumbs/Cafe_au_Lait.jpg" alt="Café au Lait - by Nickelartist" title="Café au Lait - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.6&o=14&g=.75&l=1.3&a=3.2&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.39_ffffff_ios+.54_ffffff_ios+.16_ffcc00_ios+.3_ff8000_ios+.04_ff8000_ios+.21_fddd2b_ios&acp=0&ntde=3.&ntd=9.9&prd=60.&ptde=10.&ptd=5">
  <img src="/screenshots/thumbs/EggYolkFluid.jpg" alt="Egg Yolk Fluid - by Nickelartist" title="Egg Yolk Fluid - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/PlasmaFractal2/?f=.71&o=4&g=.5&l=2&a=5&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.6_62f8ff_l+.29_000000_i2+.69_000000_l+.55_62f8ff_l+.54_00bcc6_l+.61_00bcc6_o2&acp=1&ntde=10.&ntd=10.&prd=40.&ptde=10.&ptd=10.">
  <img src="/screenshots/thumbs/NeonTapes.jpg" alt="Neon Tapes" title="Neon Tapes" width="150">
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
  
- [ResizeObserver polyfill](https://github.com/que-etc/resize-observer-polyfill)
  - Copyright (c) 2016 Denis Rul
  
## Special thanks to
- [stackoverflow](https://stackoverflow.com)
  - So many helpful answers, too many to credit them individually. Kudos to this awesome community!
  
- [Nickelartist](http://nickelartist.de/)
  - For many inspirations and some awesome presets.
