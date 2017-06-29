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


/** This class exists purely as a class with a play() function that acts
    similar to Kinetic.Tween but acts instantaneously when played (for slow machines) **/

class CustomTweenClass
{
	constructor(props)
	{
		this.node = props.node;
		this.finishCallback = props.onFinish || null;


		for (var pr in props)
		{
			if (
				(pr === "node")
			 || (pr === "onFinish")
			 || (pr === "duration")
			){
				continue;
			}


			if (pr === "x"){
				this.node.setX(props[pr])
				continue;
			}
			if (pr === "y"){
				//console.log("setting", this.node.id, this.node.getY(), props.y)
				this.node.setY(props[pr])
				//console.log(" --> to ", this.node.getY())
				continue;
			}


			this.node.attrs[pr] = props[pr];

		}
	}

	play(){
		if (this.finishCallback !== null){
			var that = this;
			setTimeout(function(){
				that.finishCallback();
			}, that.duration * 1000 || 300);
		}
	}
}


function kineticTween(props)
{
	props.easing = props.easing || Kinetic.Easings.EaseIn;
	props.duration = props.duration || 0.8;

	if (userOpts.fancyGraphics){
		return new Kinetic.Tween(props);
	}

	return new CustomTweenClass(props);
}




function addExitButton(center, callback, color_level = 0)
{

	var colors = ['#555', '#777', '#aaa', '#ddd'];
	if (color_level >= colors.length){
		color_level = 0;
	}


	var cross_diam = 20;
	var cross_rad = cross_diam/2;

	var rect = new Kinetic.Rect({
		x: -cross_rad,
		y: -cross_rad,
		width: cross_diam,
		height: cross_diam,
		fill: colors[color_level],
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


	center.scale = center.scale || {x:1,y:1};

	var group = new Kinetic.Group({
		x: center.x / center.scale.x,
		y: center.y / center.scale.y,
		scale : { x: 1 / center.scale.x, y: 1 / center.scale.y }
	});

	group.on('click', callback);

	group.add( rect );
	group.add( crossUp );
	group.add( crossDown );

	return group;
}
