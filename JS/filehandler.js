//"Reads the haplofile, maps the markers to array indices, and populates pedigree array with persons"
function processInput(text_unformatted, type)
{
    var text = text_unformatted.split('\n');

    var num_alleles_markers = -1;   // number of alleles and markers should match

    if (type === "allegro")
    {
        var header_lines = [],
            start_extract = -1

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
                    haplo_info = line.substring(start_extract).trim().split(/\s+/).map(toInt);

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
                    num_alleles_markers = haplo_info.length;
                else
                    assert(num_alleles_markers == haplo_info.length,
                           "Number of alleles do not match previous records: Line "+ l+ "!");
            }
        }

        var count_markers = 0;                              //Process header lines --> Transpose matrix
                                                            //
        for (var col=start_extract; col < header_lines[0].length; col++){
            var col_string = "";

            for (var row=header_lines.length; row > 0 ;)
                col_string += header_lines[--row][col];

            col_string = col_string.trim();

            if (col_string!=="") marker_array.push(col_string);
        }
        assert(marker_array.length == num_alleles_markers,
               "Marker map length does not match with haplo data: "
               + marker_array.length+" and " + num_alleles_markers);
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
        graphInitPos(nodeSize + 10,30);
		console.log(unique_graph_objs);
    };
    lr.readAsText(file);


}
