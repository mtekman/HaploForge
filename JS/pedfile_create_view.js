

function initiatePedigreeDraw(){

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
	new Person(13,1,2),
	{x:0, y:200}
);

personDraw.addNode(
	new Person(14,2,1),
	{x:180, y:200}
);

personDraw.addNode(
	new Person(3,1,1),
	{x:90, y:200}
);

personDraw.addNode(
	new Person(18,2,1,0,0, "Ton"),
	{x:120, y:200}
);

personDraw.addNode(
	new Person(20,2,1,0,0, "Jenn"),
	{x:105, y:250}
);



var mat1 = new MatelineDraw(1002,12,11),
	mat2 = new MatelineDraw(1002,18,3);

var c;
c = new OffspringDraw(1002,mat1.matelineID,14); delete c;
c = new OffspringDraw(1002,mat1.matelineID,13); delete c;
c = new OffspringDraw(1002,mat1.matelineID,3 ); delete c;
c = new OffspringDraw(1002,mat2.matelineID,20); delete c;

delete mat1;
delete mat2;


*/