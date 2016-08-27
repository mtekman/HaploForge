
var HomologyButtons = {

	_group : document.getElementById('homology_buttons'),
	_type_accessor : document.getElementById('plot_type'),
	_minext_accessor : document.getElementById('zygous_min_stretch'),
	_minscore_accessor : document.getElementById('zygous_min_score'),

	_printcurrent_accessor : document.getElementById('print_current'),
	_printall_accessor : document.getElementById('print_all'),
	_redraw_accessor : document.getElementById('plot_redraw'),
	_exit_accessor : document.getElementById('hom_exit'),

	init: function(){
		// Make onclick events
		HomologyButtons._exit_accessor.onclick = HomologyButtons._exit;
		HomologyButtons._redraw_accessor.onclick = HomologyButtons._redraw;
		HomologyButtons._printall_accessor.onclick = HomologyButtons._printAll;
		HomologyButtons._printcurrent_accessor.onclick = HomologyButtons._printCurrent;
	},

	updateHomologyInputs: function(){
		HomologyMode._type = HomologyButtons._type_accessor.options[
			HomologyButtons._type_accessor.selectedIndex
		].value;

		HomologyButtons._minexten = parseInt( HomologyButtons._minext_accessor.value );
		HomologyButtons._minscore = parseInt( HomologyButtons._minscore_accessor.value );
	},

	_exit: function()
	{
		if (sub_select_group != null){
			sub_select_group.destroyChildren();
			sub_select_group.destroy();
		}
		HomologyMode._active = false;
		HomologyButtons._group.style.display = "none";
		HomologyMode.removeScores();

		haplo_layer.draw();
	},

	_redraw: function(){
		HomologyButtons.updateHomologyInputs();

		HomologyMode.plotScoresOnMarkerScale
		(
			plots[HomologyMode._type],
			HomologyMode._minexten,
			HomologyMode._minscore
		);
	},

	_printAll: function(){
		printToFile(selected_for_homology);
	},

	_printCurrent: function(){
		printToFile(selected_for_homology, sta_index, end_index);
	},

	_show: function(){
		HomologyMode._active = true;
		HomologyButtons._group.style.display = "block";
	},

}