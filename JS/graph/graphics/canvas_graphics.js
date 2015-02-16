// ----------- Canvas globals -------------
var cnv = document.getElementById("canvy");
cnv.width = window.innerWidth;
cnv.height= window.innerHeight;

var ctx = cnv.getContext("2d");
ctx.strokeStyle = default_stroke_color;
ctx.font = default_font;


// ------------ Canvas Tools --------------
function drawSquare([c_x,c_y], color)
{
    ctx.beginPath();
    ctx.rect(c_x-nodeSize,c_y-nodeSize,nodeSize*2,nodeSize*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawCircle([c_x,c_y], color)
{
    ctx.beginPath();
    ctx.arc(c_x,c_y, nodeSize,0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawDiamond([c_x,c_y], color)
{
    ctx.beginPath();
    ctx.moveTo(c_x - nodeSize, c_y);
    ctx.lineTo(c_x, c_y - nodeSize);
    ctx.lineTo(c_x + nodeSize, c_y);
    ctx.lineTo(c_x, c_y + nodeSize);
    ctx.lineTo(c_x - nodeSize, c_y);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawRLine([s_x, s_y], [e_x, e_y])
{
    ctx.beginPath();
    ctx.moveTo(s_x,s_y);
    ctx.lineTo(e_x,s_y);
    ctx.lineTo(e_x,e_y);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
}



function drawPerson(coords, id, gender, aff)
{
    function drawMale  () {  drawSquare (coords, col_affs[aff])   }
    function drawFemale() {  drawCircle (coords, col_affs[aff])   }
    function drawAmbig () {  drawDiamond(coords, col_affs[aff])   }

    switch(gender){
            case 0: drawAmbig(); break;
            case 1: drawMale(); break;
            case 2: drawFemale(); break;
            default:
                assert(false, "No gender for index "+gender);
    }
    //Add Text
    ctx.fillStyle = "black";
    ctx.fillText(id, coords[0] - nodeSize/2, coords[1] - nodeSize - 1);

}

function finishDraw(){ /**/ }
