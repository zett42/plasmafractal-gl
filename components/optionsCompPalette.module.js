/*
Option UI components. Copyright (c) 2019 zett42.
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
*/
//---------------------------------------------------------------------------------------------------

import * as z42opt from "./optionsDescriptorValues.module.js"
import * as z42optUtil from "./optionsUtils.module.js"
import * as z42color from "./color.module.js"
import "../external/nouislider/nouislider.js"
import '../external/ResizeObserver/ResizeObserver.js'

// Non-module dependencies (include via <script> element):
// "color.js" - for drawing palette

// Pattern for private class members: https://stackoverflow.com/a/33533611/7571258
const privates = new WeakMap();

// When a slider handle is moved up or down more than this distance, it will be removed.
const mouseThresholdToRemoveHandle = 50;

const cssClassHandleToRemove = "z42opt-palette-handle-to-remove";
const cssClassHandleSelected = "z42opt-palette-handle-selected";

//==================================================================================================
// Public component

const paletteComponent = Vue.component( "z42opt-palette", {
	inheritAttrs: false,
	props: { 
		id:       { type: String, required: true },
		value:    { type: Array, required: true },
		optDesc:  { type: z42opt.PaletteOpt, required: true }, 
		disabled: { type: Boolean, required: false, default: false },
	},	
	data() {
		return {
			selectedHandleIndex: null,
			selectedPaletteItem: null,
			selectedPaletteItemView: {
				options: [ "" ]   // <- means "all children"
			},
		}
	},	
	mounted() {
		// Make a deep clone so we will be able to differentiate between changes of palette originating
		// from the outside and from the inside of this component.

		const palette = makePaletteValid( this.value, this.optDesc );

		const resizeObserver = new ResizeObserverPonyfill( this.onCanvasResize );
		
		// Define private variables of this component (non-reactive!)
		privates.set( this, {
			palette: palette,
			currentMousePos: null,
			slideStartMousePos: null,
			slidingHandleElement: null,
			resizeObserver: resizeObserver,
		});

		let sliderConfig = {
			start: palettePositions( palette ),
			range: { min: 0, max: 1 },
			step: 0.001,
			behaviour: "unconstrained",
		};

		if( this.optDesc.$attrs.step != null ){
			sliderConfig.step = this.optDesc.$attrs.step;
		}

		this.recreateSlider( sliderConfig );

		this.updateCanvas();

		resizeObserver.observe( document.getElementById( this.gradientCanvasId ) );
		resizeObserver.observe( document.getElementById( this.easeFunCanvasId ) );

		// If initial palette was not valid, send "fixed" palette back to parent.
		if( ! _.isEqual( palette, this.value ) ){
			this.emitPaletteInputEvent();
		}
	},
	beforeDestroy() {
		const priv = privates.get( this );

		// Remove global event listener in any case.
		window.removeEventListener( "mousemove", this.onSlideMouseMove );
		window.removeEventListener( "touchmove", this.onSlideTouchMove );

		priv.resizeObserver.disconnect();
	},
	computed: {
		easeFunCanvasId()     { return this.id + "#easeFunCanvas"; },
		gradientCanvasId()    { return this.id + "#gradientCanvas"; },
		selectedPaletteItemId()    { return this.id + "#segmentOptions"; },
		label()               { return this.optDesc.$attrs.title ? this.optDesc.$attrs.title + ":" : undefined; },
		labelFor()            { return this.optDesc.$attrs.title ? this.id : undefined; },
	},
	methods: {
		// Get the DOM element of the slider.
		getSliderElement() {
			return document.getElementById( this.id );			
		},

		getSliderWidth() {
			return getSliderElement().offsetWidth;
		},

		getEaseFunCanvasHeight() { 
			return document.getElementById( this.easeFunCanvasId ).offsetHeight;
		},

		// (Re-)create slider and (re-) attach event listeners.
		recreateSlider( options ) {
			const sliderElem = this.getSliderElement();

			if( sliderElem.noUiSlider ) {
				sliderElem.noUiSlider.destroy();
			}

			noUiSlider.create( sliderElem, options );
	
			// Using arrow function forwarder so onSlide() gets 'this' context of component instead of noUiSlider.
			sliderElem.noUiSlider.on( "start", ( ...args ) => this.onSlideStart( ...args ) );
			sliderElem.noUiSlider.on( "slide", ( ...args ) => this.onSlide( ...args ) );
			sliderElem.noUiSlider.on( "end"  , ( ...args ) => this.onSlideEnd( ...args ) );

			// Hook double-click on the slider bar (adds handle).
			for( const elem of sliderElem.getElementsByClassName( "noUi-connects" ) ) {
				elem.addEventListener( "dblclick", this.onConnectsDblClick );
			}
		
			for( const elem of sliderElem.getElementsByClassName( "noUi-handle" ) ) {
				// Hook shift-click on the handles (removes handle).
				elem.addEventListener( "click", this.onHandleClick );
	
				// Hook focus event to know about "selected" handle.
				elem.addEventListener( "focus", this.onHandleFocus );
			}	
		},

		// Called on slider position changes.
		//   values:     Current slider values formatted (array of String)
		//   handle:     Handle that caused the event (Number)
		//   valuesRaw:  Slider values without formatting (array of Number)
		//   tap:        Event was caused by the user tapping the slider (Boolean)
		//   handleOffs: Left offset of the handles (array of Number)

		onSlide( values, handleIndex, valuesRaw, tap, handleOffs ) {

			const palette = privates.get( this ).palette;
			const positions = palettePositions( palette );

			// Make sure we only react to actually changed values. The noUiSlider emits too many events 
			// even if values haven't changed.
        	if( ! _.isEqual( positions, valuesRaw ) ) {

				// Update the new positions of the slider handles in the cloned array.
				for( const i in valuesRaw ){
					palette[ i ].pos = valuesRaw[ i ];
				}

				this.updateCanvas();

				// According to Vue.js rules, this.value must not be modified directly.
				// Instead emit changes as "input" event to make the component compatible with v-model.
				this.emitPaletteInputEvent();
			 }
		},

		// Called on double click at slider bar. Adds a new handle at clicked position.
		onConnectsDblClick( event ) {
			let palettePos = 0;
			if( event.target.clientWidth > 0 )
				palettePos = event.offsetX / event.target.clientWidth;
			palettePos = _.clamp( palettePos, 0, 1 );  // just for sure
			
			// Clone required so setPaletteFromOutside() notices change in handle count.
			let newPalette = _.cloneDeep( privates.get( this ).palette );

			let newPaletteItem = { pos: palettePos };
			z42optUtil.setDefaultOptions( newPaletteItem, this.optDesc.segment );
			newPalette.push( newPaletteItem );

			this.setPaletteFromOutside( newPalette );

			// Select newly added handle.
			this.setSelectedHandle( newPalette.length - 1 );

			this.emitPaletteInputEvent();
		},

		// Called on click at a slider handle. If shift key is pressed, remove handle.
		onHandleClick( event ) {
			if( event.shiftKey ) {
				event.preventDefault();

				const handleIndex = this.handleIndexFromElement( event.target );
				if( handleIndex >= 0 ) {
					this.removeHandleAtIndex( handleIndex );
				}
			}
		},

		onSlideStart( values, handleIndex, valuesRaw, tap, handleOffs ){
			const priv = privates.get( this );
			priv.slideStartMousePos = null;
			priv.slidingHandleElement = this.handleElements()[ handleIndex ];
			
			// Register global mouse/touch move listener to capture movement even outside of handle element
			// which is needed to detect dragging up/down.
			window.addEventListener( "mousemove", this.onSlideMouseMove );
			window.addEventListener( "touchmove", this.onSlideTouchMove );
		},

		onSlideMouseMove( event ) {
			this.onSlideMouseTouchMove({ x: event.screenX, y: event.screenY });
		},
		
		onSlideTouchMove( event ) {
			if( event.changedTouches.length > 0 ){
				this.onSlideMouseTouchMove({ x: event.changedTouches[ 0 ].screenX, y: event.changedTouches[ 0 ].screenY });
			}
		},

		onSlideMouseTouchMove( pos ) {
			const priv = privates.get( this );

			priv.currentMousePos = _.clone( pos );
			if( ! priv.slideStartMousePos ){
				priv.slideStartMousePos = _.clone( pos );
			}

			const distY = Math.abs( pos.y - priv.slideStartMousePos.y ); 

			if( distY > mouseThresholdToRemoveHandle && priv.palette.length > 1 ) {
				// Visually indicate "to be deleted" state of handle.
				priv.slidingHandleElement.classList.add( cssClassHandleToRemove );				
			}
			else {
				// Removal visual "to be deleted" state of handle.
				priv.slidingHandleElement.classList.remove( cssClassHandleToRemove );				
			}
		},	

		onSlideEnd( values, handleIndex, valuesRaw, tap, handleOffs ){
			const priv = privates.get( this );

			// Remove CSS class that shows "to be deleted" state of handle.
			priv.slidingHandleElement.classList.remove( cssClassHandleToRemove );				

			if( priv.slideStartMousePos ){
				// Remove slider if mouse was moved a certain distance vertically.
				const distY = Math.abs( priv.currentMousePos.y - priv.slideStartMousePos.y ); 
				if( distY > mouseThresholdToRemoveHandle ) {
					this.removeHandleAtIndex( handleIndex );
				}
			}

			// Remove global mouse/touch move listener that was registered by onSlideStart().
			window.removeEventListener( "mousemove", this.onSlideMouseMove );
			window.removeEventListener( "touchmove", this.onSlideTouchMove );
		},

		// Called on click at a slider handle. If shift key is pressed, remove handle.
		onHandleFocus( event ) {
			const handleIndex = this.handleIndexFromElement( event.target );
			if( handleIndex >= 0 ) {

				const handleElems = this.handleElements();

				const focusedHandleElem = handleElems[ handleIndex ];
				if( focusedHandleElem ){
					// Highlight handle even if focus is on a non-handle element.
					focusedHandleElem.classList.add( cssClassHandleSelected );
				}
				if( this.selectedHandleIndex != null ){
					const selectedHandleElem = handleElems[ this.selectedHandleIndex ];
					if( selectedHandleElem ){
						selectedHandleElem.classList.remove( cssClassHandleSelected );
					}
				}

				this.selectedHandleIndex = handleIndex;

				const palette = privates.get( this ).palette;
				this.selectedPaletteItem = _.cloneDeep( palette[ handleIndex ] );
			}
		},

		// Called when a value in the input components for the selected handle has changed. 
		onPaletteAttributeInput( event ) {
			if( this.selectedHandleIndex != null ) {
				const oldValue = _.get( this.selectedPaletteItem, event.path );

				if( ! _.isEqual( oldValue, event.value ) ){
					_.set( this.selectedPaletteItem, event.path, _.cloneDeep( event.value ) );

					const palette = privates.get( this ).palette;
					_.set( palette[ this.selectedHandleIndex ], event.path, _.cloneDeep( event.value ) );

					this.updateCanvas();
					this.emitPaletteInputEvent();
				}
			}
		},

		// Resize canvas internal size to actual display size of HTML element to avoid stretching of canvas image.
		onCanvasResize( entries ) {
			for( const entry of entries ) {
				const rect = entry.contentRect;

				// Canvas uses physical coordinates, while rect is given in CSS coordinates. 
				// Multiply with DPR to adjust for High-DPI devices and browser zoom.
				const scaledWidth  = rect.width  * window.devicePixelRatio;
				const scaledHeight = rect.height * window.devicePixelRatio;

				if( entry.target.width !== scaledWidth || entry.target.height !== scaledHeight ){
					entry.target.width  = scaledWidth;
					entry.target.height = scaledHeight;

					this.updateCanvas({ 
						isEaseFunCanvas : entry.target.id == this.easeFunCanvasId, 
						isGradientCanvas: entry.target.id == this.gradientCanvasId, 
					});
				}
			}
		},	

		// Get array of handle elements
		handleElements() {
			return Array.from( this.getSliderElement().getElementsByClassName( "noUi-handle" ) );
		},

		// Get handle index from child element of handle.
		handleIndexFromElement( childElem ){
			const elems = this.handleElements();
			return elems.findIndex( elem => elem.contains( childElem ) );
		},

		// Set new palette and update slider positions. Recreate slider if handle count changes.
		setPaletteFromOutside( newPalette ) {

			const curPalette = privates.get( this ).palette;
			const newPositions = palettePositions( newPalette );

			const slider = this.getSliderElement().noUiSlider;
			
			if( newPalette.length != curPalette.length ){
				// Need to destroy and re-create slider to update handle count. 
				// https://github.com/leongersen/noUiSlider/issues/892

				let options = slider.options;
				options.start = newPositions;

				this.recreateSlider( options );
			}
			else {
				// Only update existing handle positions.
				slider.set( newPositions );
			}

			privates.get( this ).palette = newPalette;

			this.updateCanvas();
		},

		// Remove given slider handle and emit input event.
		removeHandleAtIndex( handleIndex ) {
			const palette = privates.get( this ).palette;
						
			// Slider requires at least one handle.
			if( palette.length > 1 ) {
				// Create new palette with handle removed.
				let newPalette = _.cloneDeep( palette );			
				newPalette.splice( handleIndex, 1 );

				this.setPaletteFromOutside( newPalette );
				
				// Set focus to next handle
				this.setSelectedHandle( ( handleIndex + 1 ) % newPalette.length );
			
				this.emitPaletteInputEvent();
			}
		},

		// Set focus to handle by index.
		setSelectedHandle( handleIndex ) {
			const handleElems = this.handleElements();
			handleElems[ handleIndex ].focus();
		},

		// Send "input" event with current palette. Palette will be cloned to prevent receiver
		// from accidentally modifying the current palette.
		emitPaletteInputEvent() {
			const palette = privates.get( this ).palette;
			this.$emit( "input", _.cloneDeep( palette ) );
		},

		// Update easeFunCanvas and/or gradientCanvas.
		updateCanvas( update = { isEaseFunCanvas: true, isGradientCanvas: true } ){
			const palette = privates.get( this ).palette;

			// Resolve ease function names to actual functions.
			const paletteResolved = this.optDesc.$resolvePaletteEaseFunctions( palette );

			if( update.isEaseFunCanvas )
				this.updateEaseFunCanvas( paletteResolved );
			if( update.isGradientCanvas )
				this.updateGradientCanvas( paletteResolved );
		},

		// Draw a diagram of the palette ease functions into the canvas.
		updateEaseFunCanvas( palette ){

			// shallow clone is sufficient here, as we don't modify properties of array elements
			const paletteSorted = [ ...palette ];
			paletteSorted.sort( ( a, b ) => a.pos - b.pos );

			const canvasElem = document.getElementById( this.easeFunCanvasId );
			const ctx        = canvasElem.getContext( "2d" );

			ctx.fillStyle   = "rgba( 0, 0, 0, 0.3 )";
			ctx.strokeStyle = "rgb( 255, 255, 255 )";
			ctx.lineWidth   = window.devicePixelRatio;

			ctx.clearRect( 0, 0, canvasElem.width, canvasElem.height );
			ctx.fillRect( 0, 0, canvasElem.width, canvasElem.height );

			const width      = canvasElem.width;
			const height     = canvasElem.height - ctx.lineWidth * 2;

			ctx.beginPath();

			const first = paletteSorted[ 0 ];
			const last  = paletteSorted[ paletteSorted.length - 1 ];

			const firstX = first.pos * width;
			const lastX  = last.pos * width;

			const distRight = width - lastX;

			const firstY = height - luminance( first.color ) * height + ctx.lineWidth;
			const lastY  = height - luminance( last.color )  * height + ctx.lineWidth;

			if( firstX > 0 ){
				// Draw clipped segment from left border to first handle.
				drawEaseFunction( ctx, -distRight, firstX, 0, firstX, lastY, firstY, last.easeFun );
			}

			for( let i = 0; i < paletteSorted.length - 1; ++i ) {
				const start = paletteSorted[ i ];
				const end   = paletteSorted[ i + 1 ];

				const startX = Math.trunc( start.pos * width );
				const endX   = Math.trunc( end.pos   * width );

				const startY = height - luminance( start.color ) * height + ctx.lineWidth;
				const endY   = height - luminance( end.color )   * height + ctx.lineWidth;

				// Draw full segment.
				if( endX != startX ) {
					drawEaseFunction( ctx, startX, endX, startX, endX, startY, endY, start.easeFun );
				}
				else {					
					ctx.moveTo( startX, startY );
					ctx.lineTo( startX, endY );
				}
			}

			if( distRight > 0 ){
				// Draw clipped segment from last handle to right border.
				drawEaseFunction( ctx, lastX, lastX + firstX + distRight, lastX, width, lastY, firstY, last.easeFun );
			}

			ctx.stroke();
		},

		// Draw the current palette into the canvas.
		updateGradientCanvas( palette ){
	
			const canvasElem = document.getElementById( this.gradientCanvasId );
			const width   = canvasElem.width;
			const height  = canvasElem.height;
			const context = canvasElem.getContext( "2d" );
			const imgData = context.createImageData( width, 1 );
			const pixels  = new Uint32Array( imgData.data.buffer );
			
			// Fill buffer with a single line.
			z42color.renderPaletteDef( pixels, pixels.length, palette );
		
			// Draw repeatedly to stretch vertically.
			for( let y = 0; y < height; ++y ) {
				context.putImageData( imgData, 0, y );
			}
		},
	},
	watch: {
		value: {
			deep: true,
			handler: function( val, oldVal ) { 
				
				const newPalette = makePaletteValid( val, this.optDesc );	
				const curPalette = privates.get( this ).palette;

				// Sort new and current palettes for comparability.
				const newPaletteSorted = sortPaletteClone( newPalette );
				const curPaletteSorted = sortPaletteClone( curPalette );

				// To prevent stack overflow or extreme slowdown, make sure to only react on data changes
				// originating from the outside, instead of changes originating from this component!
				if( ! _.isEqual( newPaletteSorted, curPaletteSorted ) ) {
					this.setPaletteFromOutside( newPalette );
				}
			},
		},		
	},
	template: /*html*/ `
		<b-form-group
			:label="label"
			:label-for="labelFor"
			:disabled="disabled"
			>
			<!-- Show the curves of the ease functions -->
			<canvas 
				:id="easeFunCanvasId"
				class="z42opt-palette-easefun-canvas"
				>
			</canvas>

			<!-- Show the rendered palette -->
			<canvas 
				:id="gradientCanvasId"
				class="z42opt-palette-gradient-canvas"
				>
			</canvas>

			<!-- Mounting point for noUiSlider -->
			<div 
				:id="id"
				:disabled="disabled"
				class="z42opt-palette-slider"
				>
			</div>

			<!-- Components for selected palette item -->
			<z42opt-container
				v-if="selectedHandleIndex !== null"
				:id="selectedPaletteItemId"
				:key="selectedPaletteItemId"
				:optData="selectedPaletteItem"
				:optDesc="optDesc.segment"
				:optView="selectedPaletteItemView"
				class="container px-0"
				@opt-modified="onPaletteAttributeInput( $event )"	
			/>
			
			<!-- Help text -->
			<div v-if="selectedHandleIndex === null"
				class="text-info"
				>
				<p>
					Click handle to <b>edit</b> properties.<br>
					Curve displays luminance. Change ease functions to modify curve shape.
				</p>
				<p>
					Double-click to <b>add</b> handle.<br>
					Drag up/down or shift+click to <b>remove</b> handle.
				</p>
			</div>
		</b-form-group>
	`,
});	

