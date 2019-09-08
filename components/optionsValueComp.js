/*
Option UI components. Copyright (c) 2019 zett42.
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
//---------------------------------------------------------------------------------------------------

import * as z42opt from "./optionsDescriptor.js"

//---------------------------------------------------------------------------------------------------

const rangeComponent = Vue.component( "z42opt-range", {
	inheritAttrs: false,
	props: { 
		id:      { type: String, required: true },
		value:   { required: true },
		optDesc: { type: z42opt.Option, required: true }, 
	},
	created() {
		//console.log("z42opt-range.optDesc:", this.optDesc);
		//console.log("z42opt-range.value:", this.value);
	},
	computed: {
		eventName(){ 
			return this.optDesc.$attrs.isSlow ? "change" : "input"; 
		},
		sliderValue(){
			const min = this.optDesc.$attrs.min;
			const max = this.optDesc.$attrs.max;

			if( this.optDesc.$attrs.isScale && min != null && max != null )
			{
				let result = 0;
				if( this.value < 1 )
					result = this.sliderMin - this.sliderMin * ( this.value - min ) / ( 1 - min );  
				else
					result = this.sliderMax * ( this.value - 1 ) / ( max - 1 );
			
				if( result < this.sliderMin )
					return this.sliderMin;
				if( result > this.sliderMax )
					return this.sliderMax;
				return result;
			}

			return this.value;
		},
		sliderMin(){
			if( this.optDesc.$attrs.isScale )
				return -1000 * this.optDesc.$attrs.scaleNormalPos;

			if( this.optDesc.$attrs.min != null )
				return this.optDesc.$attrs.min;

			return 0;
		},
		sliderMax(){
			if( this.optDesc.$attrs.isScale )
				return 1000 * ( 1 - this.optDesc.$attrs.scaleNormalPos );	

			if( this.optDesc.$attrs.max != null )
				return this.optDesc.$attrs.max;

			return 1000;
		},
		sliderStep(){
			if( this.optDesc.$attrs.step != null )
				return this.optDesc.$attrs.step;

			if( this.optDesc.$attrs.maxFractionDigits != null )
				return 1 / ( Math.pow( 10, this.optDesc.$attrs.maxFractionDigits ) );

			return 1;
		},
		displayValue(){
			let value = this.value;

			if( this.optDesc.$attrs.displayFactor != null )
				value *= this.optDesc.$attrs.displayFactor;

			if( this.optDesc.$attrs.maxFractionDigits != null )
				value = Number( value.toFixed( this.optDesc.$attrs.maxFractionDigits ) );

			let result = value.toString();

			if( this.optDesc.$attrs.displayUnit != null )
				result += " " + this.optDesc.$attrs.displayUnit;

			return result;
		}
	},
	methods: {
		onModified( value ) {
			value = Number( value );

			const min = this.optDesc.$attrs.min;
			const max = this.optDesc.$attrs.max;

			if( this.optDesc.$attrs.isScale && min != null && max != null ) {
				if( value < 0 )
					value = min + ( 1 - ( value / this.sliderMin ) ) * ( 1 - min );
				else
					value = 1 + ( value / this.sliderMax ) * ( max - 1 );
			}

			this.$emit( "input", value );
		}
	},
	template: /*html*/ `
		<b-form-group
			:label="optDesc.$attrs.title + ': ' + displayValue"
			:label-for="id">
			
			<b-input type="range"
				:id="id"
				:value="sliderValue"
				:min="sliderMin"
				:max="sliderMax"
				:step="sliderStep"
				@[eventName]="onModified( $event )"
			/>
		</b-form-group>`
});	

//---------------------------------------------------------------------------------------------------

const selectComponent = Vue.component( "z42opt-select", {
	inheritAttrs: false,
	props: { 
		id:      { type: String, required: true },
		value:   { required: true },
		optDesc: { type: z42opt.Option, required: true }, 
	},
	created() {
		//console.log("z42opt-select.optDesc:", this.optDesc);
	},
	template: /*html*/ `
		<b-form-group
			:label="optDesc.$attrs.title + ':'"
			:label-for="id">

			<b-form-select 
				:id="id"
				:options="optDesc.$attrs.values"
				:value="value"
				@input="$emit( 'input', $event )"
			/>
		</b-form-group>`
});

//---------------------------------------------------------------------------------------------------

const checkComponent = Vue.component( "z42opt-check", {
	inheritAttrs: false,
	props: { 
		id:      { type: String, required: true },
		value:   { required: true },
		optDesc: { type: z42opt.Option, required: true }, 
	},
	created() {
		//console.log("z42opt-check.optDesc:", this.optDesc);
	},
	template: /*html*/ `
		<b-form-group>
			<b-form-checkbox
				:id="id"
				:checked="value"
				@input="$emit( 'input', $event )"
				>
				{{ optDesc.$attrs.title }}
			</b-form-checkbox>
		</b-form-group>`
});	

//---------------------------------------------------------------------------------------------------

const colorComponent = Vue.component( "z42opt-color", {
	inheritAttrs: false,
	props: { 
		id:      { type: String, required: true },
		value:   { required: true },
		optDesc: { type: z42opt.Option, required: true }, 
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
					<label :for="id">{{ optDesc.$attrs.title }}: </label>
				</b-col>
				<b-col>
					<b-form-input type="color"
						:id="id"
						:value="hexValue"
						@input="onModified( $event )"				
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