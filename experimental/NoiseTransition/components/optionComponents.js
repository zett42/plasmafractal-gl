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
	
	// Create a "namespace" for our stuff.
	var module = global.z42comp = {};

	// TIP: Install VSCode "Comment tagged templates" extensions for syntax highlighting
	// within template string literals.

	module.sliderOption = Vue.component( "slider-option", {
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
			lazy: {  // This is a workaround for "lazy" modifier of v-model not working in component
				type: Boolean,
				required: false,
				default: false
			}  
		},
		computed: {
			eventName(){ return this.lazy ? "change" : "input"; }
		},
		template: /*html*/ `
			<p>
				<label :for="id">{{ label }}:</label> {{ value }}
				<b-input type="range"
						 :id="id"
						 :value="value"
						 :min="min"
						 :max="max"
						 :step="step"
						 @[eventName]="$emit('input', $event)"
				/>
			</p>`
	});


})(this);
