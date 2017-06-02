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
var CmulC = (a, b) => ({ re: a.re * b.re - a.im * b.im,
    im: a.im * b.re + a.re * b.im });
var CdivC = (a, b) => ({ re: (a.re * b.re + a.im * b.im) /
        (b.re * b.re + b.im * b.im),
    im: (a.im * b.re - a.re * b.im) /
        (b.re * b.re + b.im * b.im) });
var CaddC = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
var CaddR = (a, s) => ({ re: a.re + s, im: a.im });
var CtoArr = (p) => ([p.re, p.im]);
var CtoR2 = (p) => ({ x: p.re, y: p.im });
function ArrAddR(p, s) { return [p[0] + s, p[1] + s]; }
class TreeWithNavigation {
    constructor(args) {
        this.args = args;
        oneNode(node => {
            this.navData = layoutAtCenter(node);
        });
        args.dataloader(d3h => {
            this.data = args.layout(d3h); // data ok. calc init layout
            this.create();
        });
    }
    setS(ns) {
        this.args.onPan(ns);
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
        });
        this.nav = new UnitDiskD3({
            data: this.navData,
            transform: (n) => R2neg(this.args.t(n)),
            onPan: (m) => this.setS(R2neg(m)),
            parent: null,
            pos: ArrAddR(this.args.pos, navR),
            opacity: .8,
            radius: navR,
            nodeRadius: 7,
        });
        this.view = new UnitDiskD3({
            data: this.data,
            transform: (n) => this.args.t(n),
            onPan: (m) => this.setS(m),
            parent: null,
            pos: ArrAddR(this.args.pos, 240),
            radius: 200,
            nodeRadius: 7,
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
    var o = { x: 0, y: 0 };
    new TreeWithNavigation({
        dataloader: selectedDataLoader,
        layout: layoutRadial,
        t: (n) => R2addR2(n, o),
        onPan: (m) => o = m,
        parent: uiRoot,
        pos: [0, 0],
    });
    var s = { P: { re: 0, im: 0 }, T: { re: 0, im: 1 } };
    function h2e(z, p, t) {
        // (T * z + P) / ( 1 + Ccon(P) * T * z)
        // (s.T * R2toC(z) + s.P) / ( 1 + Ccon(s.P) * s.T * R2toC(z))
        var oben = CaddC(CmulC(s.T, z), s.P);
        var unten = CaddR(CmulC(CmulC(Ccon(s.P), s.T), z), 1);
        var zprime = CdivC(oben, unten);
        return zprime;
    }
    function e2h(z, p, t) {
        var pp = Cneg(CmulC(Ccon(t), p));
        var tp = Ccon(t);
        return h2e(z, pp, tp);
    }
    new TreeWithNavigation({
        dataloader: selectedDataLoader,
        layout: selectedLayout,
        t: (n) => CtoR2(e2h(R2toC(n), s.P, s.T)),
        //t:          (n:N) => R2addR2(n,o),
        onPan: (m) => { s.P = R2toC(m); o = m; },
        parent: uiRoot,
        pos: [550, 0],
    });
}
