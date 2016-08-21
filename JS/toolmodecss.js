
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

		delete toolset.table_keys[message];
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
		toolset.div.style.display = "";	
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
	}

}

