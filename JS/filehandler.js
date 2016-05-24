// "Pads rs identifiers into fixed width string based on max length
function washMarkerMap(){
	var maxlen = 0;
	for (var i= 0; i < marker_array.length; i++){
		var len = marker_array[i].length;
		if (len > maxlen)
			maxlen = len;
	}
	var format = (
		function(){
			var m=maxlen,
				tx="";
			while(m --> 0){
				tx +=" ";
			}
			return tx;}
	)();

	// Not 10 causes formatting problems in haplomode
	maxlen = 10;
	maxlen_marker = maxlen;

	for (var i=0; i < marker_array.length; i++)
		marker_array[i] = (marker_array[i] + format).slice(0,maxlen);

}




//"Reads the haplofile, maps the markers to array indices, and populates pedigree array with persons"
function processInput(text_unformatted, type)
{
	var text = text_unformatted.split('\n');

	var num_alleles_markers = -1;   // number of alleles and markers should match
	var header_lines = [];
	var start_extract = -1;

	
	function splitHeaderFromData(){

		// Handle haplo data
		for (var l=0; l< text.length; l++){
			var line = text[l];
	
			if (line.length < 5 ){continue};
	
			if (line.substr(0,1) === " ") {                             //Temp store header data
				start_extract = line.lastIndexOf("    ") +4;            //
				header_lines.push(line);                                //
			}
	
			else{														//Populate family map
																		//
				var data_and_meta = line.split('//');

				var data_part = data_and_meta[0],
					meta;

				if (data_and_meta.length === 2){
					meta = data_and_meta[1]
				}

				var people_info = data_part.substring(0,start_extract-1).trim().split(/\s+/).map(toInt),
					haplo_daaaa = data_part.substring(start_extract).trim().split(/\s+/).map(toInt);
					
				if (start_extract === -1){ // Never found end of headers
					people_info = haplo_daaaa;
				}
				
				var haplo_info = new Allele(haplo_daaaa);
					
				if (num_alleles_markers === -1){
					num_alleles_markers = haplo_info.data_array.length;
				}
				else{
					assert(num_alleles_markers == haplo_info.data_array.length,
						"Number of alleles do not match previous records: Line "+ l+ "!");
				}

				var fam = people_info[0], id  = people_info[1],
					pat = people_info[2], mat = people_info[3],
					sex = people_info[4], aff = people_info[5];
	
				var pers = new Person(id, sex, aff, mat, pat);
				familyMapOps.insert(pers, fam);
	
				family_map[fam][id].haplo_data.push( haplo_info );		//retrieves twice if needed, neater

				family_map[fam][id].stored_meta = meta;					// Holds graphics, name, other meta

			}
		}
	}
	
	if (type === "pedfile"){
		
		splitHeaderFromData();
		
	}

	else if (type === "allegro"){

		function handleHeaders(){
			var count_markers = 0;                              //Process header lines --> Transpose matrix
			//
			for (var col=start_extract; col < header_lines[0].length; col++){
				var col_string = "";

				for (var row=header_lines.length; row > 0 ;){
					col_string += header_lines[--row][col];
				}

				col_string = col_string.trim();

				if (col_string!=="") {
// 					marker_map[col_string] = count_markers++;
					marker_array.push( col_string );
				}

			}
// 			assert(Object.keys(marker_map).length === num_alleles_markers,
// 				   "Marker map length does not match with haplo data: "
// 				   + Object.keys(marker_map).length +" and " + num_alleles_markers);
		};
		
		splitHeaderFromData();
		handleHeaders();

		// Set HAP_DRAW_LIM to length of markers if dealing with a small set
		if (marker_array.length-1 < HAP_DRAW_LIM){
			HAP_DRAW_LIM = marker_array.length - 1;
		}
    }

    else if (type === "other"){}
}


function determineFileType(text_unformatted)
{
	var text = text_unformatted.split('\n'),
		texlen = text.length;

	if (texlen > 10){ texlen = 10; }
	
	for (var l=0; l < texlen; l++){ // Just read first 10 lines

		var pedpart = text[l].split('//')[0].trim()

		var tokes = pedpart.split(/\s+/)
		
		if (tokes.length === 6){
			return "pedfile";
		}
	}
	
	
	var num_tokes = {}
	for (var l=text.length-1; l >= text.length - 5; l--){
		if (text[l].length < 1){continue;}
		var tokes = text[l].split(/\s+/)
		
		var nums = tokes.length
		num_tokes[nums] = 0;
	}
	if (Object.keys(num_tokes).length === 1){
		return "allegro";
	}
	
	return "other";
}

function processFile() {
    var file = document.getElementById("file_upload").files[0];

    var lr = new FileReader();

    lr.onloadend = function(e){
		document.getElementById("buttons").style.display = 'none'
		
		var type = determineFileType(e.target.result)
		console.log(type);

		//Save to local storage
		localStorage.setItem(localStor.data_save, e.target.result)
		localStorage.setItem(localStor.data_type, type)

		processInput(e.target.result, type);
		init();

    };
    lr.readAsText(file);
}