//==================================================================================================
// Private functions

function makePaletteValid( palette, optDesc ) {
	const defaults = { pos: 0 };
	z42optUtil.setDefaultOptions( defaults, optDesc.segment );

	if( ! Array.isArray( palette ) || palette.length === 0 ) {
		const defaults2 = _.cloneDeep( defaults );
		defaults2.pos = 0.5;
		defaults2.color = { r: 255, g: 255, b: 255, a: 1 };

		return [ defaults, defaults2 ];
	}

	const result = _.cloneDeep( palette );

	// Set defaults for each array element.
	for( let i = 0; i < result.length; ++i ){
		result[ i ] = result[ i ] || {};
		_.defaultsDeep( result[ i ], defaults );
	}

	return result;
}

//---------------------------------------------------------------------------------------------------

function sortPaletteClone( palette ){
	let result = _.cloneDeep( palette );
	result.sort( ( a, b ) => a.pos - b.pos );
	return result;	
}

function palettePositions( palette ){
	return palette.map( item => item.pos );
}

//---------------------------------------------------------------------------------------------------

function luminance( color ){
	return ( 0.299 * color.r + 0.587 * color.g + 0.114 * color.b ) / 255;
} 	

//---------------------------------------------------------------------------------------------------

function drawEaseFunction( ctx, xStart, xEnd, xClipMin, xClipMax, yStart, yEnd, easeFun ) {

	xStart = Math.trunc( xStart );
	xEnd   = Math.trunc( xEnd );
	xClipMin = Math.trunc( xClipMin );
	xClipMax = Math.trunc( xClipMax );

	const iMax  = xClipMax - xClipMin;
	const xOffs = xClipMin - xStart;

	let x1 = xClipMin;
	let y1 = easeFun( xOffs, yStart, yEnd - yStart, xEnd - xStart )
	ctx.moveTo( x1, y1 );

	for( let i = 1; i <= iMax; ++i ) {
		const x2 = i + xClipMin;
		const y2 = easeFun( i + xOffs, yStart, yEnd - yStart, xEnd - xStart );
	
		// To avoid aliasing in horizontal direction, draw curve segments only when Y changes or curve ends.
		if( y2 != y1 || i >= iMax ) {
			// Draw horizontal line for any x values we previously skipped.
			if( x2 - x1 > 1 ) {
				ctx.lineTo( x2 - 1, y1 );
			}

			// Draw possibly pitched line.
			ctx.lineTo( x2, y2 );
			x1 = x2;
			y1 = y2;
		}
	}
}

//---------------------------------------------------------------------------------------------------

export {
	paletteComponent
}