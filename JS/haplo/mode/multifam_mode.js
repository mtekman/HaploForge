// Mode to use for multiple familial selection

/* 
	Generate ped diagrams with number of generation connectors for 
	related individuals.
*/

var selection_items = {}; // fid"_"id: {box:Object, status:toggled}


function launchHaplomode(){
	/* TODO!
		- Grab sub selection
		- Create new haplomode (?) or update existing ( breakages likely )
			- Merge later
	 */
	console.log( Object.keys(selection_items).filter( function(a){ return selection_items[a].status===true;}));
}



function startSelectionMode(){

	var affected_ids = [];

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
			for (var af=0; af < affected_ids.length; af ++){
				var key = affected_ids[af],
					box = selection_items[key].box

				box.fire('click');
			}
			console.log(affected_ids);
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
			id: key,
			x: pos.x - nodeSize - border_offs,
			y: pos.y - nodeSize - border_offs,
			width: (nodeSize *2) + 2*border_offs,
			height: (nodeSize * 2) + 2*border_offs,
			strokeAlpha: 0.5,
			strokeWidth: 1,
			stroke: 'green',
			dash: [5,2]
		});

		rect.on('click', function(){
			//Toggle selection
			if (!selection_items[key].status){
				this.setStrokeWidth(3);
				this.dashEnabled(false);
			}
			else{
				this.setStrokeWidth(1);
				this.dashEnabled(true);
			}

			selection_items[key].status = !selection_items[key].status
			main_layer.draw();
		});
		return rect;
	}

	for (var fid in unique_graph_objs){
		for (var node in unique_graph_objs[fid].nodes){

			if (node == 0) continue;

			var key = fid+"_"+node

			var gfx = unique_graph_objs[fid].nodes[node].graphics,
				pos = gfx.getAbsolutePosition();

			if (gfx.children[0].attrs.fill === 'red')
				affected_ids.push(key);

			var bounder = addBounder(pos, key);
			select_group.add(bounder);

			// By default not enabled
			selection_items[key] = {box:bounder, status:false}
		}
	}


	main_layer.add(select_group);
	select_group.setZIndex(20);

	main_layer.draw();
}