/** Local storage keys

Two types of saves: pedigree and haplotype (regardless of format)

Pedigree is a LINKAGE format with graphics meta appended at the end
Haplotype is a compressed JSON with haplo + map data (if map given);

**/
var localStor = {
	ped_save : 'ped_data',
	ped_type : 'ped_type',
	hap_save : 'hap_data',  // Own data format
	hap_type : 'hap_type',
	transfer : 'transferFromHaploToPed' // pedigrees in haplo can be modified
}

// 1 -- required, 0 -- optional
var FORMAT = {
	PEDFILE : 1,
	HAPLO : {
		ALLEGRO : {
			HAPLO: 1,
			MAP  : 0
		},
		SIMWALK : {
			HAPLO: 1,
			MAP  : 1
		},
		GHM     : {
			HAPLO: 1,
			MAP  : 0
		}
	},
	UNKNOWN : 0
}





class Genehunter {
	
	constructor(mode_init = null){

		var haplofile = document.getElementById("ghm_haplo").files[0] || null,
			mapfile   = document.getElementById("ghm_map").files[0] || null;

		if (haplofile !== null){
			Genehunter.readFile(haplofile, function(haplo_text)
			{
				if (mapfile !== null){
					Genehunter.readFile(mapfile, function(map_text){
						Genehunter.populateMarkerMap(map_text);
					});
				}

				Genehunter.populateFamilyMap(haplo_text);

				if (mode_init !== null){
					mode_init();
				}
			});
		}
	}


	static readFile(file, callback){
	    var fr = new FileReader();

	    fr.onloadend = function(e){
	    	callback(e.target.result);
	    };

	    fr.readAsText(file);
	}

	static populateMarkerMap(text_unformatted){
		console.log("POPULALTE MARKER MAP");
	}
	static populateFamilyMap(text_unformatted){
		console.log("POPULALTE FAMILY MAP");
	}



}