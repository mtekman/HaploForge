/*Drawing a pedigree - trickier than you'd think, simple draw rec messes up lines

Steps:
   1. Make a grid
   2. Recurse nodes
      - toplevel nodes are downshifted by existence of parents
      - place under a male-then-female order.
        - for extra mates, that is [male,female,female,...] or [male,male,...,female]
   3. Render nodes top-down from grid under parental placement
   4. Populate unique edges and render after
  - Allowed edges: [0]parent-mate, [1] parent-to-parentline, [2] child-to-parentline
  - Struct: { 0: horiz line
              1: parent_line:
                      connector from center of PAR_i and PAR_j extending down vert line
                      initiated from parent on parent.children.length > 0,
              2: child_conn :
                      connector from child to parent_line}

Notes:
   * Main intersect problems are x-specific, no need to worry about generations
   * Minimal drawing graph is then peds + unique_edges, and we can use that graph
     for all future draws (moving, dragging, etc)

*/


// Methods
function UUID(type, from_id, to_id){
	// m Father_id Mother_id   // MAYBE UNITE m and p?
	// p Father_id Mother_id
	// c parentline child_id

	// straightforward to find childline from two parents
	// (e.g any keys starting with "c m F_id M_id"
	return type+":"+from_id+"-"+to_id;
}



function populateGrids_and_UniqueObjs()
{

	function addFamMap(root)
	{

		var generation_gridmap_ids = {}, // Essentially an array, but indices are given
			unique_nodes_fam = {0:{graphics:null}},   // Add the zero id
			unique_edges_fam = {};


		// Hopefully this can be used to find inbreeding loops
		function incrementNodes(id){
			if (!(id in unique_nodes_fam))
				unique_nodes_fam[id] = {graphics:null,		//set later by graph_draw
									 	count:0};
			unique_nodes_fam[id].count += 1;
		}

		function incrementEdges(id, start_join, end_join, typer){
			if (!(id in unique_edges_fam))
				unique_edges_fam[id] = {
					graphics:null,		//set later by graph_draw
					count:0,
					type: typer,
					start_join_id: start_join,          //Note: IDs, not positions
					end_join_id: end_join,
					double_line: false};        		// Consangineous

			unique_edges_fam[id].count += 1;
		}


		function addTrioEdges(moth, fath, child) {
			//= Assume all indivs are != 0
			var u_matesline = UUID('m', fath.id, moth.id),
				u_childline = UUID('c', u_matesline, child.id);

			//= Edges
			incrementEdges(u_matesline, fath.id, moth.id, 0);
			incrementEdges(u_childline, u_matesline, child.id, 2);

			//= Nodes
			incrementNodes(moth.id);
			incrementNodes(fath.id);
			incrementNodes(child.id); //Already in
		}


		function intersect_safe(a, b)
		{
			var ai=0, bi=0;
			var result = new Array();

			while( ai < a.length && bi < b.length )
			{
				if      (a[ai].id < b[bi].id ){ ai++; }
				else if (a[ai].id > b[bi].id ){ bi++; }
				else /* they're equal */
				{
					result.push(a[ai]);
					ai++;
					bi++;
				}
			}
			return result;
		}


		//Recurse...
		function addNodeArray(obj_pers, level)
		{
			if (obj_pers.id in unique_nodes_fam) return;

			// Add current
			incrementNodes(obj_pers.id); //needed?

			if (!(level in generation_gridmap_ids))
				generation_gridmap_ids[level] = [];

			generation_gridmap_ids[level].push(obj_pers.id);

			for (var m=0; m < obj_pers.mates.length; m++){                   	//Mates
				addNodeArray(obj_pers.mates[m], level);

				//Child from mate?
				var shared_childs = intersect_safe(obj_pers.children, obj_pers.mates[m].children);
// 				console.log(obj_pers.id, obj_pers.mates[m].id, shared_childs);

				for (var c=0; c < shared_childs.length; c++)                	//Childs
					addNodeArray(shared_childs[c], level +1);

			}

			//Parents
			if (obj_pers.mother != 0) addNodeArray(obj_pers.mother, level - 1);
			if (obj_pers.father != 0) addNodeArray(obj_pers.father, level - 1);

			if (obj_pers.mother != 0 && obj_pers.father != 0)
				addTrioEdges(obj_pers.mother, obj_pers.father, obj_pers);     	//Add relevant edges



			return;
		}

		addNodeArray(root, 0);

		//Convert gridmap into gridarray
		var level_offset = 20; 				// Sort function doesn't work on negative numbers...

		var keys = Object.keys(generation_gridmap_ids).map(function (n){ return parseInt(n)+level_offset;});
		keys.sort();
		keys = keys.map(function (n){ return n-level_offset;});

		var generation_grid_ids_fam = [];
		for (var k=0; k < keys.length; k++)
			generation_grid_ids_fam.push(generation_gridmap_ids[keys[k]]);


		var uniq_map = {nodes: unique_nodes_fam, edges: unique_edges_fam};

		return [generation_grid_ids_fam, uniq_map];
	}



	//First root indiv for each family
	for (var one in family_map){
		for (var two in family_map[one]){
			var root = family_map[one][two];

			//Populate gridmap and uniq map
			var [generation_array, uniq_objs] = addFamMap(root);

			//Insert into global maps
			generation_grid_ids[one] = generation_array;
			unique_graph_objs[one] = uniq_objs;

			break; //Once per fam
		}
	}
}


