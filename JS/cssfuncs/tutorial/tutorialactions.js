

class TutorialActions {

	static getNumTutorials(){
		TutorialActions.__numTutorials = TutorialActions.__numTutorials || 0;
		return TutorialActions.__numTutorials;
	}

	static incrementNumTutorials(){
		TutorialActions.__numTutorials = (TutorialActions.__numTutorials || 0) + 1;
	}

	static decrementNumTutorials(){
		TutorialActions.__numTutorials--;
	}

	constructor( exitfunction ){
		this._onexit = exitfunction;
		this._currentpage = 0;

		TutorialActions.incrementNumTutorials();

		BackgroundVidMain.removeVid(); /*Ttorials stop other videos while running */

		Keyboard.layerOn("tutorial");
		Keyboard.addKeyPressTask("Backspace", this.backwardPage.bind(this));
		Keyboard.addKeyPressTask("Enter", this.forwardPage.bind(this));
		Keyboard.addKeyPressTask("Escape", this.quit.bind(this));
	}


	static __buttonVisibility(button, visible){
		button.style.display = visible?"block":"none";
		button.style.zIndex = visible?2:-1;
	}
	static __isButtonVisible(button){
		return button.style.display !== "none";
	}

	backwardVisible(vis){ TutorialActions.__buttonVisibility(this.back, vis);}
	forwardVisible(vis){  TutorialActions.__buttonVisibility(this.forw, vis);}
	
	quit(){
		Keyboard.layerOff();

		this.destroy();

		if (this._onexit !== null){
			this._onexit();
		}
		TutorialActions.decrementNumTutorials();
		BackgroundVidMain.addVid();
	}

	forwardPage(){
		if (!TutorialActions.__isButtonVisible(this.forw)){
			return 0; //not visible, do nothing
		}

		var len  = this._pages.length,
			next = this._currentpage + 1;

		this.forwardVisible(next !== len - 1) // If next page is last, hide forward
		this.backwardVisible(true);

		this._currentpage = next;
		this.__hidepage(this._currentpage - 1);
		this.__showpage(this._currentpage);
	}

	backwardPage(){
		if (!TutorialActions.__isButtonVisible(this.back)){
			return 0; //not visible, do nothing
		}


		var prev = this._currentpage - 1;

		this.backwardVisible(prev !== 0);
		this.forwardVisible(true) 

		this._currentpage = prev;
		this.__hidepage(this._currentpage + 1);
		this.__showpage(this._currentpage );
	}

	__hidepage(pageno){this.___setpage(pageno,false)};
	__showpage(pageno){this.___setpage(pageno,true)};

	__fadeTransition(obj, num_levels, start, interval, callback)
	{
		var op_step = 1 / num_levels,
			op_curr = start,
			op_mod  = (start === 0)?1:-1

		var wait_step = interval / num_levels

		function recur(obj, level, opacity, cb){
			console.log(level, opacity, obj)
			if (level === 0){
				cb();
				return 0
			}

			obj.style.opacity = opacity;

			setTimeout(function(){
				recur( obj, level - 1, opacity + (op_mod*op_step), cb )
			},
			wait_step);
		}

		recur(obj, num_levels, start, callback);			


	}


	___setpage(pageno, visible, interval=1000)
	{
		var page = this._pages[pageno],
			plot = this.__tps[pageno];

		if (page === undefined){
			console.log("Invalid page", pageno);
			return -1
		}

		var step = interval / 4;


		if (visible){
			setTimeout(function(){
				page.style.opacity = 1;
				console.log(plot);
				if (plot.enterAction !== null){plot.enterAction();}
				page.style.display = "block";
			
			}, TutorialActions.__wait_amount);
		}
		else {
			this.__fadeTransition(page, 4, 1, 200, function(){
				page.style.opacity = 0;
				if (plot.exitAction !== null){plot.exitAction();}
				
				page.style.display = "none";
			});
		}
		TutorialActions.__wait_amount = 200
	}
}

TutorialActions.__wait_amount = 0;