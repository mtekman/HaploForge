/* Class that rewrites the selection_tools div to swap in tools for each mode */
var toolset = {

	table_keys : {}, 
	div   : document.getElementById("selection_tools"),
	table : document.getElementById("selection_table"),
	title : document.getElementById("selection_title"),

	setTitle: function(title){
		toolset.title.innerHTML = title;
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
		toolset.table_keys[button.innerHTML] = button;

		var row = toolset.table.insertRow(),
			cell = row.insertCell();

		cell.appendChild(button);
	},

	addToolsButton: function(message, callback, show_state){
		toolset.addToToolsContainer(
			toolset.addButton(message, callback, show_state)
		);
	},

	removeFromToolsContainer: function(key)
	{
		var button = toolset.table_keys[key],
			cell = button.parentNode,
			row  = cell.parentNode,
			rowInd = row.rowIndex;

		row.deleteCell(0);
		toolset.table.deleteRow(rowInd);

		delete toolset.table_keys[key];
	}
}


var ToolSetModes = {

	clearMode: function(){
		for (var k in toolset.table_keys){
			toolset.removeFromToolsContainer(k);
		}
		toolset.setTitle("");
		toolset.div.style.display = "none";
	},

	preamble: function(){
		ToolSetModes.clearMode();
		toolset.div.style.display = "block";
	},

	/* Pedigree Creation View */
	setToPedCreate: function()
	{
		ToolSetModes.preamble();

		toolset.setTitle("Ped Tools");
		toolset.addToolsButton("Add Individual", function(){personDraw.addNode();});
		toolset.addToolsButton("Add Family", function(){familyDraw.addFam();});
		toolset.addToolsButton("Mate-Mate", function(){
			(new MatelineDraw(familyDraw.active_fam_group.id)).init();
		});
		toolset.addToolsButton("Parent-Offspring", function(){
			(new OffspringDraw(familyDraw.active_fam_group.id)).init();
		});
	},

	/* Selection View */
	setToSelectionPreMode: function()
	{
		ToolSetModes.preamble();

		toolset.setTitle("Pedigree Arrange");
		toolset.addToolsButton("Start Analysis", function(){
			SelectionMode.init();
			ToolSetModes.setToSelectionMode();
		});
	},

	/* Selection Editting View */
	setToSelectionMode: function()
	{
		ToolSetModes.preamble();

		toolset.setTitle("Selection Tools");
		toolset.addToolsButton("Select All", function()
		{
			ToolSetModes.toggle_selection_all = !ToolSetModes.toggle_selection_all || false;

			for (var key in SelectionMode._items){
				var item = SelectionMode._items[key];
				if(  (ToolSetModes.toggle_selection_all && !item.selected)
				  || (!ToolSetModes.toggle_selection_all && item.selected) ){
					item.box.fire('click')
				}
			}
		});

		toolset.addToolsButton("Select Affecteds", function()
		{
			ToolSetModes.toggle_selection_affecteds = !ToolSetModes.toggle_selection_affecteds || false;

			for (var key in SelectionMode._items){
				var item = SelectionMode._items[key];
				var affected = (item.graphics.children[0].attrs.fill === col_affs[2])

				if (affected){
					if( (ToolSetModes.toggle_selection_affecteds && !item.selected)
					 || (!ToolSetModes.toggle_selection_affecteds && item.selected) ){
						item.box.fire('click');
					}
				}
			}
			console.log("affecteds:", 
				Object.keys(SelectionMode._items).filter( function (n){ return SelectionMode._items[n].affected === true;})
			);
		});

		toolset.addToolsButton("Submit Selection", HaploWindow.init);
	},


	/* Align, Find Hom, Range, Marker */
	setToHaploMode: function()
	{
		ToolSetModes.preamble();

		toolset.setTitle("Haplo Tools");

		toolset.addToolsButton("Align Pedigree", function(){
			alignTopSelection( haplo_group_nodes, haplo_group_lines);
		});
		toolset.addToolsButton("Find Homology", function(){
			// Function exits selection mode auto
			homology_selection_mode();
			//returns marker pair list
		});
		toolset.addToolsButton("Range Slider", function(){
			showSlider(!markerscale_visible)
		});
		toolset.addToolsButton("Marker Search", showIndexCSS);
	},

}

