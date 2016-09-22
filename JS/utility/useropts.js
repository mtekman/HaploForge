
// UI configurable:
var userOpts = {
	allowTransitions: true,
	showTooltips: true,

	update: function(key, value){
//		console.log("setting", key, value)

		if (key in userOpts){
			userOpts[key] = value;
		}
		localStorage.setItem("userOpts."+key, value)
	},

	retrieve: function(key){
		if (key in userOpts){
			var value = localStorage.getItem("userOpts."+key);
//			console.log("Trying", key, value)
			if (value === null){
				return true; // deafault enable everything
			}
			return value === "true";
		}
		throw new Error(key+" not in userOpts");
	}
};