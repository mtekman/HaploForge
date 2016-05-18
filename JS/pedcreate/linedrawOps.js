// Super class of offspringDraw and matelineDraw classes


class LineDrawOps {

	constructor() {
		this._layer = null; /*Layer*/
		this._tmpRect = null; /* Rectangle to detect mousemove */
		this._tmpLine = null;
		this._startPoint = {x:-1,y:-1};

		// Callbacks
		// Set before _init
		this._oncirclemousedown = null;
		this._onaddhit = null;
		this._ondelhit = null;		
		this._onbeginlinedraw = null;
		this._onbeginlinedraw_mousemove = null;
		this._onbeginlinedraw_mouseup = null;
		this._onendlinedraw = null;
	}


	_delHitRect() {

		if (this._ondelhit !== null){
			this._ondelhit();
		}

		this._layer.destroy();
		this._layer = null;
	}

	_addHitRect() {

		this._layer = (new Kinetic.Layer({
			width: stage.getWidth(),
			height:stage.getHeight(),
			x:0, y:0
		}));

		this._tmpRect = (new Kinetic.Rect({
			width: stage.getWidth(),
			height:stage.getHeight(),
			x:0, y:0,
		}))

		stage.add( this._layer );
		this._layer.add(this._tmpRect);

		this.drawCirclesAroundActiveFam();

		if (this._onaddhit !== null){
			this._onaddhit();
		}

		this._layer.draw();
	}


	static changeToArrowCursor(){
		document.body.style.cursor = "url('assets/Precision.cur'),auto";
	}

	static restoreCursor() {
		document.body.style.cursor = "";
	}


	beginLineDraw() {
		var _this = this;

		_this._tmpLine = new Kinetic.Line({
			stroke: 'black',
			strokeWidth: 2,
		});

		_this._layer.add(_this._tmpLine);	

		_this._tmpRect.on("mousemove", function(event){
			if (_this._startPoint.x !== -1){

				var mouseX = Math.floor(event.evt.clientX/grid_rezX)*grid_rezX,
					mouseY = Math.floor(event.evt.clientY/grid_rezY)*grid_rezY;

				changeRLineHoriz(
					_this._tmpLine,
					_this._startPoint,
					{x:mouseX,y:mouseY}
				);

				if (_this._onbeginlinedraw_mousemove !== null){
					_this._onbeginlinedraw_mousemove(); // pass this?
				}
	
				_this._layer.draw();
			}
		});

		_this._tmpRect.on("mouseup", function(event){

			if (_this._onbeginlinedraw_mouseup !== null){
				_this._onbeginlinedraw_mouseup(); // pass this?
			}

			_this.endLineDraw();
		});
	}

	endLineDraw() {

		this._delHitRect();	
		
		if (this._tmpLine !== null){
			this._tmpLine.destroy();
			this._tmpLine = null;
		}
		
		LineDrawOps.restoreCursor();

		if (this._onendlinedraw !== null){
			this._onendlinedraw(); // pass this?
		}

		this._startPoint = {x:-1, y:-1}

	}

	drawCirclesAroundActiveFam(){

		var _this = this;

		for (var perc_id in personDraw.used_ids)
		{
			var personIn = personDraw.used_ids[perc_id]

			if (personIn.family !== familyDraw.active_fam_group.id){
				continue;
			}

			var gfx = personIn.gfx;

			var apos = gfx.getAbsolutePosition(),
				rad = 15 ;

			var circle = new Kinetic.Circle({
				x: apos.x, 
				y: apos.y,
				radius: rad*2,
				stroke:"red",
				strokeWidth:2.5
			});
			circle.id = perc_id;

			circle.on("mouseover", function(event){
				
				if (_this._startPoint.x === -1){
					LineDrawOps.changeToArrowCursor();
				}
				else { //Start point set

					changeRLineHoriz(
						_this._tmpLine,
						_this._startPoint,
						this.getAbsolutePosition()
					);

					_this._layer.draw();
				}
			});

			circle.on("mouseout", function(){
				if (_this._startPoint.x === -1){
					LineDrawOps.restoreCursor();
				}
			});


			circle.on("mousedown", function(event, callback)
			{
				if (_this._startPoint.x === -1){
					var cX = this.getX(),
						cY = this.getY();

					_this._startPoint = {x:cX, y:cY};

					if (_this._oncirclemousedown !== null){
						_this._oncirclemousedown(this); // Pass circle object on
						//  _this.childNodeID = this.id
					}
					_this.beginLineDraw();
				}
			});
			
			_this._layer.add(circle);
		}
	}


	init(){
		if (this._tmpLine !== null){
			this.endLineDraw();
		}

		this._addHitRect();
	}
}
