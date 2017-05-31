function oneNode(ok) {
    ok({
        children: null,
        data: {},
        depth: 0,
        id: 'root',
        parent: null
    });
}
var nrDn = 24;
function generated(ok) {
    oneNode(d => {
        d.children = [];
        for (var i = 0; i < 4 + nrDn; i++)
            d.children.push({ parent: d });
        ok(d);
    });
}
function d3csv(ok) {
    d3.csv("flare.csv", function (error, data) {
        if (error)
            throw error;
        ok(d3.stratify().parentId(d => d.id.substring(0, d.id.lastIndexOf(".")))(data));
    });
}
