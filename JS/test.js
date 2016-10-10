

var Test = {

	Allegro : {
		saveChrAndFlow(){
			localStorage.setItem("ALLFLOW", debugAllegro.descent);
			localStorage.setItem("ALLCHR", debugAllegro.haplo);
			localStorage.setItem("ALLMAP", debugAllegro.map);
		},

		run(){
			MainButtonActions.preamble();

			setTimeout(function(){
				MainPageHandler.haplomodeload();

				setTimeout(function(){
					userOpts.fancyGraphics = false;

					var haplo_text = localStorage.getItem("ALLCHR");
					var found_text = localStorage.getItem("ALLFLOW");
					var map_text   = localStorage.getItem("ALLMAP");

					Allegro.__populateFamilyAndHaploMap(haplo_text);
					Allegro.__populateFlow(found_text);
					Allegro.__populateGeneticPositions(map_text);

					HaploPedProps.init();
					FileFormat.__endFuncs( AssignHGroups.resolvers.FLOW );

					setTimeout(function(){
						SelectionMode.init();
						SelectionAction.selectAffecteds();
						HaploWindow.init();
					},500)
				}, 500);
			}, 500);
		}
	},


	Merlin : {
		saveChrAndFlow(){
			localStorage.setItem("MERLINFLOW", debugMerlin.descent);
			localStorage.setItem("MERLINCHR", debugMerlin.haplo);
		},

		run(){
			MainButtonActions.preamble();

			setTimeout(function(){
				MainPageHandler.haplomodeload();

				setTimeout(function(){
					userOpts.fancyGraphics = false;

					var haplo_text = localStorage.getItem("MERLINCHR");
					var chr_text   = localStorage.getItem("MERLINFLOW");

					Merlin.populateFamilyAndHaploMap(haplo_text);
					FileFormat.enumerateMarkers();

					Merlin.populateFlow(chr_text);

					HaploPedProps.init(familyMapOps.inferGenders);
					FileFormat.__endFuncs( AssignHGroups.resolvers.FLOW );

		/*			setTimeout(function(){
						SelectionMode.init();
						SelectionAction.selectAffecteds();
						HaploWindow.init();
					},500)*/
				}, 500);
			}, 500);
		}
	},

	Simwalk : {
		run(){
			MainButtonActions.preamble();

			setTimeout(function(){
				MainPageHandler.haplomodeload();

				setTimeout(function()
				{
					var usedesc = true;
					var haplo_text  = localStorage.getItem("TEST");
					Simwalk.populateFamHaploAndDesc(haplo_text, usedesc);

		//			FileFormat.enumerateMarkers();
					HaploPedProps.init();
					FileFormat.__endFuncs(usedesc);
				}, 500);
			}, 500);			
		}
	},

	Homology : {
		run(){
			userOpts.fancyGraphics = false;
			MainButtonActions.loadHaploFromStorage();

			setTimeout(function(){
				SelectionMode.init();
				SelectionAction.selectAffecteds();
				userOpts.fancyGraphics = true;
				HaploWindow.init();

				setTimeout(function(){
					HomologySelectionMode.init();
					SelectionAction.selectAffecteds();
					HomologySelectionMode.submit();
				},1000);
			}, 1000);
		}
	},

	Colors : {
		run(){
			FounderColor.__testColors(48);
		}
	},

	PedCreate : {
		run(){
			MainButtonActions.createNewPed()

			familyDraw.addFam(1001)

			personDraw.addNode(
				new Person(12,2,2),
				{x:0, y:50}
			);

			personDraw.addNode(
				new Person(11,1,1),
				{x:180, y:50}
			);

			personDraw.addNode(
				new Person(23,1,2),
				{x:90, y:150}
			);
		}
	}
}


//Test.Merlin.run();