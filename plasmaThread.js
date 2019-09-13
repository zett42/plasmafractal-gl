/*
Thread for generating and rendering plasma fractal. Copyright (c) 2019 zett42.
https://github.com/zett42/PlasmaFractal2

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
	'external/tinycolor/tinycolor.js',
	'components/color.js', 
	'components/easing.js', 
	'components/fractalNoise.js', 
	'plasma.js' 
);

let m_plasma = null;

let m_canvas = null;
let m_context = null;
let m_contextImageData = null;
let m_contextPixels = null;

let m_isPaused = false;

const m_ndebug = true;

//-------------------------------------------------------------------------------------------------------------------

self.onmessage = function( ev ) 
{
	m_ndebug || console.debug( "z42plasmaThread: Message received: ", ev );

	switch( ev.data.action )
	{
		case "init":   init( ev.data );
		break;

		case "start":  m_isPaused = false; animate();
		break;
		
		case "pause":  m_isPaused = true;
		break;

		case "resize": resize( ev.data.width, ev.data.height );
		break;
		
		case "reseed": reseed( ev.data.noiseSeed );
		break;
		
		case "setOptions": setOptions( ev.data.groupName, ev.data.value ); 
		break;
	}
};

//-------------------------------------------------------------------------------------------------------------------

function init( params )
{
	noise.seed( params.noiseSeed );

	m_plasma = new z42Plasma({ 
		colorSeed: params.colorSeed,
		options  : params.options
	});
	
	m_canvas = params.canvas;
	m_context = m_canvas.getContext('2d');

	resize( params.width, params.height );
	
	m_isPaused = params.isPaused;
	if( ! m_isPaused )
	{
		animate();
	}
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
	if( m_isPaused )
		return;
	
	m_plasma.drawAnimationFrame( m_contextPixels );

	m_context.putImageData( m_contextImageData, 0, 0 );	
	
	self.requestAnimationFrame( animate );
}

//-------------------------------------------------------------------------------------------------------------------

function reseed( noiseSeed )
{
	noise.seed( noiseSeed );
	
	m_plasma.generateNoiseImage();
	
	// Notify main thread that we are done.
	self.postMessage({ action: "onreseedfinished" }); 
}

//-------------------------------------------------------------------------------------------------------------------

function setOptions( groupName, value ) {
	m_plasma[ "options$" + groupName ] = value;
}