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

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Component that generates tabs for the groups defined by the options view
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<template>
	<b-tabs 
		:value="tabIndex" 
		@input="$emit( 'update:tabIndex', $event )" 
		>
		<!-- Note: 'key' attribute required when using v-for with component (https://vuejs.org/v2/guide/list.html#v-for-with-a-Component) -->
		
		<b-tab v-for="( group, key ) in optView.groups"
			:key="childId( key )"
			:id="childId( key )"
			:title="group.title"
			>
			<!-- Component to display the content of the tab.
				Instead of modifying optData directly the component just forwards opt-modified event 
				to parent to give parent full control. -->
			<component
				:is="contentComponentName( group )"
				:id="childId( key )" 
				:optData="optData"
				:optDesc="optDesc"
				:optView="group"
				class="container px-0"
				@opt-modified="$emit( 'opt-modified', $event )"
			/>
		</b-tab>
	</b-tabs>
</template>

<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<script>
import * as z42opt from "./optionsDescriptor.js";
import * as z42optUtil from "./optionsUtils.js";

export default {
	name: "z42opt-tabs",
	inheritAttrs: false,

	props: {
		id:       { type: String, required: true },
		optData:  { type: Object, required: true },
		optDesc:  { type: z42opt.Node, required: true }, 
		optView:  { type: Object, required: true },
		tabIndex: { type: Number, required: false, default: 0 },
	},
	methods: {
		childId( key ) { 
			return z42optUtil.joinPath( this.id, key, "#" ); 
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
}
</script>