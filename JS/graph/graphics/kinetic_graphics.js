// ------------ Kinetic globals ------------
var stage = new Kinetic.Stage({
	container:'container',
	width: window.innerWidth,
	height: window.innerHeight
});

var node_layer = new Kinetic.Layer(),
	line_layer = new Kinetic.Layer(); //Below node_layer


// ------------ Kinetic Tools --------------
function addSquare([c_x,c_y], color)
{
	return new Kinetic.Rect({
		x: - nodeSize,
		y: - nodeSize,
		width: nodeSize *2,
		height: nodeSize * 2,
		fill: color,
		strokeWidth: 2,
		stroke: default_stroke_color
	});
}


function addCircle([c_x,c_y], color)
{
	return new Kinetic.Circle({
		x: c_x, y: c_y, radius: nodeSize,
		fill: color, strokeWidth: 2,
		stroke: default_stroke_color
	})
}


function addDiamond([c_x,c_y], color){
	alert("fix lucy");
}


function addRLine([s_x, s_y], [e_x, e_y]){
	line_layer.add(
		new Kinetic.Line({
			points: [s_x, s_y, e_x, s_y, e_x, e_y],
			stroke: 'black',
			strokeWidth: 2
		})
	);
}



//function addPerson(coords, id, gender, aff)
function addPerson(person, t_x, t_y)
{
	var rez = 0,
		gender = person.gender,
		id = person.id;

	function addMale  () {  rez = addSquare ([0,0], col_affs[aff])   }
	function addFemale() {  rez = addCircle ([0,0], col_affs[aff])   }
	function addAmbig () {  rez = addDiamond([0,0], col_affs[aff])   }

	switch(gender){
		case 0: addAmbig(); break;
		case 1: addMale(); break;
		case 2: addFemale(); break;
		default:
			assert(false, "No gender for index "+gender);
	}
	//Add Text
	var tex = new Kinetic.Text({
		x: - (""+id+"").length*3,
		y: nodeSize + 8,
		text: id,
		fontSize: 'Calibri', //change to global setting
		fill: default_stroke_color
	});

	var group = new Kinetic.Group({
		x: t_x, y: t_y,
		draggable: true
	});
	group.person = person;

	group.add(rez);
	group.add(tex);

	//On drag do
	group.on('dragmove', function(e){
		//Snap-to-grid
// 		var x = e.target.attrs.x, y = e.target.attrs.y;
// 		group.setX( Math.floor(x/grid_rez)*grid_rez );
// 		group.setY( Math.floor(y/grid_rez)*grid_rez );

		redrawSpecifics(id, true);
	});

	group.on('dragend', function(){
		redrawSpecifics(id);
	});


	node_layer.add(group);
}



function finishDraw(){
	stage.add(line_layer);
	stage.add(node_layer);
}
