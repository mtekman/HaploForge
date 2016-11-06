/* Class that rewrites the selection_tools div to swap in tools for each mode */
var BottomButtons = {

	table_keys : {}, 
	div   : document.getElementById("save_and_close"),
	table : document.getElementById("save_and_close_table"),


	addToolsButton: function(message, shortcut_text, callback)
	{
		BottomButtons.__addToToolsContainer(
			ButtonModes.makeToolsButton("general", message, shortcut_text, callback)
		);
	},


	__addToToolsContainer: function(button)
	{
		BottomButtons.table_keys[button.innerHTML] = button;

		var row = BottomButtons.table.insertRow(),
			cell = row.insertCell();

		cell.appendChild(button);
	},

	__removeFromToolsContainer: function(key)
	{
		var button = BottomButtons.table_keys[key],
			cell = button.parentNode,
			row  = cell.parentNode,
			rowInd = row.rowIndex;

		row.deleteCell(0);
		BottomButtons.table.deleteRow(rowInd);

		delete BottomButtons.table_keys[key];
	},


	/* Switching modes */
	modes: {

		__clearMode: function(){
			for (var k in BottomButtons.table_keys){
				BottomButtons.__removeFromToolsContainer(k);
			}
			BottomButtons.div.style.display = "none";
		},

		__preamble: function(){
			BottomButtons.modes.__clearMode();
			BottomButtons.div.style.display = "block";
		},

		/* Pedigree Creation View */
		setToPedCreate: function()
		{
			BottomButtons.modes.__preamble();

			BottomButtons.addToolsButton("Save", 
				"Ctrl+S|Saves current pedigree to be automatically loaded next time", 
				MainButtonActions.savePedToStorage);

			BottomButtons.addToolsButton("Export", 
				"Ctrl+E|Exports pedigree in LINKAGE format with or without graphics positions saved",
				function(){

				utility.yesnoprompt("Export", "Strip graphics tags?", 
					"Yes", function(){
						Pedfile.exportToTab(false);
					},
					"No", function(){
						Pedfile.exportToTab(true);
					}
				);
			});

			BottomButtons.addToolsButton("Exit", "Ctrl+X|Exits to Main Menu", function(){
				MainButtonActions.exitToMenu();
			});

			ModeTracker.setMode( "pedcreate" );
		},

		/* HaploView */
		setToHaploView: function(){
			BottomButtons.modes.__preamble();

			BottomButtons.addToolsButton("Save", 
				"Ctrl+S|Save current analysis data to be automatically loaded next time",
				MainButtonActions.saveHaploToStorage);
			
			BottomButtons.addToolsButton("Exit", 
				"Ctrl+X|Exits to Main Menu",
				MainButtonActions.exitToMenu);

			ModeTracker.setMode( "haploview" );
		},

		/* Selection View */
		setToSelectionMode: function(){
			BottomButtons.modes.__clearMode();
			ModeTracker.setMode( "selection" );
		},

		/* Side by side Haploblocks */
		setToComparisonMode: function(){
			BottomButtons.modes.__preamble();

			BottomButtons.addToolsButton("Align Pedigree",
				"V|Shifts individuals vertically to be at the same position, or offset by generation", function(){
				HaploWindow.alignTopSelection( DOS.haplo_group_nodes, DOS.haplo_group_lines);
			});

			BottomButtons.addToolsButton("Recolour",
				"R|Random colour assignment to haplo blocks. Founder groups are preserved.", function(){
				FounderColor.makeUniqueColors(true); //random = true
				HaploBlock.redrawHaplos(false);
			});

//			BottomButtons.modes.__clearMode();
			ModeTracker.setMode( "comparison" );
		},


		/* From comparison mode, the buttons showed during homology selection */
		setToHomologySelection: function()
		{
			BottomButtons.modes.__clearMode();
			ModeTracker.setMode( "homselection" );
		},

		/* Align, Find Hom, Range, Marker */
		setToHomologyMode: function()
		{
			BottomButtons.modes.__clearMode();
			ModeTracker.setMode( "homology" );
		}
	}
}



