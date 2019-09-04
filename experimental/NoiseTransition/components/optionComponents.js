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

	let defaultId = 0;

	//===================================================================================================
	// Public components
	//===================================================================================================

	module.rangeComp = Vue.component( "z42opt-range", {
		inheritAttrs: false,
		props: { 
			id: {
				type: String,
				required: false,
				default: null
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
			displayUnit: {
				type: String,
				required: false,
				default: ""
			},
			displayFactor: {
				type: Number,
				required: false,
				default: 1.0
			},
			displayMaxFractionDigits: {  // Number of fraction digits to show
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
		beforeCreate(){
			++defaultId;
		},
		computed: {
			autoId(){
				return this.id || getDefaultId( "z42opt-range" );
			},
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
			},
			displayValue(){
				let value = this.value * this.displayFactor;
				value = Number( value.toFixed( this.displayMaxFractionDigits ) );
				return value.toString() + ' ' + this.displayUnit;
			}
		},
		methods: {
			onModified( value ) {
				value = Number( value );

				if( this.isScale )
					value = calcScaleFromSliderValue( value, this.min, this.max, this.sliderMin, this.sliderMax );

				this.$emit('input', value );
			}
		},
		template: /*html*/ `
			<b-form-group
				:label="label + ': ' + displayValue"
				:label-for="autoId">

				<b-input type="range"
					:id="autoId"
					:value="sliderValue"
					:min="sliderMin"
					:max="sliderMax"
					:step="step"
					@[eventName]="onModified( $event )"
				/>
			</b-form-group>`
	});

	//---------------------------------------------------------------------------------------------------

	module.selectComp = Vue.component( "z42opt-select", {
		inheritAttrs: false,
		props: { 
			id: {
				type: String,
				required: false,
				default: null
			}, 
			label: {
				type: String,
				required: true
			},
			options: {
				type: Array,
				required: true
			},
			value: {
				required: false
			},
		},
		beforeCreate(){
			++defaultId;
		},
		computed: {
			autoId(){
				return this.id || getDefaultId( "z42opt-select" );
			}
		},
		template: /*html*/ `
			<b-form-group
				:label="label + ':'"
				:label-for="autoId">

				<b-form-select 
					:id="autoId"
					:options="options"
					:value="value"
					@input="$emit( 'input', $event )"
				/>
			</b-form-group>`
	});

	//---------------------------------------------------------------------------------------------------

	module.checkComp = Vue.component( "z42opt-check", {
		inheritAttrs: false,
		props: { 
			id: {
				type: String,
				required: false,
				default: null
			}, 
			label: {
				type: String,
				required: true
			},
			checked: {
				required: false,
				default: false
			},
		},
		template: /*html*/ `
			<b-form-group>
				<b-form-checkbox 
					:id="id"
					:checked="checked"
					@input="$emit( 'input', $event )"
					>
				{{ label }}
				</b-form-checkbox>
			</b-form-group>`
	});	

	//---------------------------------------------------------------------------------------------------

	module.colorComp = Vue.component( "z42opt-color", {
		inheritAttrs: false,
		props: { 
			id: {
				type: String,
				required: false,
				default: null
			}, 
			label: {
				type: String,
				required: true
			},
			value: {
				required: false,
				default: "#000000"
			},
		},
		beforeCreate(){
			++defaultId;
		},
		computed: {
			autoId(){
				return this.id || getDefaultId( "z42opt-select" );
			},
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
			<b-form-group class="container">
				<b-row align-v="center">
					<b-col>
						<label :for="autoId">{{ label }}: </label>
					</b-col>
					<b-col>
						<b-form-input type="color"
							:id="autoId"
							:value="hexValue"
							@input="onModified( $event )"				
						/>
					</b-col>
				</b-row>
			</b-form-group>`
	});	

	//===================================================================================================
	// Private utility functions
	//===================================================================================================

	function getDefaultId( baseName )
	{
		return "__" + baseName + "_" + defaultId.toString();
	}

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
