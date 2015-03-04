var hgroup_colors = {}; // fam_id --> [founder_id], where array index = color/group


function initFounderAlleles( fid, id ){
	var perc_hdata = family_map[fid][id].haplo_data; // {data:, hgroup:, founder_allele:}

	// Add founder to color group.
	if (!(fid in hgroup_colors))
		hgroup_colors[fid] = [];

	hgroup_colors[fid].push( id );


	for (var i=0; i < perc_hdata.length; i++)
		perc_hdata[i].founder_pointer = hgroup_colors[fid].length; // index is color group
		/*
		This is the color group. If it just pointed to it's data, then only a 0 1 or 2 would propogate down through
		the pedigree. Which would be MEANINGLESS, since we want to trace specific colors to individuals.

		Only founders get unique ones. Non-founders simply trace these from their parents.

		*/

}



/*  Links non-founders to founders via parents. Potentially unphased, no error-checking at this stage

	Some assumptions:
	- Founder pointers are already set (for founders)
	- Paternal allele is first, and maternal is second.
*/
function child2parent_link(pers_hp, moth_hp, fath_hp, gender)
{
	assert( pers_hp.length === moth_hp.length
		   && pers_hp.length === fath_hp.length, "Allele lengths dont match");

	var tmp_i = 0;

	while (tmp_i++ < pers_hp.length)
	{
		// Each persons allele is one of four possible parental alleles (autosomal)
		var a0 = fath_hp[0][tmp_i],
			a1 = fath_hp[1][tmp_i],  // Y allele, potential pitfall here -- input rows either follow a specific XY order, or need to do postproc.
			a2 = moth_hp[0][tmp_i],
			a3 = moth_hp[1][tmp_i];

		/* -- Sex-linked and male scenario:
  		Assuming XY and XX are alleles 0 1 2 3;
		  female: 0{2,3} = 02 03
		    male: 1{2,3} = 12 13
		 */
		if (SEXLINKED && gender === 1){ 						 // Sexlinked and male
			var x_all = pers_hp[0][tmp_i],
				y_all = pers_hp[1][tmp_i];

			x_all.founder_pointer = x_all.founder_pointer || []; // We use arrays because phase might not be clear
																 // But it should be after linkage, no?

			y_all.founder_pointer = [ a1.founder_pointer ];		 // No ambiguity there


			if (x_all.data === a2.data) x_all.founder_pointer.push( a2.founder_pointer );  // Maternal set both
			if (x_all.data === a3.data) x_all.founder_pointer.push( a3.founder_pointer );


// 			if (x_all.founder_pointer.length > 1)
// 				console.log("Ambiguous1", pers_hp.parent, x_all);

			continue;
		}

		/* -- Autosomal or female scenario
		with the condition that the opposing allele must be chosen from the remaining sister pair:
		e.g: {0,1}{2,3} = 02 03 12 13
		 */
		var my_a1 = pers_hp[0][tmp_i],
			my_a2 = pers_hp[1][tmp_i];

		my_a1.founder_pointer = my_a1.founder_pointer || [];
		my_a2.founder_pointer = my_a2.founder_pointer || [];

		if (my_a1.data === a0.data){ 										// Add 0
			my_a1.founder_pointer.push( a0.founder_pointer )

			if (my_a2.data === a2.data) my_a2.founder_pointer.push( a2.founder_pointer ); // 02 scen;
			if (my_a2.data === a3.data) my_a2.founder_pointer.push( a3.founder_pointer ); // 03 scen;

// 			if (my_a2.founder_pointer.length > 1)
// 				console.log("Ambiguous2", pers_hp.parent, my_a2, a0, a1, a2, a3);

		}

		if (my_a1.data === a1.data){ 										// Add 1
			my_a1.founder_pointer.push( a1.founder_pointer )

			if (my_a2.data === a2.data) my_a2.founder_pointer.push( a2.founder_pointer ); // 12 scen;
			if (my_a2.data === a3.data) my_a2.founder_pointer.push( a3.founder_pointer ); // 13 scen;

// 			if (my_a2.founder_pointer.length > 1)
// 				console.log("Ambiguous3", pers_hp.parent, my_a2, a0, a1, a2, a3);

		}
		// Possible to get 4 pointers for my_a2
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





