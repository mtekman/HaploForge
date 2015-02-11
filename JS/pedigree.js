
var Person = function(id, gender, affected, mother, father){
	this.id = id;
	this.gender = gender;	// 1 - male, 2-female, 0-unknown
	this.affected = affected ; 	// 0,1,2

	this.mother = mother; this.father = father;
	this.haplo_data = []; 	//Array of alleles, each allele an array of nodes
    
    this.mates = {}; this.children = {} //Added by connect method later
};

var AlleleNode = function(allele){
	this.value = allele;
	this.parent = 0;	// 1 = father, 2 = mother, 0 = ambiguous
	this.colorgroup="";
}


function connectAllIndividuals()
{
    //Massively connected map of peeps
    for(var famid in family_map){
        for(var id in family_map[famid])
        {
            var new_root = family_map[famid][id];               //Assign father and mother to actual people
            var pers_father = 0, pers_mother = 0;
            
            if (new_root.father != 0) {
                pers_father = family_map[famid][new_root.father];
                
                new_root.father = pers_father;                  // Add father to child
                pers_father.children[new_root.id] = new_root;   // And child to father
            }

            if (new_root.mother != 0){
                pers_mother = family_map[famid][new_root.mother];
                
                new_root.mother = pers_mother;                  // Add mother to child
                pers_mother.children[new_root.id] = new_root;   // And child to mother
            }
            
            if (pers_father != 0 )                              //Add parents as mates to each other
                if(pers_mother != 0) pers_father.mates[pers_mother.id] = pers_mother;
                else pers_father.mates[0] = 0;
            
            if (pers_mother !=0 )
                if(pers_father != 0) pers_mother.mates[pers_father.id] = pers_father;
                else pers_mother.mates[0] = 0;
        }
    }
//    console.log(family_map);
}


function buildSimpleGraph(start_x,start_y){
    // Pick a random room individual, and build from them
    var root;
    
    for(var famid in family_map){
        var broke = false;
        for (var id in family_map[famid]){
            root = family_map[famid][id];
            if (root.father != 0 && root.mother !=0 ) { broke=true;break};
        }
        if(broke) break;
    }
    
    var person_drawn = {}               // Holds person id of already drawn indivs
    var connection_drawn = {}           // Holds per->per string of already drawn connections

    
    function testConnection(id1, id2){
        var c1 = [id1,id2], c2 = [id2,id1];
        
        if (!((c1 in connection_drawn) || (c2 in connection_drawn))){
                connection_drawn[c1] = connection_drawn[c2] = 1;
                return true;
        }
        return false;
    }    
    
    //Found our root -- recursively draw
    var draw = function nodeDraw(x,y,pers){
        if (pers === 0) return;
        
        var gend = pers.gender,
            affe = pers.affected;
        
        if (!(pers.id in person_drawn)){
            drawPerson(x,y, gend, affe);
            person_drawn[pers.id]=1;
        }
        
        //Mates
        for (var m=0 ; m < pers.mates.length; m++){
            var mate = pers.mates[m];        
            var new_x = x + (horiz_space*(m+1));
            
            if (testConnection(pers.id, mate.id))
                drawLine(x,y, new_x, y);
            
            nodeDraw(new_x,y, mate);
        }
        
        //Children
        var child_space = horiz_space + nodeSize,
            child_stepx = Math.floor(child_space/pers.children.length);
        
        for( var c=0; c< pers.children.length; c++){
            var child = pers.children[c];
            
            var new_x = Math.floor(nodeSize/2 + (child_stepx * c)),
                new_y = y + vert_space;
            
            if (testConnection(pers.id, child.id))
                drawLine(x,y, new_x, new_y);
            
            nodeDraw(new_x, new_y, child);        
        }
        return;
    }
    
    draw(start_x, start_y, root);
}



//var groupNodes = function(){
//	"Looks for the longest common substring of an allele, recursively searching up from offspring to founder"
//}
