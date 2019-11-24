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

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<template>
	<b-form-group class="container px-0">
		<b-row align-v="center">
			<b-col>
				<label 
					:for="id"
					:disabled="disabled"
					>
					{{ optDesc.$attrs.title }}:
				</label>
			</b-col>
			<b-col>
				<b-form-input type="color"
					:id="id"
					:value="hexValue"
					:disabled="disabled"
					class="z42opt-color"
					@change="onModified( $event )"				
				/>
			</b-col>
		</b-row>
	</b-form-group>
</template>

<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<script>
import * as tinycolor from "tinycolor2"
import * as z42opt from "./optionsDescriptor.js"

export default {
	name: "z42opt-color",
	inheritAttrs: false,

	props: { 
		id:       { type: String, required: true },
		value:    { required: true },
		optDesc:  { type: z42opt.Option, required: true }, 
		disabled: { type: Boolean, required: false, default: false },
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
}
</script>