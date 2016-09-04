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
class ProcessInput {

	constructor(text_unformatted, type = null){

		this.text = text_unformatted.split('\n');

		this._num_alleles_markers = -1; // number of alleles and markers should match
		this._header_lines = [];
		this._start_extract = -1;

		this.type = type;
		console.log("given type", type);
		if (type === null){
			this.type = this._determineFileType();			
		}
		console.log("File Type = ", this.type)
		
		this._init();
	}

	_init()
	{
		// Flush all maps
		PersistData.clearMaps();

	
		if (this.type === FORMAT.PEDFILE){
			this.splitHeaderFromData();		
		}

		else if (this.type === FORMAT.HAPLO.ALLEGRO)
		{
			this.splitHeaderFromData();
			this.handleAllegroHeaders();

			// Set HAP_DRAW_LIM to length of markers if dealing with a small set
			if (marker_array.length-1 < HAP_DRAW_LIM){
				HAP_DRAW_LIM = marker_array.length - 1;
			}
    	}
	    else {} // other formats TODO
	}


	splitHeaderFromData(){
		// Handle haplo data
		for (var l=0; l< this.text.length; l++){
			var line = this.text[l];
	
			if (line.length < 5 ){continue};
	
			if (line.substr(0,1) === " ") {                             //Temp store header data
				this._start_extract = line.lastIndexOf("    ") +4;            //
				this._header_lines.push(line);                                //
				continue;
			}
	

			// Split in to Data and Metadata parts
			var data_and_meta = line.split('//');


			//Populate family map
			//
			var data_part = data_and_meta[0];

			var people_info = data_part.substring(0,this._start_extract-1).trim().split(/\s+/).map(x => Number(x)),
				haplo_daaaa = data_part.substring(this._start_extract).trim().split(/\s+/).map(x => Number(x));

				
			if (this._start_extract === -1){ // Never found end of headers
				people_info = haplo_daaaa;
			}

			//Handle Person info
			var fam = people_info[0], id  = people_info[1],
				pat = people_info[2], mat = people_info[3],
				sex = people_info[4], aff = people_info[5];

			var pers = new Person(id, sex, aff, mat, pat);
			familyMapOps.insertPerc(pers, fam);


			// Handle HaploData (where applicable)
			if (this.type === FORMAT.HAPLO.ALLEGRO){
		
				var haplo_info = new Allele(haplo_daaaa);
				
				if (this._num_alleles_markers === -1){
					this._num_alleles_markers = haplo_info.data_array.length;
				}
				else{
					assert(this._num_alleles_markers == haplo_info.data_array.length,
						"Number of alleles do not match previous records: Line "+ l+ "!");
				}
	
				familyMapOps.getPerc(id,fam).haplo_data.push( haplo_info );		//retrieves twice if needed, neater
			}

			// Handle Meta
			if (data_and_meta.length === 2){
				var meta = data_and_meta[1]
				familyMapOps.getPerc(id,fam).stored_meta = meta;					// Holds graphics, person's name, other meta
			}
		}
	}

	handleAllegroHeaders(){
		var count_markers = 0;                              //Process header lines --> Transpose matrix
		//
		for (var col=this._start_extract; col < this._header_lines[0].length; col++){
			var col_string = "";

			for (var row=this._header_lines.length; row > 0 ;){
				col_string += this._header_lines[--row][col];
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
	}

	_determineFileType()
	{
		var text = this.text,
			texlen = text.length;

		if (texlen > 10){ texlen = 10; }
		
		for (var l=0; l < texlen; l++){ // Just read first 10 lines

			var pedpart = text[l].split('//')[0].trim()

			var tokes = pedpart.split(/\s+/)
			
			if (tokes.length === 6){
				return FORMAT.PEDFILE;
			}
		}
		
		var num_tokes = {}
		for (var l=text.length-1; l >= text.length - 5; l--)
		{
			if (text[l].length < 1){
				continue;
			}

			var tokes = text[l].split(/\s+/)
			
			var nums = tokes.length
			num_tokes[nums] = 0;
		}

		if (Object.keys(num_tokes).length === 1){
			return FORMAT.HAPLO.ALLEGRO;
		}	
		return FORMAT.UNKNOWN;
	}
}

