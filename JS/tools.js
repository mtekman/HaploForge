function toInt(arg){                                // For some reason parseInt wont work properly 
    return parseInt(arg);                           // as a lambda function arg.... wtf?
}

function assert(bool, message){                     //General error handling
    if (!bool) throw new Error(message);
}


// JS simply wont allow this, need to just start using callbacks...
//// Asynchronous handlers
//var data_ready = {};                                // Map of bools, with the key
//                                                    // being name of the variable being waited on
//
//var waitFinished = function wait(key){                   // Function to handle asynchronous read methods
//    if (!(key in data_ready)) 
//        data_ready[key] = false;
//
//    if (data_ready[key] == true) return;
//
//    setTimeout(waitFinished(key), 1000);
//}

// ------------ Canvas Tools --------------
function drawSquare(c_x,c_y, color){    
    ctx.beginPath();
    ctx.rect(c_x-nodeSize,c_y-nodeSize,nodeSize*2,nodeSize*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawCircle(c_x,c_y, color){    
    ctx.beginPath();
    ctx.arc(c_x,c_y, nodeSize,0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawDiamond(c_x,c_y, color){
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

function drawLine(s_x, s_y, e_x, e_y){
    ctx.beginPath();
    ctx.moveTo(s_x,s_y); ctx.lineTo(e_x,e_y);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
}
    
    


function drawPerson(c_x,c_y, id, gender, aff)
{
    function drawMale  () {  drawSquare (c_x,c_y, col_affs[aff])   }
    function drawFemale() {  drawCircle (c_x,c_y, col_affs[aff])   }
    function drawAmbig () {  drawDiamond(c_x,c_y, col_affs[aff])   }
    
    switch(gender){
            case 0: drawAmbig(); break;
            case 1: drawMale(); break;
            case 2: drawFemale(); break;
            default:
                assert(false, "No gender for index "+gender);
    }
    
    //Add Text
    ctx.fillStyle = "black";
    ctx.fillText(id, c_x - nodeSize/2, c_y - nodeSize - 1);   
}
