
var MarkerData = {
	rs_array: [], // rsid
	gp_array: [], // genpos

	padded: [], // what is displayed (rsid + genpos);

	// Not 10 causes formatting problems in haplomode
	maxlen_marker : 10,

	// "Pads rs identifiers into fixed width string based on max length
	padMarkerMap: function(withgp = false){
		var maxlen = 100;

/*		for (var i= 0; i < MarkerData.rs_array.length; i++){
			var len = MarkerData.rs_array[i].length;
			if (len > maxlen)
				maxlen = len;
		}
		*/
		var format = (
			function(){
				var m=maxlen,
					tx="";
				while(m --> 0){
					tx +=" ";
				}
				return tx;}
		)();


		for (var i=0; i < MarkerData.rs_array.length; i++){
			MarkerData.padded[i] = (MarkerData.rs_array[i] + format).slice(0,MarkerData.maxlen_marker);

			if (withgp){
				MarkerData.
			}
		}
	},


	clear(){
		MarkerData.rs_array = [];
		MarkerData.gp_array = [];
	}
}