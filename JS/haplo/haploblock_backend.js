
var haplo_blocks = {}; // fam_id --> [b1,b2,b3,b4,b5,b6]


var founder_allele_map = {}; 	// fam_id --> founder_id --> [haplo]
var founder_allele_groups = {}; // fam_id --> founder
// Everyone else's alleles are built from these



function longestCommon(alle1, alle2) {
	assert(alle1.length === alle2.length, "Arrays must be of equal length");

	var found_sequences = {}; // length: {s_i, f_i} }

	var s_i = 0,
		f_i = 0,
		t_i = 0;

	var sequence_started = false;

	while (t_i < alle1.length) {
		if ( alle1[t_i] === alle2[t_i] ){
			if (!sequence_started) s_i = t_i;

			sequence_started = true;

		} else {
			if (sequence_started){
				f_i = t_i;
				sequence_started = false;

				var rez = {start:s_i, end:f_i};
				found_sequences[f_i - s_i]= rez;
			}
		}
		t_i++;
	}

	if (sequence_started){
		f_i = t_i;
		var rez = {start:s_i, end:f_i};
		found_sequences[f_i - s_i]= rez;
	}

	return found_sequences;
}


var hgroups = {'f0':0, 'f1':1, 'm0':2, 'm1':3};


function child2parent_pointer( pers_hp ,moth_hp, fath_hp, gender){
	/* pseudo

	Non-founder alleles should ALWAYS reference a founder allele.
	This is done by checking data with parent data and pushing the pointer.

	Might be good to replace hgroups with the founder allele group.

	Questions:
	 - How to populate founder allele groups?
	 - What values do they take (index or id)?
	 - How are they referenced? (map or array?)
	 - How to set parental founhder alleles if they're founders. -- INIT STAGE

	*/
}



/* All triplets who are pushed into this function, at least one of them is not a founder (pers_hp).
   I think the idea here is to push founder alleles designations down from founders to non-founders.

   So founders should be given their own groups, and instead of adding hgroups to each non-founder, a specific founder allele designation is given
   which is stored in the parents .data field.


*/
function child2parent_link(pers_hp, moth_hp, fath_hp, gender)
{
	assert( pers_hp.length === moth_hp.length
		   && pers_hp.length === fath_hp.length, "Allele lengths dont match");

	var tmp_i = 0;

	while (tmp_i++ < pers_hp.length)
	{
		// Each persons allele is one of four possible parental alleles (autosomal)
		var a0 = fath_hp[0][tmp_i].data,
			a1 = fath_hp[1][tmp_i].data,  // Potential Y allele
			a2 = moth_hp[0][tmp_i].data,
			a3 = moth_hp[1][tmp_i].data;

		/* Sex-linked and male scenario:
  		   Assuming XY and XX are alleles 0 1 2 3;
		     female: 0{2,3} = 02 03
		       male: 1{2,3} = 12 13
		 */
		if (SEXLINKED && gender === 1){
			var x_all = pers_hp[0][tmp_i],
				y_all = pers_hp[1][tmp_i];

			y_all.hgroup = [ hgroups['f1'] ]; 							// No ambiguity there

			x_all.hgroup = x_all.hgroup || [];

			if (x_all.data === a2) x_all.hgroup.push( hgroups['m0'] );  // Maternal set both
			if (x_all.data === a3) x_all.hgroup.push( hgroups['m1'] );

			continue;
		}

		/* Autosomal or female scenario
		with the condition that the opposing allele must be chosen from the remaining sister pair:
		e.g: {0,1}{2,3} = 02 03 12 13
		 */
		var my_a1 = pers_hp[0][tmp_i],
			my_a2 = pers_hp[1][tmp_i];

		my_a1.hgroup = my_a1.hgroup || [];
		my_a2.hgroup = my_a2.hgroup || [];

		if (my_a1.data === a0){ 										// Add 0
			my_a1.hgroup.push( hgroups['f0'] )

			if (my_a2.data === a2) my_a2.hgroup.push( hgroups['m0'] ); // 02 scen;
			if (my_a2.data === a3) my_a2.hgroup.push( hgroups['m1'] ); // 03 scen;
		}


		if (my_a1.data === a1){ 										// Add 1
			my_a1.hgroup.push( hgroups['f1'] )

			if (my_a2.data === a2) my_a2.hgroup.push( hgroups['m0'] ); // 12 scen;
			if (my_a2.data === a3) my_a2.hgroup.push( hgroups['m1'] ); // 13 scen;
		}
	}
}



function addFounderAlleles( fid, id ){
	var perc = family_map[fid][id];

	if (!( fid in founder_allele_map))
		founder_allele_map[fid] = {}

	founder_allele_map[fid][id] = perc.haplo_data;
}




// First pass -- assign groups
function assignHGroups()
{
	for (var fam in generation_grid_ids) {

		// First generation must be founders
		var founder_gen = generation_grid_ids[fam][0];
		for (var p = 0; p < founder_gen.length; p++)
		{
			addFounderAlleles( fam, founder_gen[p] )
		}


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
					addFounderAlleles( fam, pers_id );
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
}

//Second pass -- expand ambiguous indices
function removeAmbi(){

}





