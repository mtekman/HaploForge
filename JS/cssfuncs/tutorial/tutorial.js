

class Tutorial extends TutorialActions {

	constructor( page_array_of_details, exit_function = null ){
		super(exit_function);
		
		this.__tps = {}; // for destroy

		this._pages = [];
		this.main = this._makeTutorial( page_array_of_details );

		if (this._pages.length === 1){
			this.forwardVisible(false);
		}
		this.backwardVisible(false);
		this.__showpage(0);

	}

	destroy(){ /*Called by TutorialActions.quit() */
		for (var ppp in this.__tps){
			this.__tps[ppp].destroy();
		}
		this.main.parentNode.removeChild(this.main);

	}

	_makeTutorial( pages ) {
		var divparent = document.createElement('div');
		divparent.className = "tutor"

		// Make pages
		var pageholder = document.createElement('div');
		pageholder.className = "pages";

		divparent.appendChild(pageholder);

		for (var p=0; p < pages.length; p++)
		{
			var ppp     = new TutorialPage( pages[p] ),
				newpage = ppp.getPage();

			this.__tps[p] = ppp;

			newpage.style.display = "none"; // hide by default
			this._pages.push( newpage );
		
			pageholder.appendChild( newpage );
		}

		var buttons = this._makeButtons();


		divparent.appendChild(buttons);

		var superparent = document.createElement('div');
		superparent.appendChild(divparent);
		superparent.className = 'tutorcontainer'

		//BG
//		var bg = document.createElement('div');
//		bg.id = "tutorbg";
//		superparent.appendChild(bg);

		document.body.appendChild(superparent);

		return superparent;
	}

	_makeButtons(){
		//Forward, back, exit
		this.forw = document.createElement('div');
		this.back = document.createElement('div');
		this.exit = document.createElement('div');

		this.back.id = 'tutor_back';
		this.forw.id = 'tutor_forw';
		this.exit.id = 'tutor_exit';

		this.forw.onclick = this.forwardPage.bind(this);
		this.back.onclick = this.backwardPage.bind(this);
		this.exit.onclick = this.quit.bind(this);

		// Page no
		var pageno = document.createElement('p');
		pageno.id = "tutor_pageno";

		// Collate
		var buttons = document.createElement('div');
		buttons.className = "tutorbuttons"
		buttons.appendChild(this.forw);
		buttons.appendChild(this.back);
		buttons.appendChild(this.exit);
		buttons.appendChild(pageno);

		return buttons;
	}
}