var bhaplox_offset = -5,
	bhaploy_offset = 0;

// var old_scroll_pos_y = -1;


function addHMButton(message, callback)
{
	var b = addButton(message, bhaplox_offset, bhaploy_offset, callback);

	bhaploy_offset += butt_h + 5;
	return b;
}

function resetHMButtons(){
	bhaplox_offset = -5;
	bhaploy_offset = 0;
}

// called in toggle.js
function addHaploScreen(wi, he, fam_id)
{
	active_fam = fam_id;

	var ped_group = new Kinetic.Group();

	var bg = new Kinetic.Rect({
		x: +nodeSize*2,
		y: -nodeSize,
		width: wi - nodeSize*2,
		height: he + nodeSize,
		fill: 'white',
		stroke: 'black',
		strokeWidth: 2,
	});

	var align_button = addHMButton("Align", function(){ toggle_horizAlign(fam_id);});
	var haplo_button = addHMButton("Haplo", function(){ toggle_haplotypes(fam_id);});
	var zoom_button = addHMButton("Zoom", function(){ toggle_zoomer();});

	ped_group.add(bg);
	ped_group.add(align_button);
	ped_group.add(haplo_button);
	ped_group.add(zoom_button);

	ped_group.zoomer = zoom_button;

	//hide by default, enable from toggling haplotypes
	zoom_button.hide();

	resetHMButtons();

	// Space for haplotypes to be rendered
	//
	// General HT window
	var scroll_window = new Kinetic.Group({
		x: -nodeSize*2, y: he + nodeSize*2,
		id:"scroll_panel",
		draggable: false
	});
	// Where HTs are grouped
	var scroll_area__ = new Kinetic.Group({
		draggable:true,
		dragBoundFunc: function(pos){
			var group_loc = this.parent.getAbsolutePosition();

			return {
				x: group_loc.x,
				y: group_loc.y + (Math.floor((pos.y - group_loc.y)/ HAP_VERT_SPA) * HAP_VERT_SPA)
			};
		}
	});
	scroll_area__.on('mouseup', function(){
		redrawHaplos(); // starting=300
		updateInputsByIndex( sta_index, end_index );
		updateSlide();
		mscale_layer.draw();
	});

	var main_rect = new Kinetic.Rect({
		x: -butt_w, y:0,
		width: wi + butt_w,
		height: ((HAP_DRAW_LIM+1) * HAP_VERT_SPA) + nodeSize*2,
		fill: 'white',
		stroke: 'black',
		strokeWidth: 2
	});

	scroll_window.add(main_rect);
	scroll_window.add(scroll_area__);
	scroll_window.hide();

	var total_group = new Kinetic.Group();
	total_group.add(ped_group);
	total_group.add(scroll_window);

	// Outside accessors
	scroll_window.background = main_rect;
	total_group.main_box = scroll_window;
	total_group.scrollable = scroll_area__;

	ped_group.background = bg;

	total_group.ped_grp = ped_group;

//  	ped_group.move(    {x:haplomode_panel_xoffs, y:0});
//  	scroll_window.move({x:haplomode_panel_xoffs, y:0});
 	total_group.move(  {x:haplomode_panel_xoffs, y:0});


	return total_group; // read by toggle_haplomode in haplo/toggle.js
}

