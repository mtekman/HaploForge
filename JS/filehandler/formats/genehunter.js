import Person from '/JS/pedigree/person.js';
import familyMapOps from '/JS/pedigree/familymapops.js';

debugGH = {};

class Genehunter extends FileFormat {

	constructor(mode_init = null){

		var haplo = {
			id: "ghm_haplo",
			process: function(haplo_text){
				debugGH.haplo = haplo_text;
				Genehunter.populateFamilyAndHaploMap(haplo_text);
			},
			hasMarkerNames : false,
			inferGenders : true // unless ped is uploaded!
		}

		var map = {
			id: "ghm_map",
			process: function(map_text){
				debugGH.map = map_text;
				Genehunter.populateMarkerMap(map_text);
			}
		}

		var ped = {
			id: "ghm_ped",
			process: FileFormat.updateFamily
		}

		super(haplo, map, ped, null, mode_init);

	}

	static populateMarkerMap(text_unformatted){
		var lines = text_unformatted.split('\n'),
			current_chrom = null;

		// Skip header
		var markers = [],
			gps = [];

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
				error("Chrom changed from "+ current_chrom + " to " + tokens[0])
			}

			var genpos = Number(tokens[1]),
				marker = tokens[2].trim();


			markers.push(marker);
			gps.push(genpos);
		}

		MarkerData.addGenePos( gps );
		MarkerData.addMarkers( markers );
	}

	static populateFamilyMap(text_unformatted)
	{

	}

	static populateFamilyAndHaploMap(text_unformatted){

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
	}
}
