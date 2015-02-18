
// TODO: Update node_map to point at unique_graph_obs.nodes, and retrieve family name

function moveMatesToo(pers_id){
	var npers = node_map[pers_id],
		npers_pos = npers.getPosition(),
		pers = npers.person;

	//Move mates vertically
	for (var m=0; m< pers.mates.length; m++){
		var mate = pers.mates[m],
			nmate = node_map[mate.id],
			nmate_pos = nmate.getPosition();

		nmate.setY(npers_pos.y); // bind y only

		//Mate is on left
		if (npers_pos.x > nmate_pos.x){
			if ((npers_pos.x - nmate_pos.x) < horiz_space)
				nmate.setX(npers_pos.x - horiz_space);

			// -- Keep this out, otherwise you can never swap around parents
			//		else
			//			if ((nmate_pos.x-npers_pos.x) < buffer)
			//				nmate.setX(npers_pos.x + buffer+2);
		}

	}
}


function redrawSpecifics(pers_id, moveMatesOnly=false)
{
	var npers = node_map[pers_id],
		npers_pos = npers.getPosition(),
		pers = npers.person,
		per_isMale = (pers.gender===1);

	//Move mates vertically
	for (var m=0; m< pers.mates.length; m++){
		var mate = pers.mates[m],
			nmate = node_map[mate.id],
			nmate_pos = nmate.getPosition();

		nmate.setY(npers_pos.y); // bind y only

		//Mate is on left
		if (npers_pos.x > nmate_pos.x){
			if ((npers_pos.x - nmate_pos.x) < horiz_space)
				nmate.setX(npers_pos.x - horiz_space);

			// -- Keep this out, otherwise you can never swap around parents
			//		else
			//			if ((nmate_pos.x-npers_pos.x) < buffer)
			//				nmate.setX(npers_pos.x + buffer+2);
		}


		if (!moveMatesOnly){
			var male_id = (per_isMale)?pers.id:mate.id,
				female_id = (per_isMale)?mate.id:pers.id;

			//--- mateline, and update it's pos
			var mateline_id = UUID('m', male_id, female_id),
				mateline = line_map[mateline_id];

			var s1_x = npers_pos.x, s1_y = npers_pos.y,
				e1_x = nmate_pos.x, e1_y = nmate_pos.y;

			//		console.log("changing "+ mateline_id+" from "+ mateline.getPoints());
			mateline.setPoints([s1_x, s1_y, e1_x, s1_y, e1_x, e1_y]);
			//		console.log("                         to "+mateline.getPoints());
			//		console.log("                         to "+[s1_x, s1_y, e1_x, s1_y, e1_x, e1_y]);


			// -- parentline, and update it's pos too
			var parentline_id = UUID('p',male_id, female_id),
				parentline = line_map[parentline_id];

			var s2_x = Math.floor((s1_x + e1_x)/2), s2_y = s1_y,
				e2_x = s2_x, e2_y = s1_y + vert_space;

			//		console.log("changing "+ parentline_id+" from "+ parentline.getPoints());
			parentline.setPoints([s2_x, s2_y, e2_x, s2_y, e2_x, e2_y]);
			//		console.log("to "+ parentline.getPoints());


			//  -- update childlines attached to it
			var childkey_starting = "c:"+parentline_id;   //Look for all childnodes starting with

			for (var key in unique_graph_objs){
				if (key.lastIndexOf(childkey_starting,0) === 0) //startsWith implementation
				{
					var find_child_id = key.split('-'),
						child_id = find_child_id[find_child_id.length - 1].trim(),
						nchild = node_map[child_id];

					var s3_x = e2_x, s3_y = e2_y,
						e3_x = nchild.getX(), e3_y = nchild.getY();

					//				console.log("changing "+ key+" from "+ line_map[key].getPoints());
					line_map[key].setPoints([s3_x, s3_y, e3_x, s3_y, e3_x, e3_y]);
					//				console.log("to "+ line_map[key].getPoints());

				}
			}
		}
	}

	//Update own childnode.
	if (pers.father !==0 && pers.mother !==0){
		var childline_id = UUID('c', UUID('p', pers.father.id, pers.mother.id), pers_id),
			childline_ps = line_map[childline_id].points,
			childline_ln = childline_ps.length;

		var s4_x = childline_ps[childline_ln-2],
			s4_y = childline_ps[childline_ln-1],
			e4_x = npers_pos.x,
			e4_y = npers_pos.y;

		//		console.log("changing "+ childline_id+" from "+ line_map[childline_id].getPoints());
		line_map[childline_id].setPoints([s4_x, s4_y, e4_x, s4_y, e4_x, e4_y]);
		//		console.log("to "+ line_map[childline_id].getPoints());
	}
}
