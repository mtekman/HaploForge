

class Tutorial {

	constructor(id, direct, head, text, pos = null){

		this.box = Tutorial.__makePointy(id, direct, head, text);

		this.box.style.position = "absolute";
		
		if (pos === null){
			this.box.style.top  = '200px';
			this.box.style.left = '400px';
		}
		else {
			for (var prop in pos){
				this.box.style[prop] = pos[prop];
			}
		}


		this.__shake();
	}



	// Smacky
	__shake(){

		var that = this,
			box = that.box;

		var move = 2,
			mult = 2,
			ydiff= 10;

		var box_bot = box.offsetTop,
			box_top = box_bot - ydiff;


		var tim = setInterval(function(){
			var current = box.offsetTop;
		  	
		  	if (current < box_top){
		    	move = mult;
		  	}
		  	else if (current > box_bot ){
		    	move = -mult;
		  	}
		  	that.box.style.top = (current + move) + 'px';
		}, 100);

		box.onclick = function(){
			clearInterval(tim);
			this.parentNode.removeChild(this);
		}
	}


	// new block
	static __makePointy(id, direct, head, text){
		var div1 = document.createElement('div');
		div1.id = id;
		div1.className = 'tutorial ' + direct;
		document.getElementsByTagName('body')[0].appendChild(div1);

		// Now create and append to iDiv
		var divtext = document.createElement('div');
		divtext.className = 'tutorial_text';

		var h2er = document.createElement('h4');
		h2er.innerText = head;

		var per = document.createElement('p');
		per.innerText = text;


		divtext.appendChild(h2er);
		divtext.appendChild(per);

		div1.appendChild(divtext)

		return div1;
	}
}