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

import * as plasmaOpt from "./components/plasmaOptions.module.js"
import * as z42optUtil from "./components/optionsUtils.module.js"
import "./components/optionsCompDialog.module.js"
import "./components/optionsCompValue.module.js"
import "./components/optionsCompPalette.module.js"

const m_options = z42optUtil.mergeDefaultsWithUrlParams( plasmaOpt.optionsDescriptor, window.location.search );

const m_canvas = document.getElementById( "plasmaCanvas" );
const m_thread = createPlasmaThreadForCanvas( m_canvas );

let m_optionsButtonFadeoutTimer = null;

const m_app = initGui();

//===================================================================================================================
// Functions
//===================================================================================================================

function createPlasmaThreadForCanvas( canvas ) {
	let thread = new Worker( "./components/plasmaThread.js" );

	// Create an offscreen canvas, as regular canvas is bound to DOM and cannot be passed to web worker.
	const offscreenCanvas = canvas.transferControlToOffscreen();

	// Launch animation in worker thread. Threads will generate different noise images, but same sequence of
	// random palette colors.
	thread.postMessage(
		{
			action   : "init",
			isPaused : false,
			canvas   : offscreenCanvas,
			width    : Math.round( window.innerWidth  * window.devicePixelRatio ),
			height   : Math.round( window.innerHeight * window.devicePixelRatio ),
			noiseSeed: Math.random(),
			colorSeed: Math.random(),
			options  : m_options
		},
		[ offscreenCanvas ]   // transfer ownership of offscreenCanvas to thread
	);

	return thread;
}

//-------------------------------------------------------------------------------------------------------------------

function initGui() {

	// Create root Vue instance, which represents the GUI of this application.
	let app = new Vue({
		el: "#app",
		data: function() {
			// The data to provide to z42opt-dialog component.
			return {
				optData: m_options,                      // Option values (variable).
				optDesc: plasmaOpt.optionsDescriptor,    // Options meta data (constant).
				optView: plasmaOpt.optionsView,          // Overall GUI structure (constant).
			};
		},			
		methods: {
			// Called when an option has been changed in the UI.
			onModified( event ) {
				_.set( m_options, event.path, event.value );

				const groupName = event.path.split( "." )[ 0 ];
				setPlasmaOptions( groupName, m_options[ groupName ] ); 
			},
		},
		// TIP: Install VSCode "Comment tagged templates" extensions for syntax highlighting of template.
		template: /*html*/ `
			<div>
				<b-button 
					id="button-options-dialog" 
					v-b-modal.z42opt-dialog 
					title="Plasma Options (Key 'o')">⚙</b-button>
				
				<z42opt-dialog 
					id="z42opt-dialog" 
					:optData="optData" 
					:optDesc="optDesc" 
					:optView="optView" 
					@opt-modified="onModified( $event )"
				/>
			</div>
		`
	});	

	// Wire up global events.

	// On window resize, resize the canvas to fill browser window dynamically.
	// Use debounce() to avoid costly calculations while the window size is in flux.
	window.addEventListener( "resize", _.debounce( resizePlasmaToWindowSize, 150 ) );

	// When browser back/forward button gets pressed, reload the state that onOptionsDialogClose() pushed to the history. 
	window.addEventListener( "popstate", () => window.location.reload() );

	// Toggle visibility of options button: fullscreen will hide it, mouse interaction will show it again.
	document.addEventListener( "fullscreenchange", updateOptionsButtonVisibility );
	document.addEventListener( "mousemove", updateOptionsButtonVisibility );
	document.addEventListener( "click", updateOptionsButtonVisibility );

	// Handle keyboard shortcuts
	document.addEventListener( "keydown", onKeyDown );

	// Toggle fullscreen by double-click on canvas.
	m_canvas.addEventListener( "dblclick", toggleFullscreen );

	// To work around blurry popup windows when browser zoom != 100%. Popper is used by Bootstrap.
	Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false;

	return app;
}

//-------------------------------------------------------------------------------------------------------------------

function resizePlasmaToWindowSize(){
	m_thread.postMessage({ 
		action: "resize", 
		width : Math.round( window.innerWidth  * window.devicePixelRatio ), 
		height: Math.round( window.innerHeight * window.devicePixelRatio ),
	});
}

//-------------------------------------------------------------------------------------------------------------------

function setPlasmaOptions( groupName, value ){
	m_thread.postMessage({
		action: "setOptions",
		groupName: groupName,
		value: value
	});
}

const setPlasmaOptionsDebounced = _.debounce( setPlasmaOptions, 150 ); //, { leading: true, trailing: false } );

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
	document.getElementById( "button-options-dialog").style.opacity = 1.0;

	if( m_optionsButtonFadeoutTimer ){
		clearTimeout( m_optionsButtonFadeoutTimer );
	}

	if( document.fullscreenElement ){
		// In fullscreen mode, options button will be hidden after timeout.
		m_optionsButtonFadeoutTimer = setTimeout( 
			() => document.getElementById( "button-options-dialog" ).style.opacity = 0, 
			2000 
		);
	}
}

//-------------------------------------------------------------------------------------------------------------------

function onKeyDown( event ){
	if( ! event.isComposing ) {
		switch( event.keyCode ){
			case "O".charCodeAt( 0 ): 
				// toggle options dialog
				document.getElementById( "button-options-dialog" ).click(); 
				break;
		}
	}
}
