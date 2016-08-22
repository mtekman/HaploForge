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
		if (localStorage.getItem(localStor.ped_save) === null){
			MainPageHandler.showDiv("pedexist", false);
		}
		if (localStorage.getItem(localStor.hap_save) === null){
			MainPageHandler.showDiv("hapexist", false);
		}
	}

	static defaultload(){
		/** Show main page, hide rest **/
		MainPageHandler.showDiv("main", true);
		MainPageHandler.showDiv("container", false);
		MainPageHandler.showDiv("saveclose", false);
		MainPageHandler.showDiv("toolset", false);

		MainPageHandler.setPrevExistingButtons();
	}

	static haplomodeload(){
		/** Show haplotypes, after file (up)load **/
		MainPageHandler.showDiv("container", true);

		MainPageHandler.showDiv("main", false);
		MainPageHandler.showDiv("toolset", false);
		MainPageHandler.showDiv("saveclose", false);
	}

	static createpedmode(){
		/** Show haplotypes, after file (up)load **/
		MainPageHandler.showDiv("main", false);

		MainPageHandler.showDiv("container", true);
		MainPageHandler.showDiv("saveclose", true);

		ToolSetModes.setToPedCreate();
		MainPageHandler.showDiv("toolset", true);
	}
}
