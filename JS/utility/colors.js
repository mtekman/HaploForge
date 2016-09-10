// Founder color groups are unique, even across families

var FounderColor = {

	hgroup : [], // [founder_id], where array index = color/group
	unique : [], // [color --> hex]

	zero_color_grp : -1,

	makeUniqueColors: function()
	{
		FounderColor.unique = FounderColor.__generateColorRange(hgroup.length).rgb_array;
	},

	__mapped_used : {}, //needs to be cleared after final mapped() call
	__good_hues : [
		  0,  30,  36,  41,  48,  54,
		 60,  72, 120, 180, 186, 192,
	    204, 240, 262, 276, 288, 300
	],


	__evenlySpacedRange: function(req, array)
	{
		var totalnum = array.length;

		if (req > totalnum){
			throw new Error(req+" > "+totalnum);
		}

		var dd = [],
			step = array.length/req;

		for (var b=0; b < array.length; b += step)
		{
			var index = parseInt(b);

			dd.push( array[index] )
		}
		return dd;
	},

	__getColorRange: function(total){
		var hues = FounderColor.__good_hues,
			huelen = hues.length;

		if (total === 1){
			return hues[huelen/2]
		}

		if (total > huelen){
			throw new Error("Please tier S and V values")
		}
		return FounderColor.__evenlySpacedRange(total, hues);
	},


	__generateArrays(num_colors)
	{
		var colours_per_tier = FounderColor.__good_hues.length,
			num_tiers = Math.floor(num_colors / colours_per_tier);

		if (num_colors < colours_per_tier){
			num_tiers = 1;
			colours_per_tier = num_colors
		}
		else if (num_colors % colours_per_tier === 0){
			// nought		
		} else {
			num_tiers += 1;			
		}

		var rgb_array = [],
			hsv_array = [];


		for (var tier=0; tier < num_tiers; tier ++)
		{
			var sat = 100 - (tier * (80/num_tiers)),
				val = 90 - (tier * (80/num_tiers)),
				hue = 0;

			var hues = FounderColor.getColorRange(colours_per_tier)

			for (var c = 0; c < colours_per_tier; c++)
			{
				var index = (tier * colours_per_tier) + c;

				if (index >= num_colors){
					break;
				}
				var hue = hues[c]

				hsv_array.push( [hue,sat,val] )
				rgb_array.push( FounderColor.__hsv2rgb(hue, sat, val) );			
			}
		}
		return {hsv: hsv_array, rgb: rgb_array};
	},

	__hsv2rgb : function HSVtoRGB(h, s, v) {
		var r, g, b, i, f, p, q, t;
		if (arguments.length === 1) {
		    s = h.s, v = h.v, h = h.h;
		}

		h /= 360;
		s /= 100;
		v /= 100;

		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
	    r = Math.round(r * 255);
	    g = Math.round(g * 255);
	    b = Math.round(b * 255);

		return FounderColor.__rgb2hex(r,g,b);
	},

	__rgb2hex : function rgbToHex(r, g, b) {
    	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	},

	// Purely testing:
	__testcontainer : null,
	testColors: function(n, step = true){

		var hsv_and_rgb = FounderColor.generateArrays(n),
			hsv_array = hsv_and_rgb.hsv,
			rgb_array = hsv_and_rgb.rgb;

		console.log(hsv_and_rgb)


		//Display
		if (FounderColor.__testcontainer !== null){
			while(FounderColor.__testcontainer.firstChild){
				FounderColor.__testcontainer.removeChild(FounderColor.__testcontainer.firstChild);
			}
			FounderColor.__testcontainer.parentNode.removeChild(FounderColor.__testcontainer)
		}
		var container = document.createElement('div'),
			glen = (!step || n < FounderColor.__good_hues.length)?n:FounderColor.__good_hues.length;
			general_width = parseInt((window.innerWidth / glen)*0.99);

		container.style.background = "white";
		container.style.position = "absolute";
		container.style.left = "10px";
		container.style.top = "10px";
		container.style.width = glen*general_width + "px";

		for (var a=0; a < rgb_array.length; a++){
			var col = document.createElement("div");

			function sets(g){
				console.log(rgb_array[g], hsv_array[g])
			};

			col.style.background = rgb_array[a];
			col.style.width = general_width + "px";
			col.style.height = "100px";
			col.style.float = "left";
			col.onclick = sets.bind(this, a);

			container.appendChild(col);
		}
		FounderColor.__testcontainer = container;

		document.body.appendChild(container);
	}
}







// 	// Different methods for generating color ranges.
// 	__slopes : {

// 		__mapped_used : {}, //needs to be cleared after final mapped() call
// 		__good_hues : [
// 			  0,  30,  36,  41,  48,  54,
// 			 60,  72, 120, 180, 186, 192,
// 		    204, 240, 262, 276, 288, 300
// 		],


// 		// Last ditch inelegant method of getting distinct colours -- pull at random from good hues
// 		randomMapped : function(discard){  // Default

// 			var good_hues = FounderColor.__slopes.__good_hues,
// 				used_map = FounderColor.__slopes.__mapped_used;

// 			var hue = good_hues[0],
// 				iter = 0;
// 			while (hue in used_map && iter++ < 100){
// 				var index = parseInt(Math.random()*(good_hues.length));
// 				hue = good_hues[index];
// 			}
// 			used_map[hue] = 1;

// 			return hue;
// 		},


// 		mapped : function(discard){

// 			var good_hues = FounderColor.__slopes.__good_hues,
// 				used_map = FounderColor.__slopes.__mapped_used;

// 			var hue = good_hues[0],
// 				iter = 0;

// 			while (hue in used_map && iter++ < 100){
// 				var highest_hue = Number(Object.keys(used_map).sort(function(a,b){
// 					return Number(b) - Number(a);
// 				})[0])

// 				var index = good_hues.indexOf(highest_hue) + 1
// 				hue = good_hues[index];
// 			}
// 			used_map[hue] = 1;

// 			return hue;
// 		},


// 		// This accentuates more easily distinguishable colours using a stepped hue gradient
// 		stepped : function(fract){   // [0,1] --> [0,16]  -- 16 is how the coeffs were derived...
// 			var c = [	// Coeffs:
// 				-3.07674557236884E-05, 	//	x^7
// 				-0.000459011980079,		//	x^6
// 				0.061300309597543,		//	x^5
// 				-1.26960404651228,		//	x^4
// 				10.6469387121164,		// 	x^3
// 				-36.8885440632869,		//	x^2
// 				58.3413936178228,		//	x
// 				0		//  y-inter
// 			];

// 			if (fract > 1 || fract < 0){
// 				throw new Error("Bad fract", fract)
// 			}

// 			var x = fract * 16,
// 				hue = (c[0]*Math.pow(x,7)
// 					+c[1]*Math.pow(x,6)
// 					+c[2]*Math.pow(x,5)
// 					+c[3]*Math.pow(x,4)
// 					+c[4]*Math.pow(x,3)
// 					+c[5]*Math.pow(x,2)
// 					+c[6]*x
// 					+c[7])

// 			if (hue < 0){ hue = 0;}

// 			return parseInt(hue);
// 		},

// 		linear: function(fract){
// 			if (fract > 1 || fract < 0){
// 				throw new Error("Bad fract", fract)
// 			}

// 			return parseInt(fract * 300); // hue between 300-360/0 are essentially the same colour...
// 		}
// 	},

