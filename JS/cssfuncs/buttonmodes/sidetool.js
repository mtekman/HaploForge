/* Class that rewrites the selection_tools div to swap in tools for each mode */
var ToolButtons = {

	table_keys : {}, 
	div   : document.getElementById("selection_tools"),
	table : document.getElementById("selection_table"),
	title : document.getElementById("selection_title"),

	setWidth: function(px){
		ToolButtons.div.style.width = px + 'px';
	},

	setTitle: function(title){
		ToolButtons.title.innerHTML = title;
	},

	addButton: function(message, title_text, callback, show_state){
		var button = document.createElement("button");

		button.title = title_text;
		button.innerHTML = message;
		button.onclick = function(){
			callback(show_state)
		};

		return button;
	},

	addToToolsContainer: function(button)
	{
		ToolButtons.table_keys[button.innerHTML] = button;

		var row = ToolButtons.table.insertRow(),
			cell = row.insertCell();

		cell.appendChild(button);
	},

	addToolsButton: function(message, shortcut_key, callback, show_state){
		ToolButtons.addToToolsContainer(
			ToolButtons.addButton(message, shortcut_key, callback, show_state)
		);

		ButtonModes.addKeyboardShortcut( "sidetool", shortcut_key, callback)
	},

	removeFromToolsContainer: function(key)
	{
		var button = ToolButtons.table_keys[key],
			cell = button.parentNode,
			row  = cell.parentNode,
			rowInd = row.rowIndex;

		row.deleteCell(0);
		ToolButtons.table.deleteRow(rowInd);

		delete ToolButtons.table_keys[key];
	},


	/* Switching modes */
	modes: {

		clearMode: function(){
			for (var k in ToolButtons.table_keys){
				ToolButtons.removeFromToolsContainer(k);
			}
			ButtonModes.removeKeyboardShortcuts("sidetool");

			ToolButtons.setTitle("");
			ToolButtons.div.style.display = "none";
		},

		preamble: function(){
			ToolButtons.modes.clearMode();
			ToolButtons.div.style.display = "block";
		},

		/* Pedigree Creation View */
		setToPedCreate: function()
		{
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Ped Tools");
			ToolButtons.addToolsButton("Add Individual", "I", function(){personDraw.addNode();});
			ToolButtons.addToolsButton("Add Family", "F", function(){familyDraw.addFam();});
			ToolButtons.addToolsButton("Mate-Mate", "M", function(){
				(new MatelineDraw(familyDraw.active_fam_group.id)).init();
			});
			ToolButtons.addToolsButton("Parent-Offspring", "P", function(){
				(new OffspringDraw(familyDraw.active_fam_group.id)).init();
			});
		},

		/* Haplo View */
		setToHaploView: function()
		{
			ToolButtons.modes.preamble();

			//ToolButtons.setWidth(90);
			ToolButtons.setTitle("Pedigree");

			ToolButtons.addToolsButton("Start Analysis", "Enter" , SelectionMode.init);

			ToolButtons.addToolsButton("Modify Pedigree", "Ctrl + M", function(){
				localStorage.setItem(localStor.transfer, MainButtonActions._temphaploload);
				utility.notify("transferring","...");

				MainButtonActions.loadPedFromStorage(true);
			});
		},

		/* Selection Editting View */
		setToSelectionMode: function()
		{
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Selection");
			ToolButtons.addToolsButton("Select All", "A", SelectionAction.selectAll);
			ToolButtons.addToolsButton("Select Affecteds", "F", SelectionAction.selectAffecteds);
			ToolButtons.addToolsButton("Submit", "Enter", HaploWindow.init);
		},


		/* Aka Side-by-Side Haploblock mode: Align, Find Hom, Range, Marker */
		setToComparisonMode: function()
		{
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Haplotypes");

			ToolButtons.addToolsButton("Compare Genotypes", "Ctrl + G", HomologySelectionMode.init);
			ToolButtons.addToolsButton("Marker Search", "M", CSSMarkerRange.init);
			ToolButtons.addToolsButton("Prev. Recomb.", "[", HaploBlock.scrollToPrevRecomb);
			ToolButtons.addToolsButton("Next. Recomb.", "]", HaploBlock.scrollToNextRecomb);
		},

		/* From comparison mode, the buttons showed during homology selection */
		// called by HomologySelectionMode.init
		setToHomologySelection: function(){
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("GT Compare");
			ToolButtons.addToolsButton("Select All", "A", SelectionAction.selectAll);
			ToolButtons.addToolsButton("Select Affecteds", "F", SelectionAction.selectAffecteds);
			ToolButtons.addToolsButton("Submit", "Enter", HomologySelectionMode.submit);
			
		},


		/* Actual tools used in homology plots */
		// called by HomologySelectionMode.submit()
		setToHomologyMode: function(){
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("GT Compare");
			ToolButtons.addToolsButton("Marker Search", "M", CSSMarkerRange.showIndexCSS);
		}
	}
}
