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

// Return a deep clone of passed object.
const cloneDeep = ( obj ) => JSON.parse( JSON.stringify( obj ) );

//---------------------------------------------------------------------------------------------------

const paletteComponent = Vue.component( "z42opt-palette", {
	inheritAttrs: false,
	props: { 
		id:       { type: String, required: true },
		value:    { type: Array, required: true },
		optDesc:  { type: z42opt.PaletteOpt, required: true }, 
		disabled: { type: Boolean, required: false, default: false },
	},
	mounted() {
		// Make a deep clone so we will be able to differentiate between changes of this.value originating
		// from the outside and from the inside of this component.
		this.lastKnownValue = cloneDeep( this.value );

		noUiSlider.create( this.sliderElem, this.sliderConfig );
		
		// Using arrow function here so onSliderChange() gets 'this' context of component instead
		// of noUiSlider.
		this.sliderElem.noUiSlider.on( "slide", ( values, handle, valuesRaw, tap, positions ) => {
			this.onSlide( values, handle, valuesRaw, tap, positions );
		});
	},	
	computed: {
		sliderElem() {
			return document.getElementById( this.id );
		},
		sliderConfig(){
			let result = {
				start: this.positions,
				range: { min: 0, max: 1 },
				behaviour: "unconstrained-tap",
			};

			if( this.optDesc.$attrs.step != null ){
				result.step = this.optDesc.$attrs.step;
			}

			return result;
		},
		positions() {
			return this.value.map( ( item ) => item.pos );
		},
		label(){
			return this.optDesc.$attrs.title ? this.optDesc.$attrs.title + ":" : undefined;
		},
		labelFor(){
			return this.optDesc.$attrs.title ? this.id : undefined;
		},
	},
	methods: {
		// Called on slider position changes.
		//   values:     Current slider values formatted (array of String)
		//   handle:     Handle that caused the event (Number)
		//   valuesRaw:  Slider values without formatting (array of Number)
		//   tap:        Event was caused by the user tapping the slider (Boolean)
		//   handleOffs: Left offset of the handles (array of Number)

		onSlide( values, handle, valuesRaw, tap, handleOffs ) {

			// Make sure we only emit actually changed values. The noUiSlider emits too many events even 
			// if values haven't changed.
        	if( this.positions.toString() !== valuesRaw.toString() ) {

				console.debug("value changed from inside");

				// Update the new positions of the slider handles in the cloned array.
				for( const i in valuesRaw ){
					this.lastKnownValue[ i ].pos = valuesRaw[ i ];
				}

				// Emit changes as "input" event to make the component compatible with v-model.
				// Make clone so receiver of event can't change this.lastKnownValue.
				this.$emit( "input", cloneDeep( this.lastKnownValue ) );
			 }			
		},
	},
	watch: {
		value: {
			deep: true,
			handler: function( val, oldVal ) { 

				const lastKnownPositions = this.lastKnownValue.map( ( item ) => item.pos );

				// To prevent stack overflow or extreme slowdown, make sure to only react on data changes
				// originating from the outside, instead of changes originating from this component!
				if( this.positions.toString() !== lastKnownPositions.toString() ) {	
					console.debug("value changed from outside");

					this.sliderElem.noUiSlider.set( this.positions );
				}

				this.lastKnownValue = cloneDeep( val );
			},
		},		
	},
	template: /*html*/ `
		<b-form-group
			:label="label"
			:label-for="labelFor"
			:disabled="disabled"
			>
			<!-- Mounting point for noUiSlider -->
			<div 
				:id="id"
				:disabled="disabled"
				>
			</div>
		</b-form-group>
	`,
});	

//---------------------------------------------------------------------------------------------------

export {
	paletteComponent
}