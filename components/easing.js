/* z42easing Module.
 *
 * This code is a modified version of "jQuery Easing v1.3" for standalone use.
 * - removed unused 'x' parameters
 * - conciser function names
 * - added 'linear', 'inExpo2', 'outExpo2', 'inOutExpo2', 'inOutSine2*' functions
 *
 * Original license below this line:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

(function(){
	'use strict';
	
	// For compatibility with WebWorkers, where 'window' is not available, use 'self' instead.
	// Also module import from WebWorkers isn't widely supported yet, so we keep this an "old-school" module. 
	const module = self.z42easing = {};
	
	// Function parameters:
	// t: current time, b: begInnIng value, c: change In value, d: duration
		
	module.linear = function (t, b, c, d) { 
		return c * t / d + b;
	}		
	module.inQuad = function (t, b, c, d) {
		return c*(t/=d)*t + b;
	}
	module.outQuad = function (t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	}
	module.inOutQuad = function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	}
	module.inCubic = function (t, b, c, d) {
		return c*(t/=d)*t*t + b;
	}
	module.outCubic = function (t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	}
	module.inOutCubic = function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	}
	module.inQuart = function (t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	}
	module.outQuart = function (t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	}
	module.inOutQuart = function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	}
	module.inQuint = function (t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	}
	module.outQuint = function (t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	}
	module.inOutQuint = function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	}
	module.inSine = function (t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	}
	module.outSine = function (t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	}
	module.inOutSine = function (t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	}
	module.inOutSine2_3 = function (t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) * 0.6 + Math.cos(Math.PI*t/d*3) * 0.4 - 1) + b;
	}
	module.inOutSine2_5 = function (t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) * 0.875 + Math.cos(Math.PI*t/d*5) * 0.125 - 1) + b;
	}
	module.inOutSine2_9 = function (t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) * 0.875 + Math.cos(Math.PI*t/d*9) * 0.125 - 1) + b;
	}
	module.inOutSine2_13 = function (t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) * 0.9 + Math.cos(Math.PI*t/d*13) * 0.1 - 1) + b;
	}
	module.inExpo = function (t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	}
	module.outExpo = function (t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	}
	module.inOutExpo = function (t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	}	
	module.inExpo2 = function (t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 20 * (t/d - 1)) + b;
	}
	module.outExpo2 = function (t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -20 * t/d) + 1) + b;
	}
	module.inOutExpo2 = function (t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 20 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -20 * --t) + 2) + b;
	}
	module.inCirc = function (t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	}
	module.outCirc = function (t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	}
	module.inOutCirc = function (t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	}
	module.inElastic = function (t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	}
	module.outElastic = function (t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	}
	module.inOutElastic = function (t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	}
	module.inBack = function (t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	}
	module.outBack = function (t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	}
	module.inOutBack = function (t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	}
	module.inBounce = function (t, b, c, d) {
		return c - module.outBounce (d-t, 0, c, d) + b;
	}
	module.outBounce = function (t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	}
	module.inOutBounce = function (t, b, c, d) {
		if (t < d/2) return module.inBounce (t*2, 0, c, d) * .5 + b;
		return module.outBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
	}	
})();