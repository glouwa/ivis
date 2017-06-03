/**
 * Created by julian on 31.05.17.
 */
var R2neg = (p) => ({ x: -p.x, y: -p.y });
var R2mulR = (p, s) => ({ x: p.x * s, y: p.y * s });
var R2divR = (p, s) => ({ x: p.x / s, y: p.y / s });
var R2addR2 = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
var R2toArr = (p) => ([p.x, p.y]);
var R2toC = (p) => ({ re: p.x, im: p.y });
var Cneg = (p) => ({ re: -p.re, im: -p.im });
var Ccon = (p) => ({ re: p.re, im: -p.im });
var CmulR = (p, s) => ({ re: p.re * s, im: p.im * s });
var CmulC = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.im * b.re + a.re * b.im });
var CdivC = (a, b) => ({ re: (a.re * b.re + a.im * b.im) / (b.re * b.re + b.im * b.im),
    im: (a.im * b.re - a.re * b.im) / (b.re * b.re + b.im * b.im) });
var CaddC = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
var CaddR = (a, s) => ({ re: a.re + s, im: a.im });
var CtoArr = (p) => ([p.re, p.im]);
var CtoR2 = (p) => ({ x: p.re, y: p.im });
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
                this.data = args.layout(d3h); // data ok. calc init layout
                this.create();
            });
    }
    update(ns) {
        this.nav.update();
        this.view.update();
    }
    create() {
        var navR = 55;
        var navbg = new UnitDiskD3({
            data: this.data,
            transform: (n) => this.args.t(n),
            onPan: (m) => { },
            parent: null,
            pos: ArrAddR(this.args.pos, navR),
            radius: navR,
            nodeRadius: 2,
            clip: true
        });
        this.nav = new UnitDiskD3({
            data: this.navData,
            transform: (n) => R2neg(this.args.t(n)),
            onPan: (m) => this.args.onPan(R2neg(m)),
            parent: null,
            pos: ArrAddR(this.args.pos, navR),
            opacity: .8,
            radius: navR,
            nodeRadius: 7,
            clip: true
        });
        this.view = new UnitDiskD3({
            data: this.data,
            transform: (n) => this.args.t(n),
            onPan: (m) => this.args.onPan(m),
            parent: null,
            pos: ArrAddR(this.args.pos, 240),
            radius: 200,
            nodeRadius: 7,
            clip: this.args.clip
        });
    }
}
//----------------------------------------------------------------------------------------
/**
 * create a euclidien and a hyperbolic tree view
 * same data
 * same initial layout
 * different states and
 */
function init() {
    var uiRoot = selectedInitUi();
    var o = { v: { x: 0, y: 0 } };
    var offsetPan = new TreeWithNavigation({
        dataloader: selectedDataLoader,
        navData: obj2data(o, x => x),
        layout: selectedLayout,
        t: (n) => R2addR2(n, o.v),
        onPan: (m) => { s.P = R2toC(m); o.v = m; offsetPan.update(); hyperbolicPan.update(); },
        parent: uiRoot,
        pos: [0, 0],
        clip: true
    });
    var s = { P: { re: 0, im: 0 }, θ: { re: 0, im: 1 } };
    var hyperbolicPan = new TreeWithNavigation({
        dataloader: selectedDataLoader,
        navData: obj2data(s, x => CtoR2(x)),
        layout: selectedLayout,
        t: (n) => CtoR2(h2e(R2toC(n), s.P, s.θ)),
        onPan: (m) => { s.P = R2toC(m); o.v = m; offsetPan.update(); hyperbolicPan.update(); },
        parent: uiRoot,
        pos: [550, 0],
    });
}
function h2e(z, p, t) {
    var oben = CaddC(CmulC(t, z), p);
    var unten = CaddR(CmulC(CmulC(Ccon(p), t), z), 1);
    var zprime = CdivC(oben, unten);
    return zprime;
}
function e2h(z, p, t) {
    var pp = Cneg(CmulC(Ccon(t), p));
    var tp = Ccon(t);
    return h2e(z, pp, tp);
}
