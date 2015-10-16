// Global graphic styles


function addWhiteRect(props, color_override)
 {
	color_override = color_override || 'white'

	props.fill = color_override;
	props.stroke = 'black';
	props.strokeWidth = 2;
	props.cornerRadius = 10;
	return new Kinetic.Rect(props);
}




function kineticTween(props){
// Kinetic.prototype.Tween = function(props){
	props.easing = Kinetic.Easings.EaseIn;
	props.duration = 0.8
	return new Kinetic.Tween(props);
}



function addInvisibleOrangeBox(pos, radius)
{
	var border_offs = 3,
		radius = radius || nodeSize;

	return new Kinetic.Rect({
		x: pos.x - radius - border_offs,
		y: pos.y - radius - border_offs,
		width: (radius *2) + 2*border_offs,
		height: (radius * 2) + 2*border_offs,
		strokeAlpha: 0.5,
		strokeWidth: 3,
		strokeEnabled: false,
		stroke: 'orange'
	});
}


function addButton(message, xp, yp, callback, show_state)
{
	var group = new Kinetic.Group({x: xp, y: yp});

	var rec = new Kinetic.Rect({
		x: 0, y: 0,
		width: butt_w,
		height: butt_h,
		fill: 'grey',
		stroke: 'black',
		strokeWidth: 2,
		cornerRadius : 6
	});

	var tex = new Kinetic.Text({
		x: 6, y: butt_h/4,
		text: message,
		fontSize: 10,
		fill: 'white'
	});

	group.add(rec);
	group.add(tex);


	if (show_state){
		var diam=8, buff=4;

		var status = new Kinetic.Rect({
			x: butt_w - diam,
			y: buff,
			width: diam - buff,
			height: diam - buff,
			fill: 'red'
		})
		group.add(status);
		
		var butt_state = true;

		group.on('click', function(){
			status.setFill( butt_state?'green':'red' );
			butt_state = !butt_state;
		});
	}


	group.on('click', callback);

	return group;
}

function addExitButton(center, callback, cross_diam)
{
	cross_diam = cross_diam || 20;
	var cross_rad = cross_diam/2;

	var rect = new Kinetic.Rect({
		x: -cross_rad,
		y: -cross_rad,
		width: cross_diam,
		height: cross_diam,
		fill: 'grey',
		stroke: 'black',
		strokeWidth: 1.5,
		cornerRadius: 3
	});

	var crossUp = new Kinetic.Line({
		stroke: 'white',
		strokeWidth: 1
	});

	var crossDown = new Kinetic.Line({
		stroke: 'white',
		strokeWidth: 1
	});

	var cross_buff = cross_rad - 5;

	crossUp.setPoints([-cross_buff,-cross_buff,
						cross_buff, cross_buff]);

	crossDown.setPoints([-cross_buff, cross_buff,
						  cross_buff,-cross_buff]);

	var group = new Kinetic.Group({
		x: center.x,
		y: center.y
		// hitFunc: function(context){
		// 	var points = [{x:-cross_diam, y:-cross_diam},
		// 				  {x: cross_diam, y: cross_diam}];
		// 	var bound = 20;

		// 	context.beginPath();
		// 	context.moveTo(points[0].x - bound, points[0].y - bound);
		// 	context.lineTo(points[1].x + bound, points[0].y - bound);
		// 	context.lineTo(points[1].x + bound, points[1].y + bound);
		// 	context.lineTo(points[0].x - bound, points[1].y + bound);
		// 	context.closePath()

		// 	context.fillStrokeShape(this);
		// }
	});

	group.on('click', callback);

	group.add( rect );
	group.add( crossUp );
	group.add( crossDown );

	return group;
}
