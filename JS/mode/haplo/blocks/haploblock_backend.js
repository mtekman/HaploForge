// Founder color groups are unique, even across families

var hgroup_colors = [], // [founder_id], where array index = color/group
	unique_colors = []; // [color --> hex]

var zero_color_grp = -1;


//Get unique color groups in an allele
var uniqueset = function(set){
	return set.filter(function(item,i,ar){
		return (item !== zero_color_grp  && ar.indexOf(item) === i);
	});
};



function initFounderAlleles( fid, id )
{
	var perc_hdata = familyMapOps.getPerc(id,fid).haplo_data;

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


		allele_ptrs.unique_groups = [color_group];

// 		console.log("founder "+id+" "+a, allele_ptrs[0].color_group, perc_hdata[a].data_array[0]);
	}
	// console.log("Cf", id, debugHaploData(perc_hdata));
}





function pushAll(from, to){
// 	console.log("called", from, to);
	for (var j=0; j < from.color_group.length; j++){
		if (to.color_group.indexOf( from.color_group[j] )==-1)
			to.color_group.push( from.color_group[j] );
	}
}


function debugHaploData(dat){
	return { 0: dat[0].debug(),
			 1: dat[1].debug()};
}


/*  Links non-founders to founders via parents. Potentially unphased, no error-checking at this stage

	Some assumptions:
	- Founder pointers are already set (for founders)
	- Always two alleles
	- Paternal allele is first, and maternal is second.
*/
function child2parent_link(pers, moth, fath, fam) // fam only needed for consang check.
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
		var f0_ht = fath_hp[0].data_array[tmp_i],
			f1_ht = fath_hp[1].data_array[tmp_i],  // Y allele, potential pitfall here -- input rows either follow a specific XY order, or need to do postproc.
			m0_ht = moth_hp[0].data_array[tmp_i],
			m1_ht = moth_hp[1].data_array[tmp_i];

		var f0_pr = fath_hp[0].pter_array[tmp_i],
			f1_pr = fath_hp[1].pter_array[tmp_i],
			m0_pr = moth_hp[0].pter_array[tmp_i],
			m1_pr = moth_hp[1].pter_array[tmp_i];

// 		if (f0_pr === undefined || f1_pr === undefined
// 			|| m0_pr === undefined || m1_pr === undefined)

		if (f0_ht === 0) f0_pr.color_group = [zero_color_grp];
		if (f1_ht === 0) f1_pr.color_group = [zero_color_grp];
		if (m0_ht === 0) m0_pr.color_group = [zero_color_grp];
		if (m1_ht === 0) m1_pr.color_group = [zero_color_grp];

// 		if (f0_ht === f1_ht  && f1_ht === m0_ht	&& m0_ht === m1_ht  && m1_ht === 0) continue;

		var c0_ht = pers_hp[0].data_array[tmp_i],  				// X allele
			c1_ht = pers_hp[1].data_array[tmp_i];  				// Y allele

		var c0_pr = pers_hp[0].pter_array[tmp_i],
			c1_pr = pers_hp[1].pter_array[tmp_i]; 				// Y pointer

		if (c0_pr.color_group.length !== 0 ){
			console.log("c0_pr not [], for "+pers.id+" @ "+tmp_i, c0_pr);
			throw new Error("");

		}

		if (c1_pr.color_group.length !== 0 ){
			console.log("c1_pr not [], for "+pers.id+" @ "+tmp_i, c1_pr);
			throw new Error("");
		}


		/* -- Sex-linked and male scenario:
   		 Assuming XY and XX are alleles 0 1 2 3;
		  female: 0{2,3} = 02 03
		    male: 1{2,3} = 12 13
		 */
		if (HaploPedProps.xlinked && gender === PED.MALE){ 						 // Sexlinked and male

			// console.log("Extra work for", pers.id);

			// MASSIVE ASSUMPTIONS HERE:
			// - The child's (male) second allele is the Y chrom, as is the father's
			// - Only true if input file is set as such for males.

			pushAll(f1_pr,c1_pr);

			if (c0_ht === m0_ht) pushAll(m0_pr, c0_pr); // Maternal set both
			if (c0_ht === m1_ht) pushAll(m1_pr, c0_pr);

			continue;
		}

		/*
		-- Autosomal or female scenario
		with the condition that the opposing allele must be chosen from the remaining sister pair:
		e.g: {0,1}{2,3} = 02 03 12 13

		*/
		function resetCheck(p1,p2){
			var reset = (p1.color_group.length === 0 || p2.color_group.length === 0);
			if (reset){
				p1.color_group = [];
				p2.color_group = [];
			}
		}

		if (c0_ht === f0_ht){ 						   // Add 0
			pushAll(f0_pr, c0_pr);

			if (c1_ht === m0_ht) pushAll(m0_pr, c1_pr);// 02 scen;
			if (c1_ht === m1_ht) pushAll(m1_pr, c1_pr);// 03 scen;
		}
		resetCheck(c0_pr,c1_pr);


		if (c0_ht === f1_ht){ 		 					// Add 1
			pushAll(f1_pr, c0_pr);

			if (c1_ht === m0_ht) pushAll(m0_pr, c1_pr); // 12 scen;
			if (c1_ht === m1_ht) pushAll(m1_pr, c1_pr); // 13 scen;
		}
		resetCheck(c0_pr,c1_pr);


		if (c0_ht === m0_ht){ 		 					// Add 2
			pushAll(m0_pr, c0_pr);

			if (c1_ht === f0_ht) pushAll(f0_pr, c1_pr); // 20 scen;
			if (c1_ht === f1_ht) pushAll(f1_pr, c1_pr); // 21 scen;
		}
		resetCheck(c0_pr,c1_pr);

		if (c0_ht === m1_ht){ 		 					// Add 3
			pushAll(m1_pr, c0_pr);

			if (c1_ht === f0_ht) pushAll(f0_pr, c1_pr); // 30 scen;
			if (c1_ht === f1_ht) pushAll(f1_pr, c1_pr); // 31 scen;
		}
		resetCheck(c0_pr,c1_pr);
	}

