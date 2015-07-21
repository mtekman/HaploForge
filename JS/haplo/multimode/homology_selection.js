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


function scan_alleles_for_homology( ids_to_scan ){

	var alleles = [];

	// Sort alleles into groups of affecteds and unaffecteds
	//   Affecteds are checked for homology, and subtracted against unaffecteds
	for (var i=0; i < ids_to_scan.length; i++)
	{
		var fid_id = ids_to_scan[i].split('_'),
			fid = fid_id[0], 
			id = fid_id[1];

		var perc_affected = (family_map[fid][id].affected == 2),
			perc_haplo_data = family_map[fid][id].haplo_data;

		var data_only = [
			perc_haplo_data[0].data_array,
			perc_haplo_data[1].data_array
		];


		alleles.push( {data:data_only, aff:perc_affected} );
	}


	// Begin processing
	var num_markers = marker_array.length;

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

		for (var afs = 0; afs < alleles.length; afs++) 		// Iterate over group
		{
			var affected_indiv = alleles[afs].aff,
				mult = affected_indiv?1:-1;

			// Fuckit just assume two alleles per patient
			var ht1 = alleles[afs].data[0][m],
				ht2 = alleles[afs].data[1][m];

			var perc_is_hom_at_marker = (ht1 === ht2);

			if (perc_is_hom_at_marker)
			{
				if (hom_allele_global === -1)
					hom_allele_global = ht1;
				
				else if (hom_allele_global === ht1){
					hom_at_marker_score += 2*mult
				}
			}

			else {
				// Chet + Het
				if (het_allele_global_h1 === -1){
					het_allele_global_h1 = ht1;
					het_allele_global_h2 = ht2;
				}

				else {
					if (het_allele_global_h1 === ht1){
						het_at_marker_score += mult

						if (het_allele_global_h2 === ht2){
							het_at_marker_score += mult
							chet_at_marker_score += 2*mult
						}
					}
					else if (het_allele_global_h1 === ht2){
						het_at_marker_score += mult

						if (het_allele_global_h2 === ht1){
							het_at_marker_score += mult
							chet_at_marker_score += 2*mult
						}
					}
				}
			}
		}

		hom_region_scores[m] = hom_at_marker_score;
		het_region_scores[m] = het_at_marker_score;
		chet_region_scores[m] = chet_at_marker_score;
	}

	return {
		hom: hom_region_scores,
		het: het_region_scores,
		chet: chet_region_scores,
		num_comparisons: ids_to_scan.length
	};
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

			if (selected_for_homology.length === 0)
				return -1;

			var plots = scan_alleles_for_homology( selected_for_homology );

			plotScoresOnMarkerScale( plots );
			return 0;
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


function plotScoresOnMarkerScale ( plots ){
	/* Grab rangeline and hang graphics from it.

	 Shape likely to be > 1000 px tall, and rangeline only 300 px,
	 which is a scale down of 3x that most pc's can handle
	  -- hopefully Kinetic/canvas handles mipmaps efficiently
	     so I don't have to ~~~
	*/

	var marker_scale = showSlider(true),
		rangeline = marker_scale.rangeline,
		r_height = slider_height;

	var plen = plots.hom.length,
		points_per_pixel = plen / r_height,
		ppp = Math.ceil(points_per_pixel);


	// stretch min -- must have >0 for stretch min else 0
	// score_min -- must have score > score_min else 0
	function plotAxis3( given_plot, stretch_min, score_min )
	{
		var p=0,q=0,
			block_size = 10,
			average_points = [0,-1],
			inform_points = [0,-1];

		var current_stretch_len = 0,
			in_hom_region_stretch = false;
		
		while (p < plen)
		{
			var average_x = 0,
				inform_x = 0; // <-- inform. within block, cannot overlap

			for (var b=0; b++ < block_size;)
			{
				var val = given_plot[p++];

				// Handle stretches
				if (val >= score_min){
					if (!(in_hom_region_stretch)){
						in_hom_region_stretch = true;
					}
					current_stretch_len ++
				}
				else{
					if (in_hom_region_stretch){
						in_hom_region_stretch = false;

						if (current_stretch_len >= stretch_min){
							inform_x += 1;
						}
					}
				}

				average_x += val;
			}
			average_x /= block_size;

			average_points.push(average_x, q)
			inform_points.push( inform_x, q);

			q++;
		}
		average_points.push(0,q+1);
		inform_points.push(0,q+1);

		var avline = new Kinetic.Line({
			x: rangeline.getX(),
			y: rangeline.getY(),
			points: average_points,
			stroke: 'green',
			strokeWidth: 0.3,
			closed: true,
			fill: 'green',
			alpha: 0.3
		});

		avline.scaleY( block_size * r_height/plen );
		avline.scaleX(0.5)

		var infline = new Kinetic.Line({
			x: rangeline.getX(),
			y: rangeline.getY(),
			points: inform_points,
			stroke: 'blue',
			strokeWidth: 0.3,
			closed: true,
			fill: 'blue',
			alpha: 0.3
		});

		infline.scaleY( block_size * r_height/plen );
		infline.scaleX( 15 );

		return [avline,infline];
	}


	var lines = plotAxis3( plots.het, 3, 8 )

	marker_scale.add(lines[1]);
	lines[1].setZIndex(-99);

	marker_scale.add(lines[0]);
	lines[0].setZIndex(-99);

	
	mscale_layer.draw();
}