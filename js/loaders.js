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
var star10 = ok => star(ok, 10);
var star100 = ok => star(ok, 100);
var star1000 = ok => star(ok, 1000);
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
function path10(ok) { return path(ok, 10); }
function path100(ok) { return path(ok, 100); }
function path1000(ok) { return path(ok, 1000); }
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
