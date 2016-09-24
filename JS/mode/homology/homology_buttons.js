

var HomologyButtons = {

	_alreadyset : false,

	_group : document.getElementById('homology_buttons'),
	_type_accessor : document.getElementById('plot_type'),
	_minext_accessor : document.getElementById('zygous_min_stretch'),
	_minscore_accessor : document.getElementById('zygous_min_score'),

	_export_accessor : document.getElementById('homology_export'),
	_redraw_accessor : document.getElementById('homology_redraw'),
	//_exit_accessor : document.getElementById('hom_exit'),

	init: function(){

		HomologyButtons._show();

		if (HomologyButtons._alreadyset){
			return 0;
		}

		// Make onclick events
		HomologyButtons._redraw_accessor.onclick = HomologyMode.redraw;
		HomologyButtons._export_accessor.onclick = function(){

			utility.yesnoprompt("Homology Export", "Export All or Shown?",
				"All", HomologyButtons._printAll,
		 		"Shown", HomologyButtons._printCurrent
			);
		};
		HomologyButtons._alreadyset = true;
	},

	updateHomologyInputs: function(){
		HomologyMode.type = HomologyButtons._type_accessor.value;

		HomologyMode.minexten = Number( HomologyButtons._minext_accessor.value );
		HomologyMode.minscore = Number( HomologyButtons._minscore_accessor.value );
	},


	_printAll: function(){
		HomologyPlot.printToFile(HomologyMode.selected_for_homology);
	},

	_printCurrent: function(){
		HomologyPlot.printToFile(HomologyMode.selected_for_homology, sta_index, end_index);
	},

	_show: function(){
		HomologyMode._active = true;
		HomologyButtons._group.style.display = "block";
	}
}
