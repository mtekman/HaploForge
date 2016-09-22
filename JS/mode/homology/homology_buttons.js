
var HomologyMode = {

	selected_for_homology: null,

	_exit : null, //set by init and destroyed by quit

	_active : false,
	_minexten : 0,
	_minscore : 0,


	init(){

		HomologyMode._active = true;
		HaploWindow._exit.hide();

		if (HomologyMode._exit === null){
			HomologyMode._exit = addExitButton(
				{x: 20,
				 y: 60},
				 HomologyMode.quit
			);
			HaploWindow._group.add( HomologyMode._exit );
		}

		HomologyMode._exit.show();

		HomologyButtons.init();
	},

	quit: function(){

		ButtonModes.setToHomologySelection();

		HomologyMode._active = false;
		HomologyMode._exit.hide();

		if (HomologySelectionMode.sub_select_group != null){
			HomologySelectionMode.sub_select_group.destroyChildren();
			HomologySelectionMode.sub_select_group.destroy();
		}

		HomologyMode._active = false;
		HomologyButtons._group.style.display = "none";
		HomologyPlot.removeScores();

		HomologySelectionMode.init();

		haplo_layer.draw();
	},

	redraw: function(){
		HomologyButtons.updateHomologyInputs();

		HomologyPlot.plotScoresOnMarkerScale
		(
			HomologyPlot.plots[HomologyMode._type],
			HomologyMode._minexten,
			HomologyMode._minscore
		);
	},


}



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
		if (HomologyButtons._alreadyset){
			return 0;
		}

		// Make onclick events
		HomologyButtons._redraw_accessor.onclick = HomologyButtons._redraw;
		HomologyButtons._export_accessor.onclick = function(){

			utility.yesnoprompt("Homology Export", "Export All or Shown?",
				"All", HomologyButtons._printAll,
		 		"Shown", HomologyButtons._printCurrent
			);
		};
		HomologyButtons._alreadyset = true;
	},

	updateHomologyInputs: function(){
		HomologyMode._type = HomologyButtons._type_accessor.value;

		HomologyButtons._minexten = Number( HomologyButtons._minext_accessor.value );
		HomologyButtons._minscore = Number( HomologyButtons._minscore_accessor.value );
	},


	_printAll: function(){
		HomologyMode.printToFile(HomologyMode.selected_for_homology);
	},

	_printCurrent: function(){
		HomologyMode.printToFile(HomologyMode.selected_for_homology, sta_index, end_index);
	},

	_show: function(){
		HomologyMode._active = true;
		HomologyButtons._group.style.display = "block";
	}
}
