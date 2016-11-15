
var pf;

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
/*				["Welcome to HaploHTML5!",
				"This is a tool that helps you draw pedigrees from scratch, and or analyze haplotypes."],
*/
				["Getting Started", 
				"Since this is your first run, there are two options available to you: Visualizing Haplotypes, or Drawing a Pedigree",
				 "Let us first explore some of the pedigree creation tools. Please click the indicated button below.", 
				 {
				 	type:"video", 
				 	src:"helpers/video/vids/post/jumpintoit.post.mp4", 
				 	transcript: transcript.jumpintoit
				 }
				],

				["Title2", "This is the text at the top that explains quickly", 
				 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest"],

				["Title3", "This is the text at the top that explains quickly", 
				 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest"],
			];

			pf = new Tutorial( pages, function exit(){
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





var transcript = {

	jumpintoit : {

		 0.0 : [1, "Choosing the mode","Visualize New Haplotypes"],
		 1.3 : [1, "Uploading Files",""],
		 2.7 : [1, null, "In this case selecting 'Allegro'"],
		 4.3 : [1, "Question Marks can be highlighted to show hints on the files", "ihaplo (phased genotypes),..."],
		 5.5 : [1, null, "... [Optional] founder file (to use existing points of recombination),..."],
		 6.6 : [1, null, "... or [Optional] map file (to show centiMorgan positions)."],
		 7.8 : [1, "Selecting the File", "where:\nihaplo (phased genotypes)\nfounder file (to use existing points of recombination)\nmap file (to show centiMorgan positions)"],
		 9.7 : [1, "Submitting and beginning the analysis", ""],
		11.0 : [1, "Main View", ""],
		14.0 : [1, null, "Pedigrees can be moved around and modified internally before continuing to further analysis."],
		23.4 : [1, "Selection View" , ""],
		24.5 : [1, null, "Selecting all affecteds via side buttons..."],
		26.5 : [1, null, "..or manually selecting with a single click."],
		27.8 : [1, "Comparison View : Side-by-side analysis of the selected individuals' haplotypes.", ""],
		28.9 : [1, null, "Related individual are joined by lines showing the number of generations between them."],
		30.0 : [1, null, "Haplotypes for each selected individual with marker positions are expanded below."],
		31.0 : [1, "Region Indicator (red line)", "The displayed locus can be scrolled through by dragging the indicator or scrolling the mousewheel."],
		33.5 : [1, null, "The locus can also be expanded/contracted by dragging either of the handles..."],
		36.8 : [1, null, "...where the entirety of the region can be examined by scrolling the mouse (if it exceeds window height )..."],
		43.3 : [1, "Marker Search", "...or a region of interest can be manually specified from a list of ordered markers."],
		52.1 : [1, "Recombination Finder", "Points of recombination can be automatically scrolled to."],
		55.3 : [1, "Change Founder Allele Colours", "If founder alleles are too hard to see, their colours can be randomized without affecting the analysis."],
		57.4 : [1, "Align the Pedigree", ""],
		62.1 : [1, "Compare Genotypes", "Genotypes for selected individual can be compared to find regions of homology for those who share the same founder alleles (family-specific)."],
		68.3 : [1, null, "These are then plotted as vertical scores on the region indicator and the haplotypes which can be scrolled through."],
		73.1 : [1, "Exit mode", "Each mode can be exited by closing the window in the top-left"],
		79.4 : [1, "Save Analysis", "The analysis can be saved at any time..."],
		84.0 : [1, null, "...to be resumed at a later date without having to reupload the same data twice."],
		9999 : [0, "Please click the forward button to view the next tutorial", ""]
	}
}