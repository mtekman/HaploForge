
var Settings = {

	__img : document.getElementById('settings_wheel'),
	__div : document.getElementById('settings_box'),

	__set: false,

	__storageoverridekey: "overridewindow", 
	__storagebindingskey: "bindings",

	init(){ // called by window load
		if (Settings.__set){
			return 0
		}

		// Set buttons
		Settings.__set = true;
		Settings.__img.onclick = Settings.__showSettings;

		// Make default bindings
		for (let group in Settings.bindings)
		{
			Settings.__defaults[group] = {};

			for (let key in Settings.bindings[group]){
				let value = Settings.bindings[group][key]
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
		userTutorials.run();
	},

	bindings : {
		"global" : {
			"Toggle All" 				: 'A',
			"Toggle Affecteds" 			: 'F',
			"Submit" 					: 'Enter',
			"Marker Search" 			: "M",
			"Save" 						: 'Ctrl+S',
			"Exit Mode"    				: "Escape",
			"Reset Family Positions" 	: "Ctrl+R"
		},

		"comparison" : {
			"Compare Genotypes" 		: 'G',
			"Prev. Recomb."  			: '[',
			"Next  Recomb."  			: ']',
			"Align Pedigree" 			: 'V',
			"Recolour Haploblocks" 		: 'R'
		},

		"haploview" : {
			"Start Analysis" 			: 'Enter',
			/*"Modify Pedigree"			: 'Ctrl+M'*/
		},

		"pedcreate" : {
			"Add Individual" 			: 'I',
			"Add Family" 				: 'F',
			"Mate-Mate" 				: 'M',
			"Parent-Offspring" 			: 'P',
			"Export" 					: 'Ctrl+E'
		}
	},
	__defaults : {}, // populated as bindingsChange

	__width_mod : 8 / 10,

	changeBinding(){
		let that = this;

		that.value = "[Type Now]";
		that.style.width = '6em';

		Keyboard.setCombo(function(keycombo){
			that.value = keycombo;
			that.style.width = (Settings.__width_mod * keycombo.length) + 'em';

			let group_key = that.id.split(':');
			Settings.bindings[group_key[0]][group_key[1]] = keycombo;
		});
	},

	__destroyTables(){
		let parent = Settings.__div;

		while (parent.firstChild) {
    		parent.removeChild(parent.firstChild);
		}
	},



	__setDefaultBindings(){
		for (let group in Settings.__defaults){
			Settings.bindings[group] = {};

			for (let key in Settings.__defaults[group]){
				let value = Settings.__defaults[group][key]
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
		localStorage.setItem(Settings.__storagebindingskey, JSON.stringify(Settings.bindings))
		localStorage.setItem(Settings.__storageoverridekey, Keyboard.overridewindowdefaults);
	},

	readBindingsFromLocal(){
		let bind = localStorage.getItem(Settings.__storagebindingskey);
		if (bind === null){
			console.log("no local settings found, setting defaults");
			Settings.setDefaultBindings();
		}
		else {
			Settings.bindings = JSON.parse(bind);
			console.log("reading from local");
		}

		Keyboard.overridewindowdefaults = JSON.parse(localStorage.getItem(Settings.__storageoverridekey) || false);
	},

	__updateTables(){
		Settings.__destroyTables();
		Settings.__makeTables();
	},

	__makeTables(){
		let div = Settings.__div;

		let uu = document.createElement('ul')

		for (let group in Settings.bindings)
		{
			let childdiv = document.createElement('li');

			// Head
			let hh = document.createElement('h5');

			let groupname = (group === "global")?"haploview + comparison":group;

			hh.innerHTML = groupname + " bindings";

			childdiv.appendChild(hh);

		    // Body
		    let ul = document.createElement('ul');

    		for (let key in Settings.bindings[group]){
    			let combo = Settings.bindings[group][key];

    			let lli = document.createElement('li'),
    				uul = document.createElement('ul');

    			let li1 = document.createElement('li'),
    				li2 = document.createElement('li');

    			let inp = document.createElement('input');
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
		//Buttons
		uu.appendChild( Settings.__makeSaveRestoreButtons());
		div.appendChild(uu);

		// Tick box
		div.appendChild( Settings.__makeOverrideTickBox() );
		div.appendChild( Settings.__makeFirstRunTickBox() );
		div.appendChild( Settings.__makeClearSavedButton());
	},

	__makeClearSavedButton(){
		//Button to clear all saved data
		let unew = document.createElement('ul'),
			linew = document.createElement('li'),
			input = document.createElement('input');

		input.value = "Clear Saved Data";
		input.type = "button"

		input.onclick = function(){
			utility.yesnoprompt("Clear Data", "Delete all haplotype and pedigree cached data?",
			"yes",
			function(){
				clearLocalHaploStorage()  // -> formats.js
				MainPageHandler.defaultload()				
			},
			"no",
			function(){});
		}

		linew.appendChild(input);
		 unew.appendChild(linew);

		return unew;
	},


	__makeFirstRunTickBox(){
		//Tick box to enable tutorials
		let unew = document.createElement('ul'),
			linew = document.createElement('li'),
			input = document.createElement('input'),
			label = document.createElement('label');

		label.innerHTML = "Enable Tutorial";
		input.type = "checkbox"

		// set by readBindingsFromLocal()
		input.checked = userTutorials.isFirstRun();

		input.onchange = function(){
			userTutorials.setFirstRun( this.checked );
		}
		
		label.appendChild(input);
		linew.appendChild(label);
		 unew.appendChild(linew);

		return unew;
	},

	__makeOverrideTickBox(){
		//Add tickbox for overriding window activities
		let unew = document.createElement('ul'),
			linew = document.createElement('li'),
			input = document.createElement('input'),
			label = document.createElement('label');

		label.innerHTML = "Override Window Bindings";
		input.type = "checkbox"

		// set by readBindingsFromLocal()
		input.checked = Keyboard.overridewindowdefaults;

		input.onchange = function(){
			Keyboard.overridewindowdefaults = this.checked;
		}
		
		label.appendChild(input);
		linew.appendChild(label);
		 unew.appendChild(linew);

		return unew;
	},

	__makeSaveRestoreButtons(){
		let dli0 = document.createElement('li'),
			dul0 = document.createElement('ul'),
			dli2a = document.createElement('li'),
			dli2b = document.createElement('li');


		let save = document.createElement('button');
		save.innerHTML = "Save";
		save.onclick = Settings.saveBindings;
		dli2a.appendChild(save);

		let restore = document.createElement('button')
		restore.innerHTML = "Restore Defaults";
		restore.onclick = Settings.setDefaultBindings;
		dli2b.appendChild(restore);

		dul0.className = 'buttons_inline'
		dul0.appendChild(dli2a);
		dul0.appendChild(dli2b);

		dli0.appendChild(dul0);

		return dli0;
	}

}
