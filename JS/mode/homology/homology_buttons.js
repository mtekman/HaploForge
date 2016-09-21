

var HomologyButtons = {

	_group : document.getElementById('homology_buttons'),
	_type_accessor : document.getElementById('plot_type'),
	_minext_accessor : document.getElementById('zygous_min_stretch'),
	_minscore_accessor : document.getElementById('zygous_min_score'),

	_export_accessor : document.getElementById('homology_export'),
	_redraw_accessor : document.getElementById('homology_redraw'),
	//_exit_accessor : document.getElementById('hom_exit'),

	init: function(){
		// Make onclick events
		HomologyButtons._exit_accessor.onclick = HomologyButtons._exit;
		HomologyButtons._redraw_accessor.onclick = HomologyButtons._redraw;
		HomologyButtons._export_accessor.onclick = function(){
			utility.yesnoprompt("Homology Export", "Export All or Shown?",
				"All", HomologyButtons._printAll,
		 		"Shown", HomologyButtons._printCurrent
			);
		};
	},

	updateHomologyInputs: function(){
		HomologyMode._type = HomologyButtons._type_accessor.value;

		HomologyButtons._minexten = Number( HomologyButtons._minext_accessor.value );
		HomologyButtons._minscore = Number( HomologyButtons._minscore_accessor.value );
	},

	_exit: function()
	{
		if (HomologySelectionMode.sub_select_group != null){
			HomologySelectionMode.sub_select_group.destroyChildren();
			HomologySelectionMode.sub_select_group.destroy();
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
			HomologyMode.plots[HomologyMode._type],
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
