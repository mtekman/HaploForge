//Requires LineReader to be loaded first, make sure this is the case in index.html

function HaploData(file, format) {
	//"Reads the haplofile, maps the markers to array indices, and populates pedigree array with persons"
    var family_map = {}; // fam_id ---> pedigree map --> person
    var marker_map = {}; // rs_id --> array index across allele data

    if (format === "Allegro") {
        
        //For some reason parseInt wont work properly as a lambda map function.... wtf?
        function toInt(arg){return parseInt(arg);}
        
        var header_lines = [],
            start_extract = -1;
        
        var lr = new FileReader();
        var text;
//        lr.onload = function(e){
//            text = e.target.result.split('\n');
//        };
        lr.onloadend = function(e){
            text = e.target.result;
        };
        lr.readAsText(file);
        lr.close();
        
        alert(text);

        for (var line in text){
//            alert(line);
            
            if (line.substr(0,1) === " ") {
                start_extract = line.lastIndexOf("    ") +4;
                header_lines.push(line.slice(1,6));
            }        
            else
            {
                var people_info = line.substring(0,start_extract-1).trim().split(/\s+/).map(toInt), 
                    haplo_info = line.substring(start_extract).trim().split(/\s+/).map(toInt);
                        
                var fam = people_info[0], 
                    id = people_info[1],
                    pat = people_info[2],
                    mat = people_info[3],
                    sex = people_info[4],
                    affect = people_info[5];

                //sanity check
                if (!(fam in family_map))
                    family_map[fam] = {};
            
                if (!(id in family_map[fam])){
                    var pers = new Person(id, sex, affect, mat, pat);
                    family_map[fam][id] = pers;                    
                }

                //Retrieves twice if necc, but neater
                family_map[fam][id].haplo_data.push( haplo_info );
                //console.log(family_map[fam][id])
            }
        }
                
        console.log(header_lines);
//        console.log(family_map);    
    }
    
    console.log(header_lines);
    for (var l=0; l< 10; l++){
        console.log(header_lines[l]);
    }
}

function processFile() {
    var file = document.getElementById("file_upload").files[0],
        type = "Allegro";
    
    HaploData(file, type);
}