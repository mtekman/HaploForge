var hgroup_colors = {}; // fam_id --> [founder_id], where array index = color/group

var zero_color_grp = -1,
	null_color_grp = -2;

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
//  	console.log("founder "+id);
}





/*  Links non-founders to founders via parents. Potentially unphased, no error-checking at this stage

	Some assumptions:
	- Founder pointers are already set (for founders)
	- Always two alleles
	- Paternal allele is first, and maternal is second.
*/
function child2parent_link(pers, moth, fath)
{
	var pers_hp = pers.haplo_data,
		moth_hp = moth.haplo_data,
		fath_hp = fath.haplo_data,
		gender = pers.gender;


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

		var a0_pr = fath_hp[0].pter_array[tmp_i].color_group,
			a1_pr = fath_hp[1].pter_array[tmp_i].color_group,
			a2_pr = moth_hp[0].pter_array[tmp_i].color_group,
			a3_pr = moth_hp[1].pter_array[tmp_i].color_group;


// 		if (a0_pr === undefined || a1_pr === undefined
// 			|| a2_pr === undefined || a3_pr === undefined)

		if (a0_ht === 0) a0_pr = zero_color_grp;
		if (a1_ht === 0) a1_pr = zero_color_grp;
		if (a2_ht === 0) a2_pr = zero_color_grp;
		if (a3_ht === 0) a3_pr = zero_color_grp;


// 		if (a0_ht === a1_ht  && a1_ht === a2_ht	&& a2_ht === a3_ht  && a3_ht === 0) continue;

		var m1_ht = pers_hp[0].data_array[tmp_i],  				// X allele
			m2_ht = pers_hp[1].data_array[tmp_i];  				// Y allele

		var m1_pr = pers_hp[0].pter_array[tmp_i].color_group,
			m2_pr = pers_hp[1].pter_array[tmp_i].color_group; 	// Y pointer

		if (m1_pr.length !== 0 ){
			console.log("m1_pr not [], for "+pers.id+" @ "+tmp_i, m1_pr);
			throw new Error("");

		}

		if (m2_pr.length !== 0 ){
			console.log("m2_pr not [], for "+pers.id+" @ "+tmp_i, m2_pr);
			throw new Error("");
		}


		/* -- Sex-linked and male scenario:
   		 Assuming XY and XX are alleles 0 1 2 3;
		  female: 0{2,3} = 02 03
		    male: 1{2,3} = 12 13
		 */
		if (SEXLINKED && gender === 1){ 						 // Sexlinked and male

			m2_pr.push( a1_pr );	 // No ambiguity there

			if (m1_ht === a2_ht) m1_pr.push( a2_pr );  // Maternal set both
			if (m1_ht === a3_ht) m1_pr.push( a3_pr );

			continue;
		}

		/* -- Autosomal or female scenario
		with the condition that the opposing allele must be chosen from the remaining sister pair:
		e.g: {0,1}{2,3} = 02 03 12 13
		 */
		if (m1_ht === a0_ht){ 						   // Add 0
			m1_pr.push( a0_pr )

			if (m2_ht === a2_ht) m2_pr.push( a2_pr );  // 02 scen;
			if (m2_ht === a3_ht) m2_pr.push( a3_pr );  // 03 scen;
		}

		if (m1_ht === a1_ht){ 						  // Add 1
			m1_pr.push( a1_pr )

			if (m2_ht === a2_ht) m2_pr.push( a2_pr ); // 12 scen;
			if (m2_ht === a3_ht) m2_pr.push( a3_pr ); // 13 scen;
		}

		//Set -1's to non-ambiguous (set)
		if (m1_pr[0] === zero_color_grp){
			var all_zero = true;
			for (var z = 0; z < m1_pr.length; z++)
				if (m1_pr[z] !== zero_color_grp){
					all_zero = false;
					break;
				}
			if (all_zero)
				while (m1_pr.length !==1) m1_pr.pop();
		}

		if (m2_pr[0] === zero_color_grp){
			var all_zero = true;
			for (var z = 0; z < m2_pr.length; z++)
				if (m2_pr[z] !== zero_color_grp){
					all_zero = false;
					break;
				}
			if (all_zero)
				while (m2_pr.length !==1) m2_pr.pop();
		}




	}

// 	if (pers.id === 7652){
// 		for (var y= 1090; y <= 1110; y++)
// 			console.log("7652 after @ "+y,
// 						pers_hp[0].data_array[y],
// 						pers_hp[1].data_array[y],
// 						pers_hp[0].pter_array[y].color_group,
// 						pers_hp[1].pter_array[y].color_group);
// 		throw new Error("stop");
// 	}


}



// First pass -- assign groups
function assignHGroups()
{
	for (var fam in generation_grid_ids) {

		// First generation must be founders
		var founder_gen = generation_grid_ids[fam][0];

		for (var p = 0; p < founder_gen.length; p++)
			initFounderAlleles( fam, founder_gen[p] )


		for (var g = 1; g < generation_grid_ids[fam].length; g++){
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

				var moth = family_map[fam][moth_id],
					fath = family_map[fam][fath_id];

				child2parent_link(pers, moth, fath);
				console.log("alleles for "+pers_id, pers.haplo_data);
			}
		}
		console.log("hgroups fam =" + fam);
		removeAmbiguousPointers(fam);

	}

	copyPointersAndClean(fam);

// 	console.log("colors=", hgroup_colors);
}



