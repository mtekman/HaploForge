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
	unique_graph_objs = {}; // fam_id --> purely stores ids, this will be passed to node_map and line_map later


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

	// Recur.
	function addFamMap(root)
	{

		var generation_gridmap_ids = {}; // Essentially an array, but indices are given
		var unique_nodes_fam = {},
			unique_edges_fam = {};


		// Hopefully this can be used to find inbreeding loops
		function incrementNodes(id){
			if (!(id  in unique_nodes_fam))
				unique_nodes_fam = { graphics:null,		//set later by graph_draw
									 count:0};
			unique_nodes_fam[id].count += 1;
		}

		function incrementEdges(id, start_join, end_join, typer){
			if (!(id  in unique_edges_fam))
				unique_edges_fam = {
					graphics:null,		//set later by graph_draw
					count:0,
					type: typer,
					start_join_id = start_join,
					end_join_id = end_join};

			unique_edges_fam[id].count += 1;
		}


		function addTrioEdges(moth, fath, child) {
			//= Assume all indivs are != 0
			var u_matesline = UUID('m', fath.id, moth.id),
				u_parntline = UUID('p', fath.id, moth.id),
				u_childline = UUID('c', u_parntline, child.id);

			//= Edges
			incrementEdges(u_matesline, fath.id, moth.id);
			incrementEdges(u_parntline, u_matesline, -1);
			incrementEdges(u_childline, u_parntline, child.id);

			//= Nodes
			incrementNodes(moth.id);
			incrementNodes(fath.id);
			incrementNodes(child.id); //Already in
		}



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
