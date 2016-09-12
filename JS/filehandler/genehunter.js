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
			HAPLO:   1, // ihaplo
			DESCENT: 0, // inher
			MAP  :   0  // map
		},
		SIMWALK : {
			HAPLO:   1, // HEF
			MAP  :   1  // map
		},
		GHM     : {
			HAPLO:   1, // haplo
			MAP  :   0, // map
			PED  :   0  // pedin
		},
		MERLIN  : {
			PED :    1, // pedin
			HAPLO:   1,	// chr
			DESCENT: 0, // flow
			MAP:     0  // map
		}
	},
	UNKNOWN : 0
}





class Genehunter {
	
	constructor(mode_init = null){

		var haplofile = document.getElementById("ghm_haplo").files[0] || null,
			mapfile   = document.getElementById("ghm_map").files[0] || null;

/*		if (haplofile !== null){
			Genehunter.readFile(haplofile, function(haplo_text)
			{
				localStorage.setItem("test", haplo_text);*/
				var haplo_text = localStorage.getItem("test");
				Genehunter.populateFamilyMap(haplo_text);


/*				if (mapfile !== null){
					Genehunter.readFile(mapfile, function(map_text){

						localStorage.setItem("maptest", map_text);*/
						var map_text = localStorage.getItem("maptest");
						Genehunter.populateMarkerMap(map_text);
/*					});
				}
				else {
					var randomperc = familyMapOps.getRandomPerc(),
						allele_length = randomperc.haplo_data.data_array.length;

					for (var m=0; m < allele_length; m++){
						MarkerData.rs_array.push(String("          " + m).slice(-10));
					}
				}
*/

				if (mode_init !== null){
					mode_init();
				}
/*			});
		}*/
	}


	static readFile(file, callback){
	    var fr = new FileReader();

	    fr.onloadend = function(e){
	    	callback(e.target.result);
	    };

	    fr.readAsText(file);
	}

	static populateMarkerMap(text_unformatted){
		var lines = text_unformatted.split('\n'),
			current_chrom = null;

		// Skip header

		for (var l=1; l < lines.length; l++){
			var line = lines[l].trim(),
				tokens = line.split(/\s+/);

			if (line === ""){
				continue;
			}

			if (current_chrom === null){
				current_chrom = tokens[0]
			}
			else if (current_chrom !== tokens[0]){
				throw new Error("Chrom changed from "+ current_chrom + " to " + tokens[0])
			}

			var genpos = Number(tokens[1]),
				marker = tokens[2].trim();


			MarkerData.rs_array.push(marker);
			MarkerData.gp_array.push(genpos);
		}
	}


	static populateFamilyMap(text_unformatted){
		
		var lines = text_unformatted.split('\n'),
			tmp_perc = null,
			current_fam = null;

		for (var l=0; l < lines.length; l++)
		{
			var line = lines[l];

			// New family line
			if (line.startsWith("*****")){
				var star_fam_score = line.split(/\s+/);
				current_fam = parseInt(star_fam_score[1]);
				continue;
			}

			var tokens = line.trim().split(/\s+/).map(function(a){
				return parseInt(a);
			});

			// Second Allele, finish and insert into family ap
			if (( line.startsWith("   ") || line.startsWith('\t\t')) && tmp_perc!==null){
				var haplo2 = tokens;

				tmp_perc.insertHaploData(haplo2);

				familyMapOps.insertPerc(tmp_perc, current_fam);		
				tmp_perc = null;
				continue
			}

			// First Allele and person data
			var haplo1 = tokens.splice(4),
				pdata = tokens;

			var person = new Person(
				pdata[0], //id
					  0, //gender -- undeclared, inferred from parentage
				pdata[3], //affected
				pdata[2], //mother
				pdata[1]  //father
			);
			person.insertHaploData(haplo1);

			tmp_perc = person;
		}
		console.log("POPULALTE FAMILY MAP", familyMapOps._map);
	}
}