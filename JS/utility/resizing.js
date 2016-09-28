
var Resize = {

	updateHaploScrollHeight : function(new_lim = null)
	{
		HAP_DRAW_LIM = new_lim || HAP_DRAW_LIM;

		console.log("new_lim", new_lim);

		HaploBlock.end_index = HaploBlock.sta_index + HAP_DRAW_LIM;
	
		HaploWindow._bottom.rect.setHeight(
			(HAP_DRAW_LIM+3) * HAP_VERT_SPA 
		);

		HaploBlock.redrawHaplos();
		SliderHandler.updateInputsByIndex();
		SliderHandler.updateSlide();

	},

	getYOffset : function (){
		return HaploWindow._top.rect.getAbsolutePosition().y 
			+ HaploWindow._top.rect.getHeight()
			+ 10;

	},

	numFittableHaplos : function(){
		var y_offset = Resize.getYOffset(),
			avail_space = window.innerHeight - y_offset;

		return Math.floor( avail_space / HAP_VERT_SPA ) - 6;
	},

	resizeCanvas : function(playing = 90)
	{  	
	    if (stage !== null){
	    	stage.setWidth(window.innerWidth);

	        var stageHeight = window.innerHeight - 4;


	        if (HaploWindow._background !== null){

	            HaploWindow._background.setWidth(window.innerWidth);
	            SelectionMode._background.setWidth(window.innerWidth);
	            
	            var secHeight = stageHeight;

	            var fittable = Resize.numFittableHaplos();

	            if (HAP_DRAW_LIM > fittable){
	            	var y_offs = Resize.getYOffset()
//	            if (HaploBlock.exceeds_window){
	                secHeight = y_offs + ((HAP_DRAW_LIM+3) * HAP_VERT_SPA );
	                console.log("EXCEEDS WINDOW")
	                Resize.updateHaploScrollHeight( HAP_DRAW_LIM );
	            }
	            else {
	                Resize.updateHaploScrollHeight( Resize.numFittableHaplos() );
	            }

	            HaploWindow._background.setHeight(secHeight);
	            SelectionMode._background.setHeight(secHeight);
	            stage.setHeight(secHeight);


	            if (  ModeTracker.currentMode === ModeTracker.modes.pedcreate
	                ||ModeTracker.currentMode === ModeTracker.modes.haploview){
	                  FamSpacing.init(20);
	            }
	            haplo_layer.draw();
	        }
	        else {
	            stage.setHeight(stageHeight);
	        }
	    }
	}
}
