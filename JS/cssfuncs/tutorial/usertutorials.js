
var userTutorials = {

	__firstrun : false,
	__firstkey : "firstrun",

	__storeFirstRun(){
		localStorage.setItem(userTutorials.__firstkey, userTutorials.__firstrun);
	},

	__getFirstRun(){
		var val = localStorage.getItem(userTutorials.__firstkey);

		if (val === null){
			userTutorials.__firstrun = true;
			userTutorials.__storeFirstRun();
		}
		else {
			userTutorials.__firstrun = JSON.parse(val);
		}
		return userTutorials.__firstrun;
	},

	isFirstRun(){
		return userTutorials.__getFirstRun();
	},

	setFirstRun(bool){
		userTutorials.__firstrun = JSON.parse(bool);
		userTutorials.__storeFirstRun();
	},


	run(exitfunc = null)
	{
		if (userTutorials.isFirstRun()){
			userTutorials.__first(function ex()
			{
				userTutorials.setFirstRun(false);
				if (exitfunc!==null){
					exitfunc();
				}
			});
		}
	},
	
	__first(exitfunc = null){
		var pages = [
/*				["Welcome to HaploHTML5!",
			"This is a tool that helps you draw pedigrees from scratch, and or analyze haplotypes."],
*/
			{
				title: "Getting Started", 
			 	text : [
			  		"Since this is your first time, let's go through some tutorials!",
			  		"Tutorials can be navigated using the arrows in the top right corner, or exited completely by closing this window.\n\nTo move to the next screen, please click the forward direction icon\n(or press the Enter key)."
			  	]
			},

			{
				title: "Jumping Straight in!",
			 	type : "video",
			 	media: transcript.jumpintoit
			},


			{
				title: "Bindings",
				type : "video",
				media: transcript.bindings
			},

			{
				title: "Fine Control",
				type : "video",
				media: transcript.finecontrol,
			},

			{
				title: "Pedigree Creation",
				type : "video",
				media: transcript.pedcreate
			}
		];

		(new Tutorial( pages, exitfunc));
	},
/*	setToPedCreate : {},
	setToHaploView : {},
	setToSelectionMode : {},
	setToComparisonMode : {},
	setToHomologySelection : {},
	setToHomologyMode : {}*/
}





