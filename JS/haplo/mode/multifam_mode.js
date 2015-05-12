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
	var start_x = 10;

	for (var fid in line_map){
		var start_y = 10;

		for (var g=0; g < line_map[fid].length; g++){

			// ConnectEEs and connectERs... 
			for (var connectee in line_map[fid][g])
			{
				var sib_ids = connectee.split('_');

				//Iterate over all sibs and hang from line.
				var sib_line; // == coords


				var directline = line_map[fid][g][connectee].directlines,
					mateline = line_map[fid][g][connectee].matelines;

				for (var dline in directline){

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
					start_x += vert_space					
					moth_gfx.setPosition( {x: start_x, y: start_y} );

					//Get existing line attribs
					var consang = unique_graph_objs[fid].edges['m'+fath_id+'_'+moth_id].consanginous;

					// Add mate line
					addRLine_simple( fath_gfx.getAbsolutePosition(), moth_gfx.getAbsolutePosition(), consang );

					// Add parent line, with DOS, to sib_line
					var dos = mateline[mline];
					addRLine_simple(  )


				}


			}
		}


	}


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


	renderLinesAndNodes( lines );

	console.log( lines );
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