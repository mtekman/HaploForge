/* This should be replaced with a method that literally scans each allele against each
 other allele:

 */

 /* It would then be a matter of plotting affecteds and unaffected scores on seperate side of the marker
 	Hmm, no - hom and compound het can be performed in the same pass for any number of alleled individuals
 	Problem is resolving single het for multiple alleles, which is doable, but:

 	  -- Would need to track working indexes for all alleles, and perform an A* search either
 	  	 for every ambiguous index (precise, kludge), or for the entire damn search (easier, not optimal).
 	  
 	  -- Aim would be to minimize the number of allele transitions (no, not crossovers...) across an entire
 	     chromosome, splitting appropriately for each pre-established founder allele group (block proc
 	     until init).

 	It would then be a matter of plotting affecteds and unaffected scores on seperate side of the marker
 	scale axis, and adding a toggle to change between modes. Some issues though:

 	  -- Initial processing would take some time on low gfx setups (Kinetic vs WebCL )
	  -- Small or single marker stretches of homology would be under-represented on the marker scale
	     -- Propose (yet another) zoom tool to highlight such regions? Or a text widget to iterate and
	        focus on each block...? Fuck knows, jump that bridge later.
*/
var singleHetHomolgy = function(){
	var allele_ids_ordered = [], // Lookup array - affecteds + unaffecteds
		affected_alleles = [],
		unaffected_alleles = [];


	var previous_indexes = {}; // Checked/updated for every ambiguous haplotype

	for (var m=0; m++ < num_markers;){

		var active_indexes = [],
			global_ht = -1

		for (var a_a = 0; a_a++ < affected_alleles.length;){

			var ht = affected_alleles[a_a][m];

			if (global_ht=== -1) global_ht = ht;

			if (global_ht === ht) active_indexes.push(a_a);
		}

		// indexes populated, check overlap

		for(var ol=0; ol++ < previous_indexes.length){
			if (previous_indexes[ol] !== active_indexes[ol])
			{

			}
		}
		
	}

}







 	for (var i=0; i++ < affecteds.length;){
 		var indiv1 = affecteds[i],
			indiv1_alleles = affected_alleles[indiv1];

		for (var i1a =0; i1a++ < indiv1_alleles.length;)
		{
			var current_indiv1_allele = indiv1_alleles[i1a]
	
			for (var j=i+1; j++ < affecteds.length)
			{
				var indiv2 = affecteds[j],
					indiv2_alleles = affected_alleles[indiv2];

				// Current allele for indiv1, iterating over all indiv2
				//
				var hom_regions_for_i1a_to_i2all = {}; // Score --> [allele, hom_regions]

				for (var i2a=0; i2a++ < indiv2_alleles.length;)
				{
					var current_indiv2_allele = indiv2_alleles[i2a]

					var hom_regions = [],
						homology_score = 0;

					var homology_started = false,
						temp_hom_region = new Array(2);

					// Begin checking allele vs allele
					for (var m=0; m++ < num_markers;)
					{
						var ht1 = current_indiv1_allele[m],
							ht2 = current_indiv2_allele[m];

						if (ht1 === ht2){
							if (!homology_started){
								homology_started = true;
								temp_hom_region[0] = m;
							}
						} else {
							if (homology_started){
								homology_started = false;
								temp_hom_region[1] = m-1;

								hom_regions.push( temp_hom_region );
								homology_score += temp_hom_region[1] - tmp_hom_region[0];

								temp_hom_region = new Array(2);
							}
						}
					}

					// Hom_regions_populated
					if (!(homology_score in hom_regions_for_i1a_to_i2all)){
						hom_regions_for_i1a_to_i2all[homology_score] = [];
					}

					hom_regions_for_i1a_to_i2all[homology_score].push({
						regions:hom_regions,
						allele: i2a,
						affected_indiv: j
					});
				}

				// Here we've compared indiv1's single allele to all of indiv2's
			}


 		for allele 



*/

function scan_alleles_for_homology( ids_to_scan ){

	var affected_alleles = [],
		unaffected_alleles = [];

	// Sort alleles into groups of affecteds and unaffecteds
	//   Affecteds are checked for homology, and subtracted against unaffecteds
	for (var i=0; i < ids_to_scan.length; i++)
	{
		var fid_id = ids_to_scan[i].split('_'),
			fid = fid_id[0], 
			id = fid_id[1];

		var perc_affected = (family_map[fid][id].affected == 2),
			perc_haplo_data = family_map[fid][id].haplo_data;

		var data_only = [];

		for (var a=0; a < perc_haplo_data.length; a++){
			data_only.push(perc_haplo_data[a].data_array)
		}

		if(perc_affected){
			affected_alleles.push(data_only)
		} else {
			unaffected_alleles.push(data_only);
		}
	}

	console.log(affected_alleles);


	// Begin processing
	var num_markers = marker_array.length,
		min_marker_stretch = 2;

	var het_started = false,
		tmp_het_region = new Uint8Array(2),
		hom_started = false,
		tmp_hom_region = new Uint8Array(2);

	// First just pass over affecteds ands find regions of het and hom
	var hom_region_scores  = new Uint8Array(num_markers),
		het_region_scores  = new Uint8Array(num_markers),
		chet_region_scores = new Uint8Array(num_markers);

	for (var m=0; m < num_markers; m++)
	{
		// These need to be state maps...
		var hom_allele_global = -1,					// 11 11
			hom_at_marker_score = 0;

		var het_at_marker_score = 0;

		var het_allele_global_h1 = -1,
			het_allele_global_h2 = -1,				// 12 12 
			chet_at_marker_score = 0;

		for (var afs = 0; afs < affected_alleles.length; afs++) 		// Iterate over group
		{
			// Fuckit just assume two alleles per patient
			var ht1 = affected_alleles[afs][0][m],
				ht2 = affected_alleles[afs][1][m];

			var perc_is_hom_at_marker = (ht1 === ht2);

			if (perc_is_hom_at_marker)
			{				
				if (hom_allele_global === -1)
					hom_allele_global = ht1;
				
				else if (hom_allele_global === ht1){
					hom_at_marker_score += 1
				}
			}

			else {
				// Chet 
				if (chet_allele_global_h1 === -1){
					chet_allele_global_h1 = ht1;
					chet_allele_global_h2 = ht2;
				}

				else if (
					   ((chet_allele_global_h1 === ht1) && (chet_allele_global_h2 === ht2))
					|| ((chet_allele_global_h2 === ht1) && (chet_allele_global_h1 === ht2))
				){
					chet_at_marker_score += 1
				}

				else if {
					()
				}


			}


			if (!(perc_is_hom_at_marker)){
				// Chet allele

			}



			for (var all=0; all < affected_alleles[afs].length; all++)	// Iterate over individual alleles
			{
				var ht = affected_alleles[afs][all][m];

				// Hom check at allele level
				if (hom_allele_local === -1) hom_allele_local = ht;
				else if (hom_allele_local !== ht){
					// Chet allele
					perc_is_hom_at_marker = false;
					het_alleles_local[ht] = 1;
				}
			}

			// Hom check at individual level
			if (perc_is_hom_at_marker)
			{
				if (hom_allele_global === -1)
					hom_allele_global = hom_allele_local;
				else if (hom_allele_local !== hom_allele_global){
					all_are_hom_at_marker = false;

					// Het checking goes here, because it should not overlap with purely hom regions
					for (het in het_alleles_local)
					{
						if (!(het in chet_allele_global)){
							chet_allele_global[het] = 0;
						}
						chet_allele_global[het] += 1; // add 
					}


				}




			}
			// else {
				// all_are_hom_at_marker = false;
			// }

			// Het storage -- requires outside processing
			het_alleles_global.push( het_alleles_local );
		}

		// Het check at group level (outside processing step)
		// TODO
		// This is hard.
		// het_started = false;

	

		// Hom check at group level
		if (hom_started){
			if (!all_are_hom_at_marker){ // End search
				tmp_hom_region[1] = m - 1;
				hom_regions.push(tmp_hom_region);
				
				tmp_hom_region = new Uint8Array(2);
				hom_started = false
			}
			// Otherwise carry on
		}
		else {
			if (all_are_hom_at_marker){ // New search
				tmp_hom_region[0] = m;
				hom_started = true;
			}
		}
	}

	// var check_array = [];
	// for (var i=0; i < hom_regions.length; i++){
	// 	var entry = hom_regions[i];
	// 	check_array.push( [marker_array[entry[0]], marker_array[entry[1]]] )
	// }

	// console.log("hom_regions", check_array);
	// console.log("hom_regions", hom_regions);
}




var homology_selection_mode = function()
{
	// Main selection layer
	var sub_select_group = new Kinetic.Group({
		x:0, y:0,
		width: stage.getWidth(),
		height: stage.getHeight()
	});

	sub_select_group.add(new Kinetic.Rect({
			x:0, y:0,
			width: stage.getWidth(),
			height: stage.getHeight(),
			fill: 'black',
			strokeWidth: 0,
			opacity: 0.2
	}));

	sub_select_group.add(addButton("Submit Selection", 0, 0,
		function()
		{
			var selected_for_homology = [];
		
			for (var s in selection_items){
				if (selection_items[s].selected){
					selected_for_homology.push(s);
				}
			}

			sub_select_group.destroyChildren();
			sub_select_group.destroy();

			haplo_layer.draw();

			scan_alleles_for_homology( selected_for_homology );
		}
	));


	
	for (var fid in unique_graph_objs){
		for (var node in unique_graph_objs[fid].nodes)
		{
			if (node == 0) continue;

			var key = fid+"_"+node

			var gfx = unique_graph_objs[fid].nodes[node].graphics,
				pos = gfx.getAbsolutePosition(),
				bounder = addBounder(pos, key, false);

			// By default not enabled
			selection_items[key] = {
				box:bounder,
				selected:false,
				graphics: gfx
			};
			sub_select_group.add(bounder);
		}
	}

	haplo_layer.add(sub_select_group);
	sub_select_group.setZIndex(20);
	haplo_layer.draw();
}