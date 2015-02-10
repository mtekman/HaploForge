
var marker_map = {} // rsID --> index in Person.data array
var pedigree = [];

var Person = function(id, gender, affected, mother, father){
	this.id = id;
	this.gender = gender;	// 1 - male, 2-female, 0-unknown
	this.affected = affected ; 	// 0,1,2

	this.mother = mother; this.father = father;
	this.haplo_data = []; 	//Array of alleles, each allele an array of nodes
};

var Node = function(allele){
	this.value = allele;
	this.parent = 0;	// 1 = father, 2 = mother, 0 = ambiguous
	this.colorgroup="";
}


//var groupNodes = function(){
//	"Looks for the longest common substring of an allele, recursively searching up from offspring to founder"
//}
