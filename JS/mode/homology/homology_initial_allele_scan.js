import familyMapOps from '/JS/pedigree/familymapops.js';
/* Needs to be rerun for each selection */

function scan_alleles_for_homology( ids_to_scan, same_family_hblock = true ){

	var alleles = [];

	// Sort alleles into groups of affecteds and unaffecteds
	//   Affecteds are checked for homology, and subtracted against unaffecteds

	var num_markers = MarkerData.getLength();


	// Family maps
	var hom_region_scores = {},
		het_region_scores = {},
		chet_region_scores= {};

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

		// initialize family-specific score array
		hom_region_scores[fid]  = new Int8Array(num_markers).fill(0);
		het_region_scores[fid]  = new Int8Array(num_markers).fill(0);
		chet_region_scores[fid] = new Int8Array(num_markers).fill(0);

		alleles.push( {data:data_only, aff:perc_affected, fam:fid, colors:group_only} );
	}

	// Begin processing
	for (var m=0; m < num_markers; m++)
	{
		var hom_allele_global = -1,					// 11 11
			het_allele_global_h1 = -1,
			het_allele_global_h2 = -1;				// 12 12


		for (var afs = 0; afs < alleles.length; afs++) 		// Iterate over group
		{
			var fd = alleles[afs].fam;

			var hom_at_marker_score = 0,
				het_at_marker_score = 0,
				chet_at_marker_score= 0;

			var affected_indiv = alleles[afs].aff,
				mult = affected_indiv?1:-1;

			// Fuckit just assume two alleles per patient -- use strings for compatibility
			var ht1 = '' + alleles[afs].data[0][m] + '',
				ht2 = '' + alleles[afs].data[1][m] + '';

			//// If colors are relevant, then uncomment the two lines below -- at the moment
			//// I'm under the impression that A->1 and B->2, and that is carried across all
			//// families -- i.e this is NOT descent data, but phased GENOTYPES.
			//ht1 = ht1 + "-" + alleles[afs].colors[0][m];
			//ht2 = ht2 + "-" + alleles[afs].colors[1][m];

			var perc_is_hom_at_marker = (ht1 === ht2);

			if (perc_is_hom_at_marker)
			{
				if (hom_allele_global === -1){
					// Store only the first individual with a non-zero ht
					// Zero HTs contribute nothing
					if (ht1[0] !== "0" ){
						hom_allele_global = ht1;
						hom_at_marker_score += (2*mult);
					}
				}
				else if (hom_allele_global === ht1){
					hom_at_marker_score += (2*mult);
				}

				// Unaffecteds may be homozygous but may still contribute
				// towards het scores
				/////if (affected_indiv) continue;
			}

			// Chet + Het
			if (het_allele_global_h1 === -1){
				if (ht1[0] !== "0" || ht2[0] !== "0" ){
					het_allele_global_h1 = ht1;
					het_allele_global_h2 = ht2;
					het_at_marker_score += (2*mult)

					chet_at_marker_score += (2*mult)
				}
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

			hom_region_scores[fd][m]  += hom_at_marker_score;
			het_region_scores[fd][m]  += het_at_marker_score;
			chet_region_scores[fd][m] += chet_at_marker_score;
		}
	}

	// Tally up totals across families
	var hom_totals = new Int8Array(num_markers).fill(0),
		het_totals = new Int8Array(num_markers).fill(0),
		chet_totals= new Int8Array(num_markers).fill(0);

	var fam_keys = Object.keys(hom_region_scores);

	for (var m=0; m < num_markers; m++)
	{
		for (var f=0; f < fam_keys.length; f++)
		{
			var fam = fam_keys[f];

			 hom_totals[m] +=  hom_region_scores[fam][m];
			 het_totals[m] +=  het_region_scores[fam][m];
			chet_totals[m] += chet_region_scores[fam][m];
		}
	}

	return {
		HOM: hom_totals,
		HET: het_totals,
		CHET: chet_totals,
		num_comparisons: ids_to_scan.length,
		family_specific: {
			HOM : hom_region_scores,
			HET : het_region_scores,
			CHET: chet_region_scores
		}
	};
}
