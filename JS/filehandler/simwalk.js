

class Simwalk extends FileFormat {

	constructor(mode_init = null)
	{
		var use_descent = document.getElementById('sw_infer_box').checked;

		console.log("use descent", use_descent)

		var haplo = {
			id: "sw_haplo",
			process: function(haplo_text){
				Simwalk.populateFamHaploAndDesc(haplo_text, use_descent);
			},
			useDescent : use_descent,
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


	static populateFamHaploAndDesc(text_unformatted, use_descent = false){

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
			tmp = {
				_fam : null,
				_perc : null,
				_allpat : [],  // alleles
				_allmat : [],
				_decpat : [], // descent
				_decmat : []
			};


		function insertDat(tmp){
			if (tmp._allpat.length > 0){
				// console.log("appending haplo data to", tmp_perc.id)
				tmp._perc.insertHaploData(tmp._allpat);
				tmp._perc.insertHaploData(tmp._allmat);

				if (use_descent){
//					console.log("use_descent", tmp_decpat, tmp_decmat);
					tmp._perc.insertDescentData(tmp._decpat); // paternal first
					tmp._perc.insertDescentData(tmp._decmat); // maternal second
				}

				tmp._perc = null;
				tmp._allmat = [];
				tmp._allpat = [];
				tmp._decpat = [];
				tmp._decmat = [];
			}
		}


		for (; l < lines.length; l++){
			var line = lines[l];

			if (line.startsWith("________")){

				// Flush data from last perc if new fam found
				if (tmp._perc !== null){
					insertDat( tmp );
				}

				dashedlines_found = true;
				continue;
			}

			if (dashedlines_found && !line.startsWith(" "))
			{
				var fam = line.split("(")[0].trim();
				tmp._fam = fam;
				dashedlines_found = false;
				// console.log("identified fam", tmp_fam, line)
				continue
			}


			var tokens = line.trim().split(/\s+/);
			// console.log(tokens.length, tokens)

			// Person Data
			if (tmp._fam !== null && tokens.length===5){

				insertDat(tmp);

				var id = parseInt(tokens[0]),
					father_id = parseInt(tokens[1]),
					mother_id = parseInt(tokens[2]),
					gender = parseInt(tokens[3]),
					affected = parseInt(tokens[4]);

				var perc = new Person(id, gender, affected, mother_id, father_id);
				// console.log("found new perc", perc)

				familyMapOps.insertPerc(perc, tmp._fam);
				tmp._perc = familyMapOps.getPerc(perc.id, tmp._fam);

				//continue
			}

			//Allele Data
			if (tmp._fam !== null && tmp._perc !== null && tokens.length === 6){
				tokens = tokens.map(x=> parseInt(x));

				tmp._allpat.push( tokens[0] );
				tmp._allmat.push( tokens[1] );

				if (use_descent){
					tmp._decpat.push( tokens[2] );
					tmp._decmat.push( tokens[3] );
				}
			}
		}
	}


	static populateMarkerMap(text_unformatted){}

	

}