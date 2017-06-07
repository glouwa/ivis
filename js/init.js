/**
 * Created by julian on 31.05.17.
 */
var R2assignR2 = (a, b) => { a.x = b.x; a.y = b.y; };
var CassignR2 = (a, b) => { a.re = b.x; a.im = b.y; };
var R2toArr = (p) => ([p.x, p.y]);
var R2toC = (p) => ({ re: p.x, im: p.y });
var R2neg = (p) => ({ x: -p.x, y: -p.y });
var R2addR2 = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
var R2subR2 = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
var R2mulR = (p, s) => ({ x: p.x * s, y: p.y * s });
var R2divR = (p, s) => ({ x: p.x / s, y: p.y / s });
var CtoArr = (p) => ([p.re, p.im]);
var CtoR2 = (p) => ({ x: p.re, y: p.im });
var Cneg = (p) => ({ re: -p.re, im: -p.im });
var Ccon = (p) => ({ re: p.re, im: -p.im });
var CaddC = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
var CaddR = (a, s) => ({ re: a.re + s, im: a.im });
var CsubC = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
var CmulR = (p, s) => ({ re: p.re * s, im: p.im * s });
var CmulC = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.im * b.re + a.re * b.im });
var CdivC = (a, b) => {
    var r = {
        re: (a.re * b.re + a.im * b.im) / (b.re * b.re + b.im * b.im),
        im: (a.im * b.re - a.re * b.im) / (b.re * b.re + b.im * b.im)
    };
    //if (isNaN(r.re) || isNaN(r.im)) return { re:0, im:0 }
    if (isNaN(r.re)) {
        r.re = 0;
        console.log('r.re=NaN');
    }
    if (isNaN(r.im)) {
        r.im = 0;
        console.log('r.im=NaN');
    }
    return r;
};
var CktoCp = (k) => ({ θ: Math.atan2(k.im, k.re), r: Math.sqrt(k.re * k.re + k.im * k.im) });
var CptoCk = (p) => ({ re: p.r * Math.cos(p.θ), im: p.r * Math.sin(p.θ) });
function ArrAddR(p, s) { return [p[0] + s, p[1] + s]; }
/**
 * a viewdisk and a navigation disk together.
 * navdisk gets pan state as model
 */
class TreeWithNavigation {
    constructor(args) {
        this.args = args;
        this.navData = args.navData,
            args.dataloader(d3h => {
                this.data = args.layout(d3.hierarchy(d3h)); // data ok. calc init layout
                this.create();
            });
    }
    update() {
        this.nav.update();
        this.view.update();
    }
    create() {
        this.view = new SelectedUnitDisk({
            data: this.data,
            transform: (n) => this.args.t(n),
            onDragStart: this.args.onDragStart,
            onDrag: (m) => this.args.onDrag(m),
            parent: null,
            pos: ArrAddR(this.args.pos, 240),
            radius: 200,
            nodeRadius: 7,
            clip: this.args.clip
        });
        var navR = 55;
        var navbg = new SelectedUnitDisk({
            data: this.data,
            transform: (n) => CtoR2(n.z),
            onDragStart: (m) => { },
            onDrag: (m) => { },
            parent: null,
            pos: ArrAddR(this.args.pos, navR),
            radius: navR,
            nodeRadius: 2,
            clip: true
        });
        this.nav = new SelectedUnitDisk({
            data: this.navData,
            transform: (n) => CtoR2(n),
            onDragStart: this.args.onDragStart,
            onDrag: (m) => this.args.onDrag((m)),
            parent: null,
            pos: ArrAddR(this.args.pos, navR),
            opacity: .8,
            radius: navR,
            nodeRadius: 7,
            clip: false
        });
    }
}
function makeT(a, b) { return { P: a, θ: b }; }
var one = { re: 1, im: 0 };
var o = { v: { re: 0, im: 0 } };
var h = { P: { re: 0, im: 0 }, θ: one };
/**
 * create a euclidien and a hyperbolic tree view
 * same data
 * same initial layout
 * different states and
 */
function init() {
    var uiRoot = selectedInitUi();
    var dSP = null; // drag start point
    var dSTo = null; // drag start transformation offset
    var dSTh = null; // drag start transformation hyperbolic origin preseving P
    var dSTh = null; // drag start transformation hyperbolic origin preseving θ
    var offsetTwn = new TreeWithNavigation({
        dataloader: selectedDataLoader,
        navData: obj2data(o, x => x),
        layout: selectedLayout,
        t: (n) => CtoR2(CaddC(n.z, o.v)),
        onDragStart: (m) => {
            dSP = m;
            dSTo = clone(o);
            dSTh = clone(h);
        },
        onDrag: (m) => {
            var dragVector = R2subR2(m, dSP);
            var newP = R2addR2(CtoR2(dSTh.P), dragVector);
            CassignR2(h.P, newP); // re,im als parameter für die transformation
            CassignR2(o.v, newP);
            offsetTwn.update();
            hyperbolicTwn.update();
        },
        parent: uiRoot,
        pos: [25, 30],
        clip: true
    });
    var hyperbolicTwn = new TreeWithNavigation({
        dataloader: selectedDataLoader,
        navData: obj2data(h, x => CtoR2(x)),
        layout: selectedLayout,
        t: (n) => CtoR2(h2e(h, n.z)),
        onDragStart: (m) => {
            dSP = m;
            dSTo = clone(o);
            dSTh = clone(h);
        },
        onDrag: (m) => {
            var newT = compose(dSTh, shift(R2toC(dSP), R2toC(m)));
            var newP = CtoR2(newT.P);
            console.assert(CsubC(CmulC(h.θ, one), CmulC(CmulC(newP, Ccon(newP)), h.θ)) != 0);
            CassignR2(h.P, newP);
            CassignR2(o.v, newP);
            offsetTwn.update();
            hyperbolicTwn.update();
        },
        parent: uiRoot,
        pos: [525, 30],
    });
}
function h2e(t, z) {
    var oben = CaddC(CmulC(t.θ, z), t.P);
    var unten = CaddR(CmulC(CmulC(Ccon(t.P), t.θ), z), 1);
    var zprime = CdivC(oben, unten);
    return zprime;
}
function e2h(t, z) {
    var θ = Cneg(CmulC(Ccon(t.θ), t.P));
    var P = Ccon(t.θ);
    return h2e(makeT(P, θ), z);
}
function compose(t1, t2) {
    var divisor = CaddC(CmulC(t2.θ, CmulC(t1.P, Ccon(t2.P))), one);
    var θ = CdivC(CaddC(CmulC(t1.θ, t2.θ), CmulC(t1.θ, CmulC(Ccon(t1.P), t2.P))), divisor);
    var θp = CktoCp(θ);
    θp.r = 1;
    return ({
        P: CdivC(CaddC(CmulC(t2.θ, t1.P), t2.P), divisor),
        θ: CptoCk(θp)
    });
}
function shift(s, e) {
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
