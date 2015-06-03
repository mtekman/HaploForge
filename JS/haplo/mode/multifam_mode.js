// Mode to use for multiple familial selection

/* 
	Generate ped diagrams with number of generation connectors for 
	related individuals.
*/

var selection_items = {}, // fid_id: {box:Object, selected:toggled, affected:bool}
	toggle_selection_affecteds = false;



function renderLinesAndNodes(line_map )
{
	var slot_array = []; // index --> gfx

	function sortXHaplo(pos_y, id, fid ){
		var key  = fid+'_'+id;

		for (var k=0; k < slot_array.length; k ++){
			if (key === slot_array[k][0]){
				slot_array.splice(k,1);
				break;
			}
		}
		slot_array.push( [key,pos_y] );
	}


	// The line map is a generation array, so has a very top-bottom
	// approach in line placement
	var line_points = {};
	var end_point_nodes_drawn = {}; // Nodes with lines already attached (no multiple lines)

	function addLinePoint( fid, key, obj )
	{
		if (key in line_points[fid]){
			var eski_obj = line_points[fid][key],
				eski_dos = eski_obj.dos

			if (obj.dos < eski_dos){
				line_points[fid][key] = obj; // Use new object if has a lower DOS
			}
		}
		else {
			line_points[fid][key] = obj;
		}
	}

	for (var fid in line_map){
		var start_y = 400;
		var drop_amount = 50;

		line_points[fid] = {};

		var back_step = 10;

		for (var g=0; g < line_map[fid].length; g++){

			console.log("gen=", g, line_map[fid][g])


			// ConnectEEs and connectERs...  FUCK THIS
			for (var sgroup in line_map[fid][g])
			{
				console.log("SIB GROUP", sgroup)
				// start_y += drop_amount;

				var directline = line_map[fid][g][sgroup].directlines,
					mateline = line_map[fid][g][sgroup].matelines;

				for (var mline in mateline)
				{
					var parents = mline.split('_'),
						fath_id = parents[0],
						moth_id = parents[1];

					//Place moth + fath
					sortXHaplo( start_y , fath_id, fid );
					sortXHaplo( start_y, moth_id, fid );

					// Add mate line
					var consang = unique_graph_objs[fid].edges['m:'+fath_id+'-'+moth_id].consangineous;

					addLinePoint(
						fid, fath_id,
						{to:moth_id, consang:consang, drop:null, text:null, lastgen:(g==line_map[fid].length-1)}
					);
					
					// Sib line from mateline
					var dos = mateline[mline];

					addLinePoint(
						fid, fath_id+'_'+moth_id,
						{to: sgroup, consang: false, drop:drop_amount, 
						text: dos, lastgen:(g==line_map[fid].length-1)}
					);
				}

				// Directline
				for (var dline in directline)
				{
					// Check if dline key is not already part of a mating, (just use that)
					// Easier to check here than upstream
					var found_existing_mateline = false;
					var linep_keys = Object.keys(line_points[fid])

					for (var kk=0; kk < linep_keys.length; kk ++){
						var key_ids = linep_keys[kk].split('_');

						if (key_ids.length != 2) key_ids = [key_ids]

						for (var ik=0; ik < key_ids.length; ik ++){
							if (dline === key_ids[ik]){
								found_existing_mateline = true;
								break;
							}
						}
						if (found_existing_mateline) break;

						// Doesn't work for 76521 - 76611 - 5 - 7 - 8 for fam 1004
						// but only because 76611 is not related to 5 at all (step mother?)
					}

					if (!(found_existing_mateline)){
						start_y += drop_amount;

						sortXHaplo( start_y, dline, fid );

						var dos = directline[dline]

						addLinePoint(
							fid, dline, 
							{to:sgroup, consang:false, drop:drop_amount, 
							 text:dos, lastgen:(g==line_map[fid].length-1)}
						);
					}
				}
				
				//Iterate over all sibs and hang from anchor
				var sib_ids = sgroup.split('_');
				var sib_stepper = (start_y + drop_amount); // + (back_step*(sib_ids.length -1));

				for (var s=0; s < sib_ids.length; s++)
				{
					sortXHaplo(sib_stepper, sib_ids[s], fid )
					// sib_stepper -= back_step;
				}
			} // end sib group
		} // end gen
	} // end fam

	console.log("line_map", line_points)
	return {lp: line_points, sa: slot_array};
}


