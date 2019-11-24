<!--
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

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<template>
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
</template>

<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<script>
import * as z42opt from "./optionsDescriptor.js"
import noUiSlider from "nouislider";
import 'nouislider/distribute/nouislider.css';

// Pattern for private class members: https://stackoverflow.com/a/33533611/7571258
const privates = new WeakMap();

export default {
	name: "z42opt-range", 
	inheritAttrs: false,

	props: { 
		id:       { type: String, required: true },
		value:    { type: Number, required: true },
		optDesc:  { type: z42opt.Option, required: true }, 
		disabled: { type: Boolean, required: false, default: false },
	},
	mounted() {
		// Define private variables of this component (non-reactive!)
		privates.set( this, {
			sliderValue: this.value
		});

		const sliderElem = this.getSliderElement();
		noUiSlider.create( sliderElem, this.createSliderConfig() );

		const eventName = this.optDesc.$attrs.isSlow ? "change" : "slide";

		// Using arrow function forwarder so onSlide() gets 'this' context of component instead of noUiSlider.
		sliderElem.noUiSlider.on( eventName, ( ...args ) => this.onSlide( ...args ) );
	},
	computed: {
		displayValue(){ return this.optDesc.$displayValue( this.value ); }
	},
	methods: {
		getSliderElement() {
			return document.getElementById( this.id );
		},
		
		createSliderConfig(){
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

			const tooltipFormatter = { to: val => this.optDesc.$displayValue( val ) };

			return {
				start: [ this.value ],
				step: step,
				range: range,
				behaviour: "unconstrained",  // so touch scrolling of dialog doesn't move slider
				tooltips: this.optDesc.$attrs.isSlow ? tooltipFormatter : false,
			};
		},

		onSlide( values, handleIndex, valuesRaw, tap, handleOffs ){
			const priv = privates.get( this );
			const newValue = valuesRaw[ 0 ];

			if( priv.sliderValue !== newValue ){
				// Store the raw slider value which is the only way to obtain it.
				priv.sliderValue = newValue;  

				// emit as "input" event to make it compatible with v-model
				this.$emit( "input", newValue );
			}
		}
	},
	watch: {
		value( newValue, oldValue ) {
			const priv = privates.get( this );

			// Make sure the change actually originated from the outside instead from the inside of 
			// this component (i. e. when slider was moved by user).
			if( priv.sliderValue !== newValue ) {
				priv.sliderValue = newValue;

				const sliderElem = this.getSliderElement();
				sliderElem.noUiSlider.set([ newValue ]);
			}
		}
	},
}
</script>