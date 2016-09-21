
var SelectionGraphics = {

	// Shared with homology_selection.js
	// Replicate existing objects with bounding square
	addBounder: function(pos, key, main_layer_yes, hasHaplo){

		console.log("adding bounder", pos, key, main_layer_yes, hasHaplo)

		var rect = SelectionGraphics._addInvisibleOrangeBox(pos);

		rect.on('click', function(){

			if (hasHaplo === null){
				var fid_id = key.split('_').map(x => Number(x));
				hasHaplo = familyMapOps.getPerc(fid_id[1], fid_id[0]).hasHaplo();
			}

			if (!hasHaplo){
				utility.notify("Error", "No haplotypes for individual "+key.split('_')[1]);
			
			} else{
				//Toggle selection
				this.setStrokeEnabled(!SelectionMode._items[key].selected);

				SelectionMode._items[key].selected = !SelectionMode._items[key].selected
				if (main_layer_yes) main_layer.draw();
				else haplo_layer.draw();
			}
		});
		return rect;
	},

	addInvisibleBounder: function(pos, fam_id, main_layer_yes){
		var rect = SelectionGraphics._addInvisibleOrangeBox(pos, 20);

		rect.on('click', function(){
			// Select fam
			SelectionMode.selectFam(fam_id);

			if (main_layer_yes) main_layer.draw();
			else haplo_layer.draw();
		});

		return rect;
	},


	nextEmptySlot: function(fam_id)
	{
		var max_pos = {x:-grid_rezX, y:-grid_rezY};

		familyMapOps.foreachperc(function(perc_id){
			var node = uniqueGraphOps.getNode(perc_id, fam_id ).graphics,
				pos = node.getPosition();

			var new_pos = {
				x: Math.floor( pos.x / (2*grid_rezX)) * 2 * grid_rezX,
				y: Math.floor( pos.y / (2*grid_rezY)) * 2 * grid_rezY
			};

			if (new_pos.x > max_pos.x){ max_pos.x = new_pos.x;}
			if (new_pos.y > max_pos.y){ max_pos.y = new_pos.y;}

		}, fam_id);

		// Add one to Y
		max_pos.y += 2* grid_rezY;

		return max_pos;
	},



	_addInvisibleOrangeBox: function(pos, radius){
		var border_offs = 3,
			radius = radius || nodeSize;

		return new Kinetic.Rect({
			x: pos.x - radius - border_offs,
			y: pos.y - radius - border_offs,
			width: (radius *2) + 2*border_offs,
			height: (radius * 2) + 2*border_offs,
			strokeAlpha: 0.5,
			strokeWidth: 3,
			strokeEnabled: false,
			stroke: 'orange'
		});
	}
}