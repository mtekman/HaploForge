
//Tutorial.add([{ title:"Yo", text_top:"Hey there", text_bot:"Bye there", imgsrc:"assets/this.jpg", page:0} ])

class Tutorial {

	static visible


	constructor( page_array_of_details ){
		this._num_pages = page_array_of_details.length;
		this._currentpage = 0;

		this._pages = [];

		var div = this.__makeTutorial( page_array_of_details );
		document.body.appendChild(div);
	}

	_forwardPage(){
		var len = this._pages.length;
		this._currentpage ++;
		if ()

		for (var p=0; p < this._pages.length; p++){
			this._pages[p];
		}
	}


	__makeTutorial( pages ) {
		var divparent = document.createElement('div');
		divparent.className = "tutor"

		// Make pages
		var pageholder = document.createElement('div');
		pageholder.className = "pages";

		divparent.appendChild(pageholder);

		for (var p=0; p < pages.length; p++)
		{
			var newpage = new TutorialPage( pages[p] ).getPage();
			this._page.append( newpage );
		
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
		var pageno = document.createElement('div');
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
		bg.

		return superparent;
	}
}


class TutorialPage {

	constructor(obj_or_title, top, bottom, centerImageSrc){

		if (arguments.length > 3){
			this.title = obj_or_title;
			this.text_top = top;
			this.text_bot = bottom;
			this.imgsrc = centerImageSrc;
			this.page = pageno;
		} else {
			for (var prop in obj_or_title){
				this[prop] = obj_or_title[prop];
			}
		}
	}

	__makePage(){
		var divmain = document.createElement('div'),
			h2 = document.createElement('h2'),
			toptext = document.createElement('h6'), // top text
			img = document.createElement('img'),
			bottext = document.createElement('h7');   // image caption

		divmain.className = "tutorpage";

		divmain.appendChild(h2);
		divmain.appendChild(toptext);
		divmain.appendChild(img);
		divmain.appendChild(bottext);

		h2.innerText      = this.title;
		toptext.innerText = this.text_top;
		bottext.innerText = this.text_bot;
		img.src           = this.imgsrc;

		return divmain;
	}

	getPage(){
		return this.__makePage();
	}
}






/*var Tutorial = {


	__list : {},
	directions : {'top' : 0,'bot': 0 ,'left' : 0,'right': 0},

	
	create(id, direct, head, text, pos = null, offset = null, onclick = null)
	{

		var box = Tutorial.__makePointy(direct, head, text);

		// Add to map
		if (id in Tutorial.__list){
			console.log("Already in use", id);
			return 0;
		}
		Tutorial.__list[id] = box;

		if (pos === null){
			// Lock to element
			var doc  = document.getElementById(id);
			doc.appendChild(box);
			box.style.zIndex = 999;
		}
		else {
			// Abs position
			box.style.position = "absolute";
			document.getElementsByTagName('body')[0].appendChild(box);
			box.style.left = pos.x + 'px';
			box.style.top = pos.y + 'px'
		}

		if (offset !== null){
			for (var prop in offset){
				box.style[prop] = offset[prop];
			}
		}

		
		var clicker = onclick;


		if (direct in Tutorial.directions){
			this.__shake(box, direct in {'top':0,'bot':0}, clicker);
		
		} else {
			box.onclick = function(){
				Tutorial.__ondelete(box, clicker);
			}
		}
	},

	setAllVisible(yes){
		for (var f in Tutorial.__list){
			Tutorial.__list[f].style.display = yes?"block":"none";
		}
	},

	__ondelete(box, clicker = null){
		box.parentNode.removeChild(box);
		delete Tutorial.__list[box];
		
		if (clicker !== null){
			clicker();
		}
	},



	// Smacky
	__shake(box, vertical, clicker){

/*		var move = 1,
			mult = 1,
			diff= 10;

		var getcurrent, setcurrent;

		if (vertical){
			getcurrent = function(box){return Number(box.style.marginTop.split(/\D+/)[0]) || 0;};
			setcurrent = function(box,am){
				var num_unit_top = box.style.marginTop.split(/\D+/);
				box.style.marginTop = (Number(num_unit_top[0]) + am) + 'px';

				var num_unit_bot = box.style.marginBottom.split(/\D+/);
				box.style.marginBottom = (Number(num_unit_bot[0]) + am) + 'px';
			}
		}
		else {
			getcurrent = function(box){return Number(box.style.marginLeft.split(/\D+/)[0]) || 0;};
			setcurrent = function(box, am){
				var num_unit_left = box.style.marginLeft.split(/\D+/);
				box.style.marginLeft = (Number(num_unit_left[0]) + am) + 'px';

				var num_unit_right = box.style.marginRight.split(/\D+/);
				box.style.marginRight = (Number(num_unit_right[0]) + am) + 'px';
				
				console.log(num_unit_left, num_unit_right)
			}
		}

		var box_start = getcurrent(box),
			box_offset = box_start - diff;

		console.log("box_start=", box_start, "box_offset=", box_offset)

		var tim = setInterval(function(){
			var current = getcurrent(box);
//			console.log(current);
		  	
		  	if (current <= box_offset ){
		    	move = mult;
		  	}
		  	else if (current >= box_start ){
		    	move = -mult;
		  	}
		  	console.log(current, move)
		  	setcurrent(box, current + move );
		}, 1000);*//*

		var prev = box.style.borderWidth;

		var tock = 2,
			diff = 0.5,
			mult = diff;

		var tim = setInterval(function(){


			if(!userOpts.showTooltips){
				box.onclick();
			}

			if (tock > 4){
				mult = -diff
			}
			else if (tock <= 2){
				mult = diff
			}
			tock += mult;

			box.style.borderWidth = tock+'px';
			box.style.padding = tock+'px';
		},80)

		box.onclick = function(){
			clearInterval(tim);
			Tutorial.__ondelete(box,clicker);
		}
	},


	// new block
	__makePointy(direct, head, text){

		var div1 = document.createElement('div');
		//div1.id = id;
		div1.className = 'tutorial ' + direct;


		// Now create and append to iDiv
		var divtext = document.createElement('div');
		divtext.className = 'tutorial_text';

		var h2er = document.createElement('p');
		h2er.innerText = head;

		//var per = document.createElement('p');
		divtext.innerText = text;
		divtext.insertBefore(h2er, divtext.firstChild);


//		divtext.appendChild(per);

		div1.appendChild(divtext)

		return div1;
	}
}*/