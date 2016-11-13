
class ButtonTutorial {

	constructor(button, 
				head, text,  
				direction, 
				onclick = null, 
				styleprops = null){

		console.assert(['U','D','L','R'].indexOf(direction)!==-1, "not a valid direction" + direction);
		console.assert(button!==null,                             "button does not exit" );
		console.assert(button.children.length === 0,              "button already in use");

		//Directions: UDLR
		this.box = ButtonTutorial.__makePointy(direction, head, text);

		if (styleprops!==null){
			for (var prop in styleprops){
				this.box.style[prop] = styleprops[prop];
			}
		}

		// Exit function

		// Shakey
		var vertical = ['U','D'].indexOf(direction)!==-1;
		this.timers = ButtonTutorial.__shake(this.box, vertical);

		var clicker = button.onclick;
		this.box.onclick = ButtonTutorial.__ondelete.bind(this.box, clicker);
//		button.onclick =   ButtonTutorial.__ondelete.bind(this.box, clicker);

		// Lock to element
//		var tr = button.parentNode.parentNode;
//		var cell = tr.insertCell(0);
//		cell.appendChild(this.box);
		button.parentNode.appendChild(this.box);
	}

	static __makePointy(direct, head, text){

		var div1 = document.createElement('div');
		//div1.buttonid = buttonid;
		div1.className = 'buttontutorial ' + direct;

		// Now create and append to iDiv
		var divtext = document.createElement('div');
		divtext.className = 'buttontutorial_text';

		var h2er = document.createElement('p');
		h2er.innerText = head;

		//var per = document.createElement('p');
		divtext.innerText = text;
		divtext.insertBefore(h2er, divtext.firstChild);

//		divtext.appendChild(per);
		div1.appendChild(divtext)
		div1.style.zIndex = 999;

		return div1;
	}

	static __ondelete(box, clicker = null){
		box.parentNode.removeChild(box);
		clearInterval(this.timers[0]);
		clearInterval(this.timers[1]);

		if (clicker !== null){
			clicker();
		}
	}


	static __shake(box, vertical){

		var move = 1, mult = 1, diff= 10;

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

//		console.log("box_start=", box_start, "box_offset=", box_offset)

		var tim1 = setInterval(function(){
			var current = getcurrent(box);

		  	if (current <= box_offset ){
		    	move = mult;
		  	}
		  	else if (current >= box_start ){
		    	move = -mult;
		  	}
		  	setcurrent(box, current + move );
		}, 1000)

		var prev = box.style.borderButtonWidth;

		var tock = 2,
			diff = 0.5,
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

		return [tim1,tim2]
	}
}