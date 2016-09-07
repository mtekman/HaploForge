/* Class that rewrites the selection_tools div to swap in tools for each mode */
var ToolButtons = {

	table_keys : {}, 
	div   : document.getElementById("selection_tools"),
	table : document.getElementById("selection_table"),
	title : document.getElementById("selection_title"),

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
			console.log("tool", "premode")

			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Pedigree Arrange");
			ToolButtons.addToolsButton("Start Analysis", function(){
				SelectionMode.init();
			});


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

			ToolButtons.setTitle("Selection Tools");
			ToolButtons.addToolsButton("Select All", function()
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

			ToolButtons.addToolsButton("Select Affecteds", function()
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

			ToolButtons.addToolsButton("Submit Selection", HaploWindow.init);
		},


		/* Aka Side-by-Side Haploblock mode: Align, Find Hom, Range, Marker */
		setToComparisonMode: function()
		{
			ToolButtons.modes.preamble();

			ToolButtons.setTitle("Haplo Tools");

			ToolButtons.addToolsButton("Align Pedigree", function(){
				alignTopSelection( DOS.haplo_group_nodes, DOS.haplo_group_lines);
			});
			ToolButtons.addToolsButton("Find Homology", function(){
				// Function exits selection mode auto
				homology_selection_mode();
				//returns marker pair list
			});
			ToolButtons.addToolsButton("Range Slider", function(){
				MarkerSlider.showSlider(!MarkerSlider._visible)
			});
			ToolButtons.addToolsButton("Marker Search", showIndexCSS);
		},

		/* From comparison mode, the buttons showed during homology selection */
		setToHomologySelection: function(){
			console.log("implement later");
		},


		/* Actual tools used in homology plots */
		setToHomologyMode: function(){
			throw new Error("implement");
		}
	}
}
