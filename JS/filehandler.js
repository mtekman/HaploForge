// Each locus in each person's allele has {data} and a {founder pointer}
var Allele = function(data){
	this.data_array = new Int8Array(data);
	this.pter_array = [];
	// points to the founder allele group (retrieved from parent, and recursively points to founder allele group)

	//In order to pass pointers, I need to add properties to color_groups
	for (var i=0; i < data.length; i++)
		this.pter_array.push( {color_group: []} ); 	//Array due to phase ambiguity

	this.haplogroup_array;
	// ^ Empty until pter_array is completely unambiguous, where pter_array is then deleted (dereferenced, left for GC)
};

Allele.prototype.debug = function(){
	return {
		data: this.data_array,
		groups: this.pter_array.map(function (n){return ""+n.color_group+"";})
	};
};



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

    if (type === "allegro")
    {
        var header_lines = [],
            start_extract = -1


		function handleHeaders(){
			var count_markers = 0;                              //Process header lines --> Transpose matrix
			//
			for (var col=start_extract; col < header_lines[0].length; col++){
				var col_string = "";

				for (var row=header_lines.length; row > 0 ;)
					col_string += header_lines[--row][col];

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


		// Handle haplo data
		for (var l=0; l< text.length; l++){
            var line = text[l];

            if (line.length < 5 ) continue;

            if (line.substr(0,1) === " ") {                             //Temp store header data
                start_extract = line.lastIndexOf("    ") +4;            //
                header_lines.push(line);                                //
            }

			else{                                                        //Populate family map
            	                                                         //
                var people_info = line.substring(0,start_extract-1).trim().split(/\s+/).map(toInt),
                    haplo_daaaa = line.substring(start_extract).trim().split(/\s+/).map(toInt),
					haplo_info = new Allele(haplo_daaaa);



                var fam = people_info[0], id  = people_info[1],
                    pat = people_info[2], mat = people_info[3],
                    sex = people_info[4], aff = people_info[5];

                if (!(fam in family_map)) family_map[fam] = {};         //sanity check...

                if (!(id in family_map[fam])) {
                    var pers = new Person(id, sex, aff, mat, pat);
                    family_map[fam][id] = pers;
                }

                family_map[fam][id].haplo_data.push( haplo_info );      //retrieves twice if needed, neater

                if (num_alleles_markers === -1)
                    num_alleles_markers = haplo_info.data_array.length;
                else
                    assert(num_alleles_markers == haplo_info.data_array.length,
                           "Number of alleles do not match previous records: Line "+ l+ "!");
            }
        }

		handleHeaders();

		// Set HAP_DRAW_LIM to length of markers if dealing with a small set
		if (marker_array.length-1 < HAP_DRAW_LIM)
			HAP_DRAW_LIM = marker_array.length - 1;

    }

    else if (type === "Other"){}
}


function processFile() {
    var file = document.getElementById("file_upload").files[0],
        type = "allegro";

    var lr = new FileReader();

    lr.onloadend = function(e){
        processInput(e.target.result, type);
        connectAllIndividuals();
        populateGrids_and_UniqueObjs();
        graphInitPos(nodeSize + 10, grid_rezY);

		assignHGroups();
		washMarkerMap();

		document.getElementById("buttons").style.display = 'none'
    };
    lr.readAsText(file);
}
