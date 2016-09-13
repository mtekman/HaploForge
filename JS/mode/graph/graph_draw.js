// TODO: Update node_map to point at unique_graph_obs.nodes, and retrieve family name

var edgeAccessor = {

	_UUID: function (type, from_id, to_id){
		// m Father_id Mother_id   // MAYBE UNITE m and p?
		// p Father_id Mother_id
		// c parentline child_id

		// straightforward to find childline from two parents
		// (e.g any keys starting with "c m F_id M_id"
		return type+":"+from_id+"-"+to_id;
	},

	childlineID: function(mateline_id, child_id){
		return this._UUID('c', mateline_id, child_id)
	},

	matelineID: function(father_id , mother_id){
		return this._UUID('m', father_id, mother_id)
	}
}



var updateGraph = {


	childline: function(family_id, person_id, parents_mateline_id = -1)
	{
		if (parents_mateline_id === -1){
			var person_node = familyMapOps.getPerc(person_id, family_id);

			if ((person_node.father === 0) || (person_node.mother === 0)){
				//No parent mateline, nothing to update
				return 0;
			}

			parents_mateline_id = edgeAccessor.matelineID(person_node.father.id, person_node.mother.id);
		}

		var childline_id = edgeAccessor.childlineID(parents_mateline_id, person_id),
			childline    = uniqueGraphOps.getEdge(childline_id, family_id).graphics,
			mateline     = uniqueGraphOps.getEdge(parents_mateline_id, family_id).graphics,
			mateline_ps  = mateline.getPoints();

//			childline_ps = childline.getPoints();
//			var mid_xx = childline_ps[0] + childline.getX(),
//			  	mid_yy = childline_ps[1] + childline.getY();

		var mid_xx = (mateline_ps[2] + mateline_ps[4])/2 + mateline.getX(),
			mid_yy = (mateline_ps[3] + mateline_ps[5])/2 + mateline.getY();

		var person_graphics = uniqueGraphOps.getNode(person_id, family_id).graphics;

//		console.log("childline", childline);

		changeRLine( childline, {x:mid_xx, y:mid_yy}, person_graphics.getPosition());
	}
}



function redrawNodes(pers_id, fam_id, drawLinesToo)
{
	var pers      = familyMapOps.getPerc(pers_id, fam_id),
		fam_gfx   = uniqueGraphOps.getFam(fam_id),
		node_map  = fam_gfx.nodes,
		edge_map  = fam_gfx.edges,
		npers     = node_map[pers_id],
		npers_pos = npers.graphics.getPosition(),
		per_isMale= (pers.gender == PED.MALE);


	// Move mates vertically

	// Stagger mate's vertically to please the world
	var staggerY_amount = grid_rezY/2,
		use_stagger = false; //pers.mates.length > 1;

	for (var m=0; m < pers.mates.length; m++){
//		console.log(pers_id, "mate=", pers.mates[m].id )
		var mate = pers.mates[m],
			nmate = node_map[mate.id].graphics,
			nmate_pos = nmate.getPosition();

		if (use_stagger){
			nmate.setY(npers_pos.y + (staggerY_amount)); // bind y only
		}
		else {
			nmate.setY(npers_pos.y);
		}

		var ch_x = npers_pos.x + (nodeSize*2); 		// Offset stops shapes from intersecting

		//Mate is on left
		if (ch_x > nmate_pos.x){
			if ((ch_x - nmate_pos.x) < horiz_space ){
				nmate.setX(ch_x - horiz_space);
			}

		nmate_pos = nmate.getPosition() // update pos after change


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
				nmatemate_pos = nmatemate.getPosition(); // update
			}
		}


		if (drawLinesToo){
			var male_id   = (per_isMale)?pers.id:mate.id,
				female_id = (per_isMale)?mate.id:pers.id;

			// -- mateline, and update it's pos
			var mateline_id = edgeAccessor.matelineID(male_id, female_id),
				mateline = edge_map[mateline_id].graphics;

			var s1_x = npers_pos.x, s1_y = npers_pos.y,
				e1_x = nmate_pos.x, e1_y = nmate_pos.y;

			changeRLineHoriz(mateline, npers_pos, nmate_pos);

			//  -- update childlines attached to it
			var childkey_starting = "c:"+mateline_id;   //Look for all childnodes starting with

			for (var key in edge_map){
				if (key.lastIndexOf(childkey_starting,0) === 0) //startsWith implementation
				{
					var find_child_id = key.split('-'),
						child_id = parseInt(find_child_id[find_child_id.length - 1].trim());

					updateGraph.childline(fam_id, child_id);
				}
			}

			// -- mate's childline
			updateGraph.childline(fam_id, mate.id);	


			// -- mate's mate's mateline
			for (var mm=0 ; mm < mate.mates.length; mm++){
				var matemate_id = mate.mates[mm].id,
					matemate_gfx = node_map[matemate_id].graphics;

				var male_id   = (mate.gender===PED.MALE)?mate.id:matemate_id,
					female_id = (mate.gender===PED.FEMALE)?mate.id:matemate_id;

				if (matemate_id != pers_id){

					var mateline_id = edgeAccessor.matelineID(male_id, female_id),
						mateline = edge_map[mateline_id].graphics;

//					var s1_x = mate.getX(), 	s1_y = mate.getY(),
//						e1_x = matemate.getX(), e1_y = matemate.getY();

					changeRLineHoriz(mateline, nmate.getPosition(), matemate_gfx.getPosition());
				}
			}
		}
	}

	// NEED TO UPDATE GENERATION)GRID_IDS

	//If last generation, move all sibs
	if (GlobalLevelGrid.exists(fam_id))
	{
		var last_gen = GlobalLevelGrid.getlastgeneration(fam_id);

		if (last_gen.indexOf(pers_id)!== -1)
		{
			for (var c=0; c < last_gen.length; c++){
				var sib_id = last_gen[c],
					n_sib = node_map[sib_id].graphics;

				n_sib.setY(npers_pos.y);

				if (drawLinesToo){ //Update childlines			
					updateGraph.childline(fam_id, sib_id);
				}
			}
		}
	}


	//Update own childnode.
	if (drawLinesToo && (pers.father != 0 && pers.mother !=0))
	{
		updateGraph.childline(fam_id, pers.id);	
	}
}