function renderLines(line_points, haplo_group_lines){
	// Render Lines
	for (var fid in line_points){
		for (var from in line_points[fid]){
			var start_ids = from.split('_')

			var info = line_points[fid][from];

			var sib_anchor_pos = null;

			// Mateline or DOSline
			if (start_ids.length === 1){

				var from_gfx_pos = unique_graph_objs[fid].nodes[from].graphics.getPosition();

				if (info.drop === null){ 	// Mateline

					var to_id = info.to,
						to_gfx_pos = unique_graph_objs[fid].nodes[to_id].graphics.getPosition();

					haplo_group_lines.add( addRLine_simple(from_gfx_pos, to_gfx_pos, info.consang ) );
				}
			 	else {  
			 		// DOS line -- direct
			 		sib_anchor_pos = {x: from_gfx_pos.x, y:from_gfx_pos.y + info.drop/3};
			 		haplo_group_lines.add( addRLine_simple(from_gfx_pos, sib_anchor_pos, false) );
			 	}
			}
			else { // DOS line -- mate
				var parent1_id = start_ids[0],
					parent2_id = start_ids[1];

				var parent1_gfx = unique_graph_objs[fid].nodes[parent1_id].graphics.getPosition(),
					parent2_gfx = unique_graph_objs[fid].nodes[parent2_id].graphics.getPosition();

				var mid_point_pos = {x: (parent1_gfx.x + parent2_gfx.x)/2, y: parent1_gfx.y};
				sib_anchor_pos = {x:mid_point_pos.x, y:mid_point_pos.y + info.drop/3};

				haplo_group_lines.add( addRLine_simple(mid_point_pos, sib_anchor_pos, false ));
			}


			if (sib_anchor_pos !== null){
		 		var sib_ids = info.to.split('_');

		 		var min_x_of_sibgroup = 99999999999,
		 			y_pos_of_any_sibline = 999999999;

		 		for (var s=0; s < sib_ids.length; s++){
		 			var sib_id = sib_ids[s],
		 				sib_gfx_pos = unique_graph_objs[fid].nodes[sib_id].graphics.getPosition();

		 			var sibline = null;
		 			if (!info.lastgen)
		 				sibline = addRLine_nonoverlapY(sib_anchor_pos, sib_gfx_pos, false);
		 			else
		 				sibline = addRLine_simple(sib_anchor_pos, sib_gfx_pos, false);

		 			haplo_group_lines.add( sibline );

		 			if(sib_gfx_pos.x < min_x_of_sibgroup){
		 				min_x_of_sibgroup = sib_gfx_pos.x;
		 				y_pos_of_any_sibline = sibline.getPoints()[3];
		 			}
		 		}

		 		//Add dos info
		 		if (info.text > 1){
			 		haplo_group_lines.add( 
			 			new Kinetic.Circle({
			 				x: ((sib_anchor_pos.x + min_x_of_sibgroup) / 2),
			 				y: y_pos_of_any_sibline, 
			 				radius: 6,
			 				fill: 'white',
			 				stroke: 'black',
			 				strokeWidth: 1
			 			})
			 		);

			 		haplo_group_lines.add(
			 			new Kinetic.Text({
			 				x: ((sib_anchor_pos.x + min_x_of_sibgroup) / 2) - 3,
			 				y: y_pos_of_any_sibline - 5,
				 			text: info.text,
			 				fontSize: 11,
							fill: 'black'}) 
		 			);
			 	}
			}
		}
	}

	main_layer.draw();
	haplo_layer.draw();
}


function render(line_points, slot_array){
	//
	// Render
	//
	var haplo_group_nodes = new Kinetic.Group();
	var tween_nodes = [];
	var haplo_group_lines = new Kinetic.Group();

	haplo_layer.add( new Kinetic.Rect({
		width: window.innerWidth,
		height: window.innerHeight,
		fill: 'black',
		opacity: 0.5
	}));

	haplo_layer.add(haplo_group_lines);
	haplo_layer.add(haplo_group_nodes);

	// Render Nodes
	var start_x = 20;
	var render_counter = slot_array.length - 1;

	for (var fd=0; fd < slot_array.length; fd++){

		var fid_id = slot_array[fd][0].split('_'),
			y_pos = slot_array[fd][1];

		var fid = fid_id[0], 
			id = fid_id[1];

		var gfx = unique_graph_objs[fid].nodes[id].graphics;
		gfx.remove()
		haplo_group_nodes.add(gfx);

		var tween = new Kinetic.Tween({
			node: gfx,
			x: start_x,
			y: y_pos,
			duration:0.8,
			onFinish: function(){
				console.log("FINISHED", render_counter)
				if (render_counter-- === 0){
					renderLines(line_points, haplo_group_lines)							
				}
			},
			easing: Kinetic.Easings.EaseIn
		});
		tween_nodes.push(tween);

		// gfx.setPosition( {x:start_x, y:y_pos} );

		start_x += horiz_space;
	}

	
	for (var t=0; t < tween_nodes.length;)
		tween_nodes[t++].play();
}



