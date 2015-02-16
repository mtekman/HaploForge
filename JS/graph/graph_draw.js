/*
First pass -- gives unique_graph_obs initial coords based on
              generation_grid_ids ordering
*/

function calcEdges()
{

}




function graphInitPos(start_x, start_y){
	// Descending down the generations.
	// Main founders are at top

	var y_pos = start_y;

	// Init Nodes
	for (var gen=0; gen < generation_grid_ids.length; gen++){
		var x_pos = start_x;

		for (var p=0; p < generation_grid_ids[gen].length; p++)
		{
			var pers_id  = generation_grid_ids[gen][p],
				nodepers = unique_graph_objs[pers_id];

			//Mother and Father already set? Center from there
			try{
				var moth = unique_graph_objs[nodepers.mother.id],
					fath = unique_graph_objs[nodepers.father.id];

				if (moth.center_pos[0] != -1 && fath.center_pos[0] != -1)
					x_pos = Math.floor((moth.center_pos[0] + fath.center_pos[0])/2);

			} catch (e){}

			nodepers.center_pos = [x_pos, y_pos];
			x_pos += horiz_space;
		}
		y_pos += vert_space + 25;
	}

	// Init Edges
	for(var go in unique_graph_objs)
	{
		var obj = unique_graph_objs[go];

		if (obj instanceof Edge)
		{
			switch(obj.type){
				case 0: //Mateline
					obj.start_pos = unique_graph_objs[obj.start_join_id].center_pos;
					obj.end_pos = unique_graph_objs[obj.end_join_id].center_pos;
					break;

				case 1: //ParentLine
					var mateline = unique_graph_objs[obj.start_join_id];
					obj.start_pos = [ Math.floor(                              // center of X's
						(mateline.start_pos[0] + mateline.end_pos[0])/2
					),  mateline.start_pos[1] ];
					obj.end_pos = [obj.start_pos[0], obj.start_pos[1] + vert_space];
					break;

				case 2: //ChildLine
					obj.start_pos = [
						unique_graph_objs[obj.start_join_id].start_pos[0],
						unique_graph_objs[obj.start_join_id].start_pos[1] + vert_space ]
					obj.end_pos = unique_graph_objs[obj.end_join_id].center_pos;
					break;

				default:
					assert(false,"Wrong type!");
			}
		}
	}
}



function redrawSpecificLines(pers_id)
{
	var npers = node_map[pers_id],
		npers_pos = npers.getPosition(),
		pers = unique_graph_objs[pers_id].person,
		per_isMale = (pers.gender===1);

	var new_coords = npers.coords;

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


		var male_id = (per_isMale)?pers.id:mate.id,
			female_id = (per_isMale)?mate.id:pers.id;

		//--- mateline, and update it's pos
		var mateline_id = UUID('m', male_id, female_id),
			mateline = line_map[mateline_id];

		var s1_x = npers_pos.x, s1_y = npers_pos.y,
			e1_x = nmate_pos.x, e1_y = nmate_pos.y;

//		console.log("changing "+ mateline_id+" from "+ mateline.getPoints());
		mateline.setPoints([s1_x, s1_y, e1_x, s1_y, e1_x, e1_y]);
//		console.log("to "+mateline.getPoints());


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




function addGraph()
{

	//ADD lines (NOT redraw)
	for (var go in unique_graph_objs){
		var obj = unique_graph_objs[go];

		if (obj instanceof Edge)
			addRLine(obj.id, obj.start_pos, obj.end_pos);

		else if (obj instanceof NodePerson)
			addPerson(obj.center_pos, obj.person.id,
					  obj.person.gender, obj.person.affected);
	}
	finishDraw();
}
