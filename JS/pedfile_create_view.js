

function initiatePedigreeDraw(){

	document.getElementById("buttons").style.display = 'none'
	finishDraw(); // Initialize stage
}




initiatePedigreeDraw();
//familyDraw.addFam(1001)
//personDraw.addNode();
//personDraw.addNode({id:90,gender:1,affected:1});

familyDraw.addFam(1002, {x:200, y:100});

personDraw.addNode(
	new Person(12,2,2,0,0),
	{x:0, y:50}
);

personDraw.addNode(
	new Person(11,1,1,0,0),
	{x:180, y:50}
);

personDraw.addNode(
	new Person(13,1,2,0,0),
	{x:0, y:200}
);

personDraw.addNode(
	new Person(14,2,1,0,0),
	{x:180, y:200}
);


var mat = new MatelineDraw(1002,12,11);

var c = new OffspringDraw(1002,mat.matelineID,14);
delete c;
c = new OffspringDraw(1002,mat.matelineID,13);


//relationshipDraw.firstPoint();