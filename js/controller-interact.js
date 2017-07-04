var ivis;
(function (ivis) {
    var controller;
    (function (controller) {
        /**
         * a viewdisk and a navigation disk together.
         * navdisk gets pan state as model
         */
        class TreeWithNavigation // Interaction
         {
            constructor(args) {
                this.intervallEvent = null;
                this.args = args;
                this.navData = args.navData,
                    args.dataloader(d3h => {
                        this.data = args.layout(d3.hierarchy(d3h).sum(controller.slide.weight)); // data ok. calc init layout                
                        this.create();
                    });
            }
            create() {
                var navR = 70;
                new ivis.controller.slide.unitDisk({
                    class: 'nav-background-disc',
                    data: this.data,
                    transform: (n) => n.z,
                    transformR: (n) => this.nodeR(this.args.viewTT.transformPoint(n)),
                    onDragStart: (m, n) => { },
                    onDrag: (s, e) => { },
                    onDragEnd: () => { },
                    onClick: (m) => { },
                    arc: this.args.arc,
                    caption: (n) => "",
                    labelFilter: (n) => true,
                    parent: null,
                    pos: ArrAddR([navR / 2, navR / 2], navR),
                    radius: navR,
                    nodeRadius: .05,
                    clip: true
                });
                this.nav = new ivis.controller.slide.unitDisk({
                    class: 'nav-parameter-disc',
                    data: this.navData,
                    transform: (n) => n,
                    transformR: (n) => 1,
                    onDragStart: (m, n) => this.onDragStart(m, n, this.args.navTT),
                    onDrag: (s, e, n) => this.onDrag(s, e, n, this.args.navTT),
                    onDragEnd: () => this.onDragEnd(),
                    onClick: (m) => this.onClick(m, this.args.navTT),
                    arc: this.args.arc,
                    caption: this.caption,
                    labelFilter: (n) => false,
                    parent: null,
                    pos: ArrAddR([navR / 2, navR / 2], navR),
                    opacity: .8,
                    radius: navR,
                    nodeRadius: .18,
                    //rootColor:   "#ffee58",
                    clip: false,
                });
                var radius = 470;
                var dblClickTimerEvent = null;
                this.view = new ivis.controller.slide.unitDisk({
                    class: 'unitDisc',
                    data: this.data,
                    transform: (n) => this.args.viewTT.transformPoint(n),
                    transformR: (n) => this.nodeR(this.args.viewTT.transformPoint(n)),
                    onDragStart: (m, n) => this.onDragStart(m, n, this.args.viewTT),
                    onDrag: (s, e, n) => this.onDrag(s, e, n, this.args.viewTT),
                    onDragEnd: () => this.onDragEnd(),
                    onDblClick: (m, n) => {
                        if (!dblClickTimerEvent)
                            dblClickTimerEvent = setTimeout(() => {
                                dblClickTimerEvent = null;
                                this.animateTo(m, this.args.viewTT);
                            }, 300);
                    },
                    onClick: (m, n) => {
                        clearTimeout(dblClickTimerEvent);
                        dblClickTimerEvent = null;
                        this.view.updateSelection(n);
                        this.args.onNodeSelect(n);
                    },
                    arc: this.args.arc,
                    caption: this.caption,
                    labelFilter: (n) => CktoCp(n.cache).r > .7,
                    parent: null,
                    pos: ArrAddR([50, 30], radius),
                    voroBox: [[-1.01, -1.01], [1.01, 1.01]],
                    radius: radius,
                    nodeRadius: .04,
                    rootColor: "#fff59d",
                    clip: true,
                });
            }
            updatePositions() {
                this.nav.updatePositions();
                this.view.updatePositions();
            }
            updateLayout() {
                this.data = this.args.layout(this.data);
            }
            onDragStart(m, n, tt) {
                if (this.intervallEvent)
                    return;
                if (ivis.controller.slide.captions)
                    this.view.updateCaptions(false);
                tt.onDragStart(m);
            }
            onDrag(s, e, n, tt) {
                var postfix = n ? (n.name ? n.name : 'P') : 'P'; // n.name bei parameter, n.data.name bei normalen nodes :(
                tt['onDrag' + postfix](s, e);
                this.updatePositions();
            }
            onDragEnd() {
                this.view.updateCells();
                if (ivis.controller.slide.captions)
                    this.view.updateCaptions(true);
            }
            animateTo(m, tt) {
                if (this.intervallEvent)
                    return;
                this.onDragStart(m, null, tt);
                var md = CktoCp(m);
                var step = 0;
                var initR = md.r;
                var steps = 33;
                this.intervallEvent = setInterval(() => {
                    md.r = initR * (1 - sigmoid(step++ / steps));
                    if (step > steps) {
                        this.onDragEnd();
                        clearInterval(this.intervallEvent);
                        this.intervallEvent = null;
                    }
                    else {
                        this.onDrag(m, CptoCk(md), null, tt);
                    }
                }, 1);
            }
            caption(n) {
                if (n.name)
                    return n.name;
                if (n.data && n.data.name)
                    return n.data.name;
                return "";
            }
            nodeR(np) {
                var r = Math.sqrt(np.re * np.re + np.im * np.im);
                if (r > 1)
                    r = 1;
                return Math.sin(Math.acos(r));
            }
        }
        controller.TreeWithNavigation = TreeWithNavigation;
        class HyperbolicTransformation {
            constructor(tp) {
                this.transformPoint = (n) => h2e(h, n.z);
                this.onDragStart = (m) => this.dST = clone(this.tp);
                this.onDragP = (s, e) => CassignC(this.tp.P, compose(this.dST, shift(this.dST, s, maxR(e, .95))).P);
                this.tp = tp;
            }
        }
        controller.HyperbolicTransformation = HyperbolicTransformation;
        class PanTransformation {
            constructor(tp) {
                this.transformPoint = (n) => {
                    var s = CktoCp(this.tp.λ).θ;
                    var w = CktoCp(this.tp.θ).θ;
                    var zp = CktoCp(n.z);
                    var rz = CptoCk({ θ: zp.θ + w, r: zp.r });
                    return CmulR(CaddC(rz, CdivR(this.tp.P, s)), s);
                };
                this.onDragStart = (m) => this.dST = clone(this.tp);
                this.onDragP = (s, e) => CassignC(this.tp.P, CaddC(this.dST.P, CsubC(maxR(e, .95), s)));
                this.onDragθ = (s, e) => CassignC(this.tp.θ, setR(e, 1));
                this.onDragλ = (s, e) => CassignC(this.tp.λ, setR(e, 1));
                this.tp = tp;
            }
        }
        controller.PanTransformation = PanTransformation;
        var h = { P: { re: 0, im: 0 }, θ: { re: 1, im: 0 }, λ: CptoCk({ θ: -3 / Math.PI, r: 1 }) };
        //var o   = { P:{ re:0, im:0 }, θ:{ re:-1, im:0 }, λ:{ re:0.5403023058681398, im:-0.8414709848078965 } }
        var left = null;
        var right = null;
        /**
         * create a euclidien and a hyperbolic tree view
         * same data
         * same initial layout
         * different states and transformations
         */
        function reCreate() {
            document.getElementById("hypertree").innerText = '';
            document.getElementById("ivis-canvas-debug-panel").innerText = '';
            var uiRoot = ivis.controller.slide.initUi();
            left = new TreeWithNavigation({
                dataloader: ivis.controller.slide.loader,
                navData: ivis.model.loaders.obj2data(h),
                layout: ivis.controller.slide.layout,
                viewTT: new ivis.controller.slide.space(h),
                navTT: new PanTransformation(h),
                arc: ivis.controller.slide.arc,
                parent: uiRoot,
                onNodeSelect: (n) => {
                    if (document.getElementById('wiki'))
                        document.getElementById('wiki').src = "https://en.m.wikipedia.org/wiki/" + n.data.name;
                }
            });
        }
        controller.reCreate = reCreate;
        function reLayout() {
            left.updateLayout();
            right.updateLayout();
        }
        controller.reLayout = reLayout;
        function reDraw() {
            left.updatePositions();
            right.updatePositions();
        }
        controller.reDraw = reDraw;
    })(controller = ivis.controller || (ivis.controller = {}));
})(ivis || (ivis = {}));
