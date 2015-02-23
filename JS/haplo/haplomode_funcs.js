
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


function addHaploScreen(wi, he, fam_id){
	var group = new Kinetic.Group({});

	var bg = new Kinetic.Rect({
		x: -nodeSize*2,            y:-nodeSize,
		width: wi,           	   height: he + nodeSize,
		fill: 'white',
		stroke: 'black', 		   strokeWidth: 2
	});

	var align_button = addHMButton("Align", function(){ toggle_horizAlign(fam_id);});
	var haplo_button = addHMButton("Haplo", function(){ toggle_haplotypes(fam_id);});

	group.add(bg);
	group.add(align_button);
	group.add(haplo_button);

	resetHMButtons();

	return group;
}

