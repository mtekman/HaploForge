/*Drawing a pedigree - trickier than you'd think, simple draw rec messes up lines

Steps:
   1. Make a grid
   2. Recurse nodes
      - toplevel nodes are downshifted by existence of parents
      - place under a male-then-female order.
        - for extra mates, that is [male,female,female,...] or [male,male,...,female]
   3. Render nodes top-down from grid under parental placement
   4. Populate unique edges and render after
  - Allowed edges: [0]parent-mate, [1] parent-to-parentline, [2] child-to-parentline
  - Struct: { 0: horiz line
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

//Seen by graph_draw.js
var unique_graph_objs = {},
    generation_grid_ids = [];


var NodePerson = function (pers, mateline, childline) {
    this.person = pers;
    
    this.center_pos = [0, 0];
    
    this.mateline_id  = mateline;  //Node to mateline, -1 for child with no offspring
    this.childline_id = childline;
};


var Edge = function (id, from, to, type) {
    this.start_pos = [0, 0];
    this.end_pos = [0, 0];

                                      // ids are arrays, average from all
    this.start_join_id = from;       // where it starts joining from [node or edge]
    this.end_join_id = to;          // -1 = not set
    
    this.type = type; // 0 - mateline, 1 - parentline, 2 - childline
    this.id = id; //Pair ID
};


// Methods
function pairID(id1, id2) { return id1 + id2; }

/*  Node <--> mateline
              mateline <-- parentline
                           parentline <-- childline []
                                          childline  --> Node
*/
function addTrioEdges(moth, fath, child) {
    //= Assume all indivs are != 0
    
    var u_matesline = pairID(moth.id, fath.id),
        u_parntline = pairID(moth.id + fath.id, child.id),
        u_childline = pairID(u_parntline, child.id);
    
    //= Edges
    var matesline, parntline, childline;
    
    if (!(u_matesline in unique_graph_objs)) {
        matesline = new Edge(u_matesline, moth.id, fath.id, 0);
        unique_graph_objs[u_matesline] = matesline;
    }
    
    if (!(u_childline in unique_graph_objs)) {
        childline = new Edge(u_childline, u_parntline, child.id, 2);
        unique_graph_objs[u_childline] = childline;
    }

    if (!(u_parntline in unique_graph_objs)) {
        parntline = new Edge(u_parntline, matesline, -1, 1); // Any parent line from a matesline will
        unique_graph_objs[u_parntline] = parntline;          // immediately hang from it
    }                                                        // child.ids are not given, since a NodePerson
                                                             // will point to it.
                                                             // The Draw function is NOT recursive, remember.
    //= Nodes
    unique_graph_objs[moth.id]  = new NodePerson(moth, parntline, -1);
    unique_graph_objs[fath.id]  = new NodePerson(fath, parntline, -1);
    unique_graph_objs[child.id] = new NodePerson(child,-1, childline);    
}

function populateGenerationGrid() {
    var generation_gridmap_ids = {}; // Essentially an array, but indices are given

    // Recur.
    function addNodeArray(obj_pers, level){
        if (obj_pers.id in unique_graph_objs) return;

        // Add current
        unique_graph_objs[obj_pers.id] = 1; // temp place holder
        
        if (!(level in generation_gridmap_ids)) 
            generation_gridmap_ids[level] = [];
        
        generation_gridmap_ids[level].push(obj_pers.id);

        //Parents
        if (obj_pers.mother != 0) addNodeArray(obj_pers.mother, level - 1);
        if (obj_pers.father != 0) addNodeArray(obj_pers.father, level - 1);
        
        if (obj_pers.mother != 0 && obj_pers.father != 0)
            addTrioEdges(obj_pers.mother, obj_pers.father, obj_pers);   //Add relevant edges

        for (var c=0; c < obj_pers.children.length; c++)                //Childs
            addNodeArray(obj_pers.children[c], level +1);

        for (var m=0; m < obj_pers.mates.length; m++)                   //Mates
            addNodeArray(obj_pers.mates[m], level);

        return;
    }

    //First root indiv
    var root = function(){for (var one in family_map) for (var two in family_map[one]) return family_map[one][two];}
    //Populate gridmap
    addNodeArray(root(), 0);
    
    //Convert gridmap into gridarray
    var keys = [];    
    for (var k in generation_gridmap_ids) keys.push(parseInt(k)); keys.sort();
    for (var k=0; k < keys.length; k++)
        generation_grid_ids.push(generation_gridmap_ids[keys[k]]);
}
