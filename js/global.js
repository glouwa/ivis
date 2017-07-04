//----------------------------------------------------------------------------------------
function dfs(n, fpre, idx = 0) {
    if (fpre)
        fpre(n, idx);
    if (n.children)
        for (var i = 0; i < n.children.length; i++)
            dfs(n.children[i], fpre, i);
}
function dfsFlat(n, f) {
    var r = [];
    dfs(n, n => { if (!f || f(n))
        r.push(n); });
    return r;
}
function clone(o) {
    return JSON.parse(JSON.stringify(o));
}
function sigmoid(x) {
    return .5 + .5 * Math.tanh(x * 6 - 3);
}
function makeT(a, b) { return { P: a, θ: b }; }
var one = { re: 1, im: 0 };
//----------------------------------------------------------------------------------------
function h2e(t, z) {
    //var möbiusConstraint = CsubC(t.θ, CmulC(t.P, Ccon(t.P)))
    //console.assert(möbiusConstraint.re !== 0 || möbiusConstraint.im)
    //console.assert(CktoCp(t.θ).r === 1)
    var oben = CaddC(CmulC(t.θ, z), t.P);
    var unten = CaddC(CmulC(CmulC(Ccon(t.P), t.θ), z), one);
    return CdivC(oben, unten);
}
function e2h(t, z) {
    var θ = Cneg(CmulC(Ccon(t.θ), t.P));
    var P = Ccon(t.θ);
    return h2e(makeT(P, θ), z);
}
function compose(t1, t2) {
    var divisor = CaddC(CmulC(t2.θ, CmulC(t1.P, Ccon(t2.P))), one);
    var θ = CdivC(CaddC(CmulC(t1.θ, t2.θ), CmulC(t1.θ, CmulC(Ccon(t1.P), t2.P))), divisor);
    return ({
        P: CdivC(CaddC(CmulC(t2.θ, t1.P), t2.P), divisor),
        θ: setR(θ, 1)
    });
}
function shift(h, s, e) {
    var p = h2e(h, { re: 0, im: 0 });
    var a = h2e(makeT(Cneg(p), one), s);
    var esuba = CsubC(e, a);
    var aec = Ccon(CmulC(a, e));
    var divisor = 1 - Math.pow(CktoCp(CmulC(a, e)).r, 2);
    var b = {
        re: CmulC(esuba, CaddC(one, aec)).re / divisor,
        im: CmulC(esuba, CsubC(one, aec)).im / divisor
    };
    return compose(makeT(Cneg(p), one), makeT(b, one));
}
function arcCenter(a, b) {
    var d = a.re * b.im - b.re * a.im;
    var br = CktoCp(b).r;
    var ar = CktoCp(a).r;
    var numerator = CsubC(CmulR(a, 1 + br * br), CmulR(b, 1 + ar * ar));
    return { c: CmulC({ re: 0, im: 1 }, CdivR(numerator, 2 * d)), d: d };
}
var R2toArr = (p) => ([p.x, p.y]);
var R2assignR2 = (a, b) => { a.x = b.x; a.y = b.y; return a; };
var R2toC = (p) => ({ re: p.x, im: p.y });
var R2neg = (p) => ({ x: -p.x, y: -p.y });
var R2addR2 = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
var R2subR2 = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
var R2mulR = (p, s) => ({ x: p.x * s, y: p.y * s });
var R2divR = (p, s) => ({ x: p.x / s, y: p.y / s });
var CktoCp = (k) => ({ θ: Math.atan2(k.im, k.re), r: Math.sqrt(k.re * k.re + k.im * k.im) });
var CptoCk = (p) => ({ re: p.r * Math.cos(p.θ), im: p.r * Math.sin(p.θ) });
var CktoArr = (p) => ([p.re, p.im]);
var CkassignCk = (a, b) => { a.re = b.re; a.im = b.im; return a; };
var CktoR2 = (p) => ({ x: p.re, y: p.im });
var Ckneg = (p) => ({ re: -p.re, im: -p.im });
var Ckcon = (p) => ({ re: p.re, im: -p.im });
var CkaddC = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
var CksubCk = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
var CkmulR = (p, s) => ({ re: p.re * s, im: p.im * s });
var CkmulCk = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.im * b.re + a.re * b.im });
var Ckpow = (a) => ({ re: Math.cos(a), im: Math.sin(a) });
var CkdivR = (p, s) => ({ re: p.re / s, im: p.im / s });
var CkdivCk = (a, b) => CkdivCkImpl2(a, b);
var Cklog = (a) => CptoCk(Cplog(CktoCp(a)));
var CpmulCp = (a, b) => CktoCp({ re: a.r * b.r * Math.cos(a.θ + b.θ), im: a.r * b.r * Math.sin(a.θ + b.θ) });
var CpdivCp = (a, b) => CktoCp({ re: a.r / b.r * Math.cos(a.θ - b.θ), im: a.r / b.r * Math.sin(a.θ - b.θ) });
var Cplog = (a) => CplogImpl(a);
var CtoArr = CktoArr;
var CassignC = CkassignCk;
var CtoR2 = CktoR2;
var Cneg = Ckneg;
var Ccon = Ckcon;
var CaddC = CkaddC;
var CsubC = CksubCk;
var CmulR = CkmulR;
var CmulC = CkmulCk;
var Cpow = Ckpow;
var Clog = Cklog;
var CdivC = CkdivCk;
var CdivR = CkdivR;
var ArrtoC = (p) => ({ re: p[0], im: p[1] });
var ArrtoR2 = (p) => ({ x: p[0], y: p[1] });
function ArrAddR(p, s) { return [p[0] + s, p[1] + s]; }
function ArrDivR(p, s) { return [p[0] / s, p[1] / s]; }
function CkdivCkImpl(a, b) {
    var dn = b.re * b.re + b.im * b.im;
    var r = {
        re: (a.re * b.re + a.im * b.im) / dn,
        im: (a.im * b.re - a.re * b.im) / dn
    };
    if (isNaN(r.re)) {
        r.re = 0;
        console.log('r.re=NaN');
    }
    if (isNaN(r.im)) {
        r.im = 0;
        console.log('r.im=NaN');
    }
    return r;
}
function CkdivCkImpl2(a, b) {
    var ap = CktoCp(a);
    var bp = CktoCp(b);
    return {
        re: ap.r / bp.r * Math.cos(ap.θ - bp.θ),
        im: ap.r / bp.r * Math.sin(ap.θ - bp.θ)
    };
}
function CplogImpl(a) {
    if (isFinite(Math.log(a.r)))
        return { r: Math.log(a.r), θ: a.θ };
    else
        return { r: 0, θ: 0 };
}
function maxR(c, v) {
    var mp = CktoCp(c);
    mp.r = mp.r > v ? v : mp.r;
    return CptoCk(mp);
}
function setR(c, r) {
    var mp = CktoCp(c);
    mp.r = r;
    return CptoCk(mp);
}
function πify(α) {
    if (α < 0)
        return α + 2 * Math.PI;
    if (α > 2 * Math.PI)
        return α - 2 * Math.PI;
    return α;
}