// Performs redrawNodes upon all
function touchlines(grid_use){
	use_grid = grid_use;

	familyMapOps.foreachperc(function( perid, famid){

		//console.log("touch", perid, famid);

		var e = new CustomEvent("dragmove", {target: {attrs: {x:10, y:10}}}),
			o = uniqueGraphOps.getFam(famid).nodes[perid].graphics;

		o.dispatchEvent(e);
	});
	use_grid = true;
}


function spaceFamGroups(){

	var fam_placements = {}; // fid -> [position, width]

	familyMapOps.foreachfam(function(fid){

		// Get group width
		var min_x = 999999999, min_y = 9999999,
			max_x = 0, max_y = 0;

		var famgfx = uniqueGraphOps.getFam(fid),
			fgroup = famgfx.group;

		uniqueGraphOps.foreachnode(function(nid, node)
		{
			var xer = node.graphics.getX(),
				yer = node.graphics.getY()

			if (min_x > xer - nodeSize){ min_x = xer - nodeSize; }
			if (max_x < xer + nodeSize){ max_x = xer + nodeSize; }
			
			if (min_y > yer - nodeSize){ min_y = yer - nodeSize; }		
			if (max_y < yer + nodeSize){ max_y = yer + nodeSize; }
		}, fid);

		var group_pos = fgroup.getAbsolutePosition(),
			group_width = max_x - min_x,
			group_height = max_y - min_y;

		fam_placements[fid] = [fgroup, group_pos, group_width, group_height];
	});

	var start_x = nodeSize * 5,
		start_y = 50;

	var total_width = stage.getWidth(),
		last_w = 0;

	for (var f_id in fam_placements){
		var pack = fam_placements[f_id],
			group = pack[0],
			pos = pack[1],
			w = pack[2],
			h = pack[3];

		
		group.setX( start_x );
		group.setY( start_y );

		console.log("setting", f_id, start_x, w, last_w);

		main_layer.add( new Kinetic.Rect({
			x:start_x,
			y:0,
			stroke:"red",
			strokeWidth: 2,
			width: 2,
			height: stage.getHeight()
		}));
		
/*		if (start_x + w > total_width){
			start_x = 10;
			start_y = h + nodeSize*2;
		}*/
		start_x += w;

		group.add( new Kinetic.Rect({
			x:0,
			y:0,
			stroke:"blue",
			strokeWidth: 2,
			width: 2,
			height: stage.getHeight()
		}));

	}
}



// Initial spacing of groups
function spaceFamGroups2()
{
	var leftover_gap = stage.getWidth(),
		num_fams = 0;

	var global_minx = 9999999;

	//First pass get leftover space
	familyMapOps.foreachfam(function(fid){  //should be in this order
		num_fams ++;
		var nodes = uniqueGraphOps.getFam(fid).nodes;

		var min_x = 9999999, max_x = 0;

		for (var nid in nodes){
			if (nid === "0") continue;

			var xer = nodes[nid].graphics.getX();

			if (min_x > xer) min_x = xer;
			if (max_x < xer) max_x = xer;
		}

		if (global_minx > min_x) global_minx = min_x;

		leftover_gap -= max_x - min_x;
	});

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

		familyMapOps.foreachfam(function(fid){
			var group = uniqueGraphOps.getFam(fid).group;
			group.setX(group.getX() + step);
			step += gap_between;
		});
	}
}


function linesShow(fid, show){
	//Hide lines
	var edges = uniqueGraphOps.getFam(fid).edges;
	for (var eid in edges)
		if (show){
			edges[eid].graphics.show();
			edges[eid].graphics.setZIndex(-21);
		}
		else
			edges[eid].graphics.hide();

	main_layer.draw();
}


