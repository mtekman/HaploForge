

var MainPageHandler = {

	_currentMode : null,

	// enum..
	modes : {
		main : 0,
		haploview: 1,
		pedcreate: 2,
	},


	__mainpage_divgroups : {
		"main"  	: document.getElementById('maincircle'),
		"ToolButtons"	: document.getElementById('selection_tools'),
		"BottomButtons" : document.getElementById('save_and_close'),
		"container"	: document.getElementById('container'),
		"pedexist"  : document.getElementById('pedresume_label'),
		"hapexist"  : document.getElementById('haploresume_label')
	},

	div_groups: function(key){
		return MainPageHandler.__mainpage_divgroups[key];
	},

	showDiv: function(key, bool){
		MainPageHandler.div_groups(key).style.display = bool?"":"none";
	},

	setPrevExistingButtons: function(){
		MainPageHandler.showDiv("pedexist",
			(localStorage.getItem(localStor.ped_save) !== null)
		);
		
		MainPageHandler.showDiv("hapexist", 
			(localStorage.getItem(localStor.hap_save) !== null)
		);
	},

	defaultload: function(){
		MainPageHandler._currentMode = MainPageHandler.modes.main

		/** Show main page, hide rest **/
		MainPageHandler.showDiv("main", true);
		MainPageHandler.showDiv("container", false);

		MainPageHandler.showDiv("BottomButtons", false);
		MainPageHandler.showDiv("ToolButtons", false);

		MainPageHandler.setPrevExistingButtons();
	},

	haplomodeload: function(){
		MainPageHandler._currentMode = MainPageHandler.modes.haploview

		/** Show haplotypes, after file (up)load **/
		MainPageHandler.showDiv("main", false);
		MainPageHandler.showDiv("container", true);

		MainPageHandler.showDiv("ToolButtons", true);
		MainPageHandler.showDiv("BottomButtons", true);
		
		ButtonModes.setToHaploView();
	},

	createpedmode: function(){
		MainPageHandler._currentMode = MainPageHandler.modes.pedcreate

		/** Show haplotypes, after file (up)load **/
		MainPageHandler.showDiv("main", false);
		MainPageHandler.showDiv("container", true);

		MainPageHandler.showDiv("ToolButtons", true);
		MainPageHandler.showDiv("BottomButtons", true);
		
		ButtonModes.setToPedCreate();
	}
}
