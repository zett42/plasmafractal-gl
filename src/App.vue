<!--
Copyright (c) 2019 zett42.
https://github.com/zett42/plasmafractal-gl

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

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Main component
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<template>
    <div id="app">
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

        <div id="fps-info" v-if="optData.info.showFps"></div>        

       	<canvas id="plasmaCanvas" class="plasma">PlasmaFractal</canvas>
    </div>
</template>

<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<script>
import * as plasmaOpt from "./plasmaOptions";
import * as z42optUtil from "./components/optionsUtils";
import * as z42plasma from "./components/glPlasma.js";
import * as _ from "lodash";

const m_options = z42optUtil.mergeDefaultsWithUrlParams( plasmaOpt.optionsDescriptor, window.location.search );
let m_canvas = null;
let m_plasma = null;
let m_optionsButtonFadeoutTimer = null;

let m_lastFpsTime = performance.now();
let m_frameCount = 0;

//···················································································································

export default {
    name: "app",

    data() {
        // The data to provide to z42opt-dialog component.
        return {
            optData: m_options,                      // Option values (variable).
            optDesc: plasmaOpt.optionsDescriptor,    // Options meta data (constant).
            optView: plasmaOpt.optionsView,          // Overall GUI structure (constant).
        };
    },
    mounted() { 
        m_canvas = document.getElementById( "plasmaCanvas" );

        m_plasma = new z42plasma.PlasmaFractal2D({ 
            canvas    : m_canvas,
            colorSeed : Math.random(),
            noiseSeed : Math.random(),
            warpSeed  : Math.random(),
            warpSeed2 : Math.random(),
            options   : m_options,
            width     : Math.round( window.innerWidth  * window.devicePixelRatio ),
            height    : Math.round( window.innerHeight * window.devicePixelRatio ),
        });

        wireUpEventListeners();

        requestAnimationFrame( animate );
    },
    methods: {
        // Called when an option has been changed in the UI.
        onModified( event ) {
            _.set( m_options, event.path, event.value );

            const groupName = event.path.split( "." )[ 0 ];
            m_plasma[ "options$" + groupName ] = m_options[ groupName ];
        },
    },
};

//···················································································································

function wireUpEventListeners() {
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
}

//···················································································································

function animate() {
    m_plasma.drawAnimationFrame();

    showFps();

	requestAnimationFrame( animate );
}

//···················································································································

function showFps() {
    ++m_frameCount;

    let now = performance.now();
    if( now - m_lastFpsTime >= 1000 ) {
        let fpsElem = document.getElementById( "fps-info" );
        if( fpsElem ) {
            fpsElem.textContent = m_frameCount.toFixed( 0 ) + ' fps';
        }

        m_lastFpsTime = now;
        m_frameCount = 0;
    }
}

//···················································································································

function resizePlasmaToWindowSize(){

	const width  = Math.round( window.innerWidth  * window.devicePixelRatio );
	const height = Math.round( window.innerHeight * window.devicePixelRatio );

	m_plasma.resize( width, height );
}

//···················································································································

function toggleFullscreen(){
	if( document.documentElement.requestFullscreen ){
		if( document.fullscreenElement )
			document.exitFullscreen();
		else
			document.documentElement.requestFullscreen();
	}
}

//···················································································································

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

//···················································································································

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

</script>