// 		//DEBUG
// 		console.log("\n=====================");
// 		console.log("F:", fath.id, debugHaploData(fath_hp));
// 		console.log("M:", moth.id, debugHaploData(moth_hp));
	//console.log("Ci", pers.id, debugHaploData(pers_hp));

	// Remove Ambigious regions. Must be done here so that next-gen
	// deals only with clean data and not a hodge-podge of possible
	// inheritance patterns.


	/*
	The problem here is that each child allele could inherit from one of four parental
	chromosomes, but needs to do so in an exclusive fashion such that a maternal haploblock
	does not also appear in the childs paternal haploblock
	*** (i.e. no two blocks can have the same color across sister alleles)***

	To counter this, we try a standard run on a given allele and use the unique groups discovered
	on the best resolved path of that allele as an exclusion list for the opposing allele.

	This will prevent haploblocks from mixing.
	*/
	var maternal_exclusion = moth_hp[0].unique_groups.concat(moth_hp[1].unique_groups),
		paternal_exclusion = fath_hp[0].unique_groups.concat(fath_hp[1].unique_groups);



	// Check for consanginuity
	var key = "m:"+fath.id+"-"+moth.id;
	var consang_check = uniqueGraphOps.getFam(fam).edges[key].consangineous;

	if (consang_check){
		// Kick out groups that overlap in both sets
		var toKick = [];
		// console.log(key+" is said to be consangineous...");

		for (var ov1=0; ov1 < maternal_exclusion.length; ov1++)
			for (var ov2=0; ov2 < paternal_exclusion.length; ov2++)
				if (maternal_exclusion[ov1] === paternal_exclusion[ov2])
					toKick.push( maternal_exclusion[ov1]);

		if (toKick.length !== 0){
			for (var tk=0; tk < toKick.length; tk++){
				var val = toKick[tk];

				var maternal_index = maternal_exclusion.indexOf(val),
					paternal_index = paternal_exclusion.indexOf(val);

				maternal_exclusion.splice(maternal_index,1);
				paternal_exclusion.splice(paternal_index,1);
			}
		}
	}

	var res0 = a_star_bestfirst(pers_hp[0].pter_array, maternal_exclusion),
		res1;

	// Didn't take with maternal, try paternal
	if (res0 === null){
		res0 = a_star_bestfirst(pers_hp[0].pter_array, paternal_exclusion);

		if (res0 === null)
			throw new Error( "Skipper's Log: No land in sight.");


		res1 = a_star_bestfirst(pers_hp[1].pter_array, maternal_exclusion);
	}
	res1 = a_star_bestfirst(pers_hp[1].pter_array, paternal_exclusion);

	if (res1 === null){
		//If we're here, then chances are res0 is ambiguous - it has solutions
		//for both exclusion scenarios.

		//We assume that it only tried the first, so we try the second
 		res0 = a_star_bestfirst(pers_hp[0].pter_array, paternal_exclusion);
 		res1 = a_star_bestfirst(pers_hp[1].pter_array, maternal_exclusion);

		if (res0 === null || res1 === null)
			throw new Error("Skipper's Log: It's been days...");

	}


	var unique0 = res0.filter(function(item,i,ar){
		return (item !== zero_color_grp  && ar.indexOf(item) === i);
	});
	var unique1 = res1.filter(function(item,i,ar){
		return (item !== zero_color_grp  && ar.indexOf(item) === i);
	});

	pers_hp[0].unique_groups = unique0;
	pers_hp[1].unique_groups = unique1;

	//Overwrite person data
	var curr_index = -1;
	while( ++curr_index < res0.length){
		pers_hp[0].pter_array[curr_index].color_group = [ res0[curr_index] ];
		pers_hp[1].pter_array[curr_index].color_group = [ res1[curr_index] ];
	}

	//console.log("Cf", pers.id, debugHaploData(pers_hp));
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
		step_color = (Math.floor(360 / (num_colors)));

	var sat = 33,
		val = 51,
		hue = 0;

	for (var c=0; c < num_colors; c++){
		unique_colors[c] = hsv2rgb(hue, sat, val);
		hue += step_color;
	}
}



// First pass -- assign groups
function assignHGroups()
{
	GlobalLevelGrid.foreachfam(function(grid, fam){
		// First generation must be founders
		var founder_gen = grid[0];

		for (var p = 0; p < founder_gen.length; p++){
			initFounderAlleles( fam, founder_gen[p] )
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
					initFounderAlleles( fam, pers_id );
					continue;
				}

				var moth = familyMapOps.getPerc(moth_id, fam),
					fath = familyMapOps.getPerc(fath_id, fam);

				child2parent_link(pers, moth, fath, fam);
			}
		}
		removeAmbiguousPointers(fam);
	});
	makeUniqueColors();
}



