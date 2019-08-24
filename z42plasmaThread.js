/*
Thread for generating and rendering m_plasma fractal. Copyright (c) 2019 zett42.
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
	'external/perlin.js',
	'external/mersennetwister/MersenneTwister.js',
	'z42color.js', 
	'z42easing.js', 
	'z42FractalNoise.js', 
	'z42plasma.js' 
);

let m_plasma = null;

let m_canvas = null;
let m_context = null;
let m_contextImageData = null;
let m_contextPixels = null;

//-------------------------------------------------------------------------------------------------------------------

self.onmessage = function( ev ) 
{
	console.log( "z42plasmaThread: Message received: ", ev );

	switch( ev.data.action )
	{
		case "init":
		{
			init( ev.data );
		}
		break;
		
		case "resize":
		{
			resize( ev.data.width, ev.data.height );
		}		
		break;
		
		case "reseed":
		{
			noise.seed( ev.data.noiseSeed );
			
			m_plasma.generateNoiseImage();
		}
		break;
	}
};

//-------------------------------------------------------------------------------------------------------------------

function init( params )
{
	noise.seed( params.noiseSeed );

	m_plasma = new z42Plasma({ colorSeed: params.colorSeed });
	
	m_canvas = params.canvas;
	m_context = m_canvas.getContext('2d');

	resize( params.width, params.height );

	animate();	
}

//-------------------------------------------------------------------------------------------------------------------

function resize( width, height ) 
{
	if( width == m_canvas.width && height == m_canvas.height )
		return;
	
	m_canvas.width  = width;
	m_canvas.height = height;			

	m_contextImageData = m_context.createImageData( width, height );
	m_contextPixels = new Uint32Array( m_contextImageData.data.buffer );
	
	m_plasma.resize( width, height );
}

//-------------------------------------------------------------------------------------------------------------------

function animate() 
{
	m_plasma.drawAnimationFrame( m_contextPixels );

	m_context.putImageData( m_contextImageData, 0, 0 );	
	
	self.requestAnimationFrame( animate );
}
