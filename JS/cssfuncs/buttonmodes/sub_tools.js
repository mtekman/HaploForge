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

	addToToolsContainer: function(button)
	{
		ToolButtons.table_keys[button.innerHTML] = button;

		var row = ToolButtons.table.insertRow(),
			cell = row.insertCell();

		cell.appendChild(button);
	},

	addToolsButton: function(message, shortcut_text, callback, show_state = false)
	{
		var splitter = shortcut_text.split('|'),
			shortcut = splitter[0],
			text = (" (  " + shortcut + "  ) " + splitter[1]) || (" (  " + shortcut + "  ) ");


		if (!show_state){
			ToolButtons.addToToolsContainer(
				ButtonModes.addButton(message, text, callback));
			ButtonModes.addKeyboardShortcut( "sidetool", shortcut, callback)
			return 0;
		}


		// State with toggleable colours
		var button = ButtonModes.addButton(message, text);
			button.prevstate = null;

		function newcallback(){
			console.log(button,"clicked");
			if (button.prevstate === null){
				button.prevstate = [button.style.background, button.style.color];
				button.style.background = 'black'
				button.style.color = 'white'
			}
			else {
				button.style.background = button.prevstate[0];
				button.style.color = button.prevstate[1];
				button.prevstate = null;
			}
			callback();
		}

		button.onclick = newcallback.bind(button);

		ToolButtons.addToToolsContainer(button);
		ButtonModes.addKeyboardShortcut( "sidetool", shortcut, button.onclick)
		return 0;
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
	
			ToolButtons.addToolsButton("Add Individual", 
				"I|Adds an individual to the active family, which can then be modified by double-clicking on it", 
				function(){personDraw.addNode();});
	
			ToolButtons.addToolsButton("Add Family", 
				"F|Adds a new family to the screen",
				function(){familyDraw.addFam();});
	
			ToolButtons.addToolsButton("Mate-Mate", 
				"M|Draws a line between two individuals who will acts as parents.", 
				function(){
				(new MatelineDraw(familyDraw.active_fam_group.id)).init();
			});
	
			ToolButtons.addToolsButton("Parent-Offspring", 
				"P|Draws a line between an individual and a couple who will be their parents",
				function(){
				(new OffspringDraw(familyDraw.active_fam_group.id)).init();
			});
		},

		/* Haplo View */
		setToHaploView: function()
		{
			ToolButtons.modes.preamble();

			//ToolButtons.setWidth(90);
			ToolButtons.setTitle("Pedigree");

			ToolButtons.addToolsButton("Start Analysis", 
				"Enter|Begins the selection process",
				SelectionMode.init);

			ToolButtons.addToolsButton("Modify Pedigree",
				"Ctrl+M|[NOT YET IMPLEMENTED]Modifies the current pedigree",
				
				function(){
					localStorage.setItem(localStor.transfer, MainButtonActions._temphaploload);
					utility.notify("transferring","...");

					MainButtonActions.loadPedFromStorage(true);
				}
			);
		},

		/* Selection Editting View */
		setToSelectionMode: function()
		{
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Selection");
	
			ToolButtons.addToolsButton("Toggle All", 
				"A|Selects all individuals from all families",
				SelectionAction.selectAll);
	
			ToolButtons.addToolsButton("Toggle Affecteds", 
				"F|Selects all affected individuals from all families",
				SelectionAction.selectAffecteds);
	
			ToolButtons.addToolsButton("Submit", 
				"Enter|Submits selection for haplotype viewing"
				, HaploWindow.init);
		},


		/* Aka Side-by-Side Haploblock mode: Align, Find Hom, Range, Marker */
		setToComparisonMode: function()
		{
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Haplotypes");

			ToolButtons.addToolsButton("Compare Genotypes", 
				"G|Begins selection process for genotype comparison mode",
				HomologySelectionMode.init);
	
			ToolButtons.addToolsButton("Marker Search", 
				"M|Toggles marker search window",
				CSSMarkerRange.init,
				true);
	
			ToolButtons.addToolsButton("Prev. Recomb.", 
				"[|Shifts view up to previous recombination",
				HaploBlock.scrollToPrevRecomb);
	
			ToolButtons.addToolsButton("Next. Recomb.", 
				"]|Shifts view down to next recombination",
				HaploBlock.scrollToNextRecomb);
		},

		/* From comparison mode, the buttons showed during homology selection */
		// called by HomologySelectionMode.init
		setToHomologySelection: function(){
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("GT Compare");
	
			ToolButtons.addToolsButton("Toggle All", 
				"A|Selects all individuals shown",
				SelectionAction.selectAll);
	
			ToolButtons.addToolsButton("Toggle Affecteds", 
				"F|Selects only affected individuals from shown",
				SelectionAction.selectAffecteds);
	
			ToolButtons.addToolsButton("Submit", 
				"Enter|Initiates genotypes comparison mode from those selected",
				HomologySelectionMode.submit);
			
		},


		/* Actual tools used in homology plots */
		// called by HomologySelectionMode.submit()
		setToHomologyMode: function(){
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("GT Compare");
	
			ToolButtons.addToolsButton("Marker Search", 
				"M|Toggles marker search window",
				CSSMarkerRange.init,
				true);
		}
	}
}
