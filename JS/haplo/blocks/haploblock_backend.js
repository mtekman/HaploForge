// Founder color groups are unique, even across families

var hgroup_colors = [], // [founder_id], where array index = color/group
	unique_colors = []; // [color --> hex]

var zero_color_grp = -1;

function initFounderAlleles( fid, id )
{
	var perc_hdata = family_map[fid][id].haplo_data;

	for (var a = 0; a < perc_hdata.length; a++) 	// current allele
	{
		var color_group = hgroup_colors.length;
		hgroup_colors.push( id );					// Push the same guy twice for both alleles
													// Different colors (indices) will refer to the same (duplicated) id
		/*
		This is the color group. If it just pointed to it's data, then only a 0 1 or 2 would propogate down through
		the pedigree. Which would be MEANINGLESS, since we want to trace specific colors to individuals.

		Only founders get unique ones. Non-founders simply trace these from their parents.
		*/
		var	allele_ptrs = perc_hdata[a].pter_array; 		// [array of m pointers (for m markers)]

		for (var i=0; i < allele_ptrs.length; i++)
			allele_ptrs[i].color_group = [color_group];

// 		console.log("founder "+id+" "+a, allele_ptrs[0].color_group, perc_hdata[a].data_array[0]);
	}
}





function pushAll(from, to){
// 	console.log("called", from, to);
	for (var j=0; j < from.color_group.length; j++){
		if (to.color_group.indexOf( from.color_group[j] )==-1)
			to.color_group.push( from.color_group[j] );
	}
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

	var tmp_i = -1;

	while (++tmp_i < pers_hp[0].data_array.length)
	{
		// Each persons allele is one of four possible parental alleles (autosomal)
		var a0_ht = fath_hp[0].data_array[tmp_i],
			a1_ht = fath_hp[1].data_array[tmp_i],  // Y allele, potential pitfall here -- input rows either follow a specific XY order, or need to do postproc.
			a2_ht = moth_hp[0].data_array[tmp_i],
			a3_ht = moth_hp[1].data_array[tmp_i];

		var a0_pr = fath_hp[0].pter_array[tmp_i],
			a1_pr = fath_hp[1].pter_array[tmp_i],
			a2_pr = moth_hp[0].pter_array[tmp_i],
			a3_pr = moth_hp[1].pter_array[tmp_i];


// 		if (a0_pr === undefined || a1_pr === undefined
// 			|| a2_pr === undefined || a3_pr === undefined)

		if (a0_ht === 0) a0_pr.color_group = [zero_color_grp];
		if (a1_ht === 0) a1_pr.color_group = [zero_color_grp];
		if (a2_ht === 0) a2_pr.color_group = [zero_color_grp];
		if (a3_ht === 0) a3_pr.color_group = [zero_color_grp];


// 		if (a0_ht === a1_ht  && a1_ht === a2_ht	&& a2_ht === a3_ht  && a3_ht === 0) continue;

		var m1_ht = pers_hp[0].data_array[tmp_i],  				// X allele
			m2_ht = pers_hp[1].data_array[tmp_i];  				// Y allele

		var m1_pr = pers_hp[0].pter_array[tmp_i],
			m2_pr = pers_hp[1].pter_array[tmp_i]; 	// Y pointer

		if (m1_pr.color_group.length !== 0 ){
			console.log("m1_pr not [], for "+pers.id+" @ "+tmp_i, m1_pr);
			throw new Error("");

		}

		if (m2_pr.color_group.length !== 0 ){
			console.log("m2_pr not [], for "+pers.id+" @ "+tmp_i, m2_pr);
			throw new Error("");
		}


		/* -- Sex-linked and male scenario:
   		 Assuming XY and XX are alleles 0 1 2 3;
		  female: 0{2,3} = 02 03
		    male: 1{2,3} = 12 13
		 */
		if (SEXLINKED && gender === 1){ 						 // Sexlinked and male

			pushAll(a1_pr,m2_pr);	 // No ambiguity there

			if (m1_ht === a2_ht) pushAll(a2_pr, m1_pr); // Maternal set both
			if (m1_ht === a3_ht) pushAll(a3_pr, m1_pr);

			continue;
		}

		/* -- Autosomal or female scenario
		with the condition that the opposing allele must be chosen from the remaining sister pair:
		e.g: {0,1}{2,3} = 02 03 12 13
		 */
		if (m1_ht === a0_ht){ 						   // Add 0
			pushAll(a0_pr, m1_pr);

			if (m2_ht === a2_ht) pushAll(a2_pr, m2_pr);// 02 scen;
			if (m2_ht === a3_ht) pushAll(a3_pr, m2_pr);// 03 scen;
		}

		if (m1_ht === a1_ht){ 						  // Add 1
			pushAll(a1_pr, m1_pr);

			if (m2_ht === a2_ht) pushAll(a2_pr, m2_pr); // 12 scen;
			if (m2_ht === a3_ht) pushAll(a3_pr, m2_pr); // 13 scen;
		}
	}
}



var hsv2rgb = function(h,s,v) {
	var rgb, i, data = [];
	if (s === 0) {
		rgb = [v,v,v];
	} else {
		h = h / 60;
		i = Math.floor(h);
		data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
		switch(i) {
			case 0:	rgb = [v, data[2], data[0]];break;
			case 1:	rgb = [data[1], v, data[0]];break;
			case 2:	rgb = [data[0], v, data[2]];break;
			case 3:	rgb = [data[0], data[1], v];break;
			case 4:	rgb = [data[2], data[0], v];break;
			default:rgb = [v, data[0], data[1]];break;
		}
	}
	return '#' + rgb.map(function(x){
		return ("0" + Math.round(x*255).toString(16)).slice(-2);
	}).join('');
};



function makeUniqueColors()
{
	var num_colors = hgroup_colors.length,
		step_color = Math.floor(255 / (num_colors+1))

	var sat = 250,
		val = 100,
		hue = 0;

	for (var c=0; c < num_colors; c++){
		unique_colors[c] = hsv2rgb(hue, sat, val);
		hue += step_color;
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
// 				console.log("non-founder", pers_id, pers.haplo_data[0].pter_array[0].color_group, pers.haplo_data[0].data_array[0]);
// 				console.log("non-founder", pers_id, pers.haplo_data[1].pter_array[0].color_group, pers.haplo_data[1].data_array[0]);
			}
		}
		console.log("hgroups fam =" + fam);
		removeAmbiguousPointers(fam);
	}
	makeUniqueColors();
}