var transcript = {

	// -1 = pause
	//  0 = no delay (pass-through)
	//  x = x seconds delay

	jumpintoit : {
		 /* Shows all*/
		src   : "public_assets/videos/jumpintoit.post.webm",
		text  : {

			 0.0 : [0, "Choosing the mode","Visualize New Haplotypes"],
			 1.4 : [-1, "Uploading Files",""],
			 2.7 : [-1, null, "In this case selecting 'Allegro'"],
			 4.3 : [-1, "Question Marks can be highlighted to show hints on the files", "ihaplo (phased genotypes),..."],
			 5.5 : [-1, null, "... [Optional] founder file (to use existing points of recombination),..."],
			 6.6 : [-1, null, "... or [Optional] map file (to show centiMorgan positions)."],
			 7.8 : [-1, "Selecting the File", "where:\nihaplo (phased genotypes)\nfounder file (to use existing points of recombination)\nmap file (to show centiMorgan positions)"],
			 9.7 : [-1, "Submitting and beginning the analysis", ""],
			11.0 : [0, "Main View", ""],
			14.0 : [-1, null, "Pedigrees can be moved around and modified internally before continuing to further analysis."],
			23.5 : [-1, "Selection View" , ""],
			24.5 : [-1, null, "Selecting all affecteds via side buttons..."],
			26.5 : [-1, null, "..or manually selecting with a single click."],
			27.8 : [-1, "Comparison View : Side-by-side analysis of the selected individuals' haplotypes.", ""],
			28.9 : [-1, null, "Related individual are joined by lines showing the number of generations between them."],
			30.0 : [-1, null, "Haplotypes for each selected individual with marker positions are expanded below."],
			31.0 : [-1, "Region Indicator (red line)", "The displayed locus can be scrolled through by dragging the indicator or scrolling the mousewheel."],
			33.5 : [-1, null, "The locus can also be expanded/contracted by dragging either of the handles..."],
			36.8 : [-1, null, "...where the entirety of the region can be examined by scrolling the mouse (if it exceeds window height )..."],
			43.3 : [-1, "Marker Search", "...or a region of interest can be manually specified from a list of ordered markers."],
			52.1 : [-1, "Recombination Finder", "Points of recombination can be automatically scrolled to."],
			55.3 : [-1, "Change Founder Allele Colours", "If founder alleles are too hard to see, their colours can be randomized without affecting the analysis."],
			57.4 : [-1, "Align the Pedigree", ""],
			62.1 : [-1, "Compare Genotypes", "Genotypes for selected individual can be compared to find regions of homology for those who share the same founder alleles (family-specific)."],
			68.3 : [-1, null, "These are then plotted as vertical scores on the region indicator and the haplotypes which can be scrolled through."],
			73.1 : [-1, "Exit mode", "Each mode can be exited by closing the window in the top-left"],
			79.4 : [-1, "Save Analysis", "The analysis can be saved at any time..."],
			84.0 : [-1, null, "...to be resumed at a later date without having to reupload the same data twice."],
			9999 : [0, "Please click the forward button to view the next tutorial", ""]
		}
	},

	bindings : {  
		/* Show settings, haploview, resume analysis, haplo scrolling, genotypes mode, marker */
		src   : "public_assets/videos/bindings.post.webm",
		text  : {
			 0.0 : [-1, "Shortcuts and Bindings", ""],
			 1.6 : [0, null, "Shortcuts settings can be accessed by clicking on the wheel in the bottom right of the main page."],
			 3.9 : [2, null, "Bindings can be modified by clicking on any of the labels..."],
			 4.5 : [2, null, "...and pressing a desired key combination on the keyboard (in this case simply 'F')."],
			 6.2 : [0, null, "(or Ctrl + M)"],
			 8.2 : [2, null, "Bindings can then be saved or restored to their defaults to exit the settings screen."],
			 9.0 : [0, null, "We can now test these bindings in any mode. For now let's resume a previous analysis and test them there."],
			14.2 : [2, null, "Tool descriptions and their associated bindings can be viewd by simply hovering the mouse over them."],
			25.9 : [2, null, "The viewport can be scrolled slowly using Arrow keys and quickily using PageUp/PageDown keys..."],
			33.2 : [1, null, "...points of recombination via '[' and ']' keys..."],
			39.5 : [1, null, "...Haploblock colouring via 'R'..."],
			9999 : [0, "Shortcuts and Bindings", "Click the forward button to view the next tutorial."]
		}
	},

	finecontrol : {  
		/* Shows scrolling in haploview */
		src   : "public_assets/videos/finecontrol.post.webm",
		text  : {
			0.0 : [-1, "Region of Interest Handling (General)", ""],
			0.9 : [ 2, null, "The indicator can drag the current viewport to a region of interest"],
			2.6 : [ 2, null, "To expand/shrink a viewport drag either handle..."],
			4.2 : [ 0, null, "... and release to update it."],
			5.2 : [ 2, null, "Viewports larger than the reigon that can be displayed within the screen area can be scrolled." ],
			7.8 : [-1, "Region of Interest Handling (Screen Snapping)", ""],
			8.1 : [ 2, null, "To lock the viewport to a size which can be displayed in the current screen, begin dragging a handle..."],
			8.9 : [ 2, null, "...and hold down the Control key whist moving..."],
			9.8 : [ 0, null, "...and release!"],
			10.5: [ 2, null, "Once locked, scrolling now moves the viewport instead of the screen."],
			13.2: [ 2, null, "The viewport lock can be broken by simply dragging a handle out of screen bounds again."],
			13.5: [-1, "Region of Interest Handling (Fine Control)", "For finer tuning, begin to drag a handle..."],
			14.4: [ 2, null, "... and hold Shift whilst dragging..."],
			15.9: [ 0, null, "...where the handle will then move with dampened sensitivity."],
			9999: [ 0, "Region of Interest Handling", "Click the forward button to view the next tutorial" ]
		}
	},

	pedcreate : {
		/* Assumes first run, shows pedcreate and ped resume */
		src   : "public_assets/videos/pedcreate.post.webm",
		text  : {
			0.0  : [-1, "Pedigree Creation", ""],
			//1.3  : [ 2, null,]
			1.9  : [2, null, "This is the blank Pedigree View canvas, with tools on the right."],
			2.9  : [2, "Pedigree Creation (Family)", "Families need to be added before other tools can work."],
			3.2  : [2, null, "If no family exists, a new family will be prompted first."],
			6.4  : [2, null, "Notice the family name given in bold to show that it is selected, and notice Individual '1' also created."],
			6.6  : [2, null, "Families can be moved around by dragging the family name"],
			7.9  : [2, "Pedigree Creation (Individual)", "Additional individuals must be created in order make relationships between them."],
			10.0 : [2, null, "Here we added two new individuals (2 and 3) to the active family, by default all unaffected males."],
			11.2 : [2, null, "Individual properties can be altered by double-clicking on the individual's node."],
			20.0 : [0, null, ""],
			26.1 : [2, "Pedigree Creation (Relationship)", "Now we need to connect mates to mates, and offspring to their parents."],
			26.7 : [2, null, "Target circles are drawn to show which individuals can be connected."],
			26.9 : [2, null, "Lines are drawn by simply clicking, dragging, and releasing in a valid end node."],
			28.7 : [2, null, "1 and 22 are now joined mates, and are vertically locked to show this."],
			35.1 : [2, null, "Let's now add some offspring."],
			35.9 : [2, null, "As with the Mate-Mate line previously, target circles highlight valid start points..."],
			36.3 : [2, null, "...but now the only valid end points are those that exist between two mates, indicated by white anchor nodes."],
			37.9 : [0, null, "Let's give Individual 3 a female mate and join on some more offspring."],
			48.6 : [2, null, "It seems we're modelling a dominant trait, so it makes sense to change individual 3 to affected."],
			61.3 : [2, null, "Notice how 4 and 5 are now vertically locked because they are siblings."],
			65.4 : [2, "Pedigree Creation (Export)", "We can export our pedigree to a new browser tab."],
			67.7 : [2, null, "Stripping graphics exports the pedigree into LINKAGE pre-MAKEPED format, otherwise we would see positional metadata"],
			70.1 : [0, null, "Closing the tab, we can return back to our pedigree."],
			71.3 : [2, "Pedigree Creation (Save/Resume)", "Pedigrees are saved as cookies to local browser storage."],
			74.0 : [2, null, "Our pedigree is saved. Exiting our pedigree brings us back to the main page."],
			75.6 : [2, null, "A new button allows us to resume the previously saved pedigree and continue where we left off."],
			9999 : [0, "Pedigree Creation", "Click on the forward button to view the next tutorial."]
		}
	}
}