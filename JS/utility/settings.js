
var Settings = {

	__img : document.getElementById('settings_wheel'),
	__div : document.getElementById('settings_box'),
	__set: false,

	init(){
		if (!Settings.__set){
			Settings.__set = true;
			Settings.__img.onclick = Settings.__showSettings;
		}
		Settings.__showSettings();
	},

	__showSettings(){
		utility.showBG();
		Settings.makeTables();
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
    			var bind = Settings.bindings[group][key];

    			var lli = document.createElement('li'),
    				uul = document.createElement('ul');

    			var li1 = document.createElement('li'),
    				li2 = document.createElement('li');

    			var inp = document.createElement('input');
    			inp.type = 'text'
    			inp.value = bind;

    			inp.onclick = Settings.changeBinding.bind(inp);

    			li1.innerHTML = key;
    			li2.appendChild(inp)

    			uul.appendChild(li1);
    			uul.appendChild(li2);
    			lli.appendChild(uul);

//    			lli.appendChild(document.createElement('br'));

    			ul.appendChild(lli);
    		}
		    childdiv.appendChild(ul);
		    uu.appendChild(childdiv);
		}
		div.appendChild(uu);
	},

	changeBinding(button){
		var obj = button;
		Keyboard.setCombo(function(keycombo){
			obj.value = keycombo;
		});
	},

	destroyTables(){
		var parent = Settings.__div;

		while (parent.firstChild) {
    		parent.removeChild(parent.firstChild);
		}
	},

	readLocalSettings(){},
	saveBindings(){},

}
