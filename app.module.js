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
import "./components/optionsCompDialog.module.js"
import "./components/optionsCompValue.module.js"
import "./components/optionsCompPalette.module.js"

const m_ndebug = true;

const m_options = z42optUtil.mergeDefaultsWithUrlParams( plasmaOpt.optionsDescriptor, window.location.search );

const m_colorSeed = Math.random();

let m_optionsButtonFadeoutTimer = null;

// Foreground objects
let m_fg = {
	canvas : $("#canvas1")
}
// Background objects
let m_bg = {
	canvas : $("#canvas2")
}

// Create threads for rendering plasma.
m_fg.thread = createPlasmaThreadForCanvas( m_fg.canvas[ 0 ], false );
m_bg.thread = createPlasmaThreadForCanvas( m_bg.canvas[ 0 ], true );

// Set timeout for first canvas fade animation.
setTimeout( initCanvasAnimation, m_options.noiseAnim.transitionDelay );

const m_app = initGui();

//===================================================================================================================
// Functions
//===================================================================================================================

function createPlasmaThreadForCanvas( canvas, isPaused ) {
	let thread = new Worker( "./plasmaThread.js" );

	// Set callback to handle messages from worker thread.
	thread.addEventListener( "message", onPlasmaThreadMessage );

	// Create an offscreen canvas, as regular canvas is bound to DOM and cannot be passed to web worker.
	const offscreenCanvas = canvas.transferControlToOffscreen();

	// Launch animation in worker thread. Threads will generate different noise images, but same sequence of
	// random palette colors.
	thread.postMessage(
		{
			action   : "init",
			isPaused : isPaused,
			canvas   : offscreenCanvas,
			width    : window.innerWidth,
			height   : window.innerHeight,
			noiseSeed: Math.random(),
			colorSeed: m_colorSeed,
			options  : m_options
		},
		[ offscreenCanvas ]   // transfer ownership of offscreenCanvas to thread
	);

	return thread;
}

//-------------------------------------------------------------------------------------------------------------------

function onPlasmaThreadMessage( ev ) {
	m_ndebug || console.debug( "Message from plasmaThread:", ev );

	switch ( ev.data.action ) {
		case "onreseedfinished": {
			// Transition to newly created fractal.

			setTimeout( startCanvasTransition, m_options.noiseAnim.transitionDelay );
			break;
		}
	}
}

//-------------------------------------------------------------------------------------------------------------------

function initCanvasAnimation() {
	setCanvasTransitionDuration( m_options.noiseAnim.transitionDuration );

	// Set callback to be notified when CSS transition has ended.
	m_fg.canvas.on( "transitionend", () => {
		m_ndebug || console.debug( "m_fg.canvas transitionend" );

		// Swap foreground and background objects.
		[ m_fg, m_bg ] = [ m_bg, m_fg ];

		// Pause the animation of the new background thread as its canvas is invisible anyway.
		m_bg.thread.postMessage( { action: "pause" } );

		// Start to calculate new fractal image in background thread.
		// We will get notified by onPlasmaThreadMessage() when this is done.
		m_bg.thread.postMessage( { action: "reseed", noiseSeed: Math.random() } );
	});

	startCanvasTransition();
}

//-------------------------------------------------------------------------------------------------------------------

function setCanvasTransitionDuration( durationMillis ) {
	$( ".plasma" ).css( "transition-duration", durationMillis.toString() + "ms" );
}

//-------------------------------------------------------------------------------------------------------------------
// Start CSS transition animation (configured through CSS 'transition' attribute).

function startCanvasTransition() {
	// Wake the background thread up because its canvas will be visible soon.
	m_bg.thread.postMessage( { action: "start" } );

	m_fg.canvas.css( { opacity: 0.0 } );
	m_bg.canvas.css( { opacity: 1.0 } );
}

//-------------------------------------------------------------------------------------------------------------------

function initGui() {
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
		.on( "popstate", () => window.location.reload() );

	$(document)
		// Toggle visibility of options button: fullscreen will hide it, mouse interaction will show it again.
		.on( "fullscreenchange", updateOptionsButtonVisibility )
		.on( "mousemove", updateOptionsButtonVisibility )
		.on( "click", updateOptionsButtonVisibility )
		// Handle keyboard shortcuts
		.on( "keydown", onKeyDown )
		; 

	$(m_fg.canvas)
		.on( "dblclick", toggleFullscreen );

	// To work around blurry popup windows when browser zoom != 100%.
	Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false;

	return app;
}

//-------------------------------------------------------------------------------------------------------------------

function resizePlasmaToWindowSize(){
	const msg = { 
		action: "resize", 
		width : window.innerWidth, 
		height: window.innerHeight 
	};
	m_fg.thread.postMessage( msg );
	m_bg.thread.postMessage( msg );
}

//-------------------------------------------------------------------------------------------------------------------

function setPlasmaOptions( propName, value ){
	const msg = {
		action: "setOptions",
		propName: propName,
		value: value
	};
	m_fg.thread.postMessage( msg );
	m_bg.thread.postMessage( msg );
}

//-------------------------------------------------------------------------------------------------------------------

function setNoiseAnimOptions( options ){
	setCanvasTransitionDuration( options.transitionDuration );
}

//-------------------------------------------------------------------------------------------------------------------

function toggleFullscreen(){
	if( document.documentElement.requestFullscreen ){
		if( document.fullscreenElement )
			document.exitFullscreen();
		else
			document.documentElement.requestFullscreen();
	}
}

//-------------------------------------------------------------------------------------------------------------------

function updateOptionsButtonVisibility(){
	$("#button-options-dialog").css( "opacity", 1 );

	if( m_optionsButtonFadeoutTimer ){
		clearTimeout( m_optionsButtonFadeoutTimer );
	}

	if( document.fullscreenElement ){
		// In fullscreen mode, options button will be hidden after timeout.
		m_optionsButtonFadeoutTimer = setTimeout( 
			() => $("#button-options-dialog").css( "opacity", 0 ), 
			2000 
		);
	}
}

//-------------------------------------------------------------------------------------------------------------------

function onKeyDown( event ){
	if( event.isComposing ) {
		return;
	}
	switch( event.keyCode ){
		// toggle options dialog
		case "O".charCodeAt( 0 ): $( "#button-options-dialog" ).click(); break;
	}
}
