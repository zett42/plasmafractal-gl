# PlasmaFractal

<img src="/screenshots/thumbs/SeethingOnWhite.jpg" alt="Screenshot" title="Screenshot" width="150">

Oldschool PlasmaFractal revival with Perlin Noise and WebGL.
Fully customizable via dynamic VueJS based UI. 

Basic algorithm (fragment shader):
- For each pixel, grayscale value is calculated by calling Perlin Noise or other noise functions.
- RGB color is generated by using grayscale value as palette index.
- To produce fractal, calculate noise function multiple times per pixel with increasing frequency and decreasing amplitude.
- Optional domain warping:
  - Distort the space by applying another noise function to the input coordinates of the final noise function. Most [tutorials](http://www.iquilezles.org/www/articles/warp/warp.htm) simply add noise values to the coordinates, while more interesting results can be achieved with other techniques, e. g. using polar coordinates.

Animation
- Noise can be mutated by taking a slice of 3D noise and incrementing the Z position over time.
- A turbulence effect can be achieved by incrementing the Z position faster for each octave of fractal.
- Palette can be animated by rotating the palette entries and by blending between random colors.

## [Live demo](https://zett42.github.io/plasmafractal-gl/)
- Double-click to toggle fullscreen.
- Press the "gear" button in the top-left corner to adjust plasma options.
- When you are happy with your settings, share the Permalink with your friends.

### Requirements and browser support:
- Requires WebGL2 support by browser.
- :white_check_mark: Tested successfully with Chrome v77.0.3865.90, Opera v63.0.3368.94, Firefox v69.0.1
- Best performance observed in Chromium-based browsers like Chrome and Opera.
  
### Preset Links
<a href="https://zett42.github.io/plasmafractal-gl/?f=.09&o=12&g=.57&l=2.13&a=5.5&n=p3&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.149_000000_l+.7_8a0000_l+.845_f0c000_ios+.514_000000_i2+.99_8a0000_o2+.77_ff0000_ios+.92_f90000_l&acp=0&ntu=1.69&inm=1&ns=.03&ptde=10.&ptd=.1&ipr=0&prs=.1#">
   <img src="/screenshots/thumbs/Fiery.jpg" alt="Fiery" title="Fiery" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?f=.47&o=7&g=.5&l=2.31&a=4.4&n=p3&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.2_6d0b86_ios213+.1_ffffff_io2+.62_ba0c9f_o2+.49_faa3f8_i2&acp=1&ntu=2.23&inm=1&ns=.03&ptde=10.&ptd=10.&ipr=0&prs=.1#">
  <img src="/screenshots/thumbs/DirtyContrastOnWhite.jpg" alt="Dirty Contrast on White - by Nickelartist" title="Dirty Contrast on White - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?f=.94&o=4&g=.58&l=2&a=3.2&n=p3&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.6_62f8ff_l+.29_000000_i2+.835_000000_l+.55_62f8ff_l+.54_00bcc6_l+.61_00bcc6_o2&acp=1&ntd=5.4&ntu=2.22&prd=120.&ptde=10.&ptd=10.#">
  <img src="/screenshots/thumbs/NeonTapes.jpg" alt="Neon Tapes" title="Neon Tapes" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?f=.49&o=11&g=.5&l=2&a=7.4&n=p3&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.47_000000_l+.48_b9faff_l+.48_000000_l+.56_dd2ff0_ios25+.87_000000_l+.05_000000_l+.07_1ab4ce_l+.09_000000_l&acp=1&ntu=2&inm=1&ns=.02&ptde=10.&ptd=5.&ipr=0&prs=.1#">
  <img src="/screenshots/thumbs/Lines-n-clouds.jpg" alt="Lines and Clouds - by Nickelartist" title="Lines and Clouds - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?f=.15&o=7&g=.55&l=2&a=4.5&n=p3&pg=0&icp=0&pbf=ios&pfb=ob&ps=.69&pb=1&pbg=000000&cp=0_000000_i2+.25_00bfff_o2+.5_000000_i2+.75_dc0000_o2&acp=0&ntu=1.56&inm=1&ns=.02&ptde=10.&ptd=10.&ipr=1&prs=.01#">
  <img src="/screenshots/thumbs/LavaLamp.jpg" alt="Lava Lamp" title="Lava Lamp" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?f=5.43&o=2&g=.55&l=3.7&a=3.8&n=v3&pg=0&icp=1&pbf=ios&pfb=ob&ps=.69&pb=1&pbg=000000&cp=0_000000_io2+.34_123538_io2+.715_000000_io4+.75_ffce5b_io2+.777_000000_l&acp=0&ntu=1&inm=1&ns=.09&ptde=10.&ptd=10.&ipr=0&prs=.1#">
  <img src="/screenshots/thumbs/GoldenLines.jpg" alt="Golden Lines" title="Golden Lines" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?f=.14&o=5&g=.55&l=3.7&a=4.9&n=c3&pg=0&icp=1&pbf=ios&pfb=ob&ps=.69&pb=1&pbg=000000&cp=0_000000_io2+.34_2e1746_io2+.715_000000_io4+.75_ffce5b_io2+.777_000000_l&acp=0&ntd=6.&ntu=1.83&prd=120.&ptde=10.&ptd=10.#">
  <img src="/screenshots/thumbs/GoldenCircles.jpg" alt="Golden Circles" title="Golden Circles" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?n=c3&f=.46&o=7&g=.58&l=2&a=1&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=1&pbg=000000&cp=.898_000000_l+.292_91ffff_o5+.192_000000_i5+.442_000000_i2+.663_00ffa2_o2&acp=0&inm=1&ns=.05&ntu=1.85&ipr=0&prs=.1&ptde=10.&ptd=5.#">
  <img src="/screenshots/thumbs/Cellular1.jpg" alt="Cellular" title="Cellular" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?n=p3&f=.99&o=6&g=.41&l=1.96&a=5.7&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.03_000000_l+.1_ffffff_l+.14_2e2e2e_io4+.68_000000_l+.78_282828_ios23+.76_ffffff_l&acp=0&ntde=3.&ntd=10.&prd=10.&ptde=10.&ptd=5.#">
  <img src="/screenshots/thumbs/MilkGrey.jpg" alt="milk greY - by Nickelartist" title="milk greY - by Nickelartist" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?f=.23&o=14&g=.62&l=2&a=1.1&n=s3&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=.75&pbg=000000&cp=.69_ffae55_l+.695_481700_o2+.688_481700_l+.23_00485e_l+.233_9bf5ff_l+.237_00485e_o2+.456_000000_i2+.896_000000_i2&acp=0&ptde=10.&ptd=5.&ipr=0&prs=.1&inm=1&ns=.05&ntu=1.46&de=0&wt=v&wn=p3&wf=1.5&wo=4&wg=.75&wl=2&wa=12&wr=4&iwm=0&ws=.05&wtu=1.85#">
  <img src="/screenshots/thumbs/CosmicEnergy.jpg" alt="Cosmic Energy" title="Cosmic Energy" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?n=p3&f=.96&o=12&g=.5&l=2&a=1&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=1&pbg=000000&cp=0_948167_io2_f8*o6*g.61*l2*a.5*s.41+.723_333c4d_l&acp=0&inm=1&ns=.04&ntu=1.67&ipr=0&prs=.1&ptde=10.&ptd=5.#">
  <img src="/screenshots/thumbs/AgateBlueYellow.jpg" alt="Agate Blue/Yellow" title="Agate Blue/Yellow" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?n=p3&f=.33&o=5&g=.5&l=2&a=1&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=1&pbg=000000&cp=0_525787_l_f4*o12*g.61*l2*a.71*s.39&acp=1&inm=1&ns=.02&ntu=1.67&ipr=0&prs=.1&ptde=10.&ptd=5.#">
  <img src="/screenshots/thumbs/MonochromaticStripes.jpg" alt="Monochromatic Stripes" title="Monochromatic Stripes" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?n=p3&f=.96&o=12&g=.5&l=2&a=1&an=0&c=0&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=1&pbg=000000&cp=.494_461b00_io2_f2*o12*g.68*l2*a.5*s.41+.368_1f222c_io2_f4*o12*g.61*l2*a.2*s.5+.62_1f222c_io2_f1*o10*g.68*l2*a.5*s.64&acp=0&inm=1&ns=.03&ntu=1.36&ipr=0&prs=.1&ptde=15.&ptd=5.&de=0&wt=v&wn=p3&wf=1.5&wo=4&wg=.75&wl=2&wa=12&wr=4&iwm=0&ws=.05&wtu=1.85#">
  <img src="/screenshots/thumbs/DarkComplexity.jpg" alt="Dark Complexity" title="Dark Complexity" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?n=p3&f=.55&o=5.84&g=.45&l=2&a=1&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=1&pbg=000000&cp=0_000000_l_f1*o12*g.83*l3*a1.49*s.09&acp=0&inm=1&ns=.01&ntu=1.55&ipr=0&prs=.1&ptde=10.&ptd=5.#">
  <img src="/screenshots/thumbs/GraphicalFlux.jpg" alt="Graphical Flux" title="Graphical Flux" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?n=s3&f=.93&o=11.87&g=.5&l=2&a=1.14&an=0&c=1&de=1&wn=s3&wf=4.02&wo=6.99&wg=.46&wl=2&wa=9.1&wr=3.4&wt=vi&wan=0&pg=0&icp=1&pbf=i3&pfb=o3&ps=.5&pb=1&pbg=000000&cp=0_ffffff_io2+.489_0a5b76_io2+.237_032d3a_io2+.737_032d3a_io2&acp=0&inm=1&ns=.02&ntu=2.06&iwm=1&ws=.06&wtu=2.04&ipr=0&prs=.1&ptde=10.&ptd=5.#">
  <img src="/screenshots/thumbs/PetrolLake.jpg" alt="Petrol Lake (Domain Warping)" title="Petrol Lake (Domain Warping)" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?n=s3&f=.5&o=11.87&g=.46&l=2&a=1.7&an=0&c=0&de=1&wn=s3&wf=4.02&wo=10.55&wg=.49&wl=1.77&wa=20.2&wr=2.3&wt=v&pg=0&icp=1&pbf=i3&pfb=o3&ps=.5&pb=1&pbg=000000&cp=0_e7c232_io2+.667_000000_io2+.294_000000_l&acp=0&inm=1&ns=.02&ntu=1.63&iwm=1&ws=.11&wtu=1.9&ipr=0&prs=.1&ptde=10.&ptd=5.&de2=0&wt2=v&wn2=s3&wf2=3&wo2=4&wg2=.55&wl2=2&wa2=3&wr2=2&iwm2=0&ws2=.05&wtu2=1.85#">
  <img src="/screenshots/thumbs/Sulfur.jpg" alt="Sulfur (Domain Warping)" title="Sulfur (Domain Warping)" width="150">
</a>
<a href="https://zett42.github.io/plasmafractal-gl/?n=p3&f=1.23&o=7.4&g=.77&l=1.29&an=24.1&a=1&c=1&de=1&wt=vi&wn=s3&wf=6.86&wo=10&wg=.42&wl=2.28&wa=37.3&wr=3.3&pg=0&icp=1&pbf=ib&pfb=ob&ps=.5&pb=1&pbg=000000&cp=.101_af6413_io2+.404_2d365f_io2+.244_4f201a_l+1_ffffff_io2&acp=0&inm=1&ns=.03&ntu=1.49&iwm=1&ws=.13&wtu=1.94&ipr=0&prs=.1&ptde=10.&ptd=5.&de2=0&wt2=v&wn2=s3&wf2=1.12&wo2=11.91&wg2=.5&wl2=1.86&wa2=10.4&wr2=3.1&iwm2=1&ws2=.02&wtu2=1.85#">
  <img src="/screenshots/thumbs/GradientPattern1.jpg" alt="Gradient Pattern (Domain Warping)" title="Gradient Pattern (Domain Warping)" width="150">
</a>

## Develop

```bash
# Install
npm install
npm install -g @vue/cli
    
# Build & Serve
vue ui
    
# Build Release
npm run build
```
To open the release build locally in a browser, you must use a local web server. The root folder must be the project directory, so that there is a "plasmafractal-gl" sub folder in the URL:
http://127.0.0.1:8080/plasmafractal-gl/index.html

## Credits
This project uses the following open source libraries. Each library comes with its own license terms, which can be found in the source code included in this project.

- [Wombat](https://github.com/BrianSharpe/Wombat) - An efficient texture-free GLSL procedural noise library
  - by Brian Sharpe
    - http://briansharpe.wordpress.com
    - https://github.com/BrianSharpe
    
- [noisejs](https://github.com/josephg/noisejs) - A speed-improved perlin and simplex noise algorithms for 2D. 
  - Based on example code by Stefan Gustavson (stegu@itn.liu.se). 
  - Optimisations by Peter Eastman (peastman@drizzle.stanford.edu). 
  - Better rank ordering method by Stefan Gustavson in 2012. 
  - Converted to Javascript by Joseph Gentle.
 
- [Vue.js](https://vuejs.org/)
  - Copyright (c) 2013-present, Yuxi (Evan) You 

- [Bootstrap](https://getbootstrap.com/) 
  - Copyright (c) 2011-2019 Twitter, Inc.
  - Copyright (c) 2011-2019 The Bootstrap Authors

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
  
- [Nickelartist](http://nickelartist.com/)
  - For many inspirations and some awesome presets.
