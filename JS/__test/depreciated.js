
// From graphics/global_styles.js

/*
// Button
var butt_w = 90,
	butt_h = 20;
	
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
*/


//Hit func rectangle for addExitButton

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
