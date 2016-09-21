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
		ToolButtons.table_keys[button.innerHTML] = button;

		var row = ToolButtons.table.insertRow(),
			cell = row.insertCell();

		cell.appendChild(button);
	},

	addToolsButton: function(message, callback, show_state){
		ToolButtons.addToToolsContainer(
			ToolButtons.addButton(message, callback, show_state)
		);
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
			ToolButtons.addToolsButton("Add Individual", function(){personDraw.addNode();});
			ToolButtons.addToolsButton("Add Family", function(){familyDraw.addFam();});
			ToolButtons.addToolsButton("Mate-Mate", function(){
				(new MatelineDraw(familyDraw.active_fam_group.id)).init();
			});
			ToolButtons.addToolsButton("Parent-Offspring", function(){
				(new OffspringDraw(familyDraw.active_fam_group.id)).init();
			});
		},

		/* Haplo View */
		setToHaploView: function()
		{
			ToolButtons.modes.preamble();

			ToolButtons.setWidth(90);
			ToolButtons.setTitle("Pedigree");

			ToolButtons.addToolsButton("Start Analysis", SelectionMode.init);

			ToolButtons.addToolsButton("Modify Pedigree", function()
			{
				localStorage.setItem(localStor.transfer, MainButtonActions._temphaploload);
				utility.notify("transferring","...");

				MainButtonActions.loadPedFromStorage(true);
			})

		},

		/* Selection Editting View */
		setToSelectionMode: function()
		{
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Selection");
			ToolButtons.addToolsButton("Select All", SelectionAction.selectAll);
			ToolButtons.addToolsButton("Select Affecteds", SelectionAction.selectAffecteds);
			ToolButtons.addToolsButton("Submit", HaploWindow.init);
		},


		/* Aka Side-by-Side Haploblock mode: Align, Find Hom, Range, Marker */
		setToComparisonMode: function()
		{
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Haplotypes");

			ToolButtons.addToolsButton("Find Homology", HomologySelectionMode.init);
			ToolButtons.addToolsButton("Marker Search", showIndexCSS);

/*			ToolButtons.addToolsButton("Range Slider", function(){
				MarkerSlider.showSlider(!MarkerSlider._visible)
			});*/

		},

		/* From comparison mode, the buttons showed during homology selection */
		// called by HomologySelectionMode.init
		setToHomologySelection: function(){
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Homology");
			ToolButtons.addToolsButton("Select All", SelectionAction.selectAll);
			ToolButtons.addToolsButton("Select Affecteds", SelectionAction.selectAffecteds);
			ToolButtons.addToolsButton("Submit", HomologySelectionMode.submit);
			
		},


		/* Actual tools used in homology plots */
		// called by HomologySelectionMode.submit()
		setToHomologyMode: function(){
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Homology");
			ToolButtons.addToolsButton("Marker Search", showIndexCSS);
		}
	}
}
