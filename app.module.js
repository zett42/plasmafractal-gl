/*
PlasmaFractal main module. Copyright (c) 2019 zett42.
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
//===================================================================================================================
// Main entry point
//===================================================================================================================

import * as plasmaOpt from "./plasmaOptions.module.js"
import * as z42optUtil from "./components/optionsUtils.module.js"
import "./components/optionsDialog.module.js"

const m_ndebug = true;

const m_options = z42optUtil.mergeDefaultsWithUrlParams( plasmaOpt.optionsDescriptor, window.location.search );

const m_colorSeed = Math.random();

let m_optionsButtonFadeoutTimer = null;

let m_canvasFG = $("#canvas1");
let m_canvasBG = $("#canvas2");

// Create threads for rendering plasma.
let m_plasmaThreadFG = createPlasmaThreadForCanvas( m_canvasFG[ 0 ], false );
let m_plasmaThreadBG = createPlasmaThreadForCanvas( m_canvasBG[ 0 ], true );

// Set timeout for first canvas fade animation.
setTimeout( initCanvasAnimation, m_options.noiseAnim.transitionDelay );

let m_app = initGui();

//===================================================================================================================
// Functions
//===================================================================================================================

function createPlasmaThreadForCanvas( canvas, isPaused )
{
	let thread = new Worker( './plasmaThread.js' );

	// Set callback to handle messages from worker thread.
	thread.addEventListener( 'message', onPlasmaThreadMessage );

	// Create an offscreen canvas, as regular canvas is bound to DOM and cannot be passed to web worker.
	const offscreenCanvas = canvas.transferControlToOffscreen();

	// Launch animation in worker thread. Threads will generate different noise images, but same sequence of
	// random palette colors.
	thread.postMessage(
		{
			action: "init",
			isPaused: isPaused,
			canvas: offscreenCanvas,
			width: window.innerWidth,
			height: window.innerHeight,
			noiseSeed: Math.random(),
			colorSeed: m_colorSeed,
			options: m_options
		},
		[offscreenCanvas]   // transfer ownership of offscreenCanvas to thread
	);

	return thread;
}

//-------------------------------------------------------------------------------------------------------------------

function onPlasmaThreadMessage( ev )
{
	m_ndebug || console.debug( "Message from plasmaThread:", ev );

	switch ( ev.data.action )
	{
		case "onreseedfinished":
			{
				// Transition to newly created fractal.

				setTimeout( startCanvasTransition, m_options.noiseAnim.transitionDelay );
			}
			break;
	}
}
//-------------------------------------------------------------------------------------------------------------------

function initCanvasAnimation()
{
	setCanvasTransitionDuration( m_options.noiseAnim.transitionDuration );

	// Set callback to be notified when CSS transition has ended.
	m_canvasFG.on( 'transitionend', () =>
	{
		m_ndebug || console.debug( 'm_canvasFG transitionend' );

		// Swap foreground and background things.
		[m_canvasFG, m_canvasBG] = [m_canvasBG, m_canvasFG];
		[m_plasmaThreadFG, m_plasmaThreadBG] = [m_plasmaThreadBG, m_plasmaThreadFG];

		// Pause the animation of the new background thread as its canvas is invisible anyway.
		m_plasmaThreadBG.postMessage( { action: "pause" } );

		// Start to calculate new fractal image in background thread.
		// We will get notified by onPlasmaThreadMessage() when this is done.
		m_plasmaThreadBG.postMessage( { action: "reseed", noiseSeed: Math.random() } );
	} );

	startCanvasTransition();
}

//-------------------------------------------------------------------------------------------------------------------

function setCanvasTransitionDuration( durationMillis )
{
	$( ".plasma" ).css( "transition-duration", durationMillis.toString() + "ms" );
}

//-------------------------------------------------------------------------------------------------------------------
// Start CSS transition animation (configured through CSS 'transition' attribute).

function startCanvasTransition()
{
	// Wake the background thread up because its canvas will be visible soon.
	m_plasmaThreadBG.postMessage( { action: "start" } );

	m_canvasFG.css( { opacity: 0.0 } );
	m_canvasBG.css( { opacity: 1.0 } );
}

//-------------------------------------------------------------------------------------------------------------------

function initGui()
{
	// To work around blurry popup windows when browser zoom != 100%.
	Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false;

	// Create root Vue instance, which represents the GUI of this application.

	let app = new Vue({
		el: "#app",
		data: function() { 
			return {
				optData: m_options,
				optDesc: plasmaOpt.optionsDescriptor,
				optView: plasmaOpt.optionsView,
			};
		},			
		watch: {
			"optData.noise": {
				deep: true,   // watch child elements too
				handler: ( val, oldVal ) => setPlasmaOptions( 'noiseOptions', val )
			},
			"optData.palette": {
				deep: true,   // watch child elements too
				handler: ( val, oldVal ) => setPlasmaOptions( 'paletteOptions', val )
			},
			"optData.paletteAnim": {
				deep: true,   // watch child elements too
				handler: ( val, oldVal ) => setPlasmaOptions( 'paletteAnimOptions', val )
			},
			"optData.noiseAnim": {
				deep: true,   // watch child elements too
				handler: ( val, oldVal ) => setNoiseAnimOptions( val )
			}
		},
		// TIP: Install VSCode "Comment tagged templates" extensions for syntax highlighting of template.
		template: /*html*/ `
			<div>
				<b-button id="button-options-dialog" 
					v-b-modal.z42opt-dialog 
					title="Plasma Options (Key 'o')">⚙</b-button>
				
				<z42opt-dialog id="z42opt-dialog" 
					:optData="optData" :optDesc="optDesc" :optView="optView" />
			</div>
		`
	});	

	// Wire up global events.

	$(window)
		// On window resize, resize the canvas to fill browser window dynamically.
		// Use debounce() to avoid costly calculations while the window size is in flux.
		.on( "resize", _.debounce( resizePlasmaToWindowSize, 150 ) )
		// When browser back/forward button gets pressed, reload the state that onOptionsDialogClose() pushed to the history. 
		.on( "popstate", function()
		{
			window.location.reload();
		});

	$(document)
		.on( "dblclick", toggleFullscreen )
		// Toggle visibility of options button: fullscreen will hide it, mouse interaction will show it again.
		.on( "fullscreenchange", updateOptionsButtonVisibility )
		.on( "mousemove", updateOptionsButtonVisibility )
		.on( "click", updateOptionsButtonVisibility )
		// Handle keyboard shortcuts
		.on( "keydown", onKeyDown )
		; 

	return app;
}

