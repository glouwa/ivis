function oneNode(ok) {
    ok(d3.hierarchy({
        parent: null,
        children: [],
        data: {},
        depth: 0,
        id: 'root',
    }));
}
function star(ok, max) {
    oneNode(d => {
        d.children = [];
        for (var i = 0; i < max; i++)
            d.children.push({ parent: d, children: [] });
        ok(d3.hierarchy(d));
    });
}
function path(ok, max) {
    oneNode(d => {
        d.children = [];
        var cur = d;
        for (var i = 0; i < max; i++) {
            var newN = { parent: d, children: [] };
            cur.children.push(newN);
            cur = newN;
        }
        ok(d3.hierarchy(d));
    });
}
var star1 = ok => star(ok, 50);
var star2 = ok => star(ok, 500);
var star3 = ok => star(ok, 5000);
var path1 = ok => path(ok, 50);
var path2 = ok => path(ok, 500);
var path3 = ok => path(ok, 5000);
function d3csv(ok) {
    d3.csv("flare.csv", function (error, data) {
        if (error)
            throw error;
        ok(d3.stratify().parentId(d => d.id.substring(0, d.id.lastIndexOf(".")))(data));
    });
}
function json(ok) {
    ok(d3.hierarchy(JSON.parse("{}")));
}
