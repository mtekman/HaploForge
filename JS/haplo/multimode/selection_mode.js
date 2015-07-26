
// To be shared by haplomode_multi.js too
var selection_items = {}, // fid_id: {box:Object, selected:toggled, affected:bool}
	toggle_selection_affecteds = false,
	select_group,
	select_button = addButton("Select Mode", 0, 0, function(){
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
	homology_buttons_exit();

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
	if (markerInstance !== null){
		markerInstance.remove();
		mscale_layer.draw();
	}
	haplo_layer.draw();
	main_layer.draw();
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

	select_group.add(new Kinetic.Rect({
			x:0, y:0,
			width: stage.getWidth(),
			height: stage.getHeight(),
			fill: 'black',
			strokeWidth: 0,
			opacity: 0.1
	}));

	select_group.add(addButton("Select Affecteds", 0, 0, function(){

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
	}, false));

	select_group.add(
		addButton("Submit / Close", 0, butt_h, launchHaplomode)
	);

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