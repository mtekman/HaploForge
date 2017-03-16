
class TutorialPage {

	constructor(object){

		// action is made up of enter and exit functions
		if (object.action === undefined){
			object.action = {enter: null, exit: null}
		}

		if (object.text !== undefined){
			this.__text_top  = object.text[0];
			this.__text_bot  = object.text[1];

		}

		// Text comes from video transcripts, so grab zero times
		if (object.type === "video"){
			var trans = object.media.text[0];

			this.__text_top = trans[1]
			this.__text_bot = trans[2]
		}

		this.__type      = object.type;
		this.__title     = object.title;
		this.__media     = object.media;
		this.__action    = object.action;
	}

	destroy(){ /* Called by Tutorial.destroy() */
		if (this.__videotrans !== undefined){
			this.__videotrans.destroy();
		}
		while (this.__mainpage.firstChild){
			this.__mainpage.removeChild(this.__mainpage.firstChild);
		}
		this.__mainpage.parentNode.removeChild(this.__mainpage);
	}

	__makePage(){

		var divmain = document.createElement('div'),
			h2      = document.createElement('h2') ,
			toptext = document.createElement('h6') ,   // top text
			bottext = document.createElement('h7') ;   // bottom caption

		this.text = {top: toptext, bot: bottext};    // outside accessor

		divmain.className = "tutorpage";
		divmain.appendChild(h2);

		h2.innerText      = this.__title;
		toptext.innerText = this.__text_top;

		var that = this;
		
		if (this.__text_bot!== null){
			bottext.innerText = this.__text_bot;
		}

		var textholder = document.createElement('div');
		textholder.className = "textholder";

		textholder.appendChild(toptext);
		textholder.appendChild(bottext);

		divmain.appendChild(textholder);

		if (this.__media !== undefined)
		{
			var med;	
			if (this.__type === "video")
			{
				var vt = new VideoTranscript(that, this.__media.src, this.__media.text);
				med = vt.getVideo();
//				divmain.appendChild(med);
//				divmain.appendChild(toptext);

				this.__videotrans = vt; // for destroy();

				// Layer on Keyboard
				if (this.__action.enter === null){
					this.__action.enter = vt.keyboardOn.bind(vt);
				}
				else {
					var enter = this.__action.enter;
					this.__action.enter = function(){
						vt.keyboardOn.bind(vt)();
						enter();
					}
				}

				//Layer off Keyboard
				if (this.__action.exit === null){
					this.__action.exit = vt.keyboardOff.bind(vt);
				}
				else {
					var exit = this.__action.exit;
					this.__action.exit = function(){
						vt.keyboardOff.bind(vt)()
						exit();
					}
				}
			}
			
			else { //"img"
				med = document.createElement('img');
				med.src = this.__mediasrc; 
//				divmain.appendChild(toptext);
//				divmain.appendChild(med);
			}
			divmain.appendChild(med);
		}



		// Accessors
		this.enterAction = this.__action.enter;
		this.exitAction  = this.__action.exit;

		return divmain;
	}

	getPage(){
		this.__mainpage = this.__makePage();
		return this.__mainpage;
	}

	__transitionText(obj, new_text, interval = 500){

		var step = interval / 6

		setTimeout(function(){
			obj.style.opacity = 0.7;

		setTimeout(function(){
			obj.style.opacity = 0.3

		setTimeout(function(){
			obj.style.opacity = 0
			obj.innerText = new_text;

		setTimeout(function(){
			obj.style.opacity = 0.3

		setTimeout(function(){
			obj.style.opacity = 0.7

		setTimeout(function(){
			obj.style.opacity = 1
		}, step)
		}, step)
		}, step)
		}, step)
		}, step)
		}, step)
	}

	// Used by VideoTranscript
	modifyTop(text){  this.__transitionText(this.text.top, text, 500);	}
	modifyBot(text){  this.__transitionText(this.text.bot, text, 500)   }
}
