function layoutAtCenter(root) {
    dfs(root, n => { n.x = 0; n.y = 0; });
    return root;
}
var unitVectors = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
function layoutUnitVectors(root) {
    var some = [{ x: 0, y: 0 }].concat(unitVectors);
    var i = 0;
    dfs(root, n => {
        n.x = some[i % some.length].x;
        n.y = some[i % some.length].y;
        i++;
    });
    return root;
}
function layoutUnitLines(root) {
    root.x = 0;
    root.y = 0;
    for (var i = 0; i < 4; i++)
        layoutPath(root.children[i], unitVectors[i], root.children[i].height);
    function layoutPath(pathBegin, target, depth = 30) {
        var i = 0;
        var pa = 1 / depth;
        var rt = r => pa + r * (1 - pa);
        dfs(pathBegin, n => {
            var r = i / depth;
            n.x = rt(r) * target.x;
            n.y = rt(r) * target.y;
            i++;
        });
    }
    return root;
}
function layoutSpiral(root) {
    var flatNodes = dfsFlat(root);
    var nrN = flatNodes.length;
    var nrRounds = Math.floor(nrN / 24);
    for (var i = 0; i < nrN; i++) {
        var a = i / nrN * 2 * Math.PI * (nrRounds + 1);
        var r = Math.pow(2, i / nrN) - 1;
        flatNodes[i].x = r * Math.cos(a);
        flatNodes[i].y = r * Math.sin(a);
    }
    return root;
}
function layoutRadial(root) {
    root = d3.tree().size([2 * Math.PI, 1])(root);
    dfs(root, n => {
        var a = n.x - Math.PI / 2;
        n.x = n.y * Math.cos(a);
        n.y = n.y * Math.sin(a);
    });
    return root;
}
function Cplog(a) { return { r: isFinite(Math.log(a.r)) ? Math.log(a.r) : 0, θ: a.θ }; }
function Cklog(a) { return CptoCk(Cplog(CktoCp(a))); }
function Cpow(a) { return { re: Math.cos(a), im: Math.sin(a) }; }
var one = { re: 1, im: 0 };
function layoutHyperbolic(n, wedge = { p: { re: 0, im: 0 }, m: { re: 1, im: 0 }, α: 2 * Math.PI }) {
    console.log('--------------------------------------------------------', n.depth);
    console.log(wedge.p, wedge.m, wedge.α);
    n.x = wedge.p.re;
    n.y = wedge.p.im;
    if (n.children) {
        for (var i = 0; i < n.children.length; i++) {
            var cα = 2 * Math.PI / n.children.length * i;
            console.assert(isFinite(cα));
            console.log('cα', cα);
            var s = .42;
            var it = ((1 - s * s) * Math.sin(cα)) / (2 * s);
            console.log('it', it);
            var d = Math.sqrt(Math.pow(it, 2) + 1) - it;
            d = d / 2;
            console.assert(isFinite(d));
            console.log('d', d);
            var np = h2e(CmulR(wedge.m, d), wedge.p, one);
            console.log('np', np);
            var nm = h2e(h2e(wedge.m, wedge.p, one), Cneg(np), one);
            console.log('nm', nm);
            var nα = Cklog(h2e(Cpow(cα), { re: -d, im: 0 }, one)).im;
            console.assert(isFinite(nα));
            var subwedge = { p: np, m: nm, α: nα };
            layoutHyperbolic(n.children[i], subwedge);
        }
    }
    return n;
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

            var np = h2e(CmulR(wedge.m, d), wedge.p, one)
            n.wedge = {
                p:np,
                m:h2e(h2e(wedge.m, wedge.p, one), Cneg(np), one),
                a:Cklog(h2e(Cpow(ca), { re:-d, im:0 }, one)).im
            }
        }
    })
    return root
}*/
