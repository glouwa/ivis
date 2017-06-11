//----------------------------------------------------------------------------------------
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
            transform: (n) => CtoR2(this.args.t(n)),
            transformR: (n) => this.nodeR(CtoR2(this.args.t(n))),
            onDragStart: (m) => this.args.onDragStart(R2toC(m)),
            onDrag: (m) => this.args.onDrag(R2toC(m)),
            parent: null,
            pos: ArrAddR(this.args.pos, 240),
            radius: 200,
            nodeRadius: 8,
            clip: this.args.clip,
            caption: true
        });
        var navR = 55;
        var navbg = new SelectedUnitDisk({
            data: this.data,
            transform: (n) => CtoR2(n.z),
            transformR: (n) => 1,
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
            transformR: (n) => 1,
            onDragStart: (m) => this.args.onDragStart(R2toC(m)),
            onDrag: (m) => this.args.onDrag(R2toC(m)),
            parent: null,
            pos: ArrAddR(this.args.pos, navR),
            opacity: .8,
            radius: navR,
            nodeRadius: 7,
            clip: false,
            caption: true
        });
    }
    nodeR(np) {
        var r = Math.sqrt(np.x * np.x + np.y * np.y);
        if (r > 1)
            r = 1;
        return Math.sin(Math.acos(r));
    }
}
//----------------------------------------------------------------------------------------
var ivis;
(function (ivis) {
    var init;
    (function (init) {
        init.runtimeRoot = {};
    })(init = ivis.init || (ivis.init = {}));
})(ivis || (ivis = {}));
(function (ivis) {
    var controler;
    (function (controler) {
        var o = { v: { re: 0, im: 0 }, α: { re: -1, im: 0, value: 0 }, ζ: { re: 1, im: 0, value: 1 } };
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
            var dSTh = null; // drag start transformation hyperbolic origin preseving
            var offsetTwn = new TreeWithNavigation({
                dataloader: selectedDataLoader,
                navData: ivis.loaders.obj2data(o),
                layout: selectedLayout,
                t: (n) => CaddC(n.z, o.v),
                onDragStart: (m) => { dSP = m; dSTo = clone(o); dSTh = clone(h); },
                onDrag: (m) => {
                    var dragVector = CsubC(m, dSP);
                    var newP = CaddC(dSTo.v, dragVector);
                    CassignC(o.v, newP);
                    offsetTwn.update();
                },
                parent: uiRoot,
                pos: [25, 30],
                clip: true
            });
            var hyperbolicTwn = new TreeWithNavigation({
                dataloader: selectedDataLoader,
                navData: ivis.loaders.obj2data(h),
                layout: selectedLayout,
                t: (n) => h2e(h, n.z),
                onDragStart: (m) => { dSP = m; dSTo = clone(o); dSTh = clone(h); },
                onDrag: (m) => {
                    var mp = CktoCp(m);
                    mp.r = mp.r > 1 ? .95 : mp.r;
                    m = CptoCk(mp);
                    var newP = compose(dSTh, shift(h, dSP, m)).P;
                    CassignC(h.P, newP);
                    hyperbolicTwn.update();
                },
                parent: uiRoot,
                pos: [525, 30],
            });
        }
        controler.init = init;
    })(controler = ivis.controler || (ivis.controler = {}));
})(ivis || (ivis = {}));
