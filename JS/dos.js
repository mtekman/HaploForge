
degrees_of_sep = {}; // fam --> id1 --> id2 --> num
/* 
num: {
	 0: sibs,
	 1: 1 gen up mother/father,
	 2: 2 gen up grand mother/father
	 3: 3 gen up ...
	-1: no immediate relation, try:
	    
};

*/

function findDOSinSelection(selection_map){
	/*Start with bottom gens
	  queue_gen_array = [[],[],[]]
	  
	  Start at bottom of array (lowest gen level)

	  For each level in the array:

		  1. Grab current level individuals

		  2. Find sibs (by a single check to see if parents match):
				*! add a sibline and join each sib to it
				Take one sib from each sibgroup to be used in search

		  3. For each sibgroup:

			 Forward search up parental lines. 
			 If a match is found:
			  *!  note the num gens.
			  *!  add a line specification connecting parentline to subline

			 If reached top, stop search for this sibgroup

		   4. move up generation in queue_gen_array
		   */

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

		for (var g=num_diff_gens; g >= 0; g--){
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


			if (g === 0) continue;
			// Don't need to scan up if no higher order members are selected

			// 2. Recurse up for relations
			for (var sgr in sib_groups){
				var perc = sib_groups[sgr][0]; // only need first in each parental group
				var root = perc;

				var matelines = [],
				directlines = [];
				// siblines = []; // not needed, there's only one
				
				// Populates matelines and directlines, does not return anything.
				var search = function recurseParents(root, level)
				{
					console.group();
					console.log(level+": ",root.id)


					if (root === 0) {
						console.log("returning -1");
						console.groupEnd();
						return -1;
					}

					if (root.id !== perc.id){

						if (root.id in selection_map_map[fam]){
							console.log("MATCH for", root.id);
							console.groupEnd();
							return {
								id: root.id,
								dos: level
							};
						}
					}

					// for (var gen=g; gen >=0 ; gen--){
					// 	for (var ite=0; ite < selection_map[fam][gen].length; ite++){
					// 		if (root.id === selection_map[fam][gen][ite]){
					// 			console.log("MATCH");
					// 			return {
					// 				id: root.id,
					// 				dos: level
					// 			};
					// 		}
					// 	}
					// }

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
							matelines.push({
								dos:moth_rez.dos, 
								moth:moth_rez.id, 
								fath:fath_rez.id });

						} else {
							// Push as seperate connectors
							directlines.push({
								dos:moth_rez.dos,
								to: moth_rez.id
							});

							directlines.push({
								dos:fath_rez.dos,
								to: fath_rez.id
							});
						}
					}

					else if (moth_rez !== -1){
						directlines.push({
							dos:moth_rez.dos,
							to: moth_rez.id
						});
					}
					else if (fath_rez !== -1){
						directlines.push({
							dos:fath_rez.dos,
							to: fath_rez.id
						});
					}

					console.groupEnd();
					return -1;
				}

				search( root, 0 );

				var sib_key = Object.keys(sib_groups[sgr]).reduce( function(a,b){ return a+"_"+b;});
				
				sib_map[sib_key] = { 
					matelines: matelines,
					directlines: directlines
				};
			}
			fam_lines[fam] = sib_map;
		}
	}
}