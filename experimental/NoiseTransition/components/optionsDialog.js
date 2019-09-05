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

	//===================================================================================================
	// Public components
	//===================================================================================================

	// TIP: Install VSCode "Comment tagged templates" extensions for syntax highlighting
	// within template string.

	const dialogTemplate = /*html*/ `
		<b-modal title="PlasmaFractal Options" id="z42opt-dialog"
			scrollable hide-footer
			@show="onShow" @hide="onHide">
			<p>
				<a href="https://github.com/zett42/PlasmaFractal" target="_blank" rel="noopener">GitHub Project</a>
				<a :href="permaLinkUrl" style="float: right">Permalink</a>
			</p>
			<b-tabs>
				<b-tab title="Noise" class="container px-0">
					<z42opt-range label="Frequency" 
						:min="0.01" :max="15" isScale :scaleNormalPos="0.33" :displayMaxFractionDigits="2" 
						v-model.number="options.noise.frequency" lazy />

					<z42opt-range label="Octaves" 
						:min="1" :max="15" 
						v-model.number="options.noise.octaves" lazy />

					<z42opt-range label="Gain" 
						:min="0.2" :max="0.8" :step="0.01" 
						v-model.number="options.noise.gain" lazy />

					<z42opt-range label="Lacunarity"
						:min="2" :max="10" :step="0.01"
						v-model.number="options.noise.lacunarity" lazy />

					<z42opt-range id="options.noise.amplitude" label="Amplitude"
						:min="2" :max="100" :step="0.01"
						v-model.number="options.noise.amplitude" lazy />
				</b-tab>

				<b-tab title="Palette" class="container px-0">
					<b-form-row>
						<b-col>
							<z42opt-select label="BG to FG easing"
								:options="paletteEaseFunctions"
								v-model="options.palette.easeFunctionBgToFg" />
						</b-col>
						<b-col>
							<z42opt-select label="FG to BG easing"
								:options="paletteEaseFunctions"
								v-model="options.palette.easeFunctionFgToBg" />
						</b-col>
					</b-form-row>

					<z42opt-range label="Foreground saturation"
						:min="0" :max="1" :step="0.01"
						v-model.number="options.palette.saturation" />
						
					<z42opt-range label="Foreground brightness"
						:min="0" :max="1" :step="0.01"
						v-model.number="options.palette.brightness" />

					<z42opt-color label="Background color"
						v-model="options.palette.bgColor" />

					<z42opt-check label="Show original grayscale image"
						v-model="options.palette.isGrayScale" />
				</b-tab>

				<b-tab title="Animation" class="container px-0">
					<z42opt-range label="Palette rotation duration"
							:min="2000" :max="60000" :step="100"
							displayUnit="s" :displayFactor="0.001"
							v-model.number="options.paletteAnim.rotaDuration" lazy />

					<z42opt-range label="Palette transition delay"
							:min="0" :max="30000" :step="100"
							displayUnit="s" :displayFactor="0.001"
							v-model.number="options.paletteAnim.transitionDelay" lazy />

					<z42opt-range label="Palette transition duration"
							:min="1000" :max="30000" :step="100"
							displayUnit="s" :displayFactor="0.001"
							v-model.number="options.paletteAnim.transitionDuration" lazy />

					<z42opt-range label="Noise transition delay"
							:min="0" :max="30000" :step="100"
							displayUnit="s" :displayFactor="0.001"
							v-model.number="options.noiseAnim.transitionDelay" lazy />

					<z42opt-range label="Noise transition duration"
							:min="1000" :max="30000" :step="100"
							displayUnit="s" :displayFactor="0.001"
							v-model.number="options.noiseAnim.transitionDuration" lazy />
				</b-tab>
			</b-tabs>	
		</b-modal>
		`;
	
	module.registerOptionsDialog  = function( params ) {
		Vue.component( "z42opt-dialog", {
			data: function() { 
				return { 
					options: params.options,
					paletteEaseFunctions: params.paletteEaseFunctions
				};
			},
			watch: params.watch,
			
			template: dialogTemplate,

			myInitialPermaLinkUrl: null, 

			computed: {
				permaLinkUrl() {
					return createPermalink( this.options );
				}
			},
			methods: {
				onShow(){
					this.myInitialPermaLinkUrl = createPermalink( this.options );
				},
				onHide(){
					// When options have changed, make it possible to use the browser back button to revert the current options.
					if( this.permaLinkUrl !== this.myInitialPermaLinkUrl ){
						window.history.pushState( { action: "optionsDialogClose" }, document.title, this.permaLinkUrl );
					}
				}
			}
		});
	}
	//===================================================================================================
	// Private functions
	//===================================================================================================

	function createPermalink( options )
	{
		const urlParams = z42plasmaOptions.urlParamsMapper.createUrlParams( options );

		// Remove sub string after "#" and "?", if exists.
		const baseUrl = window.location.href.split( "#" )[ 0 ].split( "?" )[ 0 ];

		return baseUrl + "?" + urlParams;
	}	

})(this);
