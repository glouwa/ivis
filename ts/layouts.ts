function layoutAtCenter(root) {
    dfs(root, n=> { n.x=0; n.y=0 })
    return root
}

function layoutUnitVectors(root) {
    var some = [{ x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x:-1, y: 0 },
                { x: 0, y:-1 }]
    var i=0
    dfs(root, n=> {
        n.x=some[i%some.length].x;
        n.y=some[i%some.length].y;
        i++
    })
    return root
}

function layoutDemo(root) {
    var flatNodes = flat(root)
    var nrDn = flatNodes.length
    for (var i=0; i<nrDn; i++) {
        a = i/nrDn * 2*Math.PI * 3
        r = i/nrDn * 0.3 + 0.3
        flatNodes[i].x = r*Math.cos(a)
        flatNodes[i].y = r*Math.sin(a)
    }
    return root
}

function layoutSpiral(root) {
    var flatNodes = flat(root)
    var nrDn = flatNodes.length
    var nrRounds = Math.floor(nrDn/24)
    for (var i=0; i<nrDn; i++) {
        a = i/nrDn * 2*Math.PI * nrRounds
        r = Math.pow(2, i/nrDn)-1
        flatNodes[i].x = r*Math.cos(a)
        flatNodes[i].y = r*Math.sin(a)
    }
    return root
}

function layoutRadial(root) {
    root = d3.tree().size([2 * Math.PI, 1])(root)
    dfs(root, n=> {
        var a = n.x - Math.PI/2
        n.x = n.y * Math.cos(a)
        n.y = n.y * Math.sin(a)
    })
    return root
}

function layoutHyperbolic(root) {
    dfs(root, n=> { n.x=0; n.y=0 })
    return root
}
