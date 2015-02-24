
var haplo_blocks = {}; // fam_id --> [b1,b2,b3,b4,b5,b6]


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


var hgroups = {'f1':0, 'f2':1, 'm1':2, 'm2':3};

function child2parent_link(pers_hp, moth_hp, fath_hp)
{
	assert( pers_hp.length === moth_hp.length
		   && pers_hp.length === fath_hp.length, "Allele lengths dont match");

	var tmp_i = 0;

	while (tmp_i++ < pers_hp.length)
	{
		// Each person's alleles' is one of four possible parental alleles (autosomal)
		// TODO: Sex-linked scenario
		var a1 = fath_hp[0][tmp_i].data,
			a2 = fath_hp[1][tmp_i].data,
			a3 = moth_hp[0][tmp_i].data,
			a4 = moth_hp[1][tmp_i].data;

		// Compare each allele
		for(var all = 0; all < 2; all ++) {
			var aa = pers_hp[all][tmp_i];

			aa.hgroup = aa.hgroup || [];

			if (aa.data === a1) aa.hgroup.push( hgroups['f1'] );
			if (aa.data === a2) aa.hgroup.push( hgroups['f2'] );
			if (aa.data === a3) aa.hgroup.push( hgroups['m1'] );
			if (aa.data === a4) aa.hgroup.push( hgroups['m2'] );
		}
	}
}



// First pass -- assign groups
function assignHGroups()
{
	for (var fam in generation_grid_ids) {
		// Skip the first generation
		for (var g = 1; g < generation_grid_ids[fam].length; g++)
		{
			for (var p =0; p < generation_grid_ids[fam][g].length; p++)
			{
				var pers_id = generation_grid_ids[fam][g][p],
					pers    = family_map[fam][pers_id];

				var moth_id = pers.mother.id,
					fath_id = pers.father.id;

				if (moth_id == undefined)  continue; //skip this guy

				var pers_hp = pers.haplo_data,
					moth_hp = family_map[fam][moth_id].haplo_data,
					fath_hp = family_map[fam][fath_id].haplo_data;

				child2parent_link(pers_hp, moth_hp, fath_hp);
			}
		}
		console.log("hgroups fam =" + fam);
	}
}

//Second pass -- expand ambiguous indices
function removeAmbi(){

}


//Third pass -- add (do not draw)
var haplos_generated = {};

function addHaplos(fam, parent_node, start_marker= 0, end_marker= 0){

	var sta_index = 0,
		end_index = HAP_DRAW_LIM;

	if(start_marker !=0 && end_marker !=0 ){
		sta_index = marker_map[start_marker],
		end_index = marker_map[end_marker];

		assert(end_index - sta_index <= HAP_DRAW_LIM, "data exceeds haplo limit");
	}
	else console.log("showing only the first", HAP_DRAW_LIM," for now.");


	// Skip the first generation
	for (var g = 0; g < generation_grid_ids[fam].length; g++)
	{
		for (var p =0; p < generation_grid_ids[fam][g].length; p++)
		{
			var pers_id = generation_grid_ids[fam][g][p];
			var	pers_hp = family_map[fam][pers_id].haplo_data;

			var data_alleles = [];
			for (var al = 0; al < pers_hp.length; al++)
				data_alleles.push(pers_hp[al].slice(sta_index, end_index+1));

// 			console.log(pers_id, pers_hp);
			var	g_pers  = unique_graph_objs[fam].nodes[pers_id];


			g_pers.haplo_group = addHaploBlocks( data_alleles );

			//set xcoords to that of g_pers
			g_pers.haplo_group.setX( g_pers.graphics.getX() );

			parent_node.add(g_pers.haplo_group);
		}
	}
	haplos_generated[fam] = true;
	console.log("adding "+fam+" haplos");

	parent_node.show()
	haplo_layer.draw();

}




