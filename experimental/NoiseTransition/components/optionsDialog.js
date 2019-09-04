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
	// within template string.

	const dialogTemplate = /*html*/ `
		<b-modal title="PlasmaFractal Options" id="z42opt-dialog"
			scrollable hide-footer>

		<b-tabs>
			<b-tab title="Noise">
				<z42opt-range id="frequency" label="Frequency" 
					:min="0.01" :max="15" isScale :scaleNormalPos="0.33" :scaleMaxFractionDigits="2" 
					v-model.number="options.noise.frequency" lazy />

				<z42opt-range id="octaves" label="Octaves" 
					:min="1" :max="15" 
					v-model.number="options.noise.octaves" lazy />

				<z42opt-range id="gain" label="Gain" 
					:min="0.2" :max="0.8" :step="0.01" 
					v-model.number="options.noise.gain" lazy />

				<z42opt-range id="lacunarity" label="Lacunarity"
					:min="2" :max="10" :step="0.01"
					v-model.number="options.noise.lacunarity" lazy />

				<z42opt-range id="amplitude" label="Amplitude"
					:min="2" :max="100" :step="0.01"
					v-model.number="options.noise.amplitude" lazy />
			</b-tab>

			<b-tab title="Palette">

			</b-tab>

			<b-tab title="Animation">

			</b-tab>
		</b-tabs>	
		</b-modal>
		`;
	
	module.registerOptionsDialog  = function( params ) 
	{
		Vue.component( "z42opt-dialog", {
			data: function() { 
				return { options: params.data } 
			},
			watch: params.watch,
			template: dialogTemplate
		});
	}

})(this);
