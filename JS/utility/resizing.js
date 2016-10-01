
var Resize = {

	numVisibleHaplos: -1,

	updateHaploScrollHeight : function(new_lim = null)
	{
		HAP_DRAW_LIM = new_lim || Resize.numVisibleHaplos;

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

	resizeCanvas : function(playing = 90)
	{  	
	    if (stage !== null){
	        var stageHeight = window.innerHeight - 4;

	    	var newWidth = window.innerWidth;

	        if (HaploWindow._background !== null)
	        {         
	            // Update the number of visible haplotypes number
	            Resize.__numFittableHaplos();

	            if (HAP_DRAW_LIM > Resize.numVisibleHaplos + 2){
	            	var y_offs = Resize.getYOffset()
	                stageHeight = y_offs + ((HAP_DRAW_LIM+3) * HAP_VERT_SPA );
	            }

	            Resize.updateHaploScrollHeight(
	            	SliderHandler.inputsLocked?null:HAP_DRAW_LIM 
	            );

	            HaploWindow._background.setHeight(stageHeight);
	            SelectionMode._background.setHeight(stageHeight);
	            stage.setHeight(stageHeight);

	            if (  ModeTracker.currentMode === ModeTracker.modes.pedcreate
	                ||ModeTracker.currentMode === ModeTracker.modes.haploview){
	                  FamSpacing.init(20);
	            }


	            var defWidth = HaploWindow._top.rect.getWidth()
	                         + HaploWindow._top.rect.getAbsolutePosition().x 
	                         + 120; // 120 for CSS
	            if (defWidth > newWidth){
	            	newWidth = defWidth;
	            }

	            HaploWindow._background.setWidth(newWidth);
	            SelectionMode._background.setWidth(newWidth);
	            stage.setWidth(newWidth);
	            
	            haplo_layer.draw();
	        }
	        else {
	            stage.setHeight(stageHeight);
		    	stage.setWidth(newWidth);
	        }
	    }
	},

	__numFittableHaplos : function(){
		var y_offset = Resize.getYOffset(),
			avail_space = window.innerHeight - y_offset;

		Resize.numVisibleHaplos = Math.floor( avail_space / HAP_VERT_SPA ) - 6;

	}
}
