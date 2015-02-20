
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
		//Update mate's mate's
		for (var mm=0 ; mm < mate.mates.length; mm++){
			var matemate_id  = mate.mates[mm].id;

			if (matemate_id != pers_id){
				var nmatemate     = node_map[matemate_id].graphics,
					nmatemate_pos = nmatemate.getPosition();

				nmatemate.setY(npers_pos.y);
			}
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

			// -- mate's childline
			if (mate.father !=0 /*&& mate.mother != 0*/)
			{
				var mates_mateline_id = UUID('m', mate.father.id, mate.mother.id),  //get
					mates_childline_id = UUID('c', mates_mateline_id, mate.id),    //set
					m_po = edge_map[mates_mateline_id].graphics.getPoints();

				var sm_x = Math.floor((m_po[0]+m_po[m_po.length -2] )/2),
					sm_y = m_po[m_po.length -1];

				changeRLine(edge_map[mates_childline_id].graphics, {x:sm_x,y:sm_y}, nmate_pos);
			}

			// -- mate's mate's mateline

		}
	}

	//If last generation, move all sibs
	var last_gen = generation_grid_ids[fam_id][generation_grid_ids[fam_id].length - 1];

	if (last_gen.indexOf(pers_id)!== -1){

		var parents_mateline = UUID('m', pers.father.id, pers.mother.id),
			parents_ml_pos = edge_map[parents_mateline].graphics.getPoints();

		for (var c=0; c < last_gen.length; c++){
			var sib_id = last_gen[c],
				n_sib = unique_graph_objs[fam_id].nodes[sib_id].graphics;

			n_sib.setY(npers_pos.y);


			if (drawLinesToo){ //Update childlines
				var c_id = UUID('c', parents_mateline, sib_id);

				var sm_x = Math.floor((parents_ml_pos[0]+parents_ml_pos[parents_ml_pos.length -2] )/2),
					sm_y = parents_ml_pos[parents_ml_pos.length -1];

				changeRLine(edge_map[c_id].graphics, {x:sm_x,y:sm_y}, n_sib.getPosition());
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


// Performs redrawNodes upon all
function touchlines(){
	for(var one in family_map){
		for(var two in family_map[one]){

			//simulate drag event
			var e = new CustomEvent("dragmove", {target: {attrs: {x:10, y:10}}}),
				o = unique_graph_objs[one].nodes[two];

			o.graphics.dispatchEvent(e);
		}
	}
}


// Initial spacing of groups
function spaceFamGroups(){

	var leftover_gap = window.innerWidth,
		num_fams = 0;

	var global_minx = 9999999;

	//First pass get leftover space
	for (var fid in family_map){ //should be in this order
		num_fams ++;
		var nodes = unique_graph_objs[fid].nodes;

		var min_x = 9999999, max_x = 0;

		for (var nid in nodes){
			if (nid === "0") continue;

			var xer = nodes[nid].graphics.getX();

			if (min_x > xer) min_x = xer;
			if (max_x < xer) max_x = xer;
		}

		if (global_minx > min_x) global_minx = min_x;

		leftover_gap -= max_x - min_x;
	}

	//Move groups

	var buffer_x = nodeSize*4;
	leftover_gap -= (buffer_x*2);
	if (global_minx < 0) {
		buffer_x -= global_minx;
		leftover_gap -= global_minx
	}

	var gap_between = Math.floor(leftover_gap/(num_fams));

	if (gap_between > 0){
		var step = buffer_x;

		for (var fid in family_map){
			var group = unique_graph_objs[fid].group;
			group.setX(group.getX() + step);

			step += gap_between;
		}
	}
}



