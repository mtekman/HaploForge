
var bhaplox_offset = -5,
	bhaploy_offset = 0;


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
		x: -nodeSize*2,            y:-nodeSize,
		width: wi,           	   height: he + nodeSize,
		fill: 'white',
		stroke: 'black', 		   strokeWidth: 2
	});

	var align_button = addHMButton("Align", function(){ toggle_horizAlign(fam_id);});
	var haplo_button = addHMButton("Haplo", function(){ toggle_haplotypes(fam_id);});


	ped_group.add(bg);
	ped_group.add(align_button);
	ped_group.add(haplo_button);
	resetHMButtons();

	// Space for haplotypes to be rendered
	var scroll_group = new Kinetic.Group({x: -nodeSize*2, y: he + nodeSize*2, id:"scroll_panel"});
	scroll_group.add(new Kinetic.Rect({
		x:0, y:0, width: wi, height: 200,
		fill: 'white', stroke: 'black',
		strokeWidth: 2
	}));
	scroll_group.hide();

	var total_group = new Kinetic.Group();
	total_group.add(ped_group);
	total_group.add(scroll_group);

	return [total_group, scroll_group, bg];
}

