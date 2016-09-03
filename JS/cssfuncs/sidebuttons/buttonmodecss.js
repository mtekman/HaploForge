/*Wrapper for selection tools and general button
  -- No need to call either directly 
*/

var ButtonModes = {
	
	/* Pedigree Creation View */
	setToPedCreate: function()
	{
		console.log("pedmode")
		GeneralButtons.modes.setToPedCreate();
		ToolModeButtons.modes.setToPedCreate();
	},

	/* Haplo View */
	setToHaploMode: function()
	{		
		console.log("premode")
		GeneralButtons.modes.setToHaploMode();
		ToolModeButtons.modes.setToHaploMode();
	},

	/* Selection View */
	setToSelectionMode: function()
	{
		console.log("selmode")
		GeneralButtons.modes.setToSelectionMode();
		ToolModeButtons.modes.setToSelectionMode();
	},

	/* Align, Find Hom, Range, Marker */
	setToHomologyMode: function()
	{
		console.log("hommode")
		GeneralButtons.modes.setToHomologyMode();
		ToolModeButtons.modes.setToHomologyMode();
	},

	setToComparisonMode: function()
	{
		console.log("compare");
		GeneralButtons.modes.setToComparisonMode();
		ToolModeButtons.modes.setToComparisonMode();
	}
}