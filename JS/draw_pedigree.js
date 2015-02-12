
var unique_graph_people = [];
var unique_edges = {};

var grid

var GraphPerson = function(pers){
    this.center_pos = [0,0];
//    this.person = pers; // technically all we need is id's of self, mother, and father
//                        // but why duplicate data when we can just point to it?
    this.id = pers.id;
    this.mother_id = pers.mother.id;
    this.father_id = pers.father.id;
    
    this.parentline_id = -1; // The edge that extends down
}


function pairID(id1,id2){ return 1000 + id1 + id2; }

var Edge = function(id, from, to, type){
    this.start_pos = [0,0]
    this.end_pos = [0,0]    

    // ids are arrays, average from all
    this.start_join_id = from;      // where it starts joining from [node or edge]
    this.end_join_id = to;          // -1 = not set
    
    this.type = 0; // 0 is parentline, 1 is childline, 2 is noline(?)    
    this.id = id; //Pair ID
}


function addTrioEdges (moth, fath, chil) {
    var u_matesline = pairID(moth.id, fath.id),
        u_parntline = pairID(moth.id + fath.id, chil.id),
        u_childline = pairID(u_parntline, child.id);
    
    var matesline, parntline, childline;

    if (!(u_matesline in unique_edges)){
        matesline = new Edge(u_matesline, moth.id, fath.id, 2);
        unique_edges[u_matesline] = matesline;
    }
    
    if (!(u_parntline in unique_edges)){
        parntline = new Edge(u_parntline, [moth.id, fath.id], -1, 0);
        unique_edges[u_parntline] = parntline;
    }
    
    if (!(u_childline in unique_edges)){
        childline = new Edge(u_childline, u_parntline, child.id, 1);
        unique_edges[u_childline] = childline;
    }
}



/*Drawing a pedigree - trickier than you'd think, simple draw rec messes up lines

Steps:
   1. Make a grid
   2. Recurse nodes
      - toplevel nodes are downshifted by existence of parents
      - place under a male-then-female order.
        - for extra mates, that is [male,female,female,...] or [male,male,...,female]
   3. Render nodes top-down fom grid under parental placement
   4. Populate unique edges and render after
  - Allowed edges: [0]parent-mate, [1] parent-to-parentline, [2] child-to-parentline
  - Struct: { 0: horiz line,
              1: parent_line: 
                      connector from center of PAR_i and PAR_j extending down vert line
                      initiated from parent on parent.children.length > 0,
              2: child_conn :
                      connector from child to parent_line}

Notes:
   * Main intersect problems are x-specific, no need to worry about generations
   * Minimal drawing graph is then peds + unique_edges, and we can use that graph
     for all future draws (moving, dragging, etc)

*/




        
        
//function buildSimpleGraph(start_x, start_y) {
//    // Pick a random room individual, and build from them
//    var root;
//    
//    for (var famid in family_map){
//        var broke = false;
//        for (var id in family_map[famid]){
//            root = family_map[famid][id];
//            if (root.father == 0 && root.mother ==0 ) { broke=true;break};
//        }
//        if(broke) break;
//    }
//    
//    var person_drawn = {}               // Holds person id of already drawn indivs
//    var connection_drawn = {}           // Holds per->per string of already drawn connections
//
//    
//    function testConnection(id1, id2){
//        var c1 = [id1,id2], c2 = [id2,id1];
//        
//        if (!((c1 in connection_drawn) || (c2 in connection_drawn))){
//                connection_drawn[c1] = connection_drawn[c2] = 1;
//                return true;
//        }
//        return false;
//    }    
//    
//    //Found our root
//    //    -- recursively draw
//    var draw = function nodeDraw(x,y,pers){
//        if (pers === 0) return;
//        
//        var id = pers.id,
//            gend = pers.gender,
//            affe = pers.affected;
//        
//        
//        if (!(pers.id in person_drawn)){
//            drawPerson(x,y, id, gend, affe);
//            person_drawn[pers.id]=1;
//            console.log("Drawing: "+ pers.id);
//        }
//        else return;
//        
//        //Mates
//        for (var m =0; m < pers.mates.length; m++){
//            var mate = pers.mates[m];   
//            var new_x = x + (horiz_space*(m+1));
//            
//            if (testConnection(pers.id, mate.id))
//                drawLine(x,y, new_x, y);
//            
//
//            nodeDraw(new_x,y, mate);
//        }
//        
//        //Children
//        var child_step_width = 2*(horiz_space/pers.children.length);
//        
//        for( var c=0; c< pers.children.length; c++){
//            var child = pers.children[c];
//            
//            if (child.
//            
//            var new_x = x - horiz_space                 //starting point
//                        + (c * child_step_width),
//                new_y = y + vert_space;
//            
//            if (testConnection(pers.id, child.id))
//                drawLine(x,y, new_x, new_y);
//            
//            nodeDraw(new_x, new_y, child);        
//        }
//        
//        //Parents
//        nodeDraw(x - horiz_space, y - vert_space, pers.father);
//        nodeDraw(x + horiz_space, y - vert_space, pers.mother);
//        
//        
//        return;
//    }
//    
//    draw(start_x, start_y, root);
//}