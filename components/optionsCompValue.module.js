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

import * as z42opt from "./optionsDescriptor.module.js"
import "../external/nouislider/nouislider.js"

//---------------------------------------------------------------------------------------------------

const rangeComponent = Vue.component( "z42opt-range", {
	inheritAttrs: false,
	props: { 
		id:       { type: String, required: true },
		value:    { type: Number, required: true },
		optDesc:  { type: z42opt.Option, required: true }, 
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
			let step = 1;
			if( this.optDesc.$attrs.step != null ){
				step = this.optDesc.$attrs.step;
			}
			else if( this.optDesc.$attrs.maxDecimals != null ){
				step = 1 / ( Math.pow( 10, this.optDesc.$attrs.maxDecimals ) );
			}

			let range = {
				min: this.optDesc.$attrs.min,
				max: this.optDesc.$attrs.max,
			};

			if( this.optDesc.$attrs.isScale ){
				// Make the slider non-linear to make it easier to select values below 1.
				let percent = 50;
				if( this.optDesc.$attrs.scaleNormalPos != null ){
					percent = this.optDesc.$attrs.scaleNormalPos * 100;
				}
				range[ `${percent}%` ] = 1.0;
			}

			return {
				start: [ this.value ],
				step: step,
				range: range
			};
		},
		displayValue(){
			let value = this.value;

			if( this.optDesc.$attrs.displayFactor != null )
				value *= this.optDesc.$attrs.displayFactor;

			if( this.optDesc.$attrs.maxDecimals != null )
				value = Number( value.toFixed( this.optDesc.$attrs.maxDecimals ) );

			let result = value.toString();

			if( this.optDesc.$attrs.displayUnit != null )
				result += " " + this.optDesc.$attrs.displayUnit;

			return result;
		},
	},
	mounted() {
		noUiSlider.create( this.sliderElem, this.sliderConfig );

		const eventName = this.optDesc.$attrs.isSlow ? "change" : "slide";

		this.sliderElem.noUiSlider.on( eventName, ( values, handle ) => {
			const newValue = Number( values[ 0 ] );
			if( newValue !== this.value ){
				// emit as "input" event to make it compatible with v-model
				this.$emit( "input", newValue );
			}
		});
	},
	watch: {
		value( newValue ) {
			if( ! this.initialized ){
				this.initialized = true;
				return;
			}
			const curValue = Number( this.sliderElem.noUiSlider.get() );
			if( curValue !== newValue ) {
				this.sliderElem.noUiSlider.set([ newValue ]);
			}
		}
	},
	template: /*html*/ `
		<b-form-group
			:label="optDesc.$attrs.title + ': ' + displayValue"
			:label-for="id"
			:disabled="disabled"
			>
			<!-- Mounting point for nouislider -->
			<div
				:id="id" 
				:disabled="disabled"
				class="z42opt-range"
				>
			</div>
		</b-form-group>
	`,
});	

//---------------------------------------------------------------------------------------------------

const selectComponent = Vue.component( "z42opt-select", {
	inheritAttrs: false,
	props: { 
		id:       { type: String, required: true },
		value:    { required: true },
		optDesc:  { type: z42opt.Option, required: true }, 
		disabled: { type: Boolean, required: false, default: false },
	},
	created() {
		//console.log("z42opt-select.optDesc:", this.optDesc);
	},
	computed: {
		options() {
			const entries = Object.entries( this.optDesc.$attrs.values );
			return entries.map( entry => ({ 
				value: entry[ 0 ], 
				text : entry[ 1 ].title || entry[ 0 ] })
			);
		}
	},
	template: /*html*/ `
		<b-form-group
			:label="optDesc.$attrs.title + ':'"
			:label-for="id"
			:disabled="disabled"
			>
			<b-form-select 
				:id="id"
				:options="options"
				:value="value"
				:disabled="disabled"
				class="z42opt-select"
				@change="$emit( 'input', $event )"
			/>
		</b-form-group>`
});

//---------------------------------------------------------------------------------------------------

const checkComponent = Vue.component( "z42opt-check", {
	inheritAttrs: false,
	props: { 
		id:       { type: String, required: true },
		value:    { required: true },
		optDesc:  { type: z42opt.Option, required: true }, 
		disabled: { type: Boolean, required: false, default: false },
	},
	created() {
		//console.log("z42opt-check.optDesc:", this.optDesc);
	},
	template: /*html*/ `
		<b-form-group>
			<b-form-checkbox
				:id="id"
				:checked="value"
				:disabled="disabled"
				class="z42opt-check"
				@change="$emit( 'input', $event )"
				>
				{{ optDesc.$attrs.title }}
			</b-form-checkbox>
		</b-form-group>`
});	

//---------------------------------------------------------------------------------------------------

const colorComponent = Vue.component( "z42opt-color", {
	inheritAttrs: false,
	props: { 
		id:       { type: String, required: true },
		value:    { required: true },
		optDesc:  { type: z42opt.Option, required: true }, 
		disabled: { type: Boolean, required: false, default: false },
	},
	created() {
		//console.log("z42opt-color.optDesc:", this.optDesc);
	},
	computed: {
		hexValue(){
			return tinycolor( this.value ).toHexString();
		},
	},		
	methods: {
		onModified( value ){
			this.$emit( "input", tinycolor( value ).toRgb() );
		}
	},
	template: /*html*/ `
		<b-form-group class="container px-0">
			<b-row align-v="center">
				<b-col>
					<label 
						:for="id"
						:disabled="disabled"
						>
						{{ optDesc.$attrs.title }}:
					</label>
				</b-col>
				<b-col>
					<b-form-input type="color"
						:id="id"
						:value="hexValue"
						:disabled="disabled"
						class="z42opt-color"
						@change="onModified( $event )"				
					/>
				</b-col>
			</b-row>
		</b-form-group>
		`
});	

//---------------------------------------------------------------------------------------------------

export {
	rangeComponent,
	selectComponent,
	checkComponent,
	colorComponent,
}