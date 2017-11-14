import MarkerSlider from '/JS/mode/haplo/slider/marker_slider.js';
import HaploWindow from '/JS/mode/haplo/haplomode.js';
import HomologyButtons from '/JS/mode/homology/homology_buttons.js';
import HomologyPlot from '/JS/mode/homology/homology_plot.js';
import HomologySelectionMode from '/JS/mode/homology/homology_selection.js';
import ButtonModes from '/JS/cssfuncs/buttonmodes/buttonmodes_wrapper.js';

export default var HomologyMode = {

	selected_for_homology: null,

	_exit : null, //set by init and destroyed by quit
	_active : false,

	minexten : 0,
	minscore : 0,
	type : null,


	init(){
		ButtonModes.setToHomologyMode();

		HomologyMode._active = true;
		HaploWindow._exit.hide();

		HomologyMode._exit = addExitButton(
			{x: 20,
			 y: 20},
			 HomologyMode.quit,
			 0
		);
		HomologySelectionMode.sub_select_group.add(
			HomologyMode._exit
		);

		HomologyButtons.init();
	},

	quit: function()
	{
		HomologyMode._active = false;

		HomologyMode._exit.destroy();

		HomologySelectionMode.cleanup();

		HomologyButtons._group.style.display = "none";

		HomologyPlot.removeScores();

		//HomologySelectionMode.init();
		// Just quit to comparison view instead
		HomologySelectionMode.quit();


		MarkerSlider.makeVisible(true)

		haplo_layer.draw();
	},

	redraw: function(){
		HomologyButtons.updateHomologyInputs();

		HomologyPlot.plotScoresOnMarkerScale
		(
			HomologyPlot.plots[HomologyMode.type],
			HomologyMode.minexten,
			HomologyMode.minscore
		);
	},
}
