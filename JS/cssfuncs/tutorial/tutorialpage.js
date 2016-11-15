
class TutorialPage {

	constructor(array_or_title, top, bottom = null, media = null, action = null){

		// action is made up of enter and exit functions
		if (action === null){
			action = {enter: null, exit: null}
		}

		if (arguments.length > 1){
			this.title     = array_or_title;
			this.text_top  = top;
			this.text_bot  = bottom;
			this.media     = media;
			this.action    = action;
		} else {
			this.title     =  array_or_title[0];
			this.text_top  =  array_or_title[1];
			this.text_bot  =  array_or_title[2] || null;
			this.media     =  array_or_title[3] || null;
			this.action    =  array_or_title[4] || action;
		}
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

		h2.innerText      = this.title;
		toptext.innerText = this.text_top;


		var that = this;

		if (this.media !== null)
		{
			var med;	
			if (this.media.type === "video")
			{
				var vt = new VideoTranscript(that, this.media.src, this.media.transcript);
				med = vt.getVideo();
				divmain.appendChild(med);
				divmain.appendChild(toptext);

				this.__videotrans = vt; // for destroy();
			}
			
			else { //"img"
				med = document.createElement('img');
				med.src = this.mediasrc; 
				divmain.appendChild(toptext);
				divmain.appendChild(med);
			}
			
		}

		if (this.text_bot!== null){
			divmain.appendChild(bottext);
			bottext.innerText = this.text_bot;
		}

		divmain.enterAction = this.action.enter;
		divmain.exitAction  = this.action.exit;

		return divmain;
	}

	getPage(){
		this.__mainpage = this.__makePage();
		return this.__mainpage;
	}

	// Used by VideoTranscript
	modifyTop(text){this.text.top.innerText = text;}
	modifyBot(text){this.text.bot.innerText = text;}

/*	modifyText(above,below){
		this.text.top.innerText = above;
		this.text.bot.innerText = below;
	}
*/
}
