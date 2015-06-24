var haplomode_alignment_toggle = false;

function alignTopSelection( group_nodes, group_lines)
{
	haplomode_alignment_toggle = !haplomode_alignment_toggle;

	var tween_array = [];
	
	if (haplomode_alignment_toggle){
		group_lines.hide();

		var y_line = min_node_placement_y;
		console.log( y_line );

		for (var g=0; g < group_nodes.children.length; g++){
			var nd = group_nodes.children[g];

			nd.old_ypos = nd.getY();

			tween_array.push(
				kineticTween({
					node: nd,
					x: nd.getX(),
					y: y_line,
				})
			);
		}

		// Shrink!
		white_rect.box.old_height = white_rect.box.getHeight();

		tween_array.push(
			kineticTween({
				node: white_rect.box,
				height: white_margin * 3,
			})
		);
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
				node: white_rect.box,
				height: white_rect.box.old_height,
			})
		);
	}

	// Smoother to build tweens first, then execute them
	for (var t=0; t < tween_array.length;)
	{
		tween_array[t++].play();
	}
}