
var marker_map = {} // rsID --> index in Person.data array
var pedigree = [];

var Person = function(id, male, affected){
	this.id = id;
	this.male = male; ;		// True false
	this.affected = affected ; 	// 0,1,2

	this.mother = 0; this.father = 0;
	this.data = []; 		//Array of nodes
};

var Node = function(allele){
	this.value = allele;
	this.parent = 0;	// 1 = father, 2 = mother, 0 = ambiguous
	this.colorgroup="";
}


var processFile = function(file){
	"Reads the haplofile, maps the markers to array indices, and populates pedigree array with persons"
	this.processHeaders(){;};
	this.processIndividuals(){;};
};


var groupNodes = function(){
	"Looks for the longest common substring of an allele, recursively searching up from offspring to founder"
}
