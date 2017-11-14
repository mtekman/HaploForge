import HaploBlock from '/JS/mode/haplo/blocks/haploblock_frontend.js';
import HaploBlockFormat from '/JS/mode/haplo/blocks/haploblockformat.js';
import { error } from '/JS/globals.js';

export var ObservedBases = {
	_nullbase : 0,
	_nulltide : '?',
	_fmap : {'A': 1, 'C': 2, 'T': 3, 'G': 4},
	_bmap : {1: 'A', 2: 'C', 3: 'T', 4: 'G'},

	recodeBase(baseraw){
		let base = baseraw.trim()
		var res = ObservedBases._nullbase
		if (base in ObservedBases._fmap){
			res = ObservedBases._fmap[base];
		}
		return res;
	},

	decodeBase(onetworaw){
		let onetwo = onetworaw
		if (onetwo in ObservedBases._bmap){
			return ObservedBases._bmap[onetwo]
		}
		return ObservedBases._nulltide
	}
}

export var MarkerData = {
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
				error("GP array and RS array do not match");
			}
		}
	},

	// "Pads rs identifiers into fixed width string based on max length
	padMarkerMap(){
		var format = "            ",
			withgp = MarkerData.gp_array.length > 1 ;


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
