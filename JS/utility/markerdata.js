
var MarkerData = {
	rs_array: [], // rsid
	gp_array: [], // genpos

	padded: [], // what is displayed (rsid + genpos);

	// Not 10 causes formatting problems in haplomode
	maxlen_marker : 10,
	hasGPData: false,

	getLength(){
		return MarkerData.padded.length;
	},

	addMarkers(data){
		MarkerData.rs_array = data;
	},

	addGenePos(data){
		MarkerData.gp_array = data;
	},

	sanityCheck(){
		if (MarkerData.padded.length > 0){
			if (MarkerData.gp_array.length !== MarkerData.rs_array.length){
				console.log("GP array and RS array do not match",
					MarkerData.gp_array.length,
					MarkerData.rs_array.length);
				throw new Error();
			}
		}
	},

	// "Pads rs identifiers into fixed width string based on max length
	padMarkerMap(){
		var format = "            ",
			withgp = MarkerData.gp_array.length !==0;


		for (var i=0; i < MarkerData.rs_array.length; i++){
			MarkerData.padded[i] = (MarkerData.rs_array[i] + format).slice(0,MarkerData.maxlen_marker);

			if (withgp){
				MarkerData.padded[i] += " : " + (MarkerData.gp_array[i] + format).slice(0,5); // 5 sf
			}
		}
		MarkerData.hasGPData = withgp

		// Also set display format
		HaploBlockFormat.hasGPData(withgp);
	},


	clear(){
		MarkerData.rs_array = [];
		MarkerData.gp_array = [];
	}
}