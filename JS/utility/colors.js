// Founder color groups are unique, even across families

var FounderColor = {

	hgroup : [], // [founder_id], where array index = color/group
	unique : [], // [color --> hex]

	zero_color_grp : -1,


	makeUniqueColors: function( hgroup = null, map = null)
	{
		if (hgroup === null){
			hgroup = FounderColor.hgroup;
			map = FounderColor.unique;
		}

		var num_colors = hgroup.length;
		console.log("num_colours", num_colors);

		// More stepped approach -- no more than 3 tiers of darkness
		var max_tiers = 5,
			max_colors_per_tier = 9,
			colours_per_tier,
			num_tiers = Math.floor(num_colors / 10);


		if (num_colors < 10){
			num_tiers = 1;
			colours_per_tier = num_colors
		
		} else {
			// 14,15
			if (num_tiers < 2){
				num_tiers = 2
			}
			colours_per_tier = Math.floor(num_colors / num_tiers);
			
		}


		if (num_colors)


		if (num_tiers > max_tiers){
			num_tiers = max_tiers;
		}
		else if (num_tiers < 1){
			num_tiers = 1;
			colours_per_tier = 10;
		}
		else {
			colours_per_tier = Math.floor(num_colors / num_tiers);	
		}

		var hue_step = Math.floor(360/colours_per_tier);

		console.log("colors per tier", colours_per_tier, hue_step, num_tiers);

		for (var tier=0; tier < num_tiers; tier ++)
		{
			var sat = 90 - (tier * (90/max_tiers)),
				val = 80 - (tier * (60/max_tiers)),
				hue = 0;


			for (var c = 0; c < colours_per_tier; c++)
			{
				var index = (tier*colours_per_tier)+c;

				if (index > num_colors){
					break;
				}
				
				map[index] = FounderColor.__hsv2rgb(hue, sat, val);
				console.log( index, ":", hue, sat, val, map[index] )

				hue += hue_step;
			}
		}

		return colours_per_tier;
	},


	__testcontainer : null,

	__testColors: function(n){

		var array = [];
		while (array.length <n){ array.push(0)};

		var colors_per_line = FounderColor.makeUniqueColors(array, array);

		console.log(array)

		//Display
		if (FounderColor.__testcontainer !== null){
			while(FounderColor.__testcontainer.firstChild){
				FounderColor.__testcontainer.removeChild(FounderColor.__testcontainer.firstChild);
			}
			FounderColor.__testcontainer.parentNode.removeChild(FounderColor.__testcontainer)
		}
		var container = document.createElement('div');

		container.style.background = "white";
		container.style.position = "absolute";
		container.style.left = "10px";
		container.style.top = "10px";
		container.style.width = colors_per_line*100 + "px";

		for (var a=0; a < array.length; a++){
			var col = document.createElement("div");

			col.style.background = array[a];
			col.style.width = "100px";
			col.style.height = "100px";
			col.style.float = "left";

			container.appendChild(col);
		}
		FounderColor.__testcontainer = container;

		document.body.appendChild(container);
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

	    console.log(r,g,b);

		return FounderColor.__rgb2hex(r,g,b);
	},

	__rgb2hex : function rgbToHex(r, g, b) {
    	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}
}