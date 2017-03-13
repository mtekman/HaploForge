

var messProps = {
	_header : document.getElementById('message_head'),
	_text   : document.getElementById('message_text'),
	_exit : document.getElementById('message_exit'),
	_box : document.getElementById('message_props'),
	_buttonrow : document.getElementById('message_buttonsrow'),
	_yes : document.getElementById('message_yes'),
	_no : document.getElementById('message_no'),
	_inputrow : document.getElementById("message_inputrow"),
	_input : document.getElementById("message_input"),
	_submit : document.getElementById("message_submit"),

	_aftercallbacks: function(){
		this.hide();
		utility.hideBG();
		this._inputrow.style.display = "block";
		this._text.style.display = "block";
	},

	hide: function(){ 
		Keyboard.unpause()
		this._box.style.display = "none";
		this._box.style.zIndex = -99;
	},
	show: function(){ 
		Keyboard.pause()
		this._box.style.display = "block";
		this._box.style.zIndex = 502;
		this._input.focus();
	},


	display: function(header,text, exit_callback = null, yes_no_object = null, submit=false){
		utility.showBG(function(){
			messProps.hide();
		});
		this.show();

		this._header.innerHTML = header;
		this._text.innerHTML   = text;

		/* On Exit */
		this._exit.onclick = function(){
			if (exit_callback !== null){exit_callback()};
			messProps._aftercallbacks();
		};

		/*Submit */
		if (submit){
			this._buttonrow.style.display = "none";
			this._inputrow.style.display = "block";
			
			this._submit.value = "Submit";
			var that = this;
			this._submit.onclick = function(){
				submit(that._input.value);
				that._exit.onclick();
			}
		}


		/* Yes No*/
		if (yes_no_object === null){
			this._buttonrow.style.display= "none";
			this._no.value   = this._yes.value   = "";
			this._no.onclick = this._yes.onclick = null;
		}
		else
		/* Input box */
		{
			this._buttonrow.style.display = "block";
			this._inputrow.style.display = "none";

			if (yes_no_object.yes !== null)
			{
				this._yes.value = yes_no_object.yes;
				this._yes.onclick = function()
				{
					yes_no_object.yescallback();
					messProps._aftercallbacks();
				};
			};

			if (yes_no_object.no !== null)
			{
				this._no.value = yes_no_object.no;
				this._no.onclick = function()
				{
					yes_no_object.nocallback();
					messProps._aftercallbacks();
				}
			};

		}
	},

	prompt: function(header, text, yes, onYes, no, onNo)
	{
		var promptcallback = { 
			yes: yes, yescallback: onYes,
			no : no ,  nocallback: onNo
		}

		this._inputrow.style.display = "none";
		this.display(header,text, null, promptcallback, false);
	},

	input: function(header, callback){
		this._text.style.display = "none";
		this._text.value = "";

		var that = this;

		that.display(header, "", null, null, callback);
		/*function(val){
			console.log(val);
			callback(val.innerHTML);
//			messProps._aftercallbacks();
		});*/
	}

}


var statusProps = {
	_box: document.getElementById('status_props'),
	_header: document.getElementById('status_head'),
	_message: document.getElementById('status_text'),

	hide: function(){ 
		this._box.style.display = "none";
	},
	show: function(){ 
		this._box.style.display = "block";
		this._box.style.opacity = 1;
		this._box.style.zIndex = 503;
	},

	_fade: function(step=30){
		var op = 1;
		var timer = setInterval(function(){
			if (op < 0.1){
				clearInterval(timer);
				statusProps.hide();
			}
			statusProps._box.style.opacity = op;
			op -= 0.1;
		}, step)
	},

	display: function(header,details, timeUntilFade=1.5, fadeStep=50){
		// Don't change to "this", because utility.notify defers what 'this' is
		statusProps.show();

		statusProps._header.innerHTML = header;
		statusProps._message.innerHTML = details;

		setTimeout( function(){
			statusProps._fade(fadeStep);
		}, timeUntilFade * 1000);
	}
}



var utility = {
	_bg: null,

	focus: function(){
		this.focus();
	},

	yesnoprompt: function(title, message, yes, onYes, no, onNo){
		// Own method drop in?
		messProps.prompt(title, message, yes, onYes, no, onNo);
	},

	inputprompt: function(title, callback){
		messProps.input(title, callback);
	},

	notify: statusProps.display,

	getMouseXY: function(){
		return stage.getPointerPosition();
	},

	showBG: function(callback = null)
	{
		let new_bg = document.createElement('div');
		new_bg.className = 'modal_bg';

		utility._bg = new_bg
		document.body.appendChild(utility._bg)

		utility._bg.style.display = "block";

		var messZ = messProps._box.style.zIndex || 500;

		utility._bg.style.zIndex = messZ - 1; /// get Zindex of messPrompt solid
		if (callback !== null){
			utility._bg.onclick = function(){
				callback();
				utility.hideBG();
				utility._bg.onclick = null;
			}
		}
	},

	hideBG: function(){
		if (utility._bg !== null){
			utility._bg.parentNode.removeChild(utility._bg);
		}
	}
}