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

	setToSelectionPreMode: function()
	{
		ToolSetModes.preamble();

		toolset.setTitle("Pedigree Arrange");
		toolset.addToolsButton("Start Analysis", function(){
			startSelectionMode();
			ToolSetModes.setToSelectionMode();
		});
	},

	setToSelectionMode: function()
	{
		ToolSetModes.preamble();

		toolset.setTitle("Selection Tools");
		toolset.addToolsButton("Select All", function(){
			console.log("implement");
		});

		toolset.addToolsButton("Select Affecteds", function()
		{
			toggle_selection_affecteds = !toggle_selection_affecteds;

			for (var key in selection_items){

				var item = selection_items[key];
				var affected = (item.graphics.children[0].attrs.fill === col_affs[2])

				if (affected){
					if( (toggle_selection_affecteds && !item.selected)
					 || (!toggle_selection_affecteds && item.selected) ){
						item.box.fire('click');
					}
				}
			}
			console.log("affecteds:", 
				Object.keys(selection_items).filter( function (n){ return selection_items[n].affected === true;})
			);
		});

		toolset.addToolsButton("Submit Selection", function(){
			// var selected_for_homology = []; // Now global in homology_buttons.js
			selected_for_homology = [];
		
			for (var s in selection_items){
				if (selection_items[s].selected){

					selection_items[s].box.stroke('green')

					selected_for_homology.push(s);
				}
				selection_items[s].box.off('click');
			}

			// Shift top panel to front layer
			haplo_window.top.moveTo(haplo_window)
			haplo_window.top.exit.show();


			sub_select_group.rect.destroy();
			ToolSetModes.clearMode();

			haplo_layer.draw();

			if (selected_for_homology.length === 0)
				return -1;

			plots = scan_alleles_for_homology( selected_for_homology );

			homology_buttons_show();
			homology_buttons_redraw();

			return 0;
		});
	}
}

