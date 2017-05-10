
var Pedfile = {

	__tmpfamdata : {}, // fid --> stored position
	
	import: function(text_unformatted){

		var text = text_unformatted.split('\n');

		var fid_graphics = {}; // swap the graphics stuff for the serialparse method later.

		for (var l=0; l< text.length; l++)
		{
			var line = text[l];
	
			if (line.length < 5 ){continue};

			debugger

			// family lines first
			if (line.startsWith("////")){
				var fid_gfx = line.split("////")[1].split('\t');
				fid_graphics[fid_gfx[0]] = JSON.parse(fid_gfx[1]);
				continue;
			}

			// Split in to Data and Metadata parts		
			var data_and_meta = line.split('//');

			//Handle Person info
			var data_part = data_and_meta[0];
			var people_info = data_part.trim().split(/\s+/).map(x => Number(x));

			var fam = people_info[0], id  = people_info[1],
				pat = people_info[2], mat = people_info[3],
				sex = people_info[4], aff = people_info[5];

			var pers = new Person(id, sex, aff, mat, pat);
			familyMapOps.insertPerc(pers, fam);

			// Handle Meta
			if (data_and_meta.length === 2){
				var meta = JSON.parse(data_and_meta[1])

				// Holds graphics, person's name, other meta
				familyMapOps.getPerc(id,fam).stored_meta = meta;
			}
		}

		// Family meta
		for (var fid in fid_graphics){
			var pos = fid_graphics[fid];
			Pedfile.__tmpfamdata[fid] = pos;  // passed onto init_graph
		}
	},

	exportToTab: function(store_graphics){
		exportToTab(Pedfile.export(store_graphics));
	},


	export: function(store_graphics)
	{
		var text = "";


		// Family-header specific 
		if (store_graphics)
		{
			var fid_array = []
			uniqueGraphOps.foreachfam(function(fid,fam_group){
				fid_array.push( "////" + fid +'\t' + JSON.stringify(fam_group.group.getAbsolutePosition()) );
			});
			text += fid_array.join('\n');
		}

		// Person specific
		familyMapOps.foreachperc(function(pid, fid, perc){

			var array = [
				fid, 
				perc.id, 
				perc.father.id || 0, 
				perc.mother.id || 0, 
				perc.gender, perc.affected
			]

			if (store_graphics){
				var gfx = uniqueGraphOps.getNode(pid, fid);

				if (gfx===-1 || gfx.graphics === null){
					console.log("[Error]", pid,fid,"does not have any graphics...");
				}
				else {
					var meta = gfx.graphics.getPosition();
					meta.name = perc.name

					array.push( "//", JSON.stringify(meta));
				}
			}
			text += "\n"+ array.join('\t');
		});

		return text;	
	},


	pedigreeChanged: function(){
		var current_pedigree = Pedfile.export(true), /* local saves _always_ store graphics */
			stored_pedigree = localStorage.getItem(localStor.ped_save);

//		console.log("current", current_pedigree);
//		console.log("stored", stored_pedigree);

		if (current_pedigree.trim().length < 1){
			return false;
		}

		if (stored_pedigree == null){
			return true;
		}

		if (current_pedigree !== stored_pedigree){
			return true;
		}
		return false;
	},
}