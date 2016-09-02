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


	/* HaploView */
	setToHaploMode: function()
	{
		console.log("hapmode")
		GeneralButtons.modes.setToHaploMode();
		ToolModeButtons.modes.setToHaploMode();
	},

	/* Selection View */
	setToSelectionPreMode: function()
	{		
		console.log("premode")
		GeneralButtons.modes.setToSelectionPreMode();
		ToolModeButtons.modes.setToSelectionPreMode();
	},

	/* Selection Editting View */
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
	}
}