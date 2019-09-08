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
//------------------------------------------------------------------------------------------------

import "./optionsStructureComp.js"
import "./optionsDescriptor.js"
import * as z42opt from "./optionsDescriptor.js"
import * as z42optUtil from "./optionsUtils.js"

//------------------------------------------------------------------------------------------------
// Component for a dynamic options dialog. 
// It will be generated from the following information:
// - optData: the option values 
// - optDesc: options descriptor that describes the data types, constraints, etc.
// - optView: options view describes how the data should be structured in the UI

const optionsDialogComponent = Vue.component( "z42opt-dialog", {
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
			return z42optUtil.createPermalink( this.optData, this.optDesc, window.location.href );
		}
	},
	methods: {
		onShow(){
			this.myInitialPermaLinkUrl = z42optUtil.createPermalink( this.optData, this.optDesc, window.location.href );
		},
		onHide(){
			// When options have changed, make it possible to use the browser back button to revert the current options.
			if( this.permaLinkUrl !== this.myInitialPermaLinkUrl ){
				window.history.pushState( { action: "optionsDialogClose" }, document.title, this.permaLinkUrl );
			}
		}
	},
	// TIP: Install VSCode "Comment tagged templates" extensions for syntax highlighting of template.
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

//------------------------------------------------------------------------------------------------

export {
	optionsDialogComponent
}