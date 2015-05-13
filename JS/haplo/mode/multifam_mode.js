// Mode to use for multiple familial selection

/* 
	Generate ped diagrams with number of generation connectors for 
	related individuals.
*/

var selection_items = {}, // fid_id: {box:Object, selected:toggled, affected:bool}
	toggle_selection_affecteds = false;



function renderLinesAndNodes(line_map )
{
	// The line map is a generation array, so has a very top-bottom
	// approach in line placement
	var lines_to_render = [];

	var start_x = 10;

	for (var fid in line_map){
		var start_y = 10;

		for (var g=0; g < line_map[fid].length; g++){

			// ConnectEEs and connectERs... 
			for (var sgroup in line_map[fid][g])
			{
				var directline = line_map[fid][g][sgroup].directlines,
					mateline = line_map[fid][g][sgroup].matelines;

				var sib_line_anchor = null;

				for (var dline in directline){
					// var dos = directline[dline]
					var to_gfx = unique_graph_objs[fid].nodes[dline].graphics;
					to_gfx.setPosition( {x: start_x, y: start_y} );
					start_x += horiz_space;

					sib_line_anchor = {x: start_x - horiz_space, y: start_y + 5};

					lines_to_render.push(
						addRLine_simple( to_gfx.getAbsolutePosition(), sib_line_anchor, false)
					);
				}

				for (var mline in mateline)
				{
					var parents = mline.split('_'),
						fath_id = parseInt(parents[0]),
						moth_id = parseInt(parents[1]);

					var fath_gfx = selection_items[fid + '_' + fath_id].graphics,
						moth_gfx = selection_items[fid + '_' + moth_id].graphics;

					//Place moth + fath
					fath_gfx.setPosition( {x: start_x, y: start_y} );
					start_x += horiz_space;
					moth_gfx.setPosition( {x: start_x, y: start_y} );

					//Get existing line attribs
					// console.log(unique_graph_objs[fid].edges, fath_id, moth_id);
					var consang = unique_graph_objs[fid].edges['m:'+fath_id+'-'+moth_id].consangineous;

					// Add mate line
					lines_to_render.push( 
						addRLine_simple( fath_gfx.getAbsolutePosition(), moth_gfx.getAbsolutePosition(), consang )
					);

					// Add parent line, with DOS, to sib_line
					// var dos = mateline[mline];
					if (sib_line_anchor === null){
						sib_line_anchor = {x: start_x - horiz_space/2, y: start_y + 5};
					}

					lines_to_render.push( 
						addRLine_simple( 
							{x: start_x - horiz_space/2,
						 	y: start_y},
						 	sib_line_anchor,
						 	false
						)
					);

					start_x += horiz_space;
				}
				
				//Iterate over all sibs and hang from anchor
				var sib_ids = sgroup.split('_');

				for (var s=0; s < sib_ids.length; s++)
				{
					var sib_id  = sib_ids[s],
						sib_gfx = unique_graph_objs[fid].nodes[sib_id].graphics

					var pos = {x: start_x, y: sib_line_anchor.y + 5};
					sib_gfx.setPosition( pos );
					start_x += horiz_space;

					lines_to_render.push(
						addRLine_simple( sib_line_anchor, pos, false )
					);
				}
			} // end sib group
		} // end gen
	} // end fam

	console.log("lines to render", lines_to_render);


	for (var l=0; l < lines_to_render.length; l++){
		main_layer.add(l);
	}
	main_layer.draw();
	haplo_layer.draw();

	touchLines();


} //



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


	renderLinesAndNodes( lines );
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