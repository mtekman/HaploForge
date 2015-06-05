var haplomode_alignment_toggle = false;

function alignSelection( group_nodes, group_lines)
{
	haplomode_alignment_toggle = !haplomode_alignment_toggle;

	var tween_array = [];
	
	if (haplomode_alignment_toggle){
		group_lines.hide();

		var y_line = 400; // Set in globals

		for (var g=0; g < group_nodes.children.length; g++){
			var nd = group_nodes.children[g];

			nd.old_ypos = nd.getY();

			tween_array.push(
				new Kinetic.Tween({
					node: nd,
					x: nd.getX(),
					y: y_line,
					duration: 0.8,
					easing: Kinetic.Easings.EaseIn
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
				new Kinetic.Tween({
					node: nd,
					x: nd.getX(),
					y: nd.old_ypos,
					duration: 0.8,
					easing: Kinetic.Easings.EaseIn,
					onFinish: function(){
						if (render_counter-- === 0){
							group_lines.show();
						}
					}
				})
			);
		}
	}

	for (var t=0; t < tween_array.length;)
	{
		tween_array[t++].play();
	}
}