var bb;

var Test = {

	Tutorial : {
		Main(){

			var pages = [
				["Title1", "This is the text at the top that explains quickly", 
			 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest", null],

		 		["Title2", "This is the text at the top that explains quickly", 
			 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest", null, 
			 {enter:function(){console.log("Running enter action")}, exit:function(){console.log("Running exit action")}}],

			 	["Title3", "This is the text at the top that explains quickly", 
			 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest", null],
			];

			var pf = new Tutorial( pages );
		},

		Buttons(){
			userOpts.fancyGraphics = false;
			MainButtonActions.loadHaploFromStorage();

			setTimeout(function(){
				var tutbutt = document.getElementById('selection_tools').childNodes[3].childNodes[1].childNodes[0].cells[0].childNodes[0]
				bb =  new ButtonTutorial(tutbutt, "Go away", "Test this tdiasd andso", "right");				
			},1000)
		}
	},


	GHM : {
		saveChrAndFlow(){
			localStorage.setItem("GHMPED", debugGH.ped);
			localStorage.setItem("GHMHAP", debugGH.haplo);
			localStorage.setItem("GHMMAP", debugGH.map);
		},

		run(){
			MainButtonActions.preamble();

			setTimeout(function(){
				MainPageHandler.haplomodeload();

				setTimeout(function(){
					userOpts.fancyGraphics = false;

					var haplo_text = localStorage.getItem("GHMHAP");
					var ped_text = localStorage.getItem("GHMPED");
					var map_text   = localStorage.getItem("GHMMAP");

					Genehunter.populateFamilyAndHaploMap(haplo_text);
					Genehunter.populateMarkerMap(map_text);
					
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
			localStorage.setItem("MERLINPED", debugMerlin.ped);
			localStorage.setItem("MERLINMAP", debugMerlin.map);
		},

		run(){
			MainButtonActions.preamble();

			setTimeout(function(){
				MainPageHandler.haplomodeload();

				setTimeout(function(){
					userOpts.fancyGraphics = false;

					var haplo_text = localStorage.getItem("MERLINCHR");
					var chr_text   = localStorage.getItem("MERLINFLOW");
					var map_text   = localStorage.getItem("MERLINMAP");
					var ped_text   = localStorage.getItem("MERLINPED");

					Merlin.populateFamilyAndHaploMap(haplo_text);
					Merlin.populateMarkerMap(map_text)
					Merlin.populateFlow(chr_text);
					FileFormat.updateFamily(ped_text);

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

Test.Tutorial.Buttons();
