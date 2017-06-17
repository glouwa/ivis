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
                this.args = args;
                this.navData = args.navData,
                    args.dataloader(d3h => {
                        this.data = args.layout(d3.hierarchy(d3h)); // data ok. calc init layout
                        this.create();
                    });
            }
            create() {
                this.view = new ivis.controller.slide.unitDisk({
                    class: 'unitDisc',
                    data: this.data,
                    transform: (n) => this.args.viewTT.transformPoint(n),
                    transformR: (n) => this.nodeR(this.args.viewTT.transformPoint(n)),
                    onDragStart: (m, n) => this.onDragStart(m, n, this.args.viewTT),
                    onDrag: (s, e, n) => this.onDrag(s, e, n, this.args.viewTT),
                    onDragEnd: () => this.onDragEnd(),
                    onClick: (m) => this.onClick(m, this.args.viewTT),
                    parent: null,
                    pos: ArrAddR(this.args.pos, 240),
                    radius: 200,
                    nodeRadius: .04,
                    clip: this.args.clip,
                    caption: true
                });
                var navR = 55;
                new ivis.controller.slide.unitDisk({
                    class: 'unitDiscParamBg',
                    data: this.data,
                    transform: (n) => n.z,
                    transformR: (n) => 1,
                    onDragStart: (m, n) => { },
                    onDrag: (s, e) => { },
                    onDragEnd: () => { },
                    onClick: (m) => { },
                    parent: null,
                    pos: ArrAddR(this.args.pos, navR),
                    radius: navR,
                    nodeRadius: .04,
                    clip: true
                });
                this.nav = new ivis.controller.slide.unitDisk({
                    class: 'unitDiscParam',
                    data: this.navData,
                    transform: (n) => n,
                    transformR: (n) => 1,
                    onDragStart: (m, n) => this.onDragStart(m, n, this.args.navTT),
                    onDrag: (s, e, n) => this.onDrag(s, e, n, this.args.navTT),
                    onDragEnd: () => this.onDragEnd(),
                    onClick: (m) => this.onClick(m, this.args.navTT),
                    parent: null,
                    pos: ArrAddR(this.args.pos, navR),
                    opacity: .8,
                    radius: navR,
                    nodeRadius: .13,
                    clip: false,
                    caption: true
                });
            }
            updatePositions() {
                this.nav.updatePositions();
                this.view.updatePositions();
            }
            onDragStart(m, n, tt) {
                this.view.updateCaptions(false);
                tt.onDragStart(m);
            }
            onDrag(s, e, n, tt) {
                var postfix = n ? (n.name ? n.name : 'P') : 'P'; // n.name bei parameter, n.data.name bei normalen nodes :(
                tt['onDrag' + postfix](s, e);
                this.updatePositions();
            }
            onDragEnd() {
                this.view.updateCaptions(true);
            }
            onClick(m, tt) {
                this.onDragStart(m, null, tt);
                var md = CktoCp(m);
                var step = 0;
                var initR = md.r;
                var intervall = setInterval(() => {
                    md.r = initR * (1 - sigmoid(step++ / 100));
                    if (step > 100) {
                        this.onDragEnd();
                        clearInterval(intervall);
                    }
                    else {
                        this.onDrag(m, CptoCk(md), null, tt);
                    }
                }, 7);
            }
            nodeR(np) {
                var r = Math.sqrt(np.re * np.re + np.im * np.im);
                if (r > 1)
                    r = 1;
                return Math.sin(Math.acos(r));
            }
        }
        class HyperbolicTransformation {
            constructor(tp) {
                this.transformPoint = (n) => h2e(h, n.z);
                this.onDragStart = (m) => this.dST = clone(this.tp);
                this.onDragP = (s, e) => CassignC(this.tp.P, compose(this.dST, shift(this.tp, s, maxR(e, .95))).P);
                this.tp = tp;
            }
        }
        class StandardPanAndZoomTransformation {
            constructor(tp) {
                this.transformPoint = (n) => {
                    var s = CktoCp(this.tp.λ).θ;
                    var w = CktoCp(this.tp.θ).θ;
                    var zp = CktoCp(n.z);
                    var rz = CptoCk({ θ: zp.θ + w, r: zp.r });
                    return CmulR(CaddC(rz, CdivR(this.tp.P, s)), s);
                };
                this.onDragStart = (m) => this.dST = clone(this.tp);
                this.onDragP = (s, e) => CassignC(this.tp.P, CaddC(this.dST.P, CsubC(e, s)));
                this.onDragθ = (s, e) => CassignC(this.tp.θ, onUnitCircle(e));
                this.onDragλ = (s, e) => CassignC(this.tp.λ, onUnitCircle(e));
                this.tp = tp;
            }
        }
        var h = { P: { re: 0, im: 0 }, θ: { re: 1, im: 0 } };
        var o = { P: { re: 0, im: 0 }, θ: { re: 1, im: 0 }, λ: { re: 0.5403023058681398, im: -0.8414709848078965 } };
        /**
         * create a euclidien and a hyperbolic tree view
         * same data
         * same initial layout
         * different states and transformations
         */
        function loadHyperTree() {
            var uiRoot = ivis.controller.slide.initUi();
            new TreeWithNavigation({
                dataloader: ivis.controller.slide.loader,
                navData: ivis.model.loaders.obj2data(o),
                layout: ivis.controller.slide.layout,
                viewTT: new StandardPanAndZoomTransformation(o),
                navTT: new StandardPanAndZoomTransformation(o),
                parent: uiRoot,
                pos: [25, 30],
                clip: true
            });
            new TreeWithNavigation({
                dataloader: ivis.controller.slide.loader,
                navData: ivis.model.loaders.obj2data(h),
                layout: ivis.controller.slide.layout,
                viewTT: new HyperbolicTransformation(h),
                navTT: new StandardPanAndZoomTransformation(h),
                parent: uiRoot,
                pos: [525, 30],
            });
        }
        controller.loadHyperTree = loadHyperTree;
    })(controller = ivis.controller || (ivis.controller = {}));
})(ivis || (ivis = {}));
