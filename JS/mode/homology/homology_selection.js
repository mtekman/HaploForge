
var HomologySelectionMode = {

	init: function()
	{
		ButtonModes.setToHomologySelection();

		HomologySelectionMode.sub_select_group = null;   //destroyed by homology_buttons exit function
		HomologySelectionMode.__makeBackground();
		HomologySelectionMode.__addBounders();

		haplo_layer.add(HomologySelectionMode.sub_select_group);
		haplo_layer.draw();
	},

	__makeBackground: function()
	{
		// Main selection layer
		HomologySelectionMode.sub_select_group = new Kinetic.Group({
			x:0, y:0,
			width: stage.getWidth(),
			height: stage.getHeight()
		});

		HomologySelectionMode.sub_select_group.rect = new Kinetic.Rect({
			x:0, y:0,
			width: stage.getWidth(),
			height: stage.getHeight(),
			fill: 'black',
			strokeWidth: 0,
			opacity: 0.2
		});

		HomologySelectionMode.sub_select_group.add(
			HomologySelectionMode.sub_select_group.rect
		);
		HomologySelectionMode.sub_select_group.setZIndex(20);

		// Shift top panel to front layer
		HaploWindow._top.moveTo( HomologySelectionMode.sub_select_group )
		HaploWindow._exit.hide();
	},


	__addBounders: function()
	{
		//Clear previous SelectionMode._items
		SelectionMode._items = {};

		for (var c=0; c < DOS.haplo_group_nodes.children.length; c++)
		{
			var node = DOS.haplo_group_nodes.children[c];

			if (node == 0) continue;

			var key = node.attrs.id,
				gfx = node,
				pos = gfx.getAbsolutePosition(),
				bounder = SelectionGraphics.addBounder(pos, key, false, null); // false -> haplo_layer, null --> testHaplos

			// By default not enabled
			SelectionMode._items[key] = {
				box:bounder,
				selected:false,
				graphics: gfx
			};
			HomologySelectionMode.sub_select_group.add(bounder);
		}
	},

	// Called by sidetool.js
	submit: function()
	{
		ButtonModes.setToHomologyMode();

		HomologyMode.selected_for_homology = [];
	
		for (var s in SelectionMode._items){
			if (SelectionMode._items[s].selected)
			{
				SelectionMode._items[s].box.stroke('green')
				HomologyMode.selected_for_homology.push(s);
			}
			SelectionMode._items[s].box.off('click');
		}

		// Shift top panel to front layer
		HaploWindow._top.moveTo( HaploWindow._group )
		HaploWindow._exit.show();

		HomologySelectionMode.sub_select_group.rect.destroy();

		haplo_layer.draw();

		if (HomologyMode.selected_for_homology.length === 0)
			return -1;

		HomologyMode.plots = scan_alleles_for_homology( HomologyMode.selected_for_homology );

		HomologyButtons._show();
		HomologyButtons._redraw();

		return 0;
	}
}
