
var Settings = {

	__img : document.getElementById('settings_wheel'),
	__div : document.getElementById('settings_box'),

	__set: false,

	init(){ // called by window load
		if (Settings.__set){
			return 0
		}

		// Set buttons
		Settings.__set = true;
		Settings.__img.onclick = Settings.__showSettings;

		// Make default bindings
		for (var group in Settings.bindings)
		{
			Settings.__defaults[group] = {};

			for (var key in Settings.bindings[group]){
				var value = Settings.bindings[group][key]
				Settings.__defaults[group][key] = value;
			}
		}
	},


	__showSettings(){
		console.groupCollapsed("Settings:");
		utility.showBG();
		Settings.readBindingsFromLocal();
		Settings.__updateTables();
		Settings.__div.style.display = "block";
	},

	__hideSettings(){
		utility.hideBG();
		Settings.__destroyTables();
		Settings.__div.style.display = "none";
		console.groupEnd();
	},

	bindings : {
		"global" : {
			"Toggle All" : 'A',
			"Toggle Affecteds" : 'F',
			"Submit" : 'Enter',
			"Marker Search" : "M",
			"Save" : 'Ctrl+S',
			"Exit Mode"    : "Escape",
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
	__defaults : {}, // populated as bindingsChange

	__width_mod : 8 / 10,

	changeBinding(){
		var that = this;

		that.value = "[Type Now]";
		that.style.width = '6em';

		Keyboard.setCombo(function(keycombo){
			that.value = keycombo;
			that.style.width = (Settings.__width_mod * keycombo.length) + 'em';

			var group_key = that.id.split(':');
			Settings.bindings[group_key[0]][group_key[1]] = keycombo;
		});
	},

	__destroyTables(){
		var parent = Settings.__div;

		while (parent.firstChild) {
    		parent.removeChild(parent.firstChild);
		}
	},



	__setDefaultBindings(){
		for (var group in Settings.__defaults){
			Settings.bindings[group] = {};

			for (var key in Settings.__defaults[group]){
				var value = Settings.__defaults[group][key]
				Settings.bindings[group][key] = value;
			}
		}
	},

	setDefaultBindings(){
		Settings.__setDefaultBindings();
		Settings.__updateTables();
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
			console.log("no local settings found, setting defaults");
			Settings.setDefaultBindings();
		}
		else {
			Settings.bindings = JSON.parse(bind);
			console.log("reading from local");
		}
	},

	__updateTables(){
		Settings.__destroyTables();
		Settings.__makeTables();
	},

	__makeTables(){
		var div = Settings.__div;

		var uu = document.createElement('ul')

		for (var group in Settings.bindings)
		{
			var childdiv = document.createElement('li');

			// Head
			var hh = document.createElement('h5');

			var groupname = (group === "global")?"haploview + comparison":group;

			hh.innerHTML = groupname + " bindings";

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
    			inp.style.width = (Settings.__width_mod * inp.value.length) + 'em';
    			inp.id = group + ':' + key; // for quick access later

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

		var dli0 = document.createElement('li'),
			dul0 = document.createElement('ul'),
			dli2a = document.createElement('li'),
			dli2b = document.createElement('li');


		var save = document.createElement('button');
		save.innerHTML = "Save";
		save.onclick = Settings.saveBindings;
		dli2a.appendChild(save);

		var restore = document.createElement('button')
		restore.innerHTML = "Restore Defaults";
		restore.onclick = Settings.setDefaultBindings;
		dli2b.appendChild(restore);

		dul0.className = 'buttons_inline'

		dul0.appendChild(dli2a);
		dul0.appendChild(dli2b);

		dli0.appendChild(dul0);
		uu.appendChild(dli0);

	},



}