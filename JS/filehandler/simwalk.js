

class Simwalk extends FileFormat {

	constructor(mode_init = null)
	{
		var ignore_descent = document.getElementById('sw_infer_box').checked;

		console.log("IGNORE DESCENT", ignore_descent)

		var haplo = {
			id: "sw_haplo",
			process: function(haplo_text){
				Simwalk.populateFamilyAndHaploMap(haplo_text, !ignore_descent);
			},
			useDescent : !ignore_descent,
			hasMarkerNames : true
		}

		/*
		var map = {
			id: "sw_map",
			process: function(map_text){
				Simwalk.populateMarkerMap(map_text);
			},
			nonexistent: FileFormat.enumerateMarkers;
		}

		var ped = {
			id: "sw_ped",
			process: function(ped_text){
				Genehunter.populateFamilyMap(ped_text);
			}
		}*/

		super(haplo, null, null, null, mode_init);
	}


	static populateFamilyAndHaploMap(text_unformatted, use_descent = false){

		var lines = text_unformatted.split('\n');

		var marker_header_found = false,
			pedname_header_found = false;

		// Populate Marker
		var l = 0;
		for (;l < lines.length; l++)
		{
			var line = lines[l];
			//console.log(line)

			if (line.startsWith("Marker")){
				//console.log("found marker line")
				marker_header_found = true;
				continue
			}

			if (line.startsWith("Pedigree Name")){
				//console.log("found pedigree line")
				pedname_header_found = true;
				break;
			}

			if (marker_header_found){
				if (!pedname_header_found)
				{
					if (!line.startsWith(" ")){
						// console.log("found marker line!", line);
						var markername = line.split(/\s+/)[0];
						MarkerData.rs_array.push( markername );
					}
				}
			}
		}
		// console.log("finished marker data");

		//Ped Name
		var dashedlines_found = false,
			tmp_fam = null,
			tmp_perc = null,
			tmp_allpat = [],  // alleles
			tmp_allmat = [],
			tmp_decpat = [], // descent
			tmp_decmat = [];


		function insertDat(){
			if (tmp_allpat.length > 0){
				// console.log("appending haplo data to", tmp_perc.id)
				tmp_perc.insertHaploData(tmp_allpat);
				tmp_perc.insertHaploData(tmp_allmat);

				if (use_descent){
					tmp_perc.insertDescentData(tmp_decpat); // paternal first
					tmp_perc.insertDescentData(tmp_decmat); // maternal second
				}

				tmp_perc = null;
				tmp_allmat = [];
				tmp_allpat = [];
				tmp_decpat = [];
				tmp_decmat = [];
			}
		}


		for (; l < lines.length; l++){
			var line = lines[l];

			if (line.startsWith("________")){

				// Flush data from last perc if new fam found
				if (tmp_perc !== null){
					insertDat();
				}

				dashedlines_found = true;
				continue;
			}

			if (dashedlines_found && !line.startsWith(" "))
			{
				var fam = line.split("(")[0].trim();
				tmp_fam = fam;
				dashedlines_found = false;
				// console.log("identified fam", tmp_fam, line)
				continue
			}


			var tokens = line.trim().split(/\s+/);
			// console.log(tokens.length, tokens)

			// Person Data
			if (tmp_fam !== null && tokens.length===5){

				insertDat();

				var id = parseInt(tokens[0]),
					father_id = parseInt(tokens[1]),
					mother_id = parseInt(tokens[2]),
					gender = parseInt(tokens[3]),
					affected = parseInt(tokens[4]);

				var perc = new Person(id, gender, affected, mother_id, father_id);
				// console.log("found new perc", perc)

				familyMapOps.insertPerc(perc, tmp_fam);				
				tmp_perc = familyMapOps.getPerc(perc.id, tmp_fam);

				continue
			}

			//Allele Data
			if (tmp_fam !== null && tmp_perc !== null && tokens.length === 6){
				tokens = tokens.map(x=> parseInt(x));

				tmp_allpat.push( tokens[0] );
				tmp_allmat.push( tokens[1] );

				if (use_descent){
					tmp_decpat.push( tokens[2] );
					tmp_decmat.push( tokens[3] );
				}
			}
		}
	}


	static processDescentGraph(text_unformatted){

	}


	static populateMarkerMap(text_unformatted){}

	

}