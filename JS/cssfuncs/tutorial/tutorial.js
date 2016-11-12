
class Tutorial {

	hideBackward(){ this.backbutton.style.display = "none" ;}
	showBackward(){ this.backbutton.style.display = "block";}
	hideForward(){  this.forwbutton.style.display = "none" ;}
	showForward(){  this.forwbutton.style.display = "block";}
	exit(){this.main.parentNode.removeChild( this.main );}

	setButtons(){
		this.backbutton = document.getElementById('tutor_back');
		this.forwbutton = document.getElementById('tutor_forw');
		this.exitbutton = document.getElementById('tutor_exit');
		this.exitbutton.oncick = this.exit;
	}

	constructor( page_array_of_details ){
		this._currentpage = 0;
		this._pages = [];


		this._makeTutorial( page_array_of_details );
		this.setButtons()

		this.__showpage(0);
	}


	_forwardPage(){
		var len  = this._pages.length,
			next = this._currentpage + 1;

		if (next === len){
			this.hideForward();
		}
		else {
			this.showForward();
			this._currentpage = next;
		}
		this.__hidepage(this._currentpage - 1);
		this.__showpage(this._currentpage);
	}

	_backwardPage(){
		var prev = this._currentpage - 1;

		if (prev === 0){
			this.hideBackward();
		}
		else {
			this.showBackward();
			this._currentpage = prev;
		}

		this.__hidepage(this._currentpage + 1);
		this.__showpage(this._currentpage );
	}


	___setpage(pageno, visible){
		var page = this._pages[pageno];
		console.assert(page != undefined, "Invalid page", page);	
		page.style.display = visible?"block":"none";
	}

	__hidepage(pageno){this.___setpage(pageno,false)};
	__showpage(pageno){this.___setpage(pageno,true)};


	_makeTutorial( pages ) {
		var divparent = document.createElement('div');
		divparent.className = "tutor"

		// Make pages
		var pageholder = document.createElement('div');
		pageholder.className = "pages";

		divparent.appendChild(pageholder);

		for (var p=0; p < pages.length; p++)
		{
			var newpage = (new TutorialPage( pages[p] )).getPage();
			newpage.style.display = "none"; // hide by default
			this._pages.push( newpage );
		
			pageholder.appendChild( newpage );
		}

		//Forward, back, exit
		var forw = document.createElement('div'),
			back = document.createElement('div'),
			exit = document.createElement('div');

		forw.id = "tutor_forw";
		back.id = "tutor_back";
		exit.id = "tutor_exit";

		forw.onclick = this._forwardPage;
		back.onclick = this._backwardPage;
		exit.onclick = this._exit;

		// Page no
		var pageno = document.createElement('p');
		pageno.id = "tutor_pageno";


		// Collate
		var buttons = document.createElement('div');
		buttons.className = "tutorbuttons"
		buttons.appendChild(forw);
		buttons.appendChild(back);
		buttons.appendChild(exit);
		buttons.appendChild(pageno);

		divparent.appendChild(buttons);

		var superparent = document.createElement('div');
		superparent.appendChild(divparent);
		superparent.className = 'tutorcontainer'

		//BG
		var bg = document.createElement('div');
		bg.id = "tutorbg";

		superparent.appendChild(bg);
		this.main = superparent;

		document.body.appendChild(superparent);
	}
}




var pages = [
	{title:"Yo", text_top:"Hey there", text_bot:"Bye there",
	 imgsrc:"assets/this.jpg", page:0}
];

var pf = new Tutorial( pages );
