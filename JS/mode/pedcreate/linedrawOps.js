import MouseStyle from '/JS/iofuncs/mousestyle.js';
import MouseResize from '/JS/iofuncs/mouseresize.js';

// Super class of offspringDraw and matelineDraw classes

class LineDrawOps {

	constructor(familyID) {

		this._family = familyID

		this._layer = null; /*Layer*/
		this._tmpRect = null; /* Rectangle to detect mousemove */

		this._tmpLine = null;
		this._startPoint = {x:-1,y:-1};
		this._endPoint = {x:-1,y:-1};

		this._RLineMethod = Graphics.Lines.changeRLineHoriz;

		// Callbacks
		// Set before _init
		this._oncirclemousedown = null;
		this._oncirclemousedown_final = null;
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

		if (this._layer !== null){
			this._layer.destroy();
			this._layer = null;
		}
	}

	_addHitRect() {

		let spos = stage.getAbsolutePosition();

		this._layer = (new Kinetic.Layer({
			width: stage.getWidth(),
			height:stage.getHeight(),
			scale : main_layer.getScale(),
			x:-spos.x, y: -spos.y
		}));

		this._tmpRect = (new Kinetic.Rect({
			width: stage.getWidth(),
			height:stage.getHeight(),
			x:0, y:0
		}))

		stage.add( this._layer );
		this._layer.add(this._tmpRect);

		this.drawCircles();

		if (this._onaddhit !== null){
			this._onaddhit();
		}

		this._layer.draw();
	}


	updateLine() {
		this._RLineMethod(
			this._tmpLine,
			this._startPoint,
			this._endPoint
		);
	}


	beginLineDraw() {
		MouseResize.off()

		var _this = this;

		_this._tmpLine = new Kinetic.Line({
			x: 0,
			y: 0,
			stroke: 'black',
			strokeWidth: 2,
		});

		_this._layer.add(_this._tmpLine);

		_this._tmpRect.on("mousemove", function(event){
			if (_this._startPoint.x !== -1){

				var mouseX = Math.floor(event.evt.clientX/grid_rezX)*grid_rezX,
					mouseY = Math.floor(event.evt.clientY/grid_rezY)*grid_rezY;

				_this._endPoint = {
					x: mouseX,
					y: mouseY
				};

				_this.updateLine();

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

		MouseStyle.restoreCursor();

		if (this._onendlinedraw !== null){
			this._onendlinedraw(); // pass this?
		}

		this._startPoint = {x:-1, y:-1}

		// restore draggable if previously set
		MouseResize.on()
		stage.setDraggable( this.stage_draggable_state );

	}

	drawCircles(){
		this.stage_draggable_state = stage.getDraggable();
		MouseResize.off()

		var _this = this;

		var circleGroup = new Kinetic.Group({x:0, y:0});

		for (var perc_id in personDraw.used_ids)
		{
			var personIn = personDraw.used_ids[perc_id]

			if (personIn.family !== _this._family){
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
					MouseStyle.changeToArrowCursor();
				}
				else { //Start point set

					_this._endPoint = this.getAbsolutePosition();

					_this.updateLine();
					_this._layer.draw();
				}
			});

			circle.on("mouseout", function(){
				if (_this._startPoint.x === -1){
					MouseStyle.restoreCursor();
				}
			});


			circle.on("mousedown mouseup", function(event, callback)
			{
				if (_this._startPoint.x === -1){
					var cX = this.getX(),
						cY = this.getY();

					_this._startPoint = {x:cX, y:cY};

					if (_this._oncirclemousedown !== null){
						_this._oncirclemousedown(this, circleGroup); // Pass circle object on
						//  _this.childNodeID = this.id
					}
					_this.beginLineDraw();
				}
				else {

					// Execute callback on second selection/completion
					if (_this._oncirclemousedown_final !== null){
						_this._oncirclemousedown_final(this);
					}

					_this.endLineDraw();
				}


			});
			circleGroup.add(circle);
		}
		_this._layer.add(circleGroup);
	}


	init(){
		if (this._tmpLine !== null){
			this.endLineDraw();
		}

		this._addHitRect();
	}
}
