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
(function(global){
	'use strict';
	
	// Create a "namespace" for our stuff, if not already exists.
	const module = global.z42comp || ( global.z42comp = {} );

	// TIP: Install VSCode "Comment tagged templates" extensions for syntax highlighting
	// within template string literals.

	//===================================================================================================
	// Public components
	//===================================================================================================

	// Component that generates tabs for the groups defined by the options view.

	module.tabsComp = Vue.component( "z42opt-tabs", {
		inheritAttrs: false,		
		props: {
			id:      { type: String, required: true },
			value:   { type: Object, required: true },
			optDesc: { type: z42opt.Node, required: true }, 
			optView: { type: Object, required: true },
		},
		methods: {
			childId( key ) { 
				return z42opt.joinPath( this.id, key, "#" ); 
			},
			contentComponentName( group ){
				// Default component name can be overridden via optView (group.component).
				if( group.component )
					return group.component;

				// If group contains sub groups, create nested tabs. This works, but doesn't seem to be optimal.
				// Maybe a group box would be better suitable?
				if( group.groups )
					return 'z42opt-tabs';

				// Otherwise create a flat view of the options.
				return 'z42opt-container';
			},
		},
		template: /*html*/ `
			<b-tabs>
				<!-- Note: 'key' attribute required when using v-for with component (https://vuejs.org/v2/guide/list.html#v-for-with-a-Component) -->
				
				<b-tab v-for="( group, key ) in optView.groups"
					:key="childId( key )"
					:id="childId( key )"
					:title="group.title"
					>
					<component
						:is="contentComponentName( group )"
						:id="childId( key )" 
						:value="value"
						:optDesc="optDesc"
						:optView="group"
						class="container px-0"
					/>
				</b-tab>
			</b-tabs>
			`
	});

	//---------------------------------------------------------------------------------------------------
	// Component that generates a flat list of components for the individual options (the leafs of the tree).

	module.containerComp = Vue.component( "z42opt-container", {
		inheritAttrs: false,
		props: {
			id:      { type: String, required: true },
			value:   { type: Object, required: true },
			optDesc: { type: z42opt.Node, required: true }, 
			optView: { type: Object, required: true },
		},
		methods: {
			childId( key ) {  
				return z42opt.joinPath( this.id, key, "#" ); 
			},			
			// Return a flat array of options descriptors from given path.
			resolveOptDesc( path ){
				let node = z42opt.getMemberByPath( this.optDesc, path );
				if( node instanceof z42opt.Option ){
					return [{ path: path, node: node }];
				}
				let res = [];
				for( const key of Object.keys( node ) ){
					const childPath = z42opt.joinPath( path, key );
					// Recurse to append child option descriptors
					res = res.concat( this.resolveOptDesc( childPath ) );
				}
				return res;
			},	
			resolveValue( path ){
				return z42opt.getMemberByPath( this.value, path );
			},	
			onModified( value, path ){
				const optDescNode = z42opt.getMemberByPath( this.optDesc, path ); 
				if( optDescNode instanceof z42opt.Option ) {
					z42opt.setMemberByPath( this.value, path, value );
				}
			}
		},
		template: /*html*/ `
			<div>
				<template v-for="basePath in optView.options">				
					<!-- Note: 'key' attribute required when using v-for with component (https://vuejs.org/v2/guide/list.html#v-for-with-a-Component) -->

					<component v-for="opt in resolveOptDesc( basePath )"
						:is="opt.node.$component" 
						:key="childId( opt.path )"
						:id="childId( opt.path )"
						:optDesc="opt.node" 
						:value="resolveValue( opt.path )"
						@input="onModified( $event, opt.path )"
					/>
				</template>
			</div>
			`
	});	

	//---------------------------------------------------------------------------------------------------

	module.rangeComp = Vue.component( "z42opt-range", {
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
				if( this.optDesc.$attrs.isScale ) 
					return calcSliderValueFromScale( this.value, 
						this.optDesc.$attrs.min, this.optDesc.$attrs.max, this.sliderMin, this.sliderMax );
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

				if( this.optDesc.$attrs.isScale && 
					this.optDesc.$attrs.min != null && 
					this.optDesc.$attrs.max != null ) {
					value = calcScaleFromSliderValue( value, 
						this.optDesc.$attrs.min, this.optDesc.$attrs.max, this.sliderMin, this.sliderMax );
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

	module.selectComp = Vue.component( "z42opt-select", {
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

	module.checkComp = Vue.component( "z42opt-check", {
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

	module.colorComp = Vue.component( "z42opt-color", {
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