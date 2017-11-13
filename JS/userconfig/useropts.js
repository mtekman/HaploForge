import BackgroundVidMain from '/JS/window/backgroundvid.js';
import HaploBlock from '/JS/mode/haplo/blocks/haploblock_frontend.js';
import HaploBlockFormat from '/JS/mode/haplo/blocks/haploblockformat.js';
import HaploWindow from '/JS/mode/haplo/haplomode.js';

// UI configurable:
var userOpts = {
	showTooltips: true,
	fancyGraphics: true,

	update: function(key, value){

		if (key in userOpts){
			userOpts[key] = value;
		}
		localStorage.setItem("userOpts."+key, value)
	},

	retrieve: function(key){
		if (key in userOpts){
			var value = localStorage.getItem("userOpts."+key);

			var res = false

			// default enable everything
			if (value === null){
				res = true;
			}
			else{
				res = (value === "true");
			}


			// Set
			userOpts[key] = res;

			return res;
		}
		error(key+" not in userOpts");
	},

	setGraphics: function(){

		if (userOpts.fancyGraphics)
		{
			HaploBlockFormat.applyFancy();
			BackgroundVidMain.addVid();
		}
		else {
			HaploBlockFormat.applyDefault();
			BackgroundVidMain.removeVid();
		}

		if (HaploWindow._bottom !== null){
			HaploBlockFormat.hasGPData( MarkerData.hasGPData );
			HaploBlock.redrawHaplos();
		}
	}
};
