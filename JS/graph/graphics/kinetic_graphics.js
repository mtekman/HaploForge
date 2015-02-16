// ------------ Kinetic globals ------------
var stage = new Kinetic.Stage({
  container:'container',
  width: window.innerWidth,
  height: window.innerHeight
});

var node_layer = new Kinetic.Layer();


// ------------ Kinetic Tools --------------
function addSquare([c_x,c_y], color)
{
  return new Kinetic.Rect({
      x: c_x - nodeSize,
      y: c_y - nodeSize,
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
  node_layer.add(
    new Kinetic.Line({
      points: [s_x, s_y, e_x, s_y, e_x, e_y],
      stroke: 'black',
      strokeWidth: 2
    })
  );
}



function addPerson(coords, id, gender, aff)
{
    var rez = 0;

    function addMale  () {  rez = addSquare (coords, col_affs[aff])   }
    function addFemale() {  rez = addCircle (coords, col_affs[aff])   }
    function addAmbig () {  rez = addDiamond(coords, col_affs[aff])   }

    switch(gender){
            case 0: addAmbig(); break;
            case 1: addMale(); break;
            case 2: addFemale(); break;
            default:
                assert(false, "No gender for index "+gender);
    }
    //Add Text
    var tex = new Kinetic.Text({
      x: coords[0] - (""+id+"").length*3,
      y: coords[1] + nodeSize + 8,
      text: id,
      fontSize: 'Calibri', //change to global setting
      fill: default_stroke_color
    });

    var group = new Kinetic.Group({draggable: true});
    group.add(rez);
    group.add(tex);

    //On drag do
//    group.on('dragend', redrawLines);
    node_layer.add(group);
}


function redrawLines(){


}

function finishDraw(){  stage.add(node_layer); }
