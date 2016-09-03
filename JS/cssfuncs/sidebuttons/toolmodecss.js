/* Class that rewrites the selection_tools div to swap in tools for each mode */
var ToolModeButtons = {

	table_keys : {}, 
	div   : document.getElementById("selection_tools"),
	table : document.getElementById("selection_table"),
	title : document.getElementById("selection_title"),

	setTitle: function(title){
		ToolModeButtons.title.innerHTML = title;
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
		ToolModeButtons.table_keys[button.innerHTML] = button;

		var row = ToolModeButtons.table.insertRow(),
			cell = row.insertCell();

		cell.appendChild(button);
	},

	addToolsButton: function(message, callback, show_state){
		ToolModeButtons.addToToolsContainer(
			ToolModeButtons.addButton(message, callback, show_state)
		);
	},

	removeFromToolsContainer: function(key)
	{
		var button = ToolModeButtons.table_keys[key],
			cell = button.parentNode,
			row  = cell.parentNode,
			rowInd = row.rowIndex;

		row.deleteCell(0);
		ToolModeButtons.table.deleteRow(rowInd);

		delete ToolModeButtons.table_keys[key];
	},





	/* Switching modes */
	modes: {

		clearMode: function(){
			for (var k in ToolModeButtons.table_keys){
				ToolModeButtons.removeFromToolsContainer(k);
			}
			ToolModeButtons.setTitle("");
			ToolModeButtons.div.style.display = "none";
		},

		preamble: function(){
			ToolModeButtons.modes.clearMode();
			ToolModeButtons.div.style.display = "block";
		},

		/* Pedigree Creation View */
		setToPedCreate: function()
		{
			ToolModeButtons.modes.preamble();

			ToolModeButtons.setTitle("Ped Tools");
			ToolModeButtons.addToolsButton("Add Individual", function(){personDraw.addNode();});
			ToolModeButtons.addToolsButton("Add Family", function(){familyDraw.addFam();});
			ToolModeButtons.addToolsButton("Mate-Mate", function(){
				(new MatelineDraw(familyDraw.active_fam_group.id)).init();
			});
			ToolModeButtons.addToolsButton("Parent-Offspring", function(){
				(new OffspringDraw(familyDraw.active_fam_group.id)).init();
			});
		},

		/* Haplo View */
		setToHaploMode: function()
		{
			console.log("tool", "premode")

			ToolModeButtons.modes.preamble();

			ToolModeButtons.setTitle("Pedigree Arrange");
			ToolModeButtons.addToolsButton("Start Analysis", function(){
				SelectionMode.init();
				ToolModeButtons.modes.setToSelectionMode();
			});
			ToolModeButtons.addToolsButton("Modify Pedigree", function(){

			})
		},

		/* Selection Editting View */
		setToSelectionMode: function()
		{
			ToolModeButtons.modes.preamble();

			ToolModeButtons.setTitle("Selection Tools");
			ToolModeButtons.addToolsButton("Select All", function()
			{
				SelectionMode.toggle_selection_all = !SelectionMode.toggle_selection_all;

				for (var key in SelectionMode._items){
					var item = SelectionMode._items[key];
					if(  (SelectionMode.toggle_selection_all && !item.selected)
					  || (!SelectionMode.toggle_selection_all && item.selected) ){
						item.box.fire('click')
					}
				}
			});

			ToolModeButtons.addToolsButton("Select Affecteds", function()
			{
				SelectionMode.toggle_selection_affecteds = !SelectionMode.toggle_selection_affecteds;

				for (var key in SelectionMode._items){
					var item = SelectionMode._items[key];
					var affected = (item.graphics.children[0].attrs.fill === col_affs[2])

					if (affected){
						if( (SelectionMode.toggle_selection_affecteds && !item.selected)
						 || (!SelectionMode.toggle_selection_affecteds && item.selected) ){
							item.box.fire('click');
						}
					}
				}
				console.log("affecteds:", 
					Object.keys(SelectionMode._items).filter( function (n){ return SelectionMode._items[n].affected === true;})
				);
			});

			ToolModeButtons.addToolsButton("Submit Selection", HaploWindow.init);
		},

		setToHomologyMode: function(){
			console.log("implement");
		},


		/* Align, Find Hom, Range, Marker */
		setToComparisonMode: function()
		{
			ToolModeButtons.modes.preamble();

			ToolModeButtons.setTitle("Haplo Tools");

			ToolModeButtons.addToolsButton("Align Pedigree", function(){
				alignTopSelection( DOS.haplo_group_nodes, DOS.haplo_group_lines);
			});
			ToolModeButtons.addToolsButton("Find Homology", function(){
				// Function exits selection mode auto
				homology_selection_mode();
				//returns marker pair list
			});
			ToolModeButtons.addToolsButton("Range Slider", function(){
				MarkerSlider.showSlider(!MarkerSlider._visible)
			});
			ToolModeButtons.addToolsButton("Marker Search", showIndexCSS);
		},
	}
}
