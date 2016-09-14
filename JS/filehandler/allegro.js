

class Allegro extends FileFormat {
	
	constructor(mode_init = null){

		var haplo = {
			id: "allegro_haplo",
			process: function(haplo_text){
				Allegro.__populateFamilyAndHaploMap(haplo_text);			
			},
			hasMarkerNames : true
		}

		var map = {
			id: "allegro_map",
			process: function(map_text){
				Allegro.__populateGeneticPositions(map_text);
			}
		}

		var descent = {
			id: "allegro_descent",
			process: function(descent_text){
				Allegro.__populateDescentVectors(descent_text);
			}
		}

		super(haplo, map, null, descent, mode_init);

	}


	static __populateFamilyAndHaploMap(text_unformatted){
		
		var lines = text_unformatted.split('\n'),
			haplo_start_col = -1;

		var header_lines = [];
	
		for (var l=0; l < lines.length; l++){
			var line = lines[l];
	
			if (line.length < 5 ){
				continue
			};

			// Add to header data for later processing.	
			if (line.substr(0,1) === " ") {                        //Temp store header data
				haplo_start_col = line.lastIndexOf("    ") +4;     //
				header_lines.push( line );
				continue;
			}
	
			//Populate family map
			var people_info = line
				.substring(0, haplo_start_col - 1)
				.trim()
				.split(/\s+/).map(x => parseInt(x));

			var haplo_data = line
				.substring(haplo_start_col)
				.trim()
				.split(/\s+/)
				.map(x => parseInt(x));

			
			//Handle Person info
			var fam = people_info[0], id  = people_info[1],
				pat = people_info[2], mat = people_info[3],
				sex = people_info[4], aff = people_info[5];

			var pers;
	
			if (familyMapOps.percExists(id,fam)){
				pers = familyMapOps.getPerc(id,fam);
			
			} else {
				pers = new Person(id, sex, aff, mat, pat);
				familyMapOps.insertPerc(pers, fam);
			}

			// Handle HaploData		
			pers.insertHaploData( haplo_data );
		}

		Allegro.__handleHeaders(header_lines, haplo_start_col);
	}

	// Transpose marker names
	static __handleHeaders(header_lines, start_col){

		for (var col= start_col; col < header_lines[0].length; col++){
			var col_string = "";

			for (var row=header_lines.length; row > 0 ;){
				col_string += header_lines[--row][col];
			}

			col_string = col_string.trim();

			if (col_string!=="") {
				MarkerData.rs_array.push( col_string );
			}
		}

		var expected_num = familyMapOps.getRandomPerc().haplo_data[0].data_array.length,
			actual_num = MarkerData.rs_array.length;

		if (expected_num !== actual_num){
			throw new Error("Error, allele sizes do not match:" 
				+ expected_num + " != " + actual_num);
		}
	}

	static __populateGeneticPositions(text_unformatted){}
	static __populateDescentVectors(text_unformatted){}
	static __populateMarkerMap(text_unformatted){
/*			MarkerData.rs_array.push(marker);
			MarkerData.gp_array.push(genpos);*/
	}

}