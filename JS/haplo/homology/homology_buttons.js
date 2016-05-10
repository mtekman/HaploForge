var selected_for_homology; // populated by homology_selection.js

var plots,	// ditto
	rendered_filtered_plot;



var homology_mode_active = false;


var homology_button_group = document.getElementById('homology_buttons'),
	
	homology_type_accessor = document.getElementById('plot_type'),
	homology_minext_accessor = document.getElementById('zygous_min_stretch'),
	homology_minscore_accessor = document.getElementById('zygous_min_score'),

	homology_type = "HOM",
	homology_minexten = 0,
	homology_minscore = 0,

	homology_redraw_accessor = document.getElementById('plot_redraw'),
	homology_exit_accessor = document.getElementById('hom_exit'),
	homology_printcurrent_accessor = document.getElementById('print_current'),
	homology_printall_accessor = document.getElementById('print_all');


// Make onclick events
homology_redraw_accessor.onclick = homology_buttons_redraw;
homology_printall_accessor.onclick = homology_buttons_printAll;
homology_printcurrent_accessor.onclick = homology_buttons_printCurrent;
homology_exit_accessor.onclick = homology_buttons_exit;


function updateHomologyInputs()
{
	homology_type = homology_type_accessor.options[
						homology_type_accessor.selectedIndex
					].value;

	homology_minexten = parseInt( homology_minext_accessor.value );
	homology_minscore = parseInt( homology_minscore_accessor.value );
}


function homology_buttons_printAll()
{
	printToFile(selected_for_homology);
}


function homology_buttons_printCurrent()
{
	printToFile(selected_for_homology, sta_index, end_index);
}


function homology_buttons_exit()
{
	if (sub_select_group != null){
		sub_select_group.destroyChildren();
		sub_select_group.destroy();
	}

	homology_mode_active = false;
	homology_button_group.style.display = "none";
	removeScores();

	haplo_layer.draw();
}


function homology_buttons_show()
{
	homology_mode_active = true;
	homology_button_group.style.display = "block";
}


function homology_buttons_redraw()
{
	updateHomologyInputs();

	plotScoresOnMarkerScale
	(
		plots[homology_type],
		homology_minexten,
		homology_minscore
	);
}