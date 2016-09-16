
var AstarHandler = {

	/** Inherit all unique color groups from one person to another **/
	pushAll: function(from, to){
		// 	console.log("called", from, to);
		for (var j=0; j < from.color_group.length; j++){
			if (to.color_group.indexOf( from.color_group[j] )==-1)
				to.color_group.push( from.color_group[j] );
		}
	},

	/** Reset search if incompatible genotypes **/
	resetCheck: function(p1,p2){
		var reset = (p1.color_group.length === 0 || p2.color_group.length === 0);
		if (reset){
			p1.color_group = [];
			p2.color_group = [];
		}
	},


	/*  Links non-founders to founders via parents. Potentially unphased, no error-checking at this stage

	Some assumptions:
	- Founder pointers are already set (for founders)
	- Always two alleles
	- Paternal allele is first, and maternal is second.
	*/
	child2parent_link: function(pers, moth, fath, fam) // fam only needed for consang check.
	{
		var pers_hp = pers.haplo_data,
			moth_hp = moth.haplo_data,
			fath_hp = fath.haplo_data,
			gender = pers.gender;

		assert(pers_hp[0].data_array.length === moth_hp[0].data_array.length
		    && pers_hp[0].data_array.length === fath_hp[0].data_array.length
			&& pers_hp[1].data_array.length === moth_hp[1].data_array.length
			&& pers_hp[1].data_array.length === fath_hp[1].data_array.length, "Allele lengths dont match for moth,fath,chil:"+ moth.id+" "+fath.id+" "+pers.id);

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

			if (f0_ht === 0) f0_pr.color_group = [FounderColor.zero_color_grp];
			if (f1_ht === 0) f1_pr.color_group = [FounderColor.zero_color_grp];
			if (m0_ht === 0) m0_pr.color_group = [FounderColor.zero_color_grp];
			if (m1_ht === 0) m1_pr.color_group = [FounderColor.zero_color_grp];

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

				AstarHandler.pushAll(f1_pr,c1_pr);

				if (c0_ht === m0_ht) AstarHandler.pushAll(m0_pr, c0_pr); // Maternal set both
				if (c0_ht === m1_ht) AstarHandler.pushAll(m1_pr, c0_pr);

				continue;
			}

			/*
			-- Autosomal or female scenario
			with the condition that the opposing allele must be chosen from the remaining sister pair:
			e.g: {0,1}{2,3} = 02 03 12 13

			*/
			if (c0_ht === f0_ht){ 						   // Add 0
				AstarHandler.pushAll(f0_pr, c0_pr);

				if (c1_ht === m0_ht) AstarHandler.pushAll(m0_pr, c1_pr);// 02 scen;
				if (c1_ht === m1_ht) AstarHandler.pushAll(m1_pr, c1_pr);// 03 scen;
			}
			AstarHandler.resetCheck(c0_pr,c1_pr);


			if (c0_ht === f1_ht){ 		 					// Add 1
				AstarHandler.pushAll(f1_pr, c0_pr);

				if (c1_ht === m0_ht) AstarHandler.pushAll(m0_pr, c1_pr); // 12 scen;
				if (c1_ht === m1_ht) AstarHandler.pushAll(m1_pr, c1_pr); // 13 scen;
			}
			AstarHandler.resetCheck(c0_pr,c1_pr);


			if (c0_ht === m0_ht){ 		 					// Add 2
				AstarHandler.pushAll(m0_pr, c0_pr);

				if (c1_ht === f0_ht) AstarHandler.pushAll(f0_pr, c1_pr); // 20 scen;
				if (c1_ht === f1_ht) AstarHandler.pushAll(f1_pr, c1_pr); // 21 scen;
			}
			AstarHandler.resetCheck(c0_pr,c1_pr);

			if (c0_ht === m1_ht){ 		 					// Add 3
				AstarHandler.pushAll(m1_pr, c0_pr);

				if (c1_ht === f0_ht) AstarHandler.pushAll(f0_pr, c1_pr); // 30 scen;
				if (c1_ht === f1_ht) AstarHandler.pushAll(f1_pr, c1_pr); // 31 scen;
			}
			AstarHandler.resetCheck(c0_pr,c1_pr);
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

			if (res0 === null){
				console.log( pers_hp[0], paternal_exclusion, maternal_exclusion,
					consang_check, 
					pers.id, moth.id, fath.id );
				throw new Error( "Skipper's Log: No land in sight.");
			}


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
			return (item !== FounderColor.zero_color_grp  && ar.indexOf(item) === i);
		});
		var unique1 = res1.filter(function(item,i,ar){
			return (item !== FounderColor.zero_color_grp  && ar.indexOf(item) === i);
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
}