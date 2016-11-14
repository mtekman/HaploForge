
var userTutorials = {

	__firstrun : false,

	init(){
		userTutorials.__firstrun = (
			function isFirstRun(){
			var key = "firstrun"
			if  (localStorage.getItem(key)===null){
				localStorage.setItem(key, true);
				return true
			}
			return false;
		})();
	},
	
	setToMain : {

		first(){
			var pages = [
				["Welcome to HaploHTML5!",
				"This is a tool that helps you draw pedigrees from scratch, and or analyze haplotypes."],

				["Getting Started", 
				"Since this is your first run, there are two options available to you: Visualizing Haplotypes, or Drawing a Pedigree",
				 "Let us first explore some of the pedigree creation tools. Please click the indicated button below.", null],

				["Title2", "This is the text at the top that explains quickly", 
				 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest", null],

				["Title3", "This is the text at the top that explains quickly", 
				 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest", null],
			];

			var pf = new Tutorial( pages, function exit(){
				console.log("Quit function")
			});
		}

	},

	setToPedCreate : {

	},

	setToHaploView : {

	},

	setToSelectionMode : {

	},

	setToComparisonMode : {

	},

	setToHomologySelection : {

	},

	setToHomologyMode : {

	}
}

