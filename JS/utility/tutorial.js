

class Tutorial {


	constructor(id, direct, head, text, pos = null, onclick = null){

		var box = Tutorial.__makePointy(direct, head, text);

		// Add to map
		if (Tutorial.__list === undefined){
			Tutorial.__list = {};
		}
		Tutorial.__list[id] = box;


		var doc  = document.getElementById(id);
		doc.appendChild(box);
		box.style.zIndex = 999;
		
		//document.getElementsByTagName('body')[0].appendChild(box);
		//box.style.position = "absolute";
		//box.style.left = doc.offsetLeft + 'px'
		//box.style.top = doc.offsetTop + 'px'
		
		// if (pos === null){
		// 	this.box.style.top  = '200px';
		// 	this.box.style.left = '400px';
		// }
		// else {
//			for (var prop in pos){
//				this.box.style[prop] = pos[prop];
//			}
		// }

		//this.box.style.position = "absolute";
		//this.box.style.top = top + 'px';
		//this.box.style.left= left + 'px';


		this.box = box;
//		this.__shake(onclick);
	}

	static updatePositions(){ // called by resize
		
		for (var id in Tutorial.__list)
		{
			var box = Tutorial.__list[id];

		}
	}



	// Smacky
	__shake(clicker = null){

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

			if (clicker !== null){
				clicker();
			}

		}
	}


	// new block
	static __makePointy(direct, head, text){

		var div1 = document.createElement('div');
		//div1.id = id;
		div1.className = 'tutorial ' + direct;


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