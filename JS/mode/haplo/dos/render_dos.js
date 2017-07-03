
var DOS = {

	initial_group_node_offset : {
		x:HaploWindow.left_margin_x,
		y:40 // <-- Hardcoded for now, because I don't actually know how
		     //     to derive this value
	},
	haplo_group_nodes : new Kinetic.Group(),
	haplo_group_lines : new Kinetic.Group(),

	min : null,
	max : null,
	group : null,

	render: function (line_points, slot_array, finishfunc = 0){
		//
		// Renders to DOS.group
		//
		var min_pos = {x:9999,y:9999},
			max_pos = {x:0,y:0};

		DOS.group = new Kinetic.Group();

		var tween_nodes = [];

		DOS.group.add(DOS.haplo_group_lines);
		DOS.group.add(DOS.haplo_group_nodes);

		// Add directly to layer for now, but after animation over
		// move to white_box group
		haplo_layer.add( DOS.group );

		// Render Nodes
		var start_x = 20;

		min_pos.x = start_x;

		var render_counter = slot_array.length - 1;

		for (var fd=0; fd < slot_array.length; fd++){

			var fid_id = slot_array[fd][0].split('_'),
				y_pos = slot_array[fd][1];
		
			if (min_pos.y > y_pos) min_pos.y = y_pos;

			var fid = fid_id[0], 
				id = fid_id[1];

			var gfx = uniqueGraphOps.getFam(fid).nodes[id].graphics;

			// Store old position before moving
			gfx.main_layer_pos = gfx.getPosition();
			gfx.main_layer_group = uniqueGraphOps.getFam(fid).group;
			gfx.remove()
			gfx.listening( false );
			
			DOS.haplo_group_nodes.add(gfx);

			let mscale = main_layer.getScale(),
				npos = gfx.main_layer_group.getAbsolutePosition()

			gfx.setPosition(
				{x: (npos.x + gfx.main_layer_pos.x)*mscale.x,
				 y: (npos.y + gfx.main_layer_pos.y)*mscale.y}
			);
			gfx.setScale(mscale)

			var tween = kineticTween({
				node: gfx,
				x: start_x + DOS.initial_group_node_offset.x,
				y: y_pos + DOS.initial_group_node_offset.y,
				scaleX: 1,
				scaleY: 1,
				onFinish: function(){
					if (render_counter-- === 0){

						mapLines(line_points, DOS.haplo_group_lines);
						
						if (finishfunc !== 0){
							finishfunc();
						}
					}
				}
			});
			tween_nodes.push(tween);

			// gfx.setPosition( {x:start_x, y:y_pos} );

			start_x += horiz_space;

			if (start_x > max_pos.x) max_pos.x = start_x;
			if (y_pos > max_pos.y) max_pos.y = y_pos;
		}

		// Show that nodes have been popped off
		main_layer.draw();

		for (var t=0; t < tween_nodes.length;){
			tween_nodes[t++].play();
		}

		DOS.min = min_pos;
		DOS.max = max_pos;
	}
}



// Line map is given by DOS
function mapLinesAndNodes(line_map )
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
		var start_y = 0;
		var drop_amount = 50;

		line_points[fid] = {};

		var back_step = 10;

		for (var g=0; g < line_map[fid].length; g++){

//			console.log("gen=", g, line_map[fid][g])


			// ConnectEEs and connectERs...  FUCK THIS
			for (var sgroup in line_map[fid][g])
			{
//				console.log("SIB GROUP", sgroup)
				//start_y += drop_amount;

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
					var consang = uniqueGraphOps.getFam(fid).edges['m:'+fath_id+'-'+moth_id].consangineous;

					addLinePoint(
						fid, fath_id,
						{to:moth_id, consang:consang, drop:null, text:null, lastgen:(g==line_map[fid].length-1)}
					);
					
					// Sib line from mateline
					var dos = mateline[mline];

					let isLastGen = (g==line_map[fid].length-1);
					if (isLastGen){
						addLinePoint(
							fid, fath_id+'_'+moth_id,
							{to: sgroup, consang: false, drop:drop_amount, 
							text: dos, lastgen:isLastGen}
						);
					}
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
					sortXHaplo(sib_stepper, sib_ids[s], fid );
					// addLinePoint( fid, sib_ids[s], {to:sib_ids[s-1]})
				}
			} // end sib group
		} // end gen
	} // end fam

