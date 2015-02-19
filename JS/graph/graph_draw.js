
// TODO: Update node_map to point at unique_graph_obs.nodes, and retrieve family name

function moveMatesToo(pers_id, fam_id)
{
	var pers      = family_map[fam_id][pers_id],
		node_map  = unique_graph_objs[fam_id].nodes,
		npers     = node_map[pers_id],
		npers_pos = npers.graphics.getPosition();


	//Move mates vertically
	for (var m=0; m < pers.mates.length; m++){
		var mate = pers.mates[m],
			nmate = node_map[mate.id].graphics,
			nmate_pos = nmate.getPosition();

		nmate.setY(npers_pos.y); // bind y only

		var ch_x = npers_pos.x + (nodeSize*2); 		// Offset stops shapes from intersecting

		//Mate is on left
		if (ch_x > nmate_pos.x){
			if ((ch_x - nmate_pos.x) < horiz_space )
				nmate.setX(ch_x - horiz_space);

			// -- Keep this out, otherwise you can never swap around parents
			//		else
			//			if ((nmate_pos.x-npers_pos.x) < buffer)
			//				nmate.setX(npers_pos.x + buffer+2);
		}

	}
}


function redrawLines(pers_id, fam_id)
{
	var pers      = family_map[fam_id][pers_id],
		node_map  = unique_graph_objs[fam_id].nodes,
		edge_map  = unique_graph_objs[fam_id].edges,
		npers     = node_map[pers_id],
		npers_pos = npers.graphics.getPosition(),
		per_isMale= (pers.gender == 1);

	for (var m=0; m< pers.mates.length; m++){
		var mate = pers.mates[m],
			nmate = node_map[mate.id].graphics,
			nmate_pos = nmate.getPosition();

		var male_id   = (per_isMale)?pers.id:mate.id,
			female_id = (per_isMale)?mate.id:pers.id;

		//--- mateline, and update it's pos
		var mateline_id = UUID('m', male_id, female_id),
			mateline = edge_map[mateline_id].graphics;

		var s1_x = npers_pos.x, s1_y = npers_pos.y,
			e1_x = nmate_pos.x, e1_y = nmate_pos.y;

		mateline.setPoints([s1_x, s1_y, e1_x, s1_y, e1_x, e1_y]);

		// -- parentline, and update it's pos too
		var parentline_id = UUID('p',male_id, female_id),
			parentline = edge_map[parentline_id].graphics;

		var s2_x = Math.floor((s1_x + e1_x)/2), s2_y = s1_y,
			e2_x = s2_x, e2_y = s1_y + vert_space;

		parentline.setPoints([s2_x, s2_y, e2_x, s2_y, e2_x, e2_y]);

		//  -- update childlines attached to it
		var childkey_starting = "c:"+parentline_id;   //Look for all childnodes starting with
		alert("breaks here");

		for (var key in unique_graph_objs[fam_id]){
			if (key.lastIndexOf(childkey_starting,0) === 0) //startsWith implementation
			{
				var find_child_id = key.split('-'),
					child_id = find_child_id[find_child_id.length - 1].trim(),
					nchild = node_map[toInt(child_id)];

				var s3_x = e2_x, s3_y = e2_y,
					e3_x = nchild.getX(), e3_y = nchild.getY();

				edge_map[key].graphics.setPoints([s3_x, s3_y, e3_x, s3_y, e3_x, e3_y]);
			}
		}
	}

	//Update own childnode.
	if (pers.father !==0 && pers.mother !==0){
		var childline_id = UUID('c', UUID('p', pers.father.id, pers.mother.id), pers_id),
			childline_ps = edge_map[childline_id].graphics.getPoints(),
			childline_ln = childline_ps.length;

		var s4_x = childline_ps[childline_ln-2],
			s4_y = childline_ps[childline_ln-1],
			e4_x = npers_pos.x,
			e4_y = npers_pos.y;

		edge_map[childline_id].graphics.setPoints([s4_x, s4_y, e4_x, s4_y, e4_x, e4_y]);
	}
}
