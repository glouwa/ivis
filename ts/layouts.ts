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

function layoutSpiral(root) {
    var flatNodes = flat(root)
    var nrN = flatNodes.length
    var nrRounds = Math.floor(nrN/24)
    for (var i=0; i<nrN; i++) {
        a = i/nrN * 2*Math.PI * (nrRounds+1)
        r = Math.pow(2, i/nrN)-1
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
    dfs(root, n=> {

        // n.wedge = { p, m, a } // p=n.z?

        // var d = S. 47
        // n.z = { re:0.4, im:0.3 } // das z aus m paper. z strich wird erst von der transformation berechnet


        n.x=0; // n.x n.y wird derzeit zum zeichnen verwendet. kannst aber auch ändern
        n.y=0  // in der transformationsfunktion HyperboicTree argument 't'
    })
    return root
}
