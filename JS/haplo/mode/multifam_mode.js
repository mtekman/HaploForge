// Mode to use for multiple familial selection

/* TODO: Add buttons:
	- Submit selection
	- Select Affecteds

	Generate ped diagrams with number of generation connectors for 
	related individuals.
*/


function startSelectionMode(){

	var selection_items = {}; // fid"_"id: toggled status

	var select_group = new Kinetic.Group({
		x:0, y:0,
		width: stage.getWidth(),
		height: stage.getHeight()
	});


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
			strokeWidth: 1,
			stroke: 'green',
			dash: [5,2]
		});

		rect.on('click', function(){
			//Toggle selection
			if (!selection_items[key]){
				this.setStrokeWidth(3);
				this.dashEnabled(false);
			}
			else{
				this.setStrokeWidth(1);
				this.dashEnabled(true);
			}

			selection_items[key] = !selection_items[key]
			main_layer.draw();
		});
		return rect;
	}

	for (var fid in unique_graph_objs){
		for (var node in unique_graph_objs[fid].nodes){

			if (node == 0) continue;

			var key = fid+"_"+node

			console.log(key);

			var gfx = unique_graph_objs[fid].nodes[node].graphics,
				pos = gfx.getAbsolutePosition();

			var boundingbox = addBounder(pos, key)
			select_group.add(boundingbox);

			// By default not enabled
			selection_items[key] = false;
		}
	}


	main_layer.add(select_group);
	select_group.setZIndex(20);

	main_layer.draw();
}