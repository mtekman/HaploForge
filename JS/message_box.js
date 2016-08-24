var statusProps = {
	_box: document.getElementById('status_props'),
	_header: document.getElementById('status_head'),
	_message: document.getElementById('status_text'),

	hide: function(){ this._box.style.display = "none";},
	show: function(){ this._box.style.display = ""; this._box.style.opacity = 1},

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
	_bg: document.getElementById('modal_bg'),

	yesnoprompt: function(title, message, yes, onYes, no, onNo){
		// Own method drop in?
		messProps.prompt(title, message, yes, onYes, no, onNo);
	},

	inputprompt: function(title, callback){
		messProps.input(title, callback);
	},

	notify: statusProps.display,

	message: function(){
		/* Change to a notification system for users*/
		console.log(arguments)
	},

	getMouseXY: function(){
		return stage.getPointerPosition();
	},

	showBG: function(){
		this._bg.style.display = "block";
		this._bg.style.zIndex = 500;
	},

	hideBG: function(){
		this._bg.style.display = "none";
		this._bg.style.zIndex = -99;
	}
}



var famProps = {
	_box : document.getElementById('family_props'),
	_id : document.getElementById('family_id'),
	_name : document.getElementById('family_name'),
	_submit: document.getElementById('family_submit'),

	hide: function(){ this._box.style.display = "none";},
	show: function(){ this._box.style.display = "";},

	showProps: function(family){
		utility.showBG();
		this.show();

		this._id.value   = family.id;
		this._name.value = family.name;
	},

	getProps: function(){
		var fam = {id:-1, name:""};

		fam.id = Number( this._id.value );
		fam.name = this._name.value;

		utility.hideBG();
		this.hide();
		return fam;
	},

	display: function(family, callback){
		this.showProps(family);
		this._submit.onclick = function(){
			var fam = famProps.getProps();
			callback(fam);
		}
	}

}


var persProps = {
	_box : document.getElementById('person_props'),	
	_genderInput : document.getElementById('pers_gender'),
	_genderUnknown: document.getElementById('pers_gender_unknown'),
	_affectInput : document.getElementById('pers_affect'),
	_affectUnknown : document.getElementById('pers_affect_unknown'),
	_submit : document.getElementById('pers_submit'),

	id : document.getElementById('pers_id'),
	name : document.getElementById('pers_name'),
	gender : -1,
	affect: -1,
	
	_getGender: function(){
		if (!(this._genderUnknown.checked)){
			return 0;
		}
		else { //Box checked, Male or Female
			return (this._genderInput.checked)?2:1;
		}
	},

	_setGender: function(gender){
		if (gender === 0 ){
			this._genderUnknown.checked = false;
		}
		else {
			this._genderUnknown.checked = true;
			this._genderInput.checked = (gender===2);
		}
	},

	_getAffect: function(){
		if (!(this._affectUnknown.checked)){
			return 0;
		}
		else { //Box checked, Unaffected or Affected
			return (this._affectInput.checked)?2:1;
		}
	},

	_setAffect: function(affect){
		if (affect === 0 ){
			this._affectUnknown.checked = false;
		}
		else {
			this._affectUnknown.checked = true;
			this._affectInput.checked = (affect===2);
		}
	},


	hide: function(){ 
		this._box.style.display = "none";
		this._box.style.zIndex = -99;
	},
	show: function(){
		this._box.style.display = "";
		this._box.style.zIndex = 501;
	},

	showProps: function(person){
		utility.showBG();
		this.show();

		this.id.value     = person.id;
		this.name.value   = person.name || "";
		this._setGender(person.gender);
		this._setAffect(person.affected);
	},

	getProps: function(){
		var person = {id:-1,gender:-1,affected:-1, name:""};

		person.id = Number(this.id.value);
		person.gender = this._getGender();
		person.affected = this._getAffect();
		person.name = this.name.value;

		this.hide();
		utility.hideBG();

		var perc = new Person(person.id, person.gender, person.affected, 0, 0);
		if (person.name.trim().length > 0){
			perc.name = person.name.trim();
		}
		return perc;
	},

	display: function(person, callback){
		this.showProps(person);
		this._submit.onclick = function(){
			var pers = persProps.getProps();
			callback(pers);
		}
	}
}


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
		this._inputrow.style.display = "";
		this._text.style.display = "";
	},

	hide: function(){ 
		this._box.style.display = "none";
		this._box.style.zIndex = -99;
	},
	show: function(){ 
		this._box.style.display = "";
		this._box.style.zIndex = 502;
	},


	display: function(header,text, exit_callback = null, yes_no_object = null, submit=false){
		utility.showBG();
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
			this._inputrow.style.display = "";
			
			this._submit.value = "Candy";
			this._submit.onclick = submit;
		}


		/* Yes No*/
		if (yes_no_object === null){
			this._buttonrow.style.display= "none";
			this._no.value   = this._yes.value   = "";
			this._no.onclick = this._yes.onclick = null;
		}
		else
		{
			this._buttonrow.style.display = "";
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

		this.display(header, "", null, null, function(){
			messProps._aftercallbacks();
			callback();
		});
	}

}


famProps.hide();
persProps.hide();
messProps.hide();
statusProps.hide();

