
var famProps = {

	box : document.getElementById('family_props'),
	submit: document.getElementById('family_submit'),
	
	id : document.getElementById('family_id'),
	name : document.getElementById('family_name'),

	hide: function(){ this.box.style.display = "none";},
	show: function(){ this.box.style.display = "";},

	showProps: function(family){
		this.show();

		this.id.value   = family.id;
		this.name.value = family.name;
	},

	getProps: function(){
		var fam = {id:-1, name:""};

		fam.id = Number( this.id.value );
		fam.name = this.name.value;

		this.hide();
		return fam;
	}
}


var persProps = {

	box : document.getElementById('person_props'),
	submit: document.getElementById('pers_submit'),
	
	id : document.getElementById('pers_id'),
	name : document.getElementById('pers_name'),
	gender : document.getElementById('pers_gender'),
	affect : document.getElementById('pers_affect'),


	hide: function(){ this.box.style.display = "none";},
	show: function(){ this.box.style.display = "";},

	showProps: function(person){
		this.show();

		this.id.value   = person.id;
		this.name.value = person.name;
		this.gender.value   = person.gender;
		this.affect.value   = person.affected;
	},

	getProps: function(){
		var person = {id:-1,gender:-1,affected:-1, name:""};

		person.id = Number(this.id.value);
		person.gender = Number(this.gender.value);
		person.affected = Number(this.affect.value);
		person.name = this.name.value;

		this.hide();
		return person;
	}
}

persProps.submit.onclick = function(){persProps.getProps();};
famProps.submit.onclick  = function(){ famProps.getProps();};



/*

var message_box = document.getElementById('message_box');


var message = {

	hide: function(){
		message_box.style.display = "none";
	},

	show: function(){
		message_box.style.display = "";
	},

	clear: function(){
		message_box.innerHTML = "";
		this.hide()
	},


	message: function(){
		this.clear();

		var text= "";
		for (var a=0; a < arguments.length; a++){
			text += " " + arguments[a];
		}

		message_box.innerHTML = "<p>" + text + "</p>";
		this.show();
	},


	input: function(){

	}
}
*/

document.getElementById('homology_buttons').style.display = 'none'
document.getElementById('pedcreate_views').style.display = 'none'
document.getElementById('buttons').style.display = 'none'


famProps.show()
persProps.hide();