// After populating, add graphics
function graphInitPos(start_x, start_y){
	var x_shift_fam = 0;

	for (var fam in generation_grid_ids){
		// Each fam gets their own group
		var fam_group = addFamily(fam, x_shift_fam, 10);
		var max_x = 0;

		// Descending down the generations.
		// Main founders are at top
		var y_pos = start_y,
			gen_grid = generation_grid_ids[fam],
			nodes = unique_graph_objs[fam].nodes,
			edges = unique_graph_objs[fam].edges;

		unique_graph_objs[fam].group = fam_group;

		// Init Nodes, ordered by generation_grid_ids
		for (var gen=0; gen < gen_grid.length; gen++){
			var x_pos = start_x;

			var num_peeps = gen_grid[gen].length,
				isOddNum = !((num_peeps%2)==0),
				center_x = Math.floor(max_fam_width/2);


			/*
			Everyone is spaced one horiz_space apart, but centred:
			-	odd number of people in a row: centre middle perp
			-	even number of people in a row: space middle two half horiz_space from center
			and then expand out
			*/

			//Can't be helped, JS doesn't support macros...
			function placePerp(index, posx){
				var perp_id = gen_grid[gen][index],
					perp = family_map[fam][perp_id],
					n_perp = nodes[perp_id]


				n_perp.graphics = addPerson(perp, fam_group, posx, y_pos);

// 				posx  = Math.floor(posx/grid_rezX)*grid_rezX;
// 				y_pos = Math.floor(y_pos/grid_rezY)*grid_rezY;

				if(posx > max_x) max_x = posx;
			}

			var start1, start2;

			if (isOddNum)
			{
				var center_ind = Math.floor(num_peeps/2);
				placePerp(center_ind, center_x);

				//Expansion
				var tmp1 = center_ind,
					tmp2 = center_ind;

				start1 = center_x,
				start2 = center_x;

				while(tmp1 > 0){
					placePerp(--tmp1, start1 -= horiz_space);
					placePerp(++tmp2, start2 += horiz_space);
				}
			}
			else {
				var center2_ind = (num_peeps/2),
					center1_ind = center2_ind - 1;

				//Expansion
				var tmp1 = center2_ind,
					tmp2 = center1_ind;

				start1 = center_x + Math.floor(horiz_space/2);
				start2 = center_x - Math.floor(horiz_space/2);

				while (tmp1 > 0){
					placePerp(--tmp1, start1 -= horiz_space);
					placePerp(++tmp2, start2 += horiz_space);
				}
			}

			y_pos += vert_space + 25;
		}


		// Init Edges -- in order of Mateline, and Childline
		for (var tp = 0; tp <= 2; tp ++){

			for(var key in edges)
			{
				var edge = edges[key],
					type = edge.type,
					end_join_id = edge.end_join_id,
					start_join_id = edge.start_join_id;

				if (type !== tp) continue;

				var	start_pos, end_pos,
					consang = false;


				if(type === 0){
					// Mateline
					start_pos = nodes[start_join_id].graphics.getPosition();
					end_pos = nodes[end_join_id].graphics.getPosition();
					consang = checkConsanginuity(fam_group, start_join_id, end_join_id);
				}
				else if(type === 2)
				{
					// Childline
					var mateline_points = edges[start_join_id].graphics.getPoints(),
						child_pos       = nodes[  end_join_id].graphics.getPosition();

					start_pos = {
						x: Math.floor((mateline_points[0] + mateline_points[2])/2),
						y: mateline_points[1]
					};
					end_pos = {	x: child_pos.x,	y: child_pos.y	};
				}

				else assert(false,"Wrong type! "+key+", type= "+type);


				edge.graphics = addRLine(fam_group, start_pos, end_pos, consang); 					//DRAW
				edge.graphics.moveToBottom();
			}
		}
		x_shift_fam += max_x + 20;
	}

	//Go over everyone and touch their lines
	finishDraw();
	touchlines();
	spaceFamGroups();

	main_layer.draw();
}


// Hmm... needs work
function checkConsanginuity(fam_id, pers1_id, pers2_id)
{
	return false;

	var fam_map = family_map[fam_id],
		pers1 = fam_map[pers1_id],
		pers2 = fam_map[pers2_id];


	while (true){
		var m1 = pers1.mother, f1 = pers1.father,
			m2 = pers2.mother, f2 = pers2.father;

		if (m1.mother.id == m2.mother.id) return true;
		if (m1.father.id == m2.father.id) return true;

	}



	while (pers1.mother !=0 && pers1.father != 0)


	return false;
}


