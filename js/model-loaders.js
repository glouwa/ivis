//----------------------------------------------------------------------------------------
//import { Tree } from "./tree";
var ivis;
(function (ivis) {
    var loaders;
    (function (loaders) {
        function path(ok, max) {
            oneNode(d => {
                var cur = d;
                for (var i = 0; i < max; i++) {
                    var newN = { parent: d, children: [] };
                    cur.children.push(newN);
                    cur = newN;
                }
                ok(d);
            });
        }
        function star(ok, max) {
            oneNode(d => {
                for (var i = 0; i < max - 1; i++)
                    d.children.push({ parent: d, children: [] });
                ok(d);
            });
        }
        function d3csv(ok, file) {
            d3.csv(file, function (error, data) {
                if (error)
                    throw error;
                ok(d3.stratify().parentId((d) => d.id.substring(0, d.id.lastIndexOf(".")))(data));
            });
        }
        function json(ok, jsonStr) {
            ok(JSON.parse(jsonStr));
        }
        loaders.star1 = ok => star(ok, 5);
        loaders.star2 = ok => star(ok, 50);
        loaders.star3 = ok => star(ok, 500);
        loaders.path1 = ok => path(ok, 50);
        loaders.path2 = ok => path(ok, 500);
        loaders.path3 = ok => path(ok, 5000);
        loaders.d3csvFlare = ok => d3csv(ok, "flare.csv");
        loaders.jsonConst = ok => json(ok, "{}");
        const jsonFilePath = ""; //TODO: get user selected path here - then uncomment next line
        //let jsonFile = new Tree(jsonFilePath);
        function nTreeAtFirst(ok, max = 10) {
            oneNode(d => {
                var cur = d;
                for (var i = 0; i < max; i++) {
                    for (var j = 0; j < 10; j++) {
                        var newN = { parent: d, children: [] };
                        cur.children.push(newN);
                    }
                    cur = newN;
                }
                ok(d);
            });
        }
        loaders.nTreeAtFirst = nTreeAtFirst;
        function nTree(ok, depth = 8, childs = 2) {
            oneNode(d => {
                function processNode(parent, l) {
                    if (l >= depth)
                        return;
                    for (var i = 0; i < childs; i++) {
                        var newN = { parent: parent, children: [] };
                        parent.children.push(newN);
                        processNode(newN, l + 1);
                    }
                }
                processNode(d, 0);
                ok(d);
            });
        }
        loaders.nTree = nTree;
        function deepStar(ok, arms = 4, depth = 30) {
            oneNode(d => {
                for (var i = 0; i < arms; i++) {
                    var l1 = { parent: d, children: [] };
                    d.children.push(l1);
                    var cur = l1;
                    for (var j = 0; j < depth; j++) {
                        var newN = { parent: d, children: [] };
                        cur.children.push(newN);
                        cur = newN;
                    }
                }
                ok(d);
            });
        }
        loaders.deepStar = deepStar;
        /**
         * spaecial tactics loader for navDisks
         * generates a path containing nodes for each member of 'o'
         *
         * no new object created, o is extended by tree stuff.
         */
        function obj2data(o) {
            var cur = null;
            var root = null;
            for (var name in o) {
                var newN = o[name];
                newN.name = name;
                //newN.parent = cur
                newN.children = [];
                if (cur)
                    cur.children.push(newN);
                else
                    root = newN;
                cur = newN;
            }
            return root;
        }
        loaders.obj2data = obj2data;
        /**
         * creates node object for each namespace, and type
         */
        function type2data(o, name) {
            var root = { name: name, children: [] };
            for (var n in o)
                root.children.push(type2data(o[n], n));
            return root;
        }
        function code(ok) {
            ok(type2data(ivis, 'ivis'));
        }
        loaders.code = code;
        //----------------------------------------------------------------------------------------
        function oneNode(ok) {
            ok({
                parent: null,
                children: [],
                data: {}
            });
        }
        loaders.oneNode = oneNode;
    })(loaders = ivis.loaders || (ivis.loaders = {}));
})(ivis || (ivis = {}));
