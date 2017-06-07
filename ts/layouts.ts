function layoutAtCenter(root) {
    dfs(root, n=> n.z = { re:0, im:0 })
    return root
}

var unitVectors = [{ re:1, im:0 }, { re:0, im:1 }, { re:-1, im:0 }, { re:0, im:-1 }]
function layoutUnitVectors(root) {
    var some = [{ re:0, im:0 }].concat(unitVectors)
    var i=0
    dfs(root, n=> {
        n.z = { re:some[i%some.length].re, im:some[i%some.length].im }
        i++
    })
    return root
}

function layoutUnitLines(root) {
    root.z = { re:0, im:0 }
    for (var i=0; i<4; i++)
        layoutPath(root.children[i], unitVectors[i], root.children[i].height)

    function layoutPath(pathBegin, target, depth=30)
    {
        var i = 0
        var pa = 1/depth
        var rt = r=> pa + r * (1-pa)
        dfs(pathBegin, n=> {
            var r = i/depth
            n.z = { re:rt(r) * target.re, im:rt(r) * target.im }
            i++
        })
    }
    return root
}

function layoutSpiral(root) {
    var flatNodes = dfsFlat(root)
    var nrN = flatNodes.length
    var nrRounds = Math.floor(nrN/24)
    for (var i=0; i < nrN; i++) {
        var a = i/nrN * 2*Math.PI * (nrRounds+1)
        var r = Math.pow(2, i/nrN)-1
        flatNodes[i].z = { re:r*Math.cos(a), im:r*Math.sin(a) }
    }
    return root
}

function layoutRadial(root) {
    root = d3.tree().size([2 * Math.PI, 0.9])(root)
    dfs(root, n=> {
        var a = n.x - Math.PI/2
        n.z = { re:n.y * Math.cos(a), im:n.y * Math.sin(a) }
    })    
    return root
}

function Cplog(a:Cp):Cp {
    if (isFinite(Math.log(a.r)))
        return { r:Math.log(a.r), θ:a.θ }
    else
        return { r:0, θ:0 }

    //return { r:isFinite(Math.log(a.r))?Math.log(a.r):0, θ:a.θ }
}
function Cklog(a:Ck):Ck { return CptoCk(Cplog(CktoCp(a))) }
function Cpow(a:number):C { return { re:Math.cos(a), im:Math.sin(a) }}

function layoutHyperbolic(n, wedge = { p:{ re:0, im:0 }, m:{ re:1, im:0 }, α:2*Math.PI }) {

    console.log('--------------------------------------------------------', n.depth)
    console.log(wedge.p, wedge.m, wedge.α)

    n.z = wedge.p

    if (n.children) {
        for (var i=0; i < n.children.length; i++) {

            var cα = /*wedge.α*/ 2*Math.PI / n.children.length * i
            console.assert(isFinite(cα))
            console.log('cα', cα)

            var s = .42
            var it = ((1-s*s) * Math.sin(cα)) / (2*s)
            console.log('it',it)
            var d = Math.sqrt(Math.pow(it,2)+1) - it
            d = d/2
            console.assert(isFinite(d))
            console.log('d',d)

            var np = h2e(makeT(wedge.p, one), CmulR(wedge.m, d))
            console.log('np',np)

            var nm = h2e(makeT(Cneg(np), one), h2e(makeT(wedge.p, one), wedge.m))
            console.log('nm',nm)

            var nα = Cklog(h2e(makeT({ re:-d, im:0 }, one), Cpow(cα))).im
            console.assert(isFinite(nα))

            var subwedge = { p:np, m:nm, α:nα }
            layoutHyperbolic(n.children[i], subwedge)
        }
    }
    return n
}

/*
function layoutHyperbolic(root) {
    dfs(root, (n, idx)=> {

        var wedge = { p:{ re:0, im:0 }, m:{ re:1, im:0 }, a:2*Math.PI }
        if (n.parent)
            wedge = n.parent.wedge

        n.x = wedge.p.re
        n.y = wedge.p.im

        if (n.children) {
            var ca = (wedge.a / n.children.length) * idx

            var s = .12
            var it = ((1-s*s) * Math.sin(ca))/(2*s)
            var d = Math.sqrt(Math.pow(it,2)+1) - it

            var np = h2e(wedge.p, one, CmulR(wedge.m, d))
            n.wedge = {
                p:np,
                m:h2e(Cneg(np), one, h2e(wedge.p, one, wedge.m)),
                a:Cklog(h2e({ re:-d, im:0 }, one, Cpow(ca))).im
            }
        }
    })
    return root
}*/
