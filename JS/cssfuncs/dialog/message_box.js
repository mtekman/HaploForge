
var famProps = {
	_box : document.getElementById('family_props'),
	_id : document.getElementById('family_id'),
	_name : document.getElementById('family_name'),
	_submit: document.getElementById('family_submit'),

	hide: function(){ 
		Keyboard.unpause()
		famProps._box.style.display = "none";
		famProps._box.style.zIndex = -2;
	},
	show: function(){
		Keyboard.pause()
		famProps._box.style.display = "block";
		famProps._box.style.zIndex = 502;
		famProps._name.focus();
	},

	showProps: function(family){
		famProps.show();

		utility.showBG(function(){
			famProps.hide();
		});

		famProps._id.value   = family.id;
		famProps._name.value = family.name;
	},

	getProps: function(){
		var fam = {id:-1, name:""};

		fam.id = Number( famProps._id.value );
		fam.name = famProps._name.value;

		utility.hideBG();
		famProps.hide();
		return fam;
	},

	display: function(family, callback){
		famProps.showProps(family);
		famProps._submit.onclick = function(){
			var fam = famProps.getProps();
			callback(fam);
		}
	}

}


var benchProps = {
	_box :              document.getElementById('bench_props'),
	_rootfounderInput : document.getElementById('bench_root_founder'),
	_maxgenInput:       document.getElementById('bench_max_gen'),
	_allelesizeInput:   document.getElementById('bench_allele_size'),
	_inbreedInput:      document.getElementById('bench_inbreed_prob'),
	_exportInput:       document.getElementById('bench_export_haplo'),
	_submit:            document.getElementById('bench_submit'),
	_close:             document.getElementById('bench_close'),

	maxgen: -1,
	allelesize: -1,
	rootfounders: -1,
	inbreedchance: -1,
	exportFile: false,

	hide: function(){ 
		Keyboard.unpause()
		this._box.style.display = "none";
		this._box.style.zIndex = -99;
		utility.hideBG()
	},
	show: function(){
		Keyboard.pause()
		this._box.style.display = "block";
		this._box.style.zIndex = 501;
		this._rootfounderInput.focus();
		utility.showBG()
	},

	_getInputs: function(){
		this.maxgen        = Number( this._maxgenInput.value );
		this.allelesize    = Number(this._allelesizeInput.value );
		this.rootfounders  = Number(this._rootfounderInput.value );
		this.inbreedchance = Number(this._inbreedInput.value);
		this.exportFile    = this._exportInput.checked;
	},

	display: function(callback){
		this.show();

		var that = this;

		if (this._submit.onclick === null){
			this._submit.onclick = function()
			{
				that._getInputs();
				that.hide();
				callback(
					that.rootfounders,
					that.maxgen,
					that.allelesize,
					that.inbreedchance,
					that.exportFile)
			}
		}

		if (this._close.onclick === null){
			this._close.onclick = function(){
				that.hide();
			}
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
	_delete : document.getElementById('pers_delete'),

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
		Keyboard.unpause()
		this._box.style.display = "none";
		this._box.style.zIndex = -99;
	},
	show: function(){
		Keyboard.pause()
		this._box.style.display = "block";
		this._box.style.zIndex = 501;
		this.name.focus();
	},

	showProps: function(person){
		this.show();

		utility.showBG(function(){
			persProps.hide();
		});

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
		};

		this._delete.onclick = function(){
			utility.yesnoprompt(
				"Delete",
				"Remove individual " + person.id,
				"Yes", function(){
					// Migrate this to personDraw.js
					var famid = familyDraw.active_fam_group.id;

					delete personDraw.used_ids[person.id]
					uniqueGraphOps.deleteNode(person.id, famid);

					familyMapOps.removePerc(person.id, famid);

					main_layer.draw();
					
					messProps.hide();
					persProps.hide();
					utility.hideBG();

					utility.notify("Family" + famid, "deleted individual "+ person.id);
				},
				"No", function(){
					messProps.hide();
					utility.hideBG();
				}
			);
		};
	}
}
