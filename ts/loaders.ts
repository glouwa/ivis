function oneNode(ok) {
    ok(d3.hierarchy({
        id:'root',
        parent:null,
        children:[],
        data:{},
        depth:0,
    }))
}

function star(ok, max) {
    oneNode(d=> {
        d.children = []
        for (var i=0; i<max; i++)
            d.children.push({ parent:d, children:[] })
        ok(d3.hierarchy(d))
    })
}

function path(ok, max) {
    oneNode(d=> {
        d.children = []
        var cur = d
        for (var i=0; i<max; i++) {
            var newN = { parent:d, children:[] }
            cur.children.push(newN)
            cur = newN
        }
        ok(d3.hierarchy(d))
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
    ok(d3.hierarchy(JSON.parse(jsonStr)))
}

var star1 = ok=> star(ok, 50)
var star2 = ok=> star(ok, 500)
var star3 = ok=> star(ok, 5000)
var path1 = ok=> path(ok, 50)
var path2 = ok=> path(ok, 500)
var path3 = ok=> path(ok, 5000)
var d3csvFlare = ok=> d3csv(ok, "flare.csv")
var jsonConst = ok=> json(ok, "{}")
