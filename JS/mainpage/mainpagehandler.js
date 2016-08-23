// Have to enforce namespaces because Javascript doesn't know
// how  to attach static variables to classes...


const __mainpage_divgroups = {
	"main"  	: document.getElementById('maincircle'),
	"toolset"	: document.getElementById('selection_tools'),
	"saveclose" : document.getElementById('save_and_close'),
	"container"	: document.getElementById('container'),
	"pedexist"  : document.getElementById('pedresume_label'),
	"hapexist"  : document.getElementById('haploresume_label')
}


class MainPageHandler {

	static div_groups(key){
		return __mainpage_divgroups[key];
	}

	static showDiv(key, bool){
		__mainpage_divgroups[key].style.display = bool?"":"none";
	}

	static setPrevExistingButtons(){
		MainPageHandler.showDiv("pedexist",
			(localStorage.getItem(localStor.ped_save) !== null)
		);
		
		MainPageHandler.showDiv("hapexist", 
			(localStorage.getItem(localStor.hap_save) !== null)
		);
	}

	static defaultload(){
		MainPageHandler._currentMode = "Main"

		/** Show main page, hide rest **/
		MainPageHandler.showDiv("main", true);
		MainPageHandler.showDiv("container", false);
		MainPageHandler.showDiv("saveclose", false);
		MainPageHandler.showDiv("toolset", false);

		MainPageHandler.setPrevExistingButtons();
	}

	static haplomodeload(){
		MainPageHandler._currentMode = "Haplo"

		/** Show haplotypes, after file (up)load **/
		MainPageHandler.showDiv("main", false);

		MainPageHandler.showDiv("container", true);
		MainPageHandler.showDiv("saveclose", true);

		ToolSetModes.setToSelectionPreMode();
		MainPageHandler.showDiv("toolset", true);		
	}

	static createpedmode(){
		MainPageHandler._currentMode = "Pedigree"

		/** Show haplotypes, after file (up)load **/
		MainPageHandler.showDiv("main", false);

		MainPageHandler.showDiv("container", true);
		MainPageHandler.showDiv("saveclose", true);

		ToolSetModes.setToPedCreate();
		MainPageHandler.showDiv("toolset", true);
	}
}
