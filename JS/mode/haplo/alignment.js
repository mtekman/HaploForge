
HaploWindow.__aligntoggle = false;

HaploWindow.alignTopSelection = function(group_nodes, group_lines)
{
	// Group lines = DOS lines 
	// Group nodes = Pedigree nodes.

	HaploWindow.__aligntoggle = !HaploWindow.__aligntoggle;

	var tween_array = [];
	
	if (HaploWindow.__aligntoggle){
		group_lines.hide();

		var y_line = HaploWindow.min_node_placement_y + DOS.initial_group_node_offset.y;

		for (var g=0; g < group_nodes.children.length; g++){
			var nd = group_nodes.children[g];

			nd.old_ypos = nd.getY();

			tween_array.push(
				kineticTween({
					node: nd,
					x: nd.getX(),
					y: y_line
				})
			);
		}

		// Shrink!
		HaploWindow._top.rect.old_height = HaploWindow._top.rect.getHeight();

		tween_array.push(
			kineticTween({
				node: HaploWindow._top.rect,
				height: HaploWindow.white_margin * 3
			})
		);


		// Move bottom box too (if defined)
		if (HaploWindow._bottom !== undefined){
			HaploWindow._bottom.old_ypos = HaploWindow._bottom.getY();
			HaploWindow._left.old_ypos = HaploWindow._left.getY();

			tween_array.push(
				kineticTween({
					node: HaploWindow._bottom,
					y: (HaploWindow.white_margin * 3) + HaploWindow.y_margin
				})
			);

			tween_array.push(
				kineticTween({
					node: HaploWindow._left,
					y: (HaploWindow.white_margin * 3) + HaploWindow.y_margin
				})
			);
		}
	}
	else {
		var render_counter = group_nodes.children.length - 1;
		// preserved until no longer used

		for (var g=0; g < group_nodes.children.length; g++){
			var nd = group_nodes.children[g];

			tween_array.push(
				kineticTween({
					node: nd,
					x: nd.getX(),
					y: nd.old_ypos,
					onFinish: function(){
						if (render_counter-- === 0){
							group_lines.show();
						}
					}
				})
			);
		}

		// Unshrink
		tween_array.push(
			kineticTween({
				node: HaploWindow._top.rect,
				height: HaploWindow._top.rect.old_height
			})
		);

		tween_array.push(
			kineticTween({
				node: HaploWindow._left,
				y: HaploWindow._left.old_ypos,
			})
		);


		// Move bottom box back
		if (HaploWindow._bottom !== undefined){
			tween_array.push(
				kineticTween({
					node: HaploWindow._bottom,
					y: HaploWindow._bottom.old_ypos
				})
			);
		}
	}

	// Smoother to build tweens first, then execute them
	for (var t=0; t < tween_array.length;)
	{
		tween_array[t++].play();
	}

	setTimeout(Resize.resizeCanvas, 800);

	haplo_layer.draw();
}


