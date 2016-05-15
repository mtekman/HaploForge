

function initiatePedigreeDraw(){

	document.getElementById("buttons").style.display = 'none'
	finishDraw(); // Initialize stage
}




initiatePedigreeDraw();
//familyDraw.addFam(1001)
//personDraw.addNode();
//personDraw.addNode({id:90,gender:1,affected:1});

familyDraw.addFam(1002, {x:500, y:100});

var newp1 = new Person(12,2,2,0,0),
	newp2 = new Person(11,1,1,0,0),
	newp3 = new Person(13,1,2,0,0);

personDraw.addNode(
	newp1,
	{x:0, y:50}
);

personDraw.addNode(
	newp2,
	{x:180, y:50}
);

personDraw.addNode(
	newp3,
	{x:90, y:200}
);



//relationshipDraw.firstPoint();