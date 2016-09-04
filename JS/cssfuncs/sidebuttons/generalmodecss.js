/* Class that rewrites the selection_tools div to swap in tools for each mode */
var GeneralButtons = {

	table_keys : {}, 
	div   : document.getElementById("save_and_close"),
	table : document.getElementById("save_and_close_table"),

	addButton: function(message, callback, show_state){
		var button = document.createElement("button");

		button.innerHTML = message;
		button.onclick = function(){
			callback(show_state)
		};

		return button;
	},

	addToToolsContainer: function(button)
	{
		GeneralButtons.table_keys[button.innerHTML] = button;

		var row = GeneralButtons.table.insertRow(),
			cell = row.insertCell();

		cell.appendChild(button);
	},

	addToolsButton: function(message, callback, show_state){
		GeneralButtons.addToToolsContainer(
			GeneralButtons.addButton(message, callback, show_state)
		);
	},

	removeFromToolsContainer: function(key)
	{
		var button = GeneralButtons.table_keys[key],
			cell = button.parentNode,
			row  = cell.parentNode,
			rowInd = row.rowIndex;

		row.deleteCell(0);
		GeneralButtons.table.deleteRow(rowInd);

		delete GeneralButtons.table_keys[key];
	},


	/* Switching modes */
	modes: {

		clearMode: function(){
			for (var k in GeneralButtons.table_keys){
				GeneralButtons.removeFromToolsContainer(k);
			}
//			console.log("CLEAR");
			GeneralButtons.div.style.display = "none";
		},

		preamble: function(){
//			console.log("PREAMBLE")
			GeneralButtons.modes.clearMode();
			GeneralButtons.div.style.display = "block";
		},

		setToComparisonMode: function(){
			GeneralButtons.modes.clearMode();
		},

		/* Pedigree Creation View */
		setToPedCreate: function()
		{
			GeneralButtons.modes.preamble();

			GeneralButtons.addToolsButton("Save", MainButtonActions.savePedToStorage);
			GeneralButtons.addToolsButton("Export", function(){

				utility.yesnoprompt("Export", "Strip graphics tags?", 
					"Yes", function(){
						userOpts.exportPedGraphicLocs = false;
						PersistData.export();
					},
					"No", function(){
						userOpts.exportPedGraphicLocs = true;
						PersistData.export();
					}
				);
			});
			GeneralButtons.addToolsButton("Exit", MainButtonActions.exitToMenu);
		},

		/* HaploView */
		setToHaploMode: function(){
			GeneralButtons.modes.preamble();

			GeneralButtons.addToolsButton("Save", MainButtonActions.saveHaploToStorage);
			GeneralButtons.addToolsButton("Exit", MainButtonActions.exitToMenu);
		},

		/* Selection View */
		setToSelectionMode: function()
		{
			console.log("gen", "premode")
			GeneralButtons.modes.clearMode();
		},

		/* Selection Editting View */
		setToSelectionMode: function()
		{
			GeneralButtons.modes.clearMode();
		},

		/* Align, Find Hom, Range, Marker */
		setToHomologyMode: function()
		{
			GeneralButtons.modes.clearMode();
		}
	}
}



