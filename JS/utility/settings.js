
var Settings = {

	__img : document.getElementById('settings_wheel'),
	__div : document.getElementById('settings_box'),
	__set: false,

	init(){
		if (!Settings.__set){
			Settings.__set = true;
			Settings.__img.onclick = Settings.__showSettings;
			Settings.__makeDefaults;
		}
		Settings.__showSettings();
	},

	__showSettings(){
		utility.showBG();
		Settings.readBindingsFromLocal();
		Settings.updateTables();
		Settings.__div.style.display = "block";
	},

	__hideSettings(){
		utility.hideBG();
		Settings.destroyTables();
		Settings.__div.style.display = "none";
	},

	bindings : {
		"global" : {
			"Marker Search" : "M",
			"Exit Mode"    : "Escape",
			"Toggle All" : 'A',
			"Toggle Affecteds" : 'F',
			"Save" : 'Ctrl+S',
			"Submit" : 'Enter'
		},

		"comparison" : {
			"Compare Genotypes" : 'G',
			"Prev. Recomb."  : '[',
			"Next  Recomb."  : ']',
			"Align Pedigree" : 'V',
			"Recolour Haploblocks" : 'R'
		},

		"haploview" : {
			"Start Analysis" : 'Enter',
			"Modify Pedigree": 'Ctrl+M'
		},

		"pedcreate" : {
			"Add Individual" : 'I',
			"Add Family" : 'F',
			"Mate-Mate" : 'M',
			"Parent-Offspring" : 'P',
			"Export" :  'Ctrl+E'
		}
	},

	defaults : {}, // populated as bindingsChange

	makeTables(){
		var div = Settings.__div;

		var uu = document.createElement('ul')

		for (var group in Settings.bindings)
		{
			var childdiv = document.createElement('li');

			// Head
			var hh = document.createElement('h5');
			hh.innerHTML = group + " bindings";

			childdiv.appendChild(hh);

		    // Body
		    var ul = document.createElement('ul');

    		for (var key in Settings.bindings[group]){
    			var combo = Settings.bindings[group][key];

    			var lli = document.createElement('li'),
    				uul = document.createElement('ul');

    			var li1 = document.createElement('li'),
    				li2 = document.createElement('li');

    			var inp = document.createElement('input');
    			inp.type = 'text'
    			inp.value = combo;

    			li1.innerHTML = key;

    			li2.appendChild(inp);
    			uul.appendChild(li1);
    			uul.appendChild(li2);
    			
    			uul.onclick = Settings.changeBinding.bind(inp);
    			
    			lli.appendChild(uul);

//    			lli.appendChild(document.createElement('br'));

    			ul.appendChild(lli);
    		}
		    childdiv.appendChild(ul);
		    uu.appendChild(childdiv);
		}
		div.appendChild(uu);

		var dli1 = document.createElement('li');

		var save = document.createElement('button');
		save.innerHTML = "Save";
		save.onclick = Settings.saveBindings;
		dli1.appendChild(save);

		var restore = document.createElement('button')
		restore.innerHTML = "Restore Defaults";
		restore.onclick = Settings.setDefaultBindings();
		dli1.appendChild(restore);

		uu.appendChild(dli1);

	},

	changeBinding(){
		var that = this;

		that.value = "[Type Now]";
		that.style.width = '6em';

		Keyboard.setCombo(function(keycombo){
			that.value = keycombo;
			that.style.width = (keycombo.length * 6 / 10) + 'em';
		});
	},

	destroyTables(){
		var parent = Settings.__div;

		while (parent.firstChild) {
    		parent.removeChild(parent.firstChild);
		}
	},

	// Run once
	__makeDefaults(){
		for (var group in Settings.bindings)
		{
			Settings.defaults[group] = {};

			for (var key in Settings.bindings[group]){
				var value = Settings.bindings[group][key]
				Settings.defaults[group][key] = value;
			}
		}
	},

	setDefaultBindings(){
		for (var group in Settings.defaults){
			Settings.bindings[group] = {};

			for (var key in Settings.defaults[group]){
				var value = Settings.defaults[group][key]
				Settings.bindings[group][key] = value;
			}
		}
	},


	saveBindings(){
		Settings.saveBindingstoLocal();
		Settings.__hideSettings();
	},


	saveBindingstoLocal(){
		localStorage.setItem("bindings", JSON.stringify(Settings.bindings))
	},

	readBindingsFromLocal(){
		var bind = localStorage.getItem("bindings");
		if (bind === null){
			Settings.setDefaultBindings();
		}
		else {
			Settings.bindings = JSON.parse(bind);
		}
	},

	updateTables(){
		Settings.destroyTables();
		Settings.makeTables();
	}
}
