
var HaploBlockFormat = {

	hasGPData(show){
		HaploBlockFormat.format.textprops.x = show?-86:-38;
		HaploWindow._group.setX(show?45:0);

		HaploWindow._left.setX(show?-40:10);
		HaploWindow._left.setWidth(show?120:65)
	},

	format: {},

	__default : {
		textprops : {
			x: -38,
			y: -nodeSize*2,
			fontFamily: MarkerSlider._style.I_fontFamily,
			fontSize: 10,
			fill: 'black'
		},
		blockprops : {
			width: haploblock_spacers.block_width_px
		}
	},

	__fancy : {
/*		textprops : {
			strokeWidth: 0.001,
			stroke: 'white',
			shadowColor: 'black',
			shadowOffset: {x:5, y:5},
		},
		blockprops: {
			stroke: '#888',
			strokeWidth: 0.7,
			shadowColor: 'black',
			shadowOffset: {x:5, y:5},
		}*/
	},


	clearFormat : function(){
		HaploBlockFormat.format["textprops"] = {};
		HaploBlockFormat.format["blockprops"] = {};
	},

	applyDefault: function(){

		HaploBlockFormat.clearFormat();

		for (var prop_super in HaploBlockFormat.__default){
			HaploBlockFormat.format[prop_super] = {};

			for (var prop in HaploBlockFormat.__default[prop_super]){
				HaploBlockFormat.format[prop_super][prop] = HaploBlockFormat.__default[prop_super][prop];
			}
		}
	},

	applyFancy: function(){
	
		HaploBlockFormat.applyDefault();

		for (var prop_super in HaploBlockFormat.__fancy){
			for (var prop in HaploBlockFormat.__fancy[prop_super]){
				HaploBlockFormat.format[prop_super][prop] = HaploBlockFormat.__fancy[prop_super][prop];
			}
		}
	}
}