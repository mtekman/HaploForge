var sub_select_group = null; //destroyed by homology_buttons exit function

var homology_selection_mode = function()
{
	// Main selection layer
	sub_select_group = new Kinetic.Group({
		x:0, y:0,
		width: stage.getWidth(),
		height: stage.getHeight()
	});

	sub_select_group.rect = new Kinetic.Rect({
			x:0, y:0,
			width: stage.getWidth(),
			height: stage.getHeight(),
			fill: 'black',
			strokeWidth: 0,
			opacity: 0.2
	});
	sub_select_group.submit_button = addButton("Submit Selection", 0, 0,
		function()
		{
			HomologyMode.selected_for_homology = [];
		
			for (var s in SelectionMode._items){
				if (SelectionMode._items[s].selected){

					SelectionMode._items[s].box.stroke('green')

					HomologyMode.selected_for_homology.push(s);
				}
				SelectionMode._items[s].box.off('click');
			}

			// Shift top panel to front layer
			HaploWindow._top.moveTo( HaploWindow._group )
			HaploWindow._exit.show();


			sub_select_group.rect.destroy();
			sub_select_group.submit_button.destroy();

			haplo_layer.draw();

			if (HomologyMode.selected_for_homology.length === 0)
				return -1;

			plots = scan_alleles_for_homology( HomologyMode.selected_for_homology );

			HomologyButtons._show();
			HomologyButtons._redraw();

			return 0;
		}
	);

	sub_select_group.add( sub_select_group.rect );
	sub_select_group.add( sub_select_group.submit_button )


	// Shift top panel to front layer
	HaploWindow._top.moveTo(sub_select_group)
	HaploWindow._exit.hide();

	for (var c=0; c < DOS.haplo_group_nodes.children.length; c++)
	{
			var node = DOS.haplo_group_nodes.children[c];

			if (node == 0) continue;

			var key = node.attrs.id;

			var gfx = node,
				pos = gfx.getAbsolutePosition(),
				bounder = SelectionGraphics.addBounder(pos, key, false);

			// By default not enabled
			SelectionMode._items[key] = {
				box:bounder,
				selected:false,
				graphics: gfx
			};
			sub_select_group.add(bounder);
		// }
	}


	haplo_layer.add(sub_select_group);
	sub_select_group.setZIndex(20);
	haplo_layer.draw();
}

