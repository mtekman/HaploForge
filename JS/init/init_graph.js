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


function graphicsShow(show = true){

	uniqueGraphOps.foreachnode(function(pid,fid,node){
		show?node.graphics.show():node.graphics.hide();
	});

	uniqueGraphOps.foreachedge(function(pid,fid,edge){
		show?edge.graphics.show():edge.graphics.hide();
	});
	main_layer.draw();
}





// After populating, add graphics
function graphInitPos(start_x, start_y, enable_ped_edit = false){

	var x_shift_fam = 0,
		y_start = 10,
		max_fam_width = 160;

	GlobalLevelGrid.foreachfam(function(grid, fam){
		// Each fam gets their own group
		var fam_group;

		if (uniqueGraphOps.famExists(fam) && uniqueGraphOps.getFam(fam).group !== null){
			fam_group = uniqueGraphOps.getFam(fam).group;
		}
		else {
			fam_group = Graphics.Pedigree.addFamily(fam, x_shift_fam, y_start);
		}

		var max_x = 0;

		var fam_gfx = uniqueGraphOps.getFam(fam);
		fam_gfx.group = fam_group

		// Descending down the generations.
		// Main founders are at top
		var y_pos = start_y,
			nodes = fam_gfx.nodes,
			edges = fam_gfx.edges;

 
		// Init Nodes, ordered by generation
		GlobalLevelGrid.foreachgeneration(fam, function(indivs_in_gen){

			var x_pos = start_x;

			var num_peeps = indivs_in_gen.length,
			    isOddNum = !((num_peeps%2)==0),
			    center_x = Math.floor(max_fam_width/2);


			/*
			Everyone is spaced one horiz_space apart, but centred:
			-	odd number of people in a row: centre middle perp
			-	even number of people in a row: space middle two half horiz_space from center
			and then expand out
			*/

			//Can't be helped, JS doesn't support macros... mendokuse na...
			function placePerp(index, posx){
				var perp_id = indivs_in_gen[index],
					perp = familyMapOps.getPerc(perp_id, fam),
					n_perp = nodes[perp_id];

				// Restore meta
				if (typeof perp.stored_meta !== "undefined"){
					//console.log("using stored meta", perp_id, perp.stored_meta);
					var meta = perp.stored_meta;

					posx = meta.x;
					y_pos = meta.y;

					perp.name = meta.name;

					delete perp.stored_meta;
				}
				else {
					// Center on parent's positions
					var moth = perp.mother,
						fath = perp.father;

					// Parent's exist and offsrping is only child
					if (moth !== 0 && moth.children.length === 1){
						var moth_gfx = nodes[moth.id].graphics.getX(),
							fath_gfx = nodes[fath.id].graphics.getX();

						posx = (moth_gfx + fath_gfx) / 2 ;
					}
				}


				n_perp.graphics = Graphics.Pedigree.addPerson(perp, fam_group, posx, y_pos);
				//console.log("addding", n_perp.graphics);

				if (enable_ped_edit){
					n_perp.graphics.family = fam;
				 	personDraw.addClickFunctions(n_perp.graphics);
		 		}


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

		});


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

				else console.assert(false,"Wrong type! "+key+", type= "+type);


				edge.graphics = Graphics.Lines.addRLine(fam_group, start_pos, end_pos, consang); 					//DRAW
				edge.consangineous = consang;

				edge.graphics.moveToBottom();
			}
		}
		x_shift_fam += max_x + 20;
	});

	// --- Placement Positions
	if (isEmpty(Pedfile.__tmpfamdata)){
		// Space automatically
		FamSpacing.init(20);		
	}
	else {
		// Use stored positions
		for (var fam in Pedfile.__tmpfamdata)
		{
			var pos = Pedfile.__tmpfamdata[fam],
				fgr = uniqueGraphOps.getFam(fam).group;

			fgr.setX(pos.x);
			fgr.setY(pos.y);
		}
		Pedfile.__tmpfamdata = {}; //clear
	}

	// --- Determine Bounds for each fam after final placements
	uniqueGraphOps.foreachfam(function(fid,fgr){
		Graphics.Pedigree.updateFamBoundsRect(fgr.group);
		fgr.group._boundsrect.hide();
	});

	autoScaleStage();

	Resize.resizeCanvas();


	// --- Placement Animations
	if (userOpts.fancyGraphics){
		// Solitaire
		graphicsShow(false)
		FancyGraphics.init(); // init performs a graphics show on each node
	}
	else {
		touchlines();
		main_layer.draw();
	}
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

    //console.log("routes2=", pers1_id, pers2_id);

     // = [pers1, pers2];

    var complete = [],
    	loopnum = 0;

    // console.log(pers1.id+"  and  "+pers2.id);
    while(routes2.length > 0 && loopnum++ < 100){

        	var perc = routes2.shift(); // remove from search

/*        	if (perc === undefined){
        		
        	}
*/
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



function autoScaleStage(){
	let min_x = Number.MAX_VALUE,
		min_y = Number.MAX_VALUE,
		max_x = Number.MIN_VALUE,
		max_y = Number.MIN_VALUE;

	// Nodes
	uniqueGraphOps.foreachfam(function(fam, group)
	{
		let rect = group.group._boundsrect;

		let minp = rect.getAbsolutePosition(),
			widt = rect.getWidth(),
			heit = rect.getHeight();

		let maxp = {x: minp.x + widt, y: minp.y + heit};

		if (minp.x < min_x){ min_x = minp.x };
		if (maxp.x > max_x){ max_x = maxp.x };
		if (minp.y < min_y){ min_y = minp.y };
		if (maxp.y > max_y){ max_y = maxp.y };
	});

	// Title
	uniqueGraphOps.foreachfam(function(fam, group)
	{
		let rect = group.group.fam_title_text;

		let minp = rect.getAbsolutePosition(),
			widt = rect.getWidth(),
			heit = rect.getHeight();

		let maxp = {x: minp.x + widt, y: minp.y + heit};

		if (minp.x < min_x){ min_x = minp.x };
		if (maxp.x > max_x){ max_x = maxp.x };
		if (minp.y < min_y){ min_y = minp.y };
		if (maxp.y > max_y){ max_y = maxp.y };
	});


	//Add padding
	let margin = 0;
	min_x -= margin; min_y -= margin; max_x += margin; max_y += margin;

	// Established bounds for all, now:
	//   1. Scale Stage.
	//   2. Center Stage.
	//
	var x_scale = stage.getWidth() / (max_x - min_x),
		y_scale = stage.getHeight()/ (max_y - min_y);

	// Set zoom resolution to 0.1 sensitivity
	x_scale = Math.floor(x_scale / 0.1).toFixed(0) * 0.1;
	y_scale = Math.floor(y_scale / 0.1).toFixed(0) * 0.1;

	console.log(x_scale,y_scale)

	let small_scale = (x_scale < y_scale)?x_scale:y_scale;
	if (small_scale > 1){ small_scale = 1;}
	if (small_scale < 0.1){ small_scale = 0.1;} //absolute smallest req

	kineticTween({
		node:main_layer,
		scaleX:small_scale,
		scaleY:small_scale,
	}).play();


	// Translate all objects by offset
	uniqueGraphOps.foreachfam(function(fam, group)
	{
		let rect = group.group;
		kineticTween({
			node: rect,
			move: {x: -min_x, y: -min_y},
		}).play();
	});


	stage.draw();
}