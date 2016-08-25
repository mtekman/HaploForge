
var SelectionGraphics = {

	// Shared with homology_selection.js
	// Replicate existing objects with bounding square
	addBounder: function(pos, key, main_layer_yes){

		var rect = SelectionGraphics._addInvisibleOrangeBox(pos);

		rect.on('click', function(){
			//Toggle selection
			this.setStrokeEnabled(!SelectionMode._items[key].selected);

			SelectionMode._items[key].selected = !SelectionMode._items[key].selected
			if (main_layer_yes) main_layer.draw();
			else haplo_layer.draw();
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