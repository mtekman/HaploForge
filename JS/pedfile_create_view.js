

function initiatePedigreeDraw(){

	console.log("ckced");

	document.getElementById("buttons").style.display = 'none'

	var d = document.getElementById('pedcreate_views');
	d.style.position = "absolute";
	d.style.zIndex = 122;
	d.style.display = "";
	
	finishDraw(); // Initialize stage
}



/*

initiatePedigreeDraw();
//familyDraw.addFam(1001)
//personDraw.addNode();
//personDraw.addNode({id:90,gender:1,affected:1});

familyDraw.addFam(1002, {x:200, y:100});

personDraw.addNode(
	new Person(12,2,2),
	{x:0, y:50}
);

personDraw.addNode(
	new Person(11,1,1),
	{x:180, y:50}
);

personDraw.addNode(
	new Person(23,1,2),
	{x:0, y:200}
);

/*personDraw.addNode(
	new Person(21,1,2),
	{x:100, y:200}
);

personDraw.addNode(
	new Person(22,2,2),
	{x:150, y:200}
);



personDraw.addNode(
	new Person(24,2,1,0,0),
	{x:120, y:200}
);

personDraw.addNode(
	new Person(32,2,2,0,0),
	{x:105, y:250}
);

personDraw.addNode(
	new Person(31,1,2,0,0),
	{x:105, y:250}
);



var mat1 = new MatelineDraw(1002,12,11),
	mat2 = new MatelineDraw(1002,24,23),
	mat3 = new MatelineDraw(1002,22,21);

var c;
c = new OffspringDraw(1002,mat1.matelineID,23); delete c;
c = new OffspringDraw(1002,mat1.matelineID,21); delete c;
c = new OffspringDraw(1002,mat2.matelineID,32); delete c;
c = new OffspringDraw(1002,mat3.matelineID,31); delete c;
delete mat1;
delete mat2;
delete mat3;

*/
