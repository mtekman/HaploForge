
var bhaplox_offset = -5,
	bhaploy_offset = 0;

// var old_scroll_pos_y = -1;


function addHMButton(message, callback){
	var b = addButton(message, bhaplox_offset, bhaploy_offset, callback);

	bhaploy_offset += butt_h + 5;
	return b;
}

function resetHMButtons(){
	bhaplox_offset = -5;
	bhaploy_offset = 0;
}


function addHaploScreen(wi, he, fam_id)
{
	var ped_group = new Kinetic.Group();

	var bg = new Kinetic.Rect({
		x: +nodeSize*2,
		y: -nodeSize,
		width: wi - nodeSize*2,
		height: he + nodeSize,
		fill: 'white',
		stroke: 'black', 		   strokeWidth: 2,
	});

	var align_button = addHMButton("Align", function(){ toggle_horizAlign(fam_id);});
	var haplo_button = addHMButton("Haplo", function(){ toggle_haplotypes(fam_id);});


	ped_group.add(bg);
	ped_group.add(align_button);
	ped_group.add(haplo_button);

	resetHMButtons();

	// Space for haplotypes to be rendered
	//
	// General HT window
	var scroll_window = new Kinetic.Group({x: -nodeSize*2, y: he + nodeSize*2, id:"scroll_panel",
										   draggable: false});
	// Where HTs are grouped
	var scroll_area__ = new Kinetic.Group({
		draggable:true,
		dragBoundFunc: function(pos){
			var group_loc = this.parent.getAbsolutePosition();

			return {
				x: group_loc.x,
				//y: (Math.floor(pos.y/ HAP_VERT_SPA) * HAP_VERT_SPA)
				y: group_loc.y + (Math.floor((pos.y - group_loc.y)/ HAP_VERT_SPA) * HAP_VERT_SPA)
			};
		}
	});

	scroll_area__.on('mouseup', function(){
		redrawHaplos(fam_id);
	});

	scroll_window.add(new Kinetic.Rect({
		x: -butt_w, y:0, width: wi + butt_w, height: ((HAP_DRAW_LIM+1) * HAP_VERT_SPA)+nodeSize*2,
		fill: 'white', stroke: 'black',
		strokeWidth: 2
	}));
	scroll_window.add(scroll_area__);
	scroll_window.hide();

	var total_group = new Kinetic.Group();
	total_group.add(ped_group);
	total_group.add(scroll_window);

	return [total_group, scroll_window, scroll_area__, bg]; // read by toggle_haplomode in haplo/toggle.js
}

