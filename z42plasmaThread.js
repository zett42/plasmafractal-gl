/*
Thread for generating and rendering plasma fractal. Copyright (c) 2019 zett42.
https://github.com/zett42/PlasmaFractal

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 
*/

self.importScripts( 
	'z42color.js', 
	'z42easing.js', 
	'external/perlin.js', 
	'z42FractalNoise.js', 
	'z42plasma.js' 
);

let plasma = new z42Plasma();

let canvas = null;
let context = null;
let contextImageData = null;
let contextPixels = null;

noise.seed( Math.random() );

//-------------------------------------------------------------------------------------------------------------------

self.onmessage = function( ev ) {

	console.log( "z42plasmaThread: Message received: ", ev );

	switch( ev.data.action )
	{
		case "init":
		{
			canvas = ev.data.canvas;
			context = canvas.getContext('2d');

			noise.seed( ev.data.seed );

			resize( ev.data.width, ev.data.height );

			animate();
		}
		
		case "resize":
		{
			resize( ev.data.width, ev.data.height );
		}		
		
		case "reseed":
		{
			noise.seed( ev.data.seed );
			
			plasma.generateNoiseImage();
		}
	}
};

//-------------------------------------------------------------------------------------------------------------------

function resize( width, height ) 
{
	if( width == canvas.width && height == canvas.height )
		return;
	
	canvas.width  = width;
	canvas.height = height;			

	contextImageData = context.createImageData( width, height );
	contextPixels = new Uint32Array( contextImageData.data.buffer );
	
	plasma.resize( width, height );
}

//-------------------------------------------------------------------------------------------------------------------

function animate() 
{
	plasma.drawAnimationFrame( contextPixels );

	context.putImageData( contextImageData, 0, 0 );	
	
	self.requestAnimationFrame( animate );
}
