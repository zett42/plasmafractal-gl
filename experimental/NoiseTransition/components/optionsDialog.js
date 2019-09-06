/*
Options dialog component. Copyright (c) 2019 zett42.
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

	module.optionsDialog = Vue.component( "z42opt-dialog", {
		inheritAttrs: false,
		props: { 
			id:      { type: String, required: true }, 
			optData: { type: Object, required: true },
			optDesc: { type: z42opt.Group, required: true },
			optView: { type: Object, required: true },
		},
		myInitialPermaLinkUrl: null, 

		computed: {
			permaLinkUrl() {
				return createPermalink( this.optData, this.optDesc );
			}
		},
		methods: {
			onShow(){
				this.myInitialPermaLinkUrl = createPermalink( this.optData, this.optDesc );
			},
			onHide(){
				// When options have changed, make it possible to use the browser back button to revert the current options.
				if( this.permaLinkUrl !== this.myInitialPermaLinkUrl ){
					window.history.pushState( { action: "optionsDialogClose" }, document.title, this.permaLinkUrl );
				}
			}
		},
		template: /*html*/ `
			<b-modal 
				:id="id" 
				:title="optView.title"
				scrollable hide-footer
				@show="onShow" @hide="onHide">
				<p>
					<a v-if="optView.moreInfoLinkUrl" :href="optView.moreInfoLinkUrl" target="_blank" rel="noopener">
						{{ optView.moreInfoLinkText }}
					</a>
					<a :href="permaLinkUrl" style="float: right">Permalink</a>
				</p>

				<!-- Component for the root of the options tree (typically z42opt-tabs) -->
				<component 
					:is="optView.component || 'z42opt-tabs'" 
					:id="id" 
					:value="optData" 
					:optDesc="optDesc" 
					:optView="optView" 
				/>
			</b-modal>
			`
	});

	//===================================================================================================
	// Private functions
	//===================================================================================================

	function createPermalink( optData, optDesc )
	{
		const urlParams = z42opt.optionsToUrlParams( optData, optDesc );

		// Remove sub string after "#" and "?", if exists.
		const baseUrl = window.location.href.split( "#" )[ 0 ].split( "?" )[ 0 ];

		return baseUrl + "?" + urlParams;
	}	

})(this);