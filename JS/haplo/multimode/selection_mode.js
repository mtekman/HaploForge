
// To be shared by haplomode_multi.js too
var selection_items = {}, // fid_id: {box:Object, selected:toggled, affected:bool}
	toggle_selection_affecteds = false,
	select_group,
	select_button = addButton("Select", 0, 0, function(){
		startSelectionMode();
	});

main_layer.add(select_button);


function selectFam(fam_id){
	for (var key in selection_items){
		if (key.split("_")[0] == fam_id)
			selection_items[key].box.fire('click');
	}
}

function stopSelectionMode(){
	select_group.destroyChildren();
	select_group.destroy();

	// Reset all
	toggle_selection_affecteds = false;
	selection_items = {}
	// From haplomode_multi
	selected_ids_map = {}
	selected_ids = {};

	//Add selectionButton again
	select_button = addButton("Selection", 0, 0, function(){
			startSelectionMode();
		});
	main_layer.add(select_button);

	//Delete zoom
	markerInstance.remove();
	mscale_layer.draw();

}



function startSelectionMode()
{
	select_button.destroy();



	// Main selection layer
	select_group = new Kinetic.Group({
		x:0, y:0,
		width: stage.getWidth(),
		height: stage.getHeight()
	});

	var rect_buff = 10;
	var new_rect = new Kinetic.Rect({
			x:rect_buff, y:rect_buff,
			width: stage.getWidth() - 2*rect_buff,
			height: stage.getHeight() - 2*rect_buff,
			stroke: 'red',
			strokeWidth: 0.5,
	});
	select_group.add(new_rect);

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
