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

//Seen by graph_draw.js
var generation_grid_ids = {}, //fam_id --> [generation array]
	unique_graph_objs = {}; // fam_id --> Holds node and edge data, including pointers to graphics


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
					end_join_id: end_join};

			unique_edges_fam[id].count += 1;
		}


		function addTrioEdges(moth, fath, child) {
			//= Assume all indivs are != 0
			var u_matesline = UUID('m', fath.id, moth.id),
				u_parntline = UUID('p', fath.id, moth.id),
				u_childline = UUID('c', u_parntline, child.id);

			//= Edges
			incrementEdges(u_matesline, fath.id, moth.id, 0);
			incrementEdges(u_parntline, u_matesline, -1, 1);
			incrementEdges(u_childline, u_parntline, child.id, 2);

			//= Nodes
			incrementNodes(moth.id);
			incrementNodes(fath.id);
			incrementNodes(child.id); //Already in
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

			//Parents
			if (obj_pers.mother != 0) addNodeArray(obj_pers.mother, level - 1);
			if (obj_pers.father != 0) addNodeArray(obj_pers.father, level - 1);

			if (obj_pers.mother != 0 && obj_pers.father != 0)
				addTrioEdges(obj_pers.mother, obj_pers.father, obj_pers);     	//Add relevant edges

			for (var c=0; c < obj_pers.children.length; c++)                	//Childs
				addNodeArray(obj_pers.children[c], level +1);

			for (var m=0; m < obj_pers.mates.length; m++)                   	//Mates
				addNodeArray(obj_pers.mates[m], level);

			return;
		}

		addNodeArray(root, 0);

		//Convert gridmap into gridarray
		var keys = [];
		for (var k in generation_gridmap_ids)
			keys.push(parseInt(k)); keys.sort();

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

			for (var p=0; p < gen_grid[gen].length; p++)
			{
				var pers_id = gen_grid[gen][p],
					pers = family_map[fam][pers_id],
					n_pers = nodes[pers_id];

				//Mother and Father already set? Center from there
// 				var moth = null, fath = null;

// 				if (pers.mother != 0 && pers.father != 0){
// 					moth = nodes[pers.mother.id].graphics;
// 					fath = nodes[pers.father.id].graphics;
// 				}

// 				if (moth != null && fath != null){
// 					x_pos = Math.floor((moth.getX() + fath.getX())/2);
// 				}
				n_pers.graphics = addPerson(pers, fam_group, x_pos, y_pos); 				//DRAW


				x_pos += horiz_space;
			}
			y_pos += vert_space + 25;
		}


		// Init Edges -- in order of Mateline, parentline, and childline
		for (var tp = 0; tp <= 2; tp ++){

			for(var key in edges)
			{
				var edge = edges[key],
					type = edge.type,
					end_join_id = edge.end_join_id,
					start_join_id = edge.start_join_id;

				if (type !== tp) continue;


				var	start_pos, end_pos;

				console.log(key);

				if(type === 0){
					//Mateline -- get indivs
					start_pos = nodes[start_join_id].graphics.getPosition();
					end_pos = nodes[end_join_id].graphics.getPosition();
				}
				else if (type === 1){
					//ParentLine -- get mateline and drop
					var mateline_points = edges[start_join_id].graphics.getPoints(),

					start_pos = {
						x: Math.floor( (mateline_points[0] + mateline_points[mateline_points.length-2])/2),
						y: mateline_points[1]
					};

					end_pos = {
						x: start_pos.x,
						y: start_pos.y + vert_space
					};
				}

				else if(type === 2){
					//ChildLine -- get parentline drop and child
					var parentline_points = edges[start_join_id].graphics.getPoints();

					start_pos = {
						x:parentline_points[parentline_points.length-2],
						y:parentline_points[parentline_points.length-1]
					};
					end_pos = nodes[end_join_id].graphics.getPosition();
				}
				else assert(false,"Wrong type! "+key+", type= "+type);

				edge.graphics = addRLine(fam_group, start_pos,end_pos); 					//DRAW
				edge.graphics.moveToBottom();
			}
		}
		x_shift_fam += 100;
	}
	finishDraw();
	main_layer.draw();
}






