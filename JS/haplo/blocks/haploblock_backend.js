var hgroup_colors = {}; // fam_id --> [founder_id], where array index = color/group


function initFounderAlleles( fid, id )
{
	// Add founder to color group.
	if (!(fid in hgroup_colors))
		hgroup_colors[fid] = [];



	var perc_hdata = family_map[fid][id].haplo_data;

	for (var a = 0; a < perc_hdata.length; a++) 			// current allele
	{
		hgroup_colors[fid].push( id ); 						// Push the same guy twice for both alleles
															// Different colors (indices) will refer to the same (duplicated) id

		var color_group = hgroup_colors[fid].length;
		/*
		This is the color group. If it just pointed to it's data, then only a 0 1 or 2 would propogate down through
		the pedigree. Which would be MEANINGLESS, since we want to trace specific colors to individuals.

		Only founders get unique ones. Non-founders simply trace these from their parents.
		*/



		var	allele_ptrs = perc_hdata[a].pter_array; 		// [array of m pointers (for m markers)]

		for (var i=0; i < allele_ptrs.length; i++)
			allele_ptrs[i].color_group = color_group;

	}

	console.log("founder "+id, perc_hdata);
}



/*  Links non-founders to founders via parents. Potentially unphased, no error-checking at this stage

	Some assumptions:
	- Founder pointers are already set (for founders)
	- Always two alleles
	- Paternal allele is first, and maternal is second.
*/
function child2parent_link(pers_hp, moth_hp, fath_hp, gender)
{
	assert(pers_hp[0].data_array.length === moth_hp[0].data_array.length
	    && pers_hp[0].data_array.length === fath_hp[0].data_array.length
		&& pers_hp[1].data_array.length === moth_hp[1].data_array.length
		&& pers_hp[1].data_array.length === fath_hp[1].data_array.length, "Allele lengths dont match");

	var tmp_i = 0;

	while (tmp_i++ < pers_hp[0].data_array.length - 1)
	{
		// Each persons allele is one of four possible parental alleles (autosomal)
		var a0_ht = fath_hp[0].data_array[tmp_i],
			a1_ht = fath_hp[1].data_array[tmp_i],  // Y allele, potential pitfall here -- input rows either follow a specific XY order, or need to do postproc.
			a2_ht = moth_hp[0].data_array[tmp_i],
			a3_ht = moth_hp[1].data_array[tmp_i];

		if (a0_ht === a1_ht && a1_ht === a2_ht && a2_ht === a3_ht  && a3_ht === 0) continue; // Skip dead markers

		var a0_pr = fath_hp[0].pter_array[tmp_i].color_group,
			a1_pr = fath_hp[1].pter_array[tmp_i].color_group,
			a2_pr = moth_hp[0].pter_array[tmp_i].color_group,
			a3_pr = moth_hp[1].pter_array[tmp_i].color_group;


		/* -- Sex-linked and male scenario:
   		 Assuming XY and XX are alleles 0 1 2 3;
		  female: 0{2,3} = 02 03
		    male: 1{2,3} = 12 13
		 */
		if (SEXLINKED && gender === 1){ 						 // Sexlinked and male
			var x_ht = pers_hp[0].data_array[tmp_i],
				y_ht = pers_hp[1].data_array[tmp_i];

			var x_pr = pers_hp[0].pter_array[tmp_i].color_group,
				y_pr = pers_hp[1].pter_array[tmp_i].color_group;

// 			x_pr = []; 							  // initialised here I guess

			y_pr = [ a1_pr ];	 // No ambiguity there


			if (x_ht === a2_ht) x_pr.push( a2_pr );  // Maternal set both
			if (x_ht === a3_ht) x_pr.push( a3_pr );


			if (x_pr.length > 1)
				console.log("Ambiguous1");

			continue;
		}

		/* -- Autosomal or female scenario
		with the condition that the opposing allele must be chosen from the remaining sister pair:
		e.g: {0,1}{2,3} = 02 03 12 13
		 */
		var m1_ht = pers_hp[0].data_array[tmp_i],
			m2_ht = pers_hp[1].data_array[tmp_i];

		var m1_pr = pers_hp[0].pter_array[tmp_i].color_group,
			m2_pr = pers_hp[1].pter_array[tmp_i].color_group;

		if (m1_ht === a0_ht){ 						   // Add 0
			m1_pr.push( a0_pr )

			if (m2_ht === a2_ht) m2_pr.push( a2_pr );  // 02 scen;
			if (m2_ht === a3_ht) m2_pr.push( a3_pr );  // 03 scen;

			if (m2_pr.length > 1)
				console.log("Ambiguous2", m2_pr, a0_ht, a1_ht, a2_ht, a3_ht);

		}

		if (m1_ht === a1_ht){ 						  // Add 1
			m1_pr.push( a1_pr )

			if (m2_ht === a2_ht) m2_pr.push( a2_pr ); // 12 scen;
			if (m2_ht === a3_ht) m2_pr.push( a3_pr ); // 13 scen;

// 			if (m2_pr.length > 1)
// 				console.log("Ambiguous3", m2_ht, a0_ht, a1_ht, a2_ht, a3_ht);
		}
		// Possible to get 4 pointers for m2_ht
	}
}







// First pass -- assign groups
function assignHGroups()
{
	for (var fam in generation_grid_ids) {

		// First generation must be founders
		var founder_gen = generation_grid_ids[fam][0];

		for (var p = 0; p < founder_gen.length; p++)
			initFounderAlleles( fam, founder_gen[p] )



		for (var g = 1; g < generation_grid_ids[fam].length; g++)
		{
			for (var p =0; p < generation_grid_ids[fam][g].length; p++)
			{
				var pers_id = generation_grid_ids[fam][g][p],
					pers    = family_map[fam][pers_id];

				var moth_id = pers.mother.id,
					fath_id = pers.father.id;

				// Person is a founder -- add and skip
				if (moth_id == undefined){
					initFounderAlleles( fam, pers_id );
					continue;
				}

				var pers_hp = pers.haplo_data,
					moth_hp = family_map[fam][moth_id].haplo_data,
					fath_hp = family_map[fam][fath_id].haplo_data;

				child2parent_link(pers_hp, moth_hp, fath_hp,
								  pers.gender);    	// needed for sexlinked
			}
		}
		console.log("hgroups fam =" + fam);
// 		console.log(founder_allele_map);
	}
	console.log(hgroup_colors);
}

//Second pass -- expand ambiguous indices
function removeAmbi(){

}





