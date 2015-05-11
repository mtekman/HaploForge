

function findDOSinSelection(selection_map){

	// Replace this as the main argument, if generations are not needed....
	var selection_map_map = {}; // This is an actual map, no generations
	
	for (var fam in selection_map){
		selection_map_map[fam] = {};
		for (var g=0; g < selection_map[fam].length; g ++){
			for (var i=0; i < selection_map[fam][g].length; i++){
				var indiv_id = selection_map[fam][g][i];
				selection_map_map[fam][indiv_id] = 1;
			}
		}
	}

	var fam_lines = {}; // sib_map for each family, holds total lines to be drawn.

	for (var fam in selection_map){
		var num_diff_gens = selection_map[fam].length -1;

		var sib_map = {}; //stores line data for each sibgroup, regardless of generation

		for (var g=num_diff_gens; g >= 0; g--)
		{
			var current_gen = selection_map[fam][g];

			// 1. Make sib groups
			var sib_groups = {};	// indivs sharing same immediate parents

			for (var i1 = 0; i1 < current_gen.length; i1 ++){
				var id = current_gen[i1],
				perc = family_map[fam][id];

				// Only Non-founders can be sibs
				var fm_key;
				if (perc.father !== 0){
					fm_key = perc.father.id+"_"+perc.mother.id;
				}
				else {
					//Founders are in their own sibgroups
					fm_key = perc.id;					
				}
				sib_groups[fm_key] = sib_groups[fm_key] || [];
				sib_groups[fm_key].push(perc);
			}

			console.log("sib_groups", sib_groups);


			// if (g === 0) continue;
			// Don't need to scan up if no higher order members are selected

			// 2. Recurse up for relations
			for (var sgr in sib_groups){
				var perc = sib_groups[sgr][0]; // only need first in each parental group
				var root = perc;

				// Maps to reduce duplicate lines
				var matelines = {},
				directlines = {};
				// siblines = []; // not needed, there's only one
				
				// Populates matelines and directlines, does not return anything.
				var search = function recurseParents(root, level)
				{
					// console.group();
					// console.log(level+": ",root.id)


					if (root === 0) {
						// console.log("returning -1");
						// console.groupEnd();
						return -1;
					}

					if (root.id !== perc.id){

						if (root.id in selection_map_map[fam]){
							// console.log("MATCH for", root.id);
							// console.groupEnd();
							return {
								id: root.id,
								dos: level
							};
						}
					}


					var moth_rez = recurseParents(root.mother, level + 1),
						fath_rez = recurseParents(root.father, level + 1);

					//If the connected at the same level, then check if they're mates.
					if (moth_rez !== -1 && fath_rez !== -1)
					{
						var are_mates = false;

						if (moth_rez.dos === fath_rez.dos){
							var moth_perc = family_map[fam][moth_rez.id];

							for (var m=0; m < moth_perc.mates.length; m++){
								if (fath_rez.id === moth_perc.mates[m].id){
									are_mates = true;
									break;
								}
							}
						}

						if (are_mates) {
							// Push as a single connection
							console.log("adding mateline for", root.id)
							matelines[fath_rez.id+"_"+moth_rez.id] = moth_rez.dos;
						} else {
							// Push as seperate connectors
							directlines[moth_rez.id] = moth_rez.dos;
							directlines[fath_rez.id] = fath_rez.dos;
						}
					}

					else if (moth_rez !== -1) directlines[moth_rez.id] = moth_rez.dos;
					else if (fath_rez !== -1) directlines[fath_rez.id] = fath_rez.dos;

					// console.groupEnd();
					return -1;
				}

				search( root, 0 );

				console.log("sib_groups[sgr]", sib_groups[sgr]);

				if (!(g in sib_map)){
					sib_map[g] = {};
				}

				var sib_key = sib_groups[sgr][0].id;

				// Add the others if more than one sibs in group
				if (!(sib_groups[sgr].length === 1))
				{
					for (var i=1; i < sib_groups[sgr].length; i++){
						sib_key += "_"+sib_groups[sgr][i].id;
					}
				}

				if (!( isEmpty(matelines) && isEmpty(directlines))){
					sib_map[g][sib_key] = {
						matelines: matelines,
						directlines: directlines
					};
				}
			}

			// Essentially map2OrderedArray, but nested version
			// -- only occurence here
			var sib_map2 = [];
			for (var k in sib_map){
				var empty= true;
				for (var kk in sib_map[k]){
					if (!( isEmpty( sib_map[k][kk] ) )) {
						empty = false;
						break;
					}
				}
				if (!empty)
					sib_map2.push(sib_map[k])
			}

			fam_lines[fam] = sib_map2;
		}
	}
	return fam_lines
}