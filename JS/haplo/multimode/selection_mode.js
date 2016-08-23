
// To be shared by haplomode_multi.js too
var selection_items = {}, // fid_id: {box:Object, selected:toggled, affected:bool}
	select_group;



function selectFam(fam_id){
	for (var key in selection_items){
		if (key.split("_")[0] == fam_id)
			selection_items[key].box.fire('click');
	}
}

function stopSelectionMode(){
	homology_buttons_exit();

	select_group.destroyChildren();
	select_group.destroy();

	// Reset all
	selection_items = {}

	// From haplomode_multi
	selected_ids_map = {}
	selected_ids = {};

	//Delete zoom
	if (markerInstance !== null){
		markerInstance.remove();
		haplo_layer.draw();
	}
	haplo_layer.draw();
	main_layer.draw();
}



function startSelectionMode()
{
	// Main selection layer
	select_group = new Kinetic.Group({
		x:0, y:0,
		width: stage.getWidth(),
		height: stage.getHeight()
	});

	select_group.add(new Kinetic.Rect({
			x:0, y:0,
			width: stage.getWidth(),
			height: stage.getHeight(),
			fill: 'black',
			strokeWidth: 0,
			opacity: 0.1
	}));


	for (var fid in unique_graph_objs)
	{
		var text_butt = unique_graph_objs[fid].group.fam_title_text;
		var text_bounder = addInvisibleBounder( text_butt.getAbsolutePosition(), fid, true);

		select_group.add(text_bounder)

		for (var node in unique_graph_objs[fid].nodes)
		{
			if (node == 0) continue;

			var key = fid+"_"+node

			var gfx = unique_graph_objs[fid].nodes[node].graphics,
				pos = gfx.getAbsolutePosition(),
				bounder = addBounder(pos, key, true);

			gfx.attrs.draggable = false;

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


// Shared with homology_selection.js
// Replicate existing objects with bounding square
function addBounder(pos, key, main_layer_yes){

	var rect = addInvisibleOrangeBox(pos);

	rect.on('click', function(){
		//Toggle selection
		this.setStrokeEnabled(!selection_items[key].selected);

		selection_items[key].selected = !selection_items[key].selected
		if (main_layer_yes) main_layer.draw();
		else haplo_layer.draw();
	});

	return rect;
}

function addInvisibleBounder(pos, fam_id, main_layer_yes){
	var rect = addInvisibleOrangeBox(pos, 20);

	rect.on('click', function(){
		// Select fam
		selectFam(fam_id);

		if (main_layer_yes) main_layer.draw();
		else haplo_layer.draw();
	});

	return rect;
}