//	console.log("line_map", line_points, "slot_array", slot_array)
	return {lp: line_points, sa: slot_array};
}





function mapLines(line_points, haplo_group_lines){
	// Map Lines to their nodes
	for (var fid in line_points){
		for (var from in line_points[fid]){
			var start_ids = from.split('_')

			var info = line_points[fid][from];

			var sib_anchor_pos = null;

			// Mateline or DOSline
			if (start_ids.length === 1){

				var from_gfx_pos = uniqueGraphOps.getFam(fid).nodes[from].graphics.getPosition();

				if (info.drop === null){ 	// Mateline

					var to_id = info.to,
						to_gfx_pos = uniqueGraphOps.getFam(fid).nodes[to_id].graphics.getPosition();

					haplo_group_lines.add( Graphics.Lines.addRLine_simple(from_gfx_pos, to_gfx_pos, info.consang ) );
				}
			 	else {  
			 		// DOS line -- direct
			 		sib_anchor_pos = {x: from_gfx_pos.x, y:from_gfx_pos.y + info.drop/3};
			 		haplo_group_lines.add( Graphics.Lines.addRLine_simple(from_gfx_pos, sib_anchor_pos, false) );
			 	}
			}
			else { // DOS line -- mate
				var parent1_id = start_ids[0],
					parent2_id = start_ids[1];

				var parent1_gfx = uniqueGraphOps.getFam(fid).nodes[parent1_id].graphics.getPosition(),
					parent2_gfx = uniqueGraphOps.getFam(fid).nodes[parent2_id].graphics.getPosition();

				var mid_point_pos = {x: (parent1_gfx.x + parent2_gfx.x)/2, y: parent1_gfx.y};
				sib_anchor_pos = {x:mid_point_pos.x, y:mid_point_pos.y + info.drop/3};

				haplo_group_lines.add( Graphics.Lines.addRLine_simple(mid_point_pos, sib_anchor_pos, false ));
			}


			if (sib_anchor_pos !== null){
		 		var sib_ids = info.to.split('_');

		 		var min_x_of_sibgroup = 99999999999,
		 			y_pos_of_any_sibline = 999999999;

		 		for (var s=0; s < sib_ids.length; s++){
		 			var sib_id = sib_ids[s],
		 				sib_gfx_pos = uniqueGraphOps.getFam(fid).nodes[sib_id].graphics.getPosition();

		 			var sibline = null;
		 			if (!info.lastgen)
		 				sibline = Graphics.Lines.addRLine_nonoverlapY(sib_anchor_pos, sib_gfx_pos, false);
		 			else
		 				sibline = Graphics.Lines.addRLine_simple(sib_anchor_pos, sib_gfx_pos, false);

		 			haplo_group_lines.add( sibline );

		 			if(sib_gfx_pos.x < min_x_of_sibgroup){
		 				min_x_of_sibgroup = sib_gfx_pos.x;
		 				y_pos_of_any_sibline = sibline.getPoints()[3] + sibline.getY();
		 			}
		 		}

 		//Add dos info
		 		if (info.text > 1){
		 			haplo_group_lines.add(
			 			createDOSCircle(
							(sib_anchor_pos.x + min_x_of_sibgroup) / 2,
							y_pos_of_any_sibline,
							info.text
						)
					);
			 	}
			}
		}
	}

	main_layer.draw();
	haplo_layer.draw();
}



var createDOSCircle = function(xx,yy, dos_text){

	var group = new Kinetic.Group({
		x: xx,
		y: yy
	});

	var circle = new Kinetic.Circle({
		x: 0,
		y: 0,
		radius: 6,
		fill: 'white', stroke: 'black', strokeWidth: 1
	});

	var text = new Kinetic.Text({
		x: - 3,
		y: - 5,
		text: dos_text,
		fontSize: 11, fill: 'black'
	});

	group.add(circle);
	group.add(text);

	return group;
}


