/*
Option utilities. Copyright (c) 2019 zett42.
https://github.com/zett42/PlasmaFractal

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
(function(global){
	'use strict';
	
	// Create a "namespace" for our stuff, if not already exists.
	const module = global.z42comp || ( global.z42comp = {} );

	// TIP: Install VSCode "Comment tagged templates" extensions for syntax highlighting
	// within template string literals.

	//===================================================================================================
	// Public components
	//===================================================================================================

	module.rangeComp = Vue.component( "z42opt-range", {
		inheritAttrs: false,
		props: { 
			id: {
				type: String,
				required: true
			}, 
			label: {
				type: String,
				required: true
			}, 
			value: {
				type: Number,
				required: false,
				default: 0
			},
			min: {
				type: Number,
				required: false,
				default: 0
			},
			max: {
				type: Number,
				required: true
			},
			step: {
				type: Number,
				required: false,
				default: 1
			},
			isScale: {   // If true, the slider becomes better usable to edit scale factors below and above 1.
				type: Boolean,
				required: false,
				default: false
			},
			scaleNormalPos: {  // If isScale is true, this defines the relative position of the value 1 on the slider.
				type: Number,
				required: false,
				default: 0.5
			},
			scaleMaxFractionDigits: {  // If isScale is true, 'step' can't be used. Instead use this property to limit number of fraction digits.
				type: Number,
				required: false,
				default: 3
			},
			lazy: {  // This is a workaround for "lazy" modifier of v-model not working in component
				type: Boolean,
				required: false,
				default: false
			}  
		},
		computed: {
			eventName(){ 
				return this.lazy ? "change" : "input"; 
			},
			sliderValue(){
				if( this.isScale )
					return calcSliderValueFromScale( this.value, this.min, this.max, this.sliderMin, this.sliderMax );

				return this.value;
			},
			sliderMin(){
				if( this.isScale )
					return -1000 * this.scaleNormalPos;

				return this.min;
			},
			sliderMax(){
				if( this.isScale )
					return 1000 * ( 1 - this.scaleNormalPos );					

				return this.max;
			}
		},
		methods: {
			onUpdate( value ) {
				if( this.isScale )
				{
					value = calcScaleFromSliderValue( value, this.min, this.max, this.sliderMin, this.sliderMax );
					value = Number( value ).toFixed( this.scaleMaxFractionDigits );
				}

				this.$emit('input', value );
			}
		},
		template: /*html*/ `
			<p>
				<label :for="id">{{ label }}:</label> {{ value }}
				<b-input type="range"
						 :id="id"
						 :value="sliderValue"
						 :min="sliderMin"
						 :max="sliderMax"
						 :step="step"
						 @[eventName]="onUpdate($event)"
				/>
			</p>`
	});

	//===================================================================================================
	// Private utility functions
	//===================================================================================================

	function calcSliderValueFromScale( value, minValue, maxValue, minSlider, maxSlider )
	{
		let result = 0;
		if( value < 1 )
			result = minSlider - minSlider * ( value - minValue ) / ( 1 - minValue );  
		else
			result = maxSlider * ( value - 1 ) / ( maxValue - 1 );

		if( result < minSlider )
			return minSlider;
		if( result > maxSlider )
			return maxSlider;
		return result;
	}		
		
	function calcScaleFromSliderValue( sliderValue, minValue, maxValue, minSlider, maxSlider )
	{
		if( sliderValue < 0 )
			return minValue + ( 1 - ( sliderValue / minSlider ) ) * ( 1 - minValue );

		return 1 + ( sliderValue / maxSlider ) * ( maxValue - 1 );
	}

	//---------------------------------------------------------------------------------------------------


})(this);
