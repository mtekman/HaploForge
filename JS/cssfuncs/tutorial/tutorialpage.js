
class TutorialPage {

	constructor(array_or_title, top, bottom, centerImageSrc){

		if (arguments.length > 3){
			this.title = array_or_title;
			this.text_top = top;
			this.text_bot = bottom;
			this.imgsrc = centerImageSrc;
		} else {
			this.title    = array_or_title[0];
			this.text_top = array_or_title[1];
			this.text_bot = array_or_title[2];
			this.imgsrc   = array_or_title[3];
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
		divmain.appendChild(toptext);
		divmain.appendChild(img);
		divmain.appendChild(bottext);

		h2.innerText      = this.title;
		toptext.innerText = this.text_top;
		bottext.innerText = this.text_bot;

		if (this.imgsrc === null){
			img.parentNode.removeChild(img);
		}
		else img.src = this.imgsrc;

		return divmain;
	}

	getPage(){
		return this.__makePage();
	}
}