function launchHaplomode()
{
	var selection_map = function grabSelecteds(){
		var idmap = {}

		for (var fam_pid in selection_items){
		  	var item = selection_items[fam_pid];

		 	if (!item.selected) continue;
		 	
		 	var fam = fam_pid.split("_")[0],
		 		pid = fam_pid.split("_")[1];

		 	if (!(fam in idmap)){
		 		idmap[fam] = {}; // generations, key first - array later
		 	}

		 	//Hopefully these are at the same level with few discrepencies
		 	var generation = item.graphics.getY()

		 	idmap[fam][generation] = idmap[fam][generation] || [];
		 	idmap[fam][generation].push( pid );
		 }

		for (var fam in idmap)
			idmap[fam] = map2orderedArray( idmap[fam] )

		return idmap;
	};

	var lines = findDOSinSelection( selection_map() );
	var res = renderLinesAndNodes( lines );

	render( res.lp, res.sa );
}


function selectFam(fam_id){
	for (var key in selection_items){
		if (key.split("_")[0] == fam_id)
			selection_items[key].box.fire('click');
	}
}


function startSelectionMode(){

	// Main selection layer
	var select_group = new Kinetic.Group({
		x:0, y:0,
		width: stage.getWidth(),
		height: stage.getHeight()
	});

	select_group.add(
		addButton("Submit", 0, 0, launchHaplomode)
	);

	select_group.add(
		addButton("Select Affecteds", 0, butt_h, function(){

			toggle_selection_affecteds = !toggle_selection_affecteds;

			for (var key in selection_items){

				var item = selection_items[key];
				var affected = (item.graphics.children[0].attrs.fill === col_affs[2])

				if (affected)
					if( (toggle_selection_affecteds && !item.selected)
					 || (!toggle_selection_affecteds && item.selected) )
						item.box.fire('click');
			}

			console.log("affecteds:", Object.keys(selection_items).filter( function (n){ return selection_items[n].affected === true;}));
		})
	);

	// var background = new Kinetic.Rect({
	// 		x:0, y:0,
	// 		width: window.innerWidth,
	// 		height: window.innerHeight,
	// 		fill: 'black',
	// 		opacity: 0.1
	// 	});

	// select_group.add(background);
	// background.moveToBottom();

	// Replicate existing objects with bounding square
	function addBounder(pos, key){
		var border_offs = 3;

		var rect = new Kinetic.Rect({
			x: pos.x - nodeSize - border_offs,
			y: pos.y - nodeSize - border_offs,
			width: (nodeSize *2) + 2*border_offs,
			height: (nodeSize * 2) + 2*border_offs,
			strokeAlpha: 0.5,
			strokeWidth: 3,
			strokeEnabled: false,
			stroke: 'orange',
		});

		rect.on('click', function(){
			//Toggle selection

			this.setStrokeEnabled(!selection_items[key].selected);

			selection_items[key].selected = !selection_items[key].selected
			main_layer.draw();
		});
		return rect;
	}

	for (var fid in unique_graph_objs){
		for (var node in unique_graph_objs[fid].nodes)
		{
			if (node == 0) continue;

			var key = fid+"_"+node

			var gfx = unique_graph_objs[fid].nodes[node].graphics,
				pos = gfx.getAbsolutePosition(),
				bounder = addBounder(pos, key);

			// By default not enabled
			selection_items[key] = {
				box:bounder,
				selected:false,
				graphics: gfx
			};
			select_group.add(bounder);
		}
	}
	main_layer.add(select_group);
	select_group.setZIndex(20);

	main_layer.draw();
}