
// TODO: Update node_map to point at unique_graph_obs.nodes, and retrieve family name

function redrawNodes(pers_id, fam_id, drawLinesToo=true)
{
	var pers      = family_map[fam_id][pers_id],
		node_map  = unique_graph_objs[fam_id].nodes,
		edge_map  = unique_graph_objs[fam_id].edges,
		npers     = node_map[pers_id],
		npers_pos = npers.graphics.getPosition(),
		per_isMale= (pers.gender == 1);


	// Move mates vertically
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


		if (drawLinesToo){
			var male_id   = (per_isMale)?pers.id:mate.id,
				female_id = (per_isMale)?mate.id:pers.id;

			// -- mateline, and update it's pos
			var mateline_id = UUID('m', male_id, female_id),
				mateline = edge_map[mateline_id].graphics;

			var s1_x = npers_pos.x, s1_y = npers_pos.y,
				e1_x = nmate_pos.x, e1_y = nmate_pos.y;

			changeRLine(mateline, npers_pos, nmate_pos);

			//  -- update childlines attached to it
			var childkey_starting = "c:"+mateline_id;   //Look for all childnodes starting with

			for (var key in unique_graph_objs[fam_id].edges){
				if (key.lastIndexOf(childkey_starting,0) === 0) //startsWith implementation
				{
					var find_child_id = key.split('-'),
						child_id = toInt(find_child_id[find_child_id.length - 1].trim()),
						nchild = node_map[child_id].graphics.getPosition();

					var s3_x = Math.floor((s1_x + e1_x)/2),
						s3_y = s1_y;

					changeRLine(edge_map[key].graphics, {x:s3_x, y: s3_y}, nchild);
				}
			}

			// -- mate's childline, damn that is some sweet sweet coca
			if (mate.father !=0 /*&& mate.mother != 0*/)
			{
				var mates_mateline_id = UUID('m', mate.father.id, mate.mother.id),  //get
					mates_childline_id = UUID('c', mates_mateline_id, mate.id),    //set
					m_po = edge_map[mates_mateline_id].graphics.getPoints();

				var sm_x = Math.floor((m_po[0]+m_po[m_po.length -2] )/2),
					sm_y = m_po[m_po.length -1];

				changeRLine(edge_map[mates_childline_id].graphics, {x:sm_x,y:sm_y}, nmate_pos);
			}
		}
	}

	//Update own childnode.
	if (drawLinesToo && (pers.father != 0 && pers.mother !=0))
	{
		var childline_id = UUID('c', UUID('m', pers.father.id, pers.mother.id), pers_id),
			childline = edge_map[childline_id],
			childline_ps = childline.graphics.getPoints();

		var s4_x = childline_ps[0],
			s4_y = childline_ps[1];

		changeRLine(childline.graphics, {x:s4_x,y:s4_y}, npers_pos);
	}
}


