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
            onPan: (m) => this.args.onPan(m),
            parent: null,
            pos: ArrAddR(this.args.pos, 240),
            radius: 200,
            nodeRadius: 7,
            clip: this.args.clip
        });
        var navR = 55;
        var navbg = new SelectedUnitDisk({
            data: this.data,
            transform: (n) => n,
            onPan: (m) => { },
            parent: null,
            pos: ArrAddR(this.args.pos, navR),
            radius: navR,
            nodeRadius: 2,
            clip: true
        });
        this.nav = new SelectedUnitDisk({
            data: this.navData,
            transform: (n) => R2neg(n),
            onPan: (m) => this.args.onPan(R2neg(m)),
            parent: null,
            pos: ArrAddR(this.args.pos, navR),
            opacity: .8,
            radius: navR,
            nodeRadius: 7,
            clip: false
        });
    }
}
//----------------------------------------------------------------------------------------
/*
interface Transforamtion {
    point:
    line:
    area:
}*/
var o = { v: { x: 0, y: 0 } };
var s = { P: { re: 0, im: 0 }, θ: { re: 1, im: 0 } };
function R2assignR2(a, b) { a.x = b.x; a.y = b.y; }
function CassignR2(a, b) { a.re = b.x; a.im = b.y; }
/**
 * create a euclidien and a hyperbolic tree view
 * same data
 * same initial layout
 * different states and
 */
function init() {
    var uiRoot = selectedInitUi();
    var offsetTwn = new TreeWithNavigation({
        dataloader: selectedDataLoader,
        navData: obj2data(o, x => x),
        layout: selectedLayout,
        t: (n) => R2addR2(n, o.v),
        onPan: (m) => {
            R2assignR2(s.P, m); // x,y wird als position der nac nodes verwendet
            CassignR2(s.P, m); // re,im als parameter für die transformation
            R2assignR2(o.v, m);
            offsetTwn.update();
            hyperbolicTwn.update();
        },
        parent: uiRoot,
        pos: [25, 30],
        clip: true
    });
    var hyperbolicTwn = new TreeWithNavigation({
        dataloader: selectedDataLoader,
        navData: obj2data(s, x => CtoR2(x)),
        layout: selectedLayout,
        t: (n) => CtoR2(h2e(R2toC(n), s.P, s.θ)),
        onPan: (m) => {
            R2assignR2(s.P, m);
            CassignR2(s.P, m);
            R2assignR2(o.v, m);
            offsetTwn.update();
            hyperbolicTwn.update();
        },
        parent: uiRoot,
        pos: [525, 30],
    });
}
function h2e(z, P, θ) {
    var oben = CaddC(CmulC(θ, z), P);
    var unten = CaddR(CmulC(CmulC(Ccon(P), θ), z), 1);
    var zprime = CdivC(oben, unten);
    return zprime;
}
function e2h(z, p, t) {
    var pp = Cneg(CmulC(Ccon(t), p));
    var tp = Ccon(t);
    return h2e(z, pp, tp);
}
