//----------------------------------------------------------------------------------------
//import { Tree } from "./tree";

namespace ivis.model.loaders {

    function oneNode(ok) {
        ok({
            parent:null,
            children:[],
            data:{}
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

    function star(ok, max) {
        oneNode(d=> {
            for (var i=0; i < max-1; i++)
                d.children.push({ parent:d, children:[] })
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

    function loadDataFromFile(ok, path : string){
        new model.Tree(ok, path);
    }

    export var path_ =        n=> ok=> path(ok, n)
    export var star_ =        n=> ok=> star(ok, n)
    export var d3csvFlare =   ok=> d3csv(ok, "data/flare.csv")
    export var fileXml =      ok => loadDataFromFile(ok, "data/sample.xml");
    export var fileSkos =      ok => loadDataFromFile(ok, "data/sample-skos.xml");
    export var fileJson =     ok => loadDataFromFile(ok, "data/sample.json");
    export var ToL =          ok => loadDataFromFile(ok, "data/carnivora-de.xml");
    export var userUploaded = ok => loadDataFromFile(ok, "data/user-uploaded.xml");

    export function nTreeAtFirst(ok, max=10) {        
        oneNode(d=> {
            var cur = d
            for (var i=0; i < max; i++) {
                for (var j=0; j<10; j++) {
                    var newN = { parent:d, children:[] }
                    cur.children.push(newN)
                }
                cur = newN
            }
            ok(d)
        })
    }

    export function nTree(ok, depth=3, childs=8) {
        oneNode(d=> {
            function processNode(parent, l)
            {
                if (l>=depth) return
                for (var i=0; i<childs; i++) {
                    var newN = { parent:parent, children:[] }
                    parent.children.push(newN)
                    processNode(newN, l+1)
                }
            }
            processNode(d, 0)
            ok(d)
        })
    }

    export function deepStar(ok, arms=4, depth=30) {
        oneNode(d=> {
            for (var i=0; i < arms; i++) {
                var l1 = { parent:d, children:[] }
                d.children.push(l1)
                var cur = l1
                for (var j=0; j < depth; j++) {
                    var newN = { parent:d, children:[] }
                    cur.children.push(newN)
                    cur = newN
                }
            }
            ok(d)
        })
    }

    /**
     * spaecial tactics loader for navDisks
     * generates a path containing nodes for each member of 'o'
     *
     * no new object created, o is extended by tree stuff.
     */
    export function obj2data(o)
    {
        var cur = null
        var root = null
        for (var name in o) {
            var newN = o[name]
            newN.name = name
            //newN.parent = cur
            newN.children = []

            if (cur)
                cur.children.push(newN)
            else
                root = newN
            cur = newN
        }
        return root
    }

    /**
     * creates node object for each namespace, and type
     */
    function type2data(o, name)
    {
        var root = { name:name, children:[] }
        for (var n in o)        
            root.children.push(type2data(o[n], n))

        return root
    }

    export function code(ok)
    {
        ok(type2data(ivis, 'ivis'))
    }    
}