//-------------------------------------------------------------------------------------------------------------------

function resizePlasmaToWindowSize()
{
	// TODO: Use timer so thread isn't blocked by handling too many resize requests.

	m_plasmaThreadFG.postMessage( { action: "resize", width: window.innerWidth, height: window.innerHeight } );
	m_plasmaThreadBG.postMessage( { action: "resize", width: window.innerWidth, height: window.innerHeight } );
}

//-------------------------------------------------------------------------------------------------------------------

function setPlasmaOptions( propName, value )
{
	m_plasmaThreadFG.postMessage( {
		action: "setOptions",
		propName: propName,
		value: value
	} );

	m_plasmaThreadBG.postMessage( {
		action: "setOptions",
		propName: propName,
		value: value
	} );
}

//-------------------------------------------------------------------------------------------------------------------

function setNoiseAnimOptions( options )
{
	setCanvasTransitionDuration( options.transitionDuration );
}

//-------------------------------------------------------------------------------------------------------------------

function toggleFullscreen()
{
	if( document.documentElement.requestFullscreen )
	{
		if ( document.fullscreenElement )
			document.exitFullscreen();
		else
			document.documentElement.requestFullscreen();
	}
}

//-------------------------------------------------------------------------------------------------------------------

function updateOptionsButtonVisibility()
{
	$("#button-options-dialog").css( "opacity", 1 );

	if( m_optionsButtonFadeoutTimer )
	{
		clearTimeout( m_optionsButtonFadeoutTimer );
	}

	if( document.fullscreenElement )
	{
		// In fullscreen mode, options button will be hidden after timeout.
		m_optionsButtonFadeoutTimer = setTimeout( 
			() => $("#button-options-dialog").css( "opacity", 0 ), 
			2000 
		);
	}
}

//-------------------------------------------------------------------------------------------------------------------

function onKeyDown( event )
{
	if( event.isComposing ) {
		return;
	}
	switch( event.keyCode )
	{
		// toggle options dialog
		case "O".charCodeAt( 0 ): $( "#button-options-dialog" ).click(); break;
	}
}
