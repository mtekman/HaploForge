
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
		throw new Error(key+" not in userOpts");
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

		if (uniqueGraphOps.haplo_scroll !== null){
			HaploBlock.redrawHaplos();
		}
	}
};