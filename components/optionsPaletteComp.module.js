/*
Option UI components. Copyright (c) 2019 zett42.
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
//---------------------------------------------------------------------------------------------------

import * as z42opt from "./optionsDescriptorValues.module.js"
import "../external/nouislider/nouislider.js"

// Non-module dependencies (include via <script> element):
// "easing.js"
// "color.js"

// Pattern for private class members: https://stackoverflow.com/a/33533611/7571258
const privates = new WeakMap();

// When a slider handle is moved up or down more than this distance, it will be removed.
const mouseThresholdToRemoveHandle = 60;

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
			selectedPaletteItem: {
				color: null,
				easeFun: null, 
			},
			selectedColorDesc: new z42opt.ColorOpt({
				title: "Selected color",
			}),
			selectedEaseFunDesc: new z42opt.EnumOpt({
				title: "Selected ease function",
				values: this.optDesc.$attrs.easeFunctions
			}),
		}
	},	
	mounted() {
		// Make a deep clone so we will be able to differentiate between changes of palette originating
		// from the outside and from the inside of this component.

		const palette = makePaletteValid( this.value );
	
		// Define private variables of this component (non-reactive!)
		privates.set( this, {
			palette: palette,
			currentMousePos: null,
			slideStartMousePos: null,
			slidingHandleElement: null,
		});

		let sliderConfig = {
			start: palettePositions( palette ),
			range: { min: 0, max: 1 },
			behaviour: "unconstrained",
		};

		if( this.optDesc.$attrs.step != null ){
			sliderConfig.step = this.optDesc.$attrs.step;
		}

		this.recreateSlider( sliderConfig );

		this.updatePaletteCanvas();
	},
	destroyed() {
		// Remove global event listener in any case.
		window.removeEventListener( "mousemove", this.onSlideMouseMove );
		window.removeEventListener( "touchmove", this.onSlideTouchMove );
	},
	computed: {
		canvasId()          { return this.id + "#canvas"; },
		selectedColorId()   { return this.id + "#selectedColor"; },
		selectedEaseFunId() { return this.id + "#selectedEaseFun"; },
		label()   { return this.optDesc.$attrs.title ? this.optDesc.$attrs.title + ":" : undefined; },
		labelFor(){	return this.optDesc.$attrs.title ? this.id : undefined; },
	},
	methods: {
		// Get the DOM element of the slider.
		getSliderElement() {
			return document.getElementById( this.id );			
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

				//console.debug("palette changed from inside:", _.cloneDeep( palette ) );

				this.updatePaletteCanvas();

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

			newPalette.push({
				pos: palettePos,
				color:   this.optDesc.$attrs.defaultColor || { r:0, g:0, b:0, a: 1 },
				easeFun: this.optDesc.$attrs.defaultEaseFunction || "linear"
			});

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

				//console.debug("selectedHandleIndex:", this.selectedHandleIndex,
				//	          ", selectedPaletteItem:", _.cloneDeep(this.selectedPaletteItem));
			}
		},

		// Called when a value in the input fields for the selected handle has changed. 
		onPaletteAttributeInput( name, value ) {
			if( this.selectedHandleIndex != null && 
				! _.isEqual( this.selectedPaletteItem[ name ], value ) ){
				
				//console.debug("onPaletteAttributeInput:",name,"=",value);

				this.selectedPaletteItem[ name ] = value;

				const palette = privates.get( this ).palette;
				palette[ this.selectedHandleIndex ][ name ] = _.cloneDeep( value );

				this.updatePaletteCanvas();
				this.emitPaletteInputEvent();
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

			console.debug("palette changed from outside:", _.cloneDeep( newPalette ) );

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

			this.updatePaletteCanvas();
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

		// Draw the current palette into the canvas.
		updatePaletteCanvas(){
			const palette = privates.get( this ).palette;
			const sortedPalette = sortPaletteClone( palette );
		
			const canvasElem = document.getElementById( this.canvasId );
			const width   = canvasElem.width;
			const context = canvasElem.getContext( "2d" );
			const imgData = context.createImageData( width, 1 );
			const pixels  = new Uint32Array( imgData.data.buffer );
		
			// Note: drawing only a single horizontal line, which will be vertically stretched via CSS height
		
			for( let i = 0; i < sortedPalette.length; ++i ) {
				const start = sortedPalette[ i ];
				const end   = sortedPalette[ ( i + 1 ) % sortedPalette.length ];
		
				const startX = Math.trunc( start.pos * width );
				const endX   = Math.trunc( end.pos   * width );
				let dist     = endX - startX;

				if( dist != 0 || sortedPalette.length == 1 ){
					if( dist <= 0 )
						dist = width - startX + endX;  // wrap-around

					const easeFun = z42easing[ "ease" + start.easeFun ];
		
					// This function wraps around when index would be >= pixels.length.
					z42color.makePaletteGradientRGBA( pixels, startX, dist, start.color, end.color, easeFun );
				}
			}
		
			context.putImageData( imgData, 0, 0 );	
		},	
	},
	watch: {
		value: {
			deep: true,
			handler: function( val, oldVal ) { 
				
				const newPalette = makePaletteValid( val );	
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
			<canvas 
				:id="canvasId"
				class="z42opt-palette-canvas"
				width="1024"
				height="1"
				>
			</canvas>

			<!-- Mounting point for noUiSlider -->
			<div 
				:id="id"
				:disabled="disabled"
				class="z42opt-palette-slider"
				>
			</div>

			<z42opt-color
				v-if="selectedHandleIndex !== null"
				:id="selectedColorId"
				:value="selectedPaletteItem.color"
				:optDesc="selectedColorDesc"
				class="z42opt-palette-color"
				@input="onPaletteAttributeInput( 'color', $event )"
			/>

			<z42opt-select
				v-if="selectedHandleIndex !== null"
				:id="selectedEaseFunId"
				:value="selectedPaletteItem.easeFun"
				:optDesc="selectedEaseFunDesc"
				class="z42opt-palette-easeFun"
				@input="onPaletteAttributeInput( 'easeFun', $event )"
			/>
			
			<p class="text-info">
				Click handle to <b>edit</b> properties.<br>
				Double-click to <b>add</b> handle.<br>
				Drag up/down or shift+click to <b>remove</b> handle.
			</p>
		</b-form-group>
	`,
});	

//==================================================================================================
// Private functions

function makePaletteValid( palette ) {

	const defaults = {   
		pos: 0,
		color: { r: 0, g: 0, b: 0, a: 1 },
		easeFun: "Linear" 
	};

	if( ! Array.isArray( palette ) || palette.length === 0 ) {
		const defaults2 = {   
			pos: 0.5,
			color: { r: 255, g: 255, b: 255, a: 1 },
			easeFun: "Linear" 
		};
	
		return [ defaults, defaults2 ];
	}

	let result = _.cloneDeep( palette );

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

export {
	paletteComponent
}