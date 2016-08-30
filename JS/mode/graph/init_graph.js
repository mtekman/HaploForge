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



var addFamMap = {

	generation_gridmap_ids:{},				// Essentially an array, but indices are given
	unique_edges_fam: {},
	unique_nodes_fam: {0:{graphics:null}},   // Add the zero id

	_existing_graphics:null,

	init: function(root, graphicsMap = null){

		if (graphicsMap !== null){
			this._existing_graphics = graphicsMap;
		}

		var afm = this;

		var generation_grid_ids_fam = (new GridMap(root, 			
			function cb1(perc){
				afm.incrementNodes(perc.id);
			},
		
			function cb2(perc){
				if (perc.mother != 0 && perc.father != 0){
					//Add relevant edges
					afm.addTrioEdges(perc.mother, perc.father, perc);					
				}
			}
		)).getGrid();

		var uniq_map = {
			nodes: this.unique_nodes_fam,
			edges: this.unique_edges_fam
		};

		return [generation_grid_ids_fam, uniq_map];
	},


	// Hopefully this can be used to find inbreeding loops
	incrementNodes: function(id)
	{

		if (!(id in this.unique_nodes_fam))
		{
			var graphicsObj = null;
			
			if (this._existing_graphics !== null ){
				graphicsObj = this._existing_graphics.nodes[id];
			}

			this.unique_nodes_fam[id] = {
				graphics:graphicsObj,		// if being read from pedfile, set later by placePerp
			 	count:0
			 };
		}
		else{
			// Id exists, but perhaps not graphics?
			if (this._existing_graphics !== null ){
				console.log("ASDAasd")

				var graphicsObj = this._existing_graphics.nodes[id];
				this.unique_nodes_fam[id].graphics = graphicsObj;
			}
		}

		this.unique_nodes_fam[id].count += 1;
	},

	incrementEdges: function(id, start_join, end_join, typer, 
		mapper = this.unique_edges_fam,
		graphicsObj = null)
	{
		if (!(id in mapper))
		{
			mapper[id] = {
				graphics:graphicsObj,		//set later by placePerp
				count:0,
				type:typer,
				start_join_id: start_join,          //Note: IDs, not positions
				end_join_id: end_join,
				double_line: false 					// Consangineous
			};
		//	console.log(mapper);
		}
		mapper[id].count += 1;
	},

	addTrioEdges: function(moth, fath, child){
		//= Assume all indivs are != 0
		var u_matesline = edgeAccessor.matelineID(fath.id, moth.id),
			u_childline = edgeAccessor.childlineID(u_matesline, child.id);

		//= Edges
		this.incrementEdges(u_matesline, fath.id, moth.id, 0);
		this.incrementEdges(u_childline, u_matesline, child.id, 2);

		//= Nodes
		this.incrementNodes(moth.id);
		this.incrementNodes(fath.id);
		this.incrementNodes(child.id); //Already in
	}
}






function populateGrids_and_UniqueObjs( graphicsMap=null )
{

	//First root indiv for each family
	familyMapOps.foreachfam(function(fam_id){
		var root = familyMapOps.getFirst(fam_id);
		
//		console.log("ROOT=", root.id);

		//Populate gridmap and uniq map
		var arr_obj = addFamMap.init(root, graphicsMap);
		var generation_array = arr_obj[0],
			nodes_edges = arr_obj[1];

//			console.log( generation_array, uniq_objs);

		//Insert into global maps
		uniqueGraphOps.insertFam(fam_id, null);
		uniqueGraphOps.getFam(fam_id).nodes = nodes_edges.nodes;
		uniqueGraphOps.getFam(fam_id).edges = nodes_edges.edges;
		
		generation_grid_ids[fam_id] = generation_array;


		// Check if root tree contains ALL individuals
		var num_nodes = -1; // start at -1 to skip fake indidivual '0'
		for (var node in nodes_edges.nodes) {num_nodes ++};

		var num_peeps = familyMapOps.numPercs(fam_id);
		
		if (num_nodes !== num_peeps){
			console.log("Warning! Family "+fam_id
				+" has only mapped "+num_nodes
				+" individuals out of "
				+ num_peeps
			);
		}
	});
}


// After populating, add graphics
function graphInitPos(start_x, start_y){

	var x_shift_fam = 0;

	for (var fam in generation_grid_ids){
		// Each fam gets their own group
		var fam_group = addFamily(fam, x_shift_fam, 10);
		var max_x = 0;

		var fam_gfx = uniqueGraphOps.getFam(fam);
		fam_gfx.group = fam_group

		// Descending down the generations.
		// Main founders are at top
		var y_pos = start_y,
			gen_grid = generation_grid_ids[fam],
			nodes = fam_gfx.nodes,
			edges = fam_gfx.edges;


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
					perp = familyMapOps.getPerc(perp_id, fam),
					n_perp = nodes[perp_id];


				// Restore meta
				if (typeof perp.stored_meta !== "undefined"){
					//console.log("using stored meta", perp_id, perp.stored_meta);
					var meta = JSON.parse(perp.stored_meta);

					posx = meta.x;
					y_pos = meta.y;
					perp.name = meta.name;

					delete perp.stored_meta;
				}


				// Center on parent's positions
				var moth = perp.mother,
					fath = perp.father;

				// Parent's exist and offsrping is only child
				if (moth !== 0 && moth.children.length === 1){
					var moth_gfx = nodes[moth.id].graphics.getX(),
						fath_gfx = nodes[fath.id].graphics.getX();

					posx = (moth_gfx + fath_gfx) / 2 ;
				}


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
					consang = checkConsanginuity(fam, start_join_id, end_join_id);
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
				edge.consangineous = consang;

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


// Find highest founder - A* best-first search
function checkConsanginuity(fam_id, pers1_id, pers2_id)
{
    var fam_map = familyMapOps.getFam(fam_id),
        pers1 = fam_map[pers1_id],
        pers2 = fam_map[pers2_id];

    // Find pers1 founder
    var routes2 = [];
    routes2.push( pers1 );
    routes2.push( pers2 );
     // = [pers1, pers2];

    var complete = [],
    	loopnum = 0;

    // console.log(pers1.id+"  and  "+pers2.id);
    while(routes2.length > 0 && loopnum++ < 100){
        	var perc = routes2.shift(); // remove from search

        	//Try mother + father
	        if (perc.mother === 0 && perc.father === 0){
	        	complete.push(perc.id);
	        	continue;
	        }

        	if (perc.mother != 0) routes2.push(perc.mother);
        	if (perc.father != 0) routes2.push(perc.father);

        	// console.log(" routes=", routes2.map( function(n){ return n.id;}));
    }
    // console.log("complete=", complete);

    //Find duplicates in complete
    complete = complete.sort();
    for (var a=0; a < complete.length -1; a++){
    	if (complete[a+1] === complete[a])
    		return true;
    }

    return false;
}

