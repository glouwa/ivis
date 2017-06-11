//----------------------------------------------------------------------------------------
//import { Tree } from "./tree";
/**
 * spaecial tactics loader for navDisks
 * generates a path containing nodes for each member of 'o'
 */
function obj2data(o, unitConv)
{
    var cur = null
    var root = null
    for (var name in o) {
        var newN = o[name]
        newN.name = name
        //newN.parent = cur
        newN.children = []
        newN.x = unitConv(newN).x
        newN.y = unitConv(newN).y

        if (cur)
            cur.children.push(newN)
        else
            root = newN
        cur = newN
    }
    return root
}

//----------------------------------------------------------------------------------------

function oneNode(ok) {
    ok({
        parent:null,
        children:[],
        data:{}
    })
}

function star(ok, max) {
    oneNode(d=> {        
        for (var i=0; i < max-1; i++)
            d.children.push({ parent:d, children:[] })
        ok(d)
    })
}

function deepStar(ok, arms=4, depth=30) {
    oneNode(d=> {
        for (var i=0; i < arms; i++) {
            var l1 = { parent:d, children:[] }
            d.children.push(l1)
            var cur = l1
            for (var j=0; j<depth; j++) {
                var newN = { parent:d, children:[] }
                cur.children.push(newN)
                cur = newN
            }
        }
        ok(d)
    })
}

function path(ok, max) {
    oneNode(d=> {        
        var cur = d
        for (var i=0; i < max; i++) {
            var newN = { parent:d, children:[] }
            cur.children.push(newN)
            cur = newN
        }
        ok(d)
    })
}

function nTreeAtFirst(ok, max=10) {
    oneNode(d=> {        
        var cur = d
        for (var i=0; i<max; i++) {
            for (var j=0; j<10; j++) {
                var newN = { parent:d, children:[] }
                cur.children.push(newN)
            }
            cur = newN
        }
        ok(d)
    })
}

function nTree(ok, depth=7, childs=2) {
    oneNode(d=> {        
        function processNode(parent, l)
        {
            if (l>=depth) return
            for (var i=0; i<childs; i++) {
                var newN = { name:l+'-'+i, parent:parent, children:[] }
                parent.children.push(newN)
                processNode(newN, l+1)
            }
        }
        processNode(d, 0)
        ok(d)
    })
}

function d3csv(ok, file) {
    d3.csv(file, function(error, data) {
        if (error)
            throw error;
        ok(d3.stratify().parentId((d:N)=> d.id.substring(0, d.id.lastIndexOf(".")))(data))
    });
}

function json(ok, jsonStr) {
    ok(JSON.parse(jsonStr))
}

function loadJsonFile(path : string) : TreeNode[] {
    console.log('loadJsonFile');
    let tree = new Tree(path);

    return tree.getTree();
}

var star1 = ok=> star(ok, 5)
var star2 = ok=> star(ok, 50)
var star3 = ok=> star(ok, 500)
var path1 = ok=> path(ok, 50)
var path2 = ok=> path(ok, 500)
var path3 = ok=> path(ok, 5000)
var d3csvFlare = ok=> d3csv(ok, "flare.csv")
var jsonConst = ok=> json(ok, "{}");
const jsonFilePath="app/input/basicTree.json"; //TODO: get user selected path here
let jsonFile = loadJsonFile(jsonFilePath);
