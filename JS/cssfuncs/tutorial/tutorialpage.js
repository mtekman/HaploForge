
class TutorialPage {

	constructor(array_or_title, top, bottom = null, centerImageSrc = null, action = null){

		// action is made up of enter and exit functions
		if (action === null){
			action = {enter: null, exit: null}
		}

		if (arguments.length > 1){
			this.title = array_or_title;
			this.text_top = top;
			this.text_bot = bottom;
			this.imgsrc = centerImageSrc;
			this.action = action;
		} else {
			this.title    = array_or_title[0];
			this.text_top = array_or_title[1];
			this.text_bot = array_or_title[2] || null;
			this.imgsrc   = array_or_title[3] || null;
			this.action   = array_or_title[4] || action;
		}
	}

	__makePage(){
		var divmain = document.createElement('div'),
			h2 = document.createElement('h2'),
			toptext = document.createElement('h6'), // top text
			bottext = document.createElement('h7'),   // image caption
			img = document.createElement('img');

		divmain.className = "tutorpage";

		divmain.appendChild(h2);
		h2.innerText      = this.title;

		divmain.appendChild(toptext);
		toptext.innerText = this.text_top;

		if (this.imgsrc !== null){
			divmain.appendChild(img);
			img.src = this.imgsrc;
		}

		if (this.bottext!== null){
			divmain.appendChild(bottext);
			bottext.innerText = this.text_bot;
		}

		divmain.enterAction = this.action.enter;
		divmain.exitAction  = this.action.exit;

		return divmain;
	}

	getPage(){
		return this.__makePage();
	}
}
