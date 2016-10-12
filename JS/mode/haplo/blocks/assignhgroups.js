

var AssignHGroups = {

	resolvers : {
		ASTAR : 0,    // default
		DESCENT : 1,  // Simwalk  (1 2 1 2 1 2)
		FLOW : 2 	  // Merlin   (A B C D E F)
	},

	// First pass -- assign groups
	init: function(resolver_method = 0)
	{

		var resolveBlocks = AssignHGroups.__setResolverMethod(resolver_method);

		GlobalLevelGrid.foreachfam(function(grid, fam){
			// First generation must be founders
			var founder_gen = grid[0];

			for (var p = 0; p < founder_gen.length; p++){
				AssignHGroups.initFounderAlleles( fam, founder_gen[p]);
			}

			for (var g = 1; g < grid.length; g++){
				for (var p =0; p < grid[g].length; p++)
				{
					var pers_id = grid[g][p],
						pers    = familyMapOps.getPerc(pers_id, fam);

					var moth_id = pers.mother.id,
						fath_id = pers.father.id;

					if (moth_id == undefined){
						// Person is a founder -- add and skip
						AssignHGroups.initFounderAlleles( fam, pers_id );
						continue;
					}

					var moth = familyMapOps.getPerc(moth_id, fam),
						fath = familyMapOps.getPerc(fath_id, fam);

					resolveBlocks(pers, moth, fath, fam);
				}
			}
			AssignHGroups.pointerCleanup(fam);
		});

		// Flow determines founder allele groups directly
		if (resolver_method === AssignHGroups.resolvers.FLOW)
		{
			FlowResolver.initFounderAlleles();
		}

		FounderColor.makeUniqueColors();
	},

	__setResolverMethod: function(resolver){

		var resolverMethod = null;

		switch(resolver){
			case AssignHGroups.resolvers.ASTAR:
				console.log("Resolve: ASTAR");
				resolverMethod = AstarHandler.child2parent_link;
				break;

			case AssignHGroups.resolvers.DESCENT:
				console.log("Resolve: DESCENT");
				resolverMethod = DescentResolver.child2parent_link;
				break;

			case AssignHGroups.resolvers.FLOW:
				console.log("Resolve: FLOW");
				resolverMethod = FlowResolver.child2parent_link;
				break;

			default:
				throw new Error("Invalid resolver mode :" + resolver);
		}
		return resolverMethod;
	},


	// Only used by Astar and Descent resolvers
	initFounderAlleles: function(fid,id)
	{

		var perc_hdata = familyMapOps.getPerc(id,fid).haplo_data;

		for (var a = 0; a < perc_hdata.length; a++) 	// current allele
		{			
			var color_group = FounderColor.hgroup.length;

			// Push the same guy twice for both alleles
			// Different colors (indices) will refer to the same (duplicated) id
			FounderColor.hgroup.push( id );					

			/*
			This is the color group. If it just pointed to it's data, then only a 0 1 or 2 would propogate down through
			the pedigree. Which would be MEANINGLESS, since we want to trace specific colors to individuals.

			Only founders get unique ones. Non-founders simply trace these from their parents.
			*/
			var	allele_ptrs = perc_hdata[a].pter_array;

			for (var i=0; i < allele_ptrs.length; i++){
				allele_ptrs[i].color_group = [color_group];
			}


			allele_ptrs.unique_groups = [color_group];
	// 		console.log("founder "+id+" "+a, allele_ptrs[0].color_group, perc_hdata[a].data_array[0]);
		}
		// console.log("Cf", id, AssignHGroups,debugHaploData(perc_hdata));
	},

	debugHaploData: function(dat){
		return { 0: dat[0].debug(),
				 1: dat[1].debug()};
	},


	pointerCleanup: function(fam)
	{
		familyMapOps.foreachperc(function(pid, perc){
			var both_alleles = perc.haplo_data;

			for (var a = 0; a < both_alleles.length; a++)
			{
				//Clean pointers
				var pointer_array =  both_alleles[a].pter_array;
				var group_array = (both_alleles[a].haplogroup_array = new Int8Array(pointer_array.length));

				// 64-bit iterator, yet implicit 64 --> 8 bit conv: How? Fuck knows.

				var curr_index = -1;
				while (++curr_index < pointer_array.length) {
					group_array[curr_index] = pointer_array[curr_index].color_group[0];
				}

				// Leave for GC
//				delete both_alleles[a].pter_array;
//				delete both_alleles[a].descent;
//				delete both_alleles[a].flow
			}
		}, fam);
	}
}



