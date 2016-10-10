
/* Needs to be rerun for each selection */

function scan_alleles_for_homology( ids_to_scan, same_family_hblock = true ){

	var alleles = [];

	// Sort alleles into groups of affecteds and unaffecteds
	//   Affecteds are checked for homology, and subtracted against unaffecteds
	for (var i=0; i < ids_to_scan.length; i++)
	{
		var fid_id = ids_to_scan[i].split('_'),
			fid = fid_id[0], 
			id = fid_id[1];

		var perc_affected = (familyMapOps.getPerc(id,fid).affected === PED.AFFECTED),
			perc_haplo_data = familyMapOps.getPerc(id,fid).haplo_data;

		var data_only = [
			perc_haplo_data[0].data_array,
			perc_haplo_data[1].data_array
		];

		var group_only = [
			perc_haplo_data[0].haplogroup_array,
			perc_haplo_data[1].haplogroup_array
		];


		alleles.push( {data:data_only, aff:perc_affected, fam:fid, colors:group_only} );
	}

	// Begin processing
	var num_markers = MarkerData.getLength();

	// First just pass over affecteds ands find regions of het and hom
	var hom_region_scores  = new Int8Array(num_markers),
		het_region_scores  = new Int8Array(num_markers),
		chet_region_scores = new Int8Array(num_markers);

	for (var m=0; m < num_markers; m++)
	{
		// These need to be state maps...
		var hom_allele_global = -1,					// 11 11
			hom_at_marker_score = 0;

		var het_at_marker_score = 0;

		var het_allele_global_h1 = -1,
			het_allele_global_h2 = -1,				// 12 12 
			chet_at_marker_score = 0;

		for (var afs = 0; afs < alleles.length; afs++) 		// Iterate over group
		{
			var affected_indiv = alleles[afs].aff,
				mult = affected_indiv?1:-1;

			// Fuckit just assume two alleles per patient
			var ht1 = alleles[afs].data[0][m],
				ht2 = alleles[afs].data[1][m];

			// If we're comparing haploblocks too, then hts become unique strings.
			if (same_family_hblock){
				ht1 = ht1 + "-" + alleles[afs].fam + "-" + alleles[afs].colors[0][m];
				ht2 = ht2 + "-" + alleles[afs].fam + "-" + alleles[afs].colors[1][m];
			}


			var perc_is_hom_at_marker = (ht1 === ht2);

			if (perc_is_hom_at_marker)
			{
				if (hom_allele_global === -1){
					hom_allele_global = ht1;
					hom_at_marker_score += (2*mult);
				}
				else if (hom_allele_global === ht1){
					hom_at_marker_score += (2*mult);
				}

				// Unaffecteds may be homozygous but may still contribute
				// towards het scores
				if (affected_indiv) continue;
			}

			// Chet + Het
			if (het_allele_global_h1 === -1){
				het_allele_global_h1 = ht1;
				het_allele_global_h2 = ht2;
				het_at_marker_score += (2*mult)
				
				chet_at_marker_score += (2*mult)
			}

			else {
				if (het_allele_global_h1 === ht1){
					het_at_marker_score += mult

					if (het_allele_global_h2 === ht2){
						het_at_marker_score += mult
						chet_at_marker_score += (2*mult)
					}
				}
				else if (het_allele_global_h1 === ht2){
					het_at_marker_score += mult

					if (het_allele_global_h2 === ht1){
						het_at_marker_score += mult
						chet_at_marker_score += (2*mult)
					}
				}
			}
		}

		hom_region_scores[m] = hom_at_marker_score;
		het_region_scores[m] = het_at_marker_score;
		chet_region_scores[m] = chet_at_marker_score;
	}

	return {
		HOM: hom_region_scores,
		HET: het_region_scores,
		CHET: chet_region_scores,
		num_comparisons: ids_to_scan.length
	};
}
