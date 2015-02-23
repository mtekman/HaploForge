
// This should not be optimized for graphics, this is for data processing only(!!)
//
var Person = function(id, gender, affected, mother, father){
	this.id = id;
	this.gender = gender;	         // 1 - male, 2-female, 0-unknown
	this.affected = affected ; 	     // 0,1,2

	this.mother = mother; this.father = father;
	this.haplo_data = [];  			// marker_index ---> {data:, hgroup:}

    this.mates = [];
    this.children = [] 				// added by connect method later
};

Person.prototype.isMate = function(pers2){
    for (var m=0; m < this.mates.length; m++)
        if (pers2.id == this.mates[m].id) return true;
    return false;
}

Person.prototype.isChild = function(pers2){
    for (var c=0; c < this.children.length; c++)
        if (pers2.id == this.children[c].id) return true;
    return false;
}

Person.prototype.isFounder = function(){
    return (this.mother === 0 && this.father === 0);
}



// Conjoined map, needed for pedigree but would recurse infinitely for graphics
//
function connectAllIndividuals()
{
    for(var famid in family_map){
        for(var id in family_map[famid])
        {
            var new_root = family_map[famid][id];      //Assign father and mother to actual people
            var pers_father = 0, pers_mother = 0;

            if (new_root.father != 0) {
                pers_father = family_map[famid][new_root.father];

                new_root.father = pers_father;         // Add father to child
                pers_father.children.push(new_root);   // And child to father
            }

            if (new_root.mother != 0){
                pers_mother = family_map[famid][new_root.mother];

                new_root.mother = pers_mother;         // Add mother to child
                pers_mother.children.push(new_root);   // And child to mother
            }

            if (pers_father != 0 )                     //Add parents as mates to each other
                if(pers_mother != 0) pers_father.mates.push(pers_mother);
                else pers_father.mates.push(0);

            if (pers_mother !=0 )
                if(pers_father != 0) pers_mother.mates.push(pers_father);
                else pers_mother.mates.push(0);
        }
    }
//    console.log(family_map);
}


//var groupNodes = function(){
//	"Looks for the longest common substring of an allele, recursively searching up from offspring to founder"
//}
