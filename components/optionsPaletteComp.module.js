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

//---------------------------------------------------------------------------------------------------

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
		  	initialized: false,
		}
	},
	computed: {
		sliderElem() {
			return document.getElementById( this.id );
		},
		sliderConfig(){
			let result = {
				start: [],
				//step: 0.01,
				range: { min: 0, max: 1 },
				behaviour: 'unconstrained-tap',
			};

			for( const item of this.value ){
				result.start.push( item.pos );
			}

			if( this.optDesc.$attrs.step != null ){
				result.step = this.optDesc.$attrs.step;
			}

			return result;
		},
	},
	mounted() {
		noUiSlider.create( this.sliderElem, this.sliderConfig );
		/*
		this.sliderElem.noUiSlider.on( "slide", ( values, handle ) => {
			const newValue = Number( values[ 0 ] );
			if( newValue !== this.value ){
				// emit as "input" event to make it compatible with v-model
				this.$emit( "input", newValue );
			}
		});
		*/
	},
	watch: {
		value( newValue ) {
			if( ! this.initialized ){
				this.initialized = true;
				return;
			}
			/*
			const curValue = Number( this.sliderElem.noUiSlider.get() );
			if( curValue !== newValue ) {
				this.sliderElem.noUiSlider.set([ newValue ]);
			}
			*/
		}
	},
	template: /*html*/ `
		<b-form-group
			:label="optDesc.$attrs.title + ':'"
			:label-for="id"
			:disabled="disabled"
			>

			<!-- Mounting point for nouislider -->
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