// Super class of offspringDraw and matelineDraw classes

lineDrawOps = {

	_layer: null, /*Layer*/
	_tmpRect: null, /* Rectangle to detect mousemove */
	_tmpLine : null,

	_startPoint : {x:-1,y:-1},


	_delHitRect: function(){
		lineDrawOps._layer.destroy();
	},

	_addHitRect: function(callback = null)
	{

		lineDrawOps._layer = (new Kinetic.Layer({
			width: stage.getWidth(),
			height:stage.getHeight(),
			x:0, y:0
		}));

		lineDrawOps._tmpRect = (new Kinetic.Rect({
			width: stage.getWidth(),
			height:stage.getHeight(),
			x:0, y:0,
		}))

		stage.add( lineDrawOps._layer );
		lineDrawOps._layer.add(lineDrawOps._tmpRect);

		if (callback !== null){callback();}

		lineDrawOps._layer.draw();
	},

	changeToArrowCursor: function(){
		document.body.style.cursor = "url('assets/Precision.cur'),auto";
	},

	restoreCursor: function(){
		document.body.style.cursor = "";
	},


	beginLineDraw: function(mousemovecallback, mouseupcallback = null)
	{
		lineDrawOps._tmpLine = new Kinetic.Line({
			stroke: 'black',
			strokeWidth: 2,
		});

		lineDrawOps._layer.add(this._tmpLine);	

		lineDrawOps._tmpRect.on("mousemove", function(event){
			mousemovecallback(event);
		});


		lineDrawOps._tmpRect.on("mouseup", function(event){
			if (mouseupcallback === null){
				lineDrawOps.endLineDraw();
			}
			else{
				mouseupcallback(event);
			}
		});

	},

	endLineDraw:function(callback =  null){
		lineDrawOps._delHitRect();	
		
		if (lineDrawOps._tmpLine !== null){
			lineDrawOps._tmpLine.destroy();
		}
		
		lineDrawOps.restoreCursor();

		if (callback !== null){
			callback();
		}
	},

	init: function()
	{

		if (lineDrawOps._tmpLine !== null){
			this.endLineDraw();
		}

		this._addHitRect();
	}
}
