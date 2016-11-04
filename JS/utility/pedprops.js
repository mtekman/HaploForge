
var HaploPedProps = {

	xlinked: null,
	dominant: null,

	// Affecteds in each generation --> dominant
	// if males have one allele --> sexlinked (easy):
	//      if males have two alleles, but one of them is always zero --> sexlinked
	//
	// extra (unnecesary) checks:
	//      if dominant and male-to-male transmission --> autosomal
	//      if recessive and males are hemizygous and not all females are affected --> sexlinked

	// We assume that all pedigrees are on the same chromosome -- pick the largest to examine.

	init: function(hookfunc = null)
	{
		PedProps.connectAll();

		// Genehunter can infer genders at this stage
		if(hookfunc !== null){
			hookfunc();
		}

		HaploPedProps._populateGraphics(); /*Maybe doesn't need to be in this class, but MUST be after _connectAll */

		var fam_id = HaploPedProps._largestPedigree();

		HaploPedProps.dominant = HaploPedProps._determineDominant(fam_id);
		HaploPedProps.xlinked  = HaploPedProps._determineXlinked(fam_id);

		if (HaploPedProps.xlinked){
			HaploPedProps._correctAllMaleAlleles();
		}

		utility.notify("Pedigree", 
			 (HaploPedProps.xlinked?"X-Linked":"Autosomal") 
			+ " "
			+(HaploPedProps.dominant?"Dominant":"Recessive")
		);

	},

	_largestPedigree : function(){
		var max_memb=0, max_fam=0;

		familyMapOps.foreachfam(function(fid){
			var num_memb = familyMapOps.numPercs(fid);

			if (num_memb > max_memb){
				max_memb = num_memb;
				max_fam = fid;
			}
		});
		return max_fam;
	},

	_determineXlinked : function singleAlleleMale(fam_id){
		var all_zero_Ychroms = 0;
		var num_males_checked = 0;

		var num_males_with_single_allele = 0;

		familyMapOps.foreachperc(function(perc_id, perc){
			var skip_uninformative = false;

			//Determine if Y allele is zero for ALL males (not just one)
			if ( perc.gender == PED.MALE ){
				if (perc.haplo_data.length == 1)
					num_males_with_single_allele ++;

				else {
					var num_all_zero_alleles = 0;

					for (var a=0; a < perc.haplo_data.length; a++){
						var all_zeroes = true;

						for (var i=0; i < perc.haplo_data[a].data_array.length; i++ ){
							if (perc.haplo_data[a].data_array[i] !== 0){
								all_zeroes = false;
								break;
							}
						}
						if (all_zeroes){
							num_all_zero_alleles ++;
						}
					}
					if (num_all_zero_alleles === 2){ // skip this guy, completely uninformative
						skip_uninformative = true;  
					}
					else{
						all_zero_Ychroms += num_all_zero_alleles;					
					}
				}
				if (!skip_uninformative){
					num_males_checked ++;
				}
			}			
		}, fam_id);

		if (num_males_with_single_allele === num_males_checked){return true};
		if (all_zero_Ychroms === num_males_checked){return true};
		if (num_males_with_single_allele + all_zero_Ychroms === num_males_checked){return true};

		return false;
	},


	_determineDominant: function checkAffectedsInGens(fam_id)
	{
		var affected_in_each_gen = 0,
			num_gens = GlobalLevelGrid.numGens(fam_id);

		GlobalLevelGrid.foreachgeneration(fam_id, function(indivs_in_gen){
			var affecteds_in_gen = 0;

			for (var p=0; p < indivs_in_gen.length; p++){
				var perc_id = indivs_in_gen[p],
					perc = familyMapOps.getPerc(perc_id,fam_id);

				if (perc.affected === PED.AFFECTED){
					affecteds_in_gen ++;
				}
			}
			if (affecteds_in_gen > 0){ affected_in_each_gen ++ };
		});

		return affected_in_each_gen === num_gens;
	},


	_correctAllMaleAlleles: function addZeroAllele_for_sexlinkedMales()
	{
		familyMapOps.foreachperc(function(pid, fid, perc)
		{
			if (perc.gender === PED.MALE && perc.haplo_data.length === 1)
			{
				var len_of_allele = perc.haplo_data[0].data_array.length,
					new_allele = [];

				for (var i=0; i < len_of_allele ; i++){
					new_allele.push(0);
				}

				perc.haplo_data.push(new Allele(new_allele))
			}
		});
	},


	_populateGraphics: function populateGrids_and_UniqueObjs() {

		console.groupCollapsed("Populate Graphics")

		//First root indiv for each family -- all members must be connected!
		familyMapOps.foreachfam(function(fam_id){

			//Populate gridmap and uniq map		
			var nodes_edges = (new GraphicsLevelGrid(fam_id, null)).getMap();
			var generation_array = GlobalLevelGrid.getGrid(fam_id);

	//		console.log( generation_array, uniq_objs);

			//Insert into global maps
			uniqueGraphOps.insertFam(fam_id, null);
			uniqueGraphOps.getFam(fam_id).nodes = nodes_edges.nodes;
			uniqueGraphOps.getFam(fam_id).edges = nodes_edges.edges;

			GlobalLevelGrid.updateGrid(fam_id, generation_array);


			// Check if root tree contains ALL individuals
			var num_peeps = familyMapOps.numPercs(fam_id),
				num_nodes = -1; // skip 0 indiv	

			for (var node in nodes_edges.nodes){num_nodes ++;}


			if (num_nodes !== num_peeps){
				console.log("[Warning] Family "+fam_id
					+" has only mapped "+num_nodes
					+" individuals out of "
					+ num_peeps
				);

				// This is where we need to manually insert the 
				//  other non-connected individuals

				familyMapOps.foreachperc(function(perc_id, perp){
					if (!(perc_id in nodes_edges.nodes)){
				
						// Restore meta
						if (typeof perp.stored_meta !== "undefined"){
							console.log("using stored meta", perc_id, perp.stored_meta);
							var meta = perp.stored_meta;

							uniqueGraphOps.insertNode(perc_id, fam_id, null);

							// This is complicated -- essentially the pedigree in haplo view and pedcreate have
							// different onclick functions, so I need to actually iterate through the pedigree
							// manually for each person and set their graphics that way.
							//  Basically ._populateGraphics only should apply to haploview mode and I need
							// to create my own way of parsing saved pedigrees.
							
							console.log("HERE", perp.stored_meta);
							delete perp.stored_meta;
						}
					}
				}, fam_id);
			}
		});
		console.groupEnd();
	}
}


var PedProps = {

	connectAll: function connectAllIndividuals()
	{
		familyMapOps.foreachperc(function(id,famid, new_root)
		{
			//Assign father and mother to actual people
			var pers_father = 0, pers_mother = 0;

			if (new_root.father != 0) {
				pers_father = familyMapOps.getPerc(new_root.father, famid);

				new_root.father = pers_father;         // Add father to child
				pers_father.addChild(new_root);   // And child to father
			}

			if (new_root.mother != 0){
				pers_mother = familyMapOps.getPerc(new_root.mother,famid);

				new_root.mother = pers_mother;         // Add mother to child
				pers_mother.addChild(new_root);   // And child to mother
			}

			if (pers_father != 0 )                     //Add parents as mates to each other
				if(pers_mother != 0) pers_father.addMate(pers_mother);
				else pers_father.addMate(0);

			if (pers_mother !=0 )
				if(pers_father != 0) pers_mother.addMate(pers_father);
				else pers_mother.addMate(0);
		});
	}
}



//function readInP