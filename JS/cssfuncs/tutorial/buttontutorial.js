import userOpts from '/JS/userconfig/useropts.js';

export default class ButtonTutorial {

	constructor(button,
				head, text,
				direction,
				onclick = null,
				styleprops = null){

		console.assert(['top','bot','left','right'].indexOf(direction)!==-1, "not a valid direction" + direction);
		console.assert(button!==null,                             "button does not exit" );
		console.assert(button.children.length === 0,              "button already in use");

		//Directions: UDLR
		this.box = ButtonTutorial.__makePointy(direction, head, text);

		if (styleprops!==null){
			for (var prop in styleprops){
				this.box.style[prop] = styleprops[prop];
			}
		}

		// Shakey
		var vertical = ['top','bot'].indexOf(direction)!==-1;
		this.timer = ButtonTutorial.__shake(this.box, vertical);

		// Lock to element
		this.button = button;
		this.button.parentNode.appendChild(this.box);

		// Background that obscures all other clicks
		this.bg = document.createElement('div');
		this.bg.className = 'buttontutorial_bg';
		this.button.appendChild(this.bg);

		// Raise element until clicked (doesn't quite work)
		// __ondelete restores it
		this.prev_zindex = this.button.style.zIndex || 0;

		this.button.style.zIndex = 999;
		this.box.style.zIndex = 999;

		var clicker = this.button.onclick;
		this.box.onclick = this.__ondelete.bind(this, clicker);
		this.button.onclick =   this.__ondelete.bind(this, clicker);
	}

	static __makePointy(direct, head, text){

		var div1 = document.createElement('div');
		div1.className = 'buttontutorial ' + direct;

		// Now create and append to iDiv
		var divtext = document.createElement('div');
		divtext.className = 'buttontutorial_text';

		var h2er = document.createElement('p');
		h2er.innerText = head;

		divtext.innerText = text;
		divtext.insertBefore(h2er, divtext.firstChild);

		div1.appendChild(divtext)

		return div1;
	}

	__ondelete(clicker = null){
		this.box.parentNode.removeChild(this.box);
		this.bg.parentNode.removeChild(this.bg);

		this.button.style.zIndex = this.prev_zindex;

		clearInterval(this.timer);

		if (clicker !== null){
			clicker();
		}
	}

	static __getposVert(box) {return Number(box.style.marginTop.split('px')[0]) || 0;}
	static __getposHoriz(box){return Number(box.style.marginLeft.split('px')[0]) || 0;}
	static __setposVert(box, am){
		var num_unit_top = box.style.marginTop.split('px')[0];
		box.style.marginTop = (num_unit_top + am) + 'px';

		var num_unit_bot = box.style.marginBottom.split('px')[0];
		box.style.marginBottom = (num_unit_bot + am) + 'px';
	}
	static __setposHoriz(box, am){
		var num_unit_left = box.style.marginLeft.split('px')[0];
		box.style.marginLeft = (Number(num_unit_left) + am) + 'px';

		var num_unit_right = box.style.marginRight.split('px')[0];
		box.style.marginRight = (Number(num_unit_right) + am) + 'px';

//		console.log("marginL", num_unit_left, box.style.marginLeft);
//		console.log("marginR", num_unit_right, box.style.marginRight);

	}


	static __shake(box, vertical){

		var getcurrent, setcurrent;

		if (vertical){
			getcurrent = ButtonTutorial.__getposVert;  setcurrent = ButtonTutorial.__setposVert;
		}
		else {
			getcurrent = ButtonTutorial.__getposHoriz; setcurrent = ButtonTutorial.__setposHoriz;
		}

		// Movement
		var move = 1, mult = 1.4, diff= 10;

		var box_start  = getcurrent(box),
			box_offset = box_start - diff;

//		console.log("box_start", box_start, "box_offset", box_offset);

		// Shimmy
		var tim1 = setInterval(function(){
			var current = getcurrent(box);

		  	if (current <= box_offset ){
		    	move = mult;
//				console.log(current + " < " + box_offset, "moving " + move);
		  	}
		  	else if (current >= box_start ){
		    	move = -mult;
//				console.log(current + " >= " + box_offset, "moving " + move);
		  	}
		  	setcurrent(box, move );
		}, 80)

		return tim1
	}
}



/* Depreciated function

		// Padding shrink/grow
/*		var tock = 2,
			diff = 0.1,
			mult = diff;

		var tim2 = setInterval(function(){
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

			box.style.borderButtonWidth = tock+'px';
			box.style.padding = tock+'px';
		},80)
*/
