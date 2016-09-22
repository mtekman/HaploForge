
var SelectionAction = {

	toggle_selection_all : false,
	toggle_selection_affecteds : false,

	reset : function(){
		SelectionAction.toggle_selection_all = false;
		SelectionAction.toggle_selection_affecteds = false;
	},

	selectAll: function ()
	{
		SelectionAction.toggle_selection_all = !SelectionAction.toggle_selection_all;

		for (var key in SelectionMode._items){
			var item = SelectionMode._items[key];
			if(  (SelectionAction.toggle_selection_all && !item.selected)
			  || (!SelectionAction.toggle_selection_all && item.selected) ){
				item.box.fire('click')
			}
		}
	},

	selectAffecteds: function()
	{
		SelectionAction.toggle_selection_affecteds = !SelectionAction.toggle_selection_affecteds;

		for (var key in SelectionMode._items){
			var item = SelectionMode._items[key];
			var affected = (item.graphics.children[0].attrs.fill === col_affs[2])

			if (affected){
				if( (SelectionAction.toggle_selection_affecteds && !item.selected)
				 || (!SelectionAction.toggle_selection_affecteds && item.selected) ){
					item.box.fire('click');
				}
			}
		}
		console.log("affecteds:", 
			Object.keys(SelectionMode._items).filter( function (n){ return SelectionMode._items[n].affected === true;})
		);
	}

}