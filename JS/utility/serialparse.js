
var SerialParse = {

	Marker: {
		import : function(string){
			var rs_gp = string.split('|');

			MarkerData.rs_array = rs_gp[0].split("rs_array:")[1].trim().split(",");
			MarkerData.gp_array = rs_gp[1].split("gp_array:")[1].trim().split(",");	
		},

		export : function(){
			return "rs_array:"+ MarkerData.rs_array.join(",")
				+ '|'
				+ "gp_array:" + MarkerData.gp_array.join(",");
		}
	},

	HGroups: {
		import : function(string){
			var un_hg = string.split('|');

			FounderColor.unique = JSON.parse(un_hg[0]);
			FounderColor.hgroup = JSON.parse(un_hg[1]);
		},

		export : function(){
			return JSON.stringify(FounderColor.unique)
				+ '|' + JSON.stringify(FounderColor.hgroup);
		}
	},
	
	// Fam + Graphics
	Person : {
		import : function(string){
			var tokens = string.split(",");

			var id = parseInt(tokens[0]),
				mother_id = parseInt(tokens[1]),
				father_id = parseInt(tokens[2]),
				gender = parseInt(tokens[3]),
				affected = parseInt(tokens[4]),
				name = tokens[5] === "null"?null:tokens[5].trim(),
				graphics = {x:Number(tokens[6]),y:Number(tokens[7])};

			var person = new Person(id, gender, affected, mother_id, father_id, name);
			var haplo_data = SerialParse.Alleles.import( tokens[8].trim() );

			person.stored_meta = graphics;

			person.insertHaploData(haplo_data[0].data);
			person.setHaplogroupArray(haplo_data[0].haplo);
			person.insertHaploData(haplo_data[1].data);
			person.setHaplogroupArray(haplo_data[1].haplo)

			return person;
		},

		export : function(id, fam){

			var person = familyMapOps.getPerc(id, fam),
				graphx = uniqueGraphOps.getNode(id, fam).graphics;

			return [person.id,
				person.mother.id||0,
				person.father.id||0,
				person.gender,
				person.affected,
				person.name||"null",
				graphx.getX(),
				graphx.getY(),
				SerialParse.Alleles.export(person),
				].join(",");
		}	
	},

	Alleles : {
		import : function(string){
			var tokens = string.split("%");

			return {
				0: {
					data : tokens[0].split(" ").map(x => Number(x)),
					haplo: tokens[1].split(" ").map(x => Number(x))
				},
				1: {
					data : tokens[2].split(" ").map(x => Number(x)),
					haplo: tokens[3].split(" ").map(x => Number(x))
				}
			}
		},

		export : function(person){
			return person.haplo_data[0].data_array.join(" ")
			 +"%"+ person.haplo_data[0].haplogroup_array.join(" ")
			 +"%"+ person.haplo_data[1].data_array.join(" ")
			 +"%"+ person.haplo_data[1].haplogroup_array.join(" ");
		}
	},


	// Fam + Graphics
	All : {

		_delims : {
			begin : "::",
			marker : "$$",
			fidsep : "|",
			colors : "&&",
		},

		export: function()
		{
			var outstring = ""

			familyMapOps.foreachperc(function(pid, fid)
			{
				outstring += fid + SerialParse.All._delims.fidsep
					+ SerialParse.Person.export(pid, fid)
					+ '\n';
			});

			uniqueGraphOps.foreachfam(function(fid, famgroup)
			{
				var grfx = famgroup.group;

				outstring += SerialParse.All._delims.begin
					+ fid + SerialParse.All._delims.fidsep
					+ grfx.getX()
					+ ","
					+ grfx.getY()
					+ '\n';
			});

			outstring += SerialParse.All._delims.marker + SerialParse.Marker.export();
			outstring += '\n' + SerialParse.All._delims.colors + SerialParse.HGroups.export();

			return outstring;
		},

		import: function(famstring){
			var lines = famstring.split('\n');

			console.groupCollapsed("Serial Parse Import")

			for (var l=0; l < lines.length; l++){
				var line = lines[l];

				if (line.startsWith(SerialParse.All._delims.marker)){
					var data = line.split(SerialParse.All._delims.marker)[1];
					SerialParse.Marker.import(data);
				}

				else if (line.startsWith(SerialParse.All._delims.colors)){
					var data = line.split(SerialParse.All._delims.colors)[1];
					SerialParse.HGroups.import(data);
				}

				else if (line.startsWith(SerialParse.All._delims.begin)){
					// Fam data
					var fid_graphics = line.split(SerialParse.All._delims.begin)[1]
						.split(SerialParse.All._delims.fidsep);

					var fid = Number(fid_graphics[0]),
						graphics = fid_graphics[1].split(",").map(Number);

					var fam_group = addFamily(fid, graphics[0], graphics[1]);

					uniqueGraphOps.insertFam(fid, fam_group);
					// familyMapOps.insertFam is performed automatically at person level.
				}


				else {
					// Person data
					var fid_perc = line.split(SerialParse.All._delims.fidsep);

					var fid  = Number(fid_perc[0]),
						perc = fid_perc[1].trim();

					var person = SerialParse.Person.import(perc);

					familyMapOps.insertPerc(person, fid);
				}
			}
			console.groupEnd();
		}
	}
}
