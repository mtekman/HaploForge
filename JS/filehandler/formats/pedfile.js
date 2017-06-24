
var Pedfile = {

	__tmpfamdata : {}, // fid --> stored position
	
	import: function(text_unformatted){

		var text = text_unformatted.split('\n');

		var fid_graphics = {}; // swap the graphics stuff for the serialparse method later.

		for (var l=0; l< text.length; l++)
		{
			var line = text[l];
	
			if (line.length < 5 ){continue};

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

	sanity_check: function(){
		let unrelated = {}; //
		let checked = {}; // key of checked pairs

		familyMapOps.foreachfam(function(fid,fam_group){
			familyMapOps.foreachperc(function(pid1, fid, perc1){
				familyMapOps.foreachperc(function(pid2, fid, perc2)
				{
					if (pid1 === pid2){ return };

					if (!(fid in checked)){
						checked[fid] = {};
					}

					if (!(pid1 in checked)){
						checked[fid][pid1] = {}
					}

					if (!(pid2 in checked)){
						checked[fid][pid2] = {}
					}

					if (checked[fid][pid1][pid2] || checked[fid][pid2][pid1]){ return	};

					checked[fid][pid1][pid2] = true;
					checked[fid][pid2][pid1] = true;

					let res = familyMapOps.areConnected(fid, pid1, pid2);
					if (!res){
						if (!(fid in unrelated)){
							unrelated[fid] = {}
						}
						if (!(pid1 in unrelated[fid])){
							unrelated[fid][pid1] = {}
						}
						if (!(pid2 in unrelated[fid])){
							unrelated[fid][pid2] = {}
						}
						unrelated[fid][pid1][pid2] = true;
						unrelated[fid][pid2][pid1] = true;
					}
				});
			}, fid);
		});

		// Go through unrelated connections and single out the main targets.
		let mentions = {};

		for (var fid in unrelated){
			mentions[fid] = {};
			for (var id1 in unrelated[fid]){

				let targets = unrelated[fid][id1];
				for (var targ in targets){
					if (!(targ in mentions[fid])){
						mentions[fid][targ] = 0
					}
					mentions[fid][targ] += 1				
				}
			}
		}

		return mentions;
	},

	exportToTab: function(store_graphics){
		exportToTab(Pedfile.export(store_graphics));
	},


	export: function(store_graphics)
	{
		let allconnected = Pedfile.sanity_check();
		console.log(allconnected, Object.keys(allconnected), Object.keys(allconnected) > 0);

		if (Object.keys(allconnected).length > 0){
			utility.yesnoprompt(
				"Unconnected Individuals Detected",
				"These will be truncated from the pedigree. Continue with save?",
				"Yes", function(){},
				"No", function(){
					return -1;					
				}
			);
		}

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
		familyMapOps.foreachperc(function(pid, fid, perc)
		{
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