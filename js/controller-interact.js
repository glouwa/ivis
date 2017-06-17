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
            updatePositions() {
                this.nav.updatePositions();
                this.view.updatePositions();
            }
            create() {
                var dragStartTransformation = null;
                this.view = new ivis.controller.slide.unitDisk({
                    class: 'unitDisc',
                    data: this.data,
                    transform: (n) => CtoR2(this.args.t(n)),
                    transformR: (n) => this.nodeR(CtoR2(this.args.t(n))),
                    onDragStart: (m) => {
                        this.view.updateCaptions(false);
                        this.args.onDragStart(m);
                    },
                    onDrag: (s, e) => {
                        this.args.onDrag(s, e);
                        this.updatePositions();
                    },
                    onDragEnd: () => {
                        this.view.updateCaptions(true);
                    },
                    onClick: (m) => {
                        this.nav.args.onDragStart(m);
                        var md = CktoCp(m);
                        var intervall = setInterval(() => {
                            md.r = md.r - 0.05;
                            if (md.r < 0.00001) {
                                this.nav.args.onDragEnd();
                                clearInterval(intervall);
                            }
                            else
                                this.nav.args.onDrag(m, CptoCk(md));
                        }, 20);
                    },
                    parent: null,
                    pos: ArrAddR(this.args.pos, 240),
                    radius: 200,
                    nodeRadius: .04,
                    clip: this.args.clip,
                    caption: true
                });
                var navR = 55;
                var navbg = new ivis.controller.slide.unitDisk({
                    class: 'unitDiscParamBg',
                    data: this.data,
                    transform: (n) => CtoR2(n.z),
                    transformR: (n) => 1,
                    onDragStart: (m) => { },
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
                    transform: (n) => CtoR2(n),
                    transformR: (n) => 1,
                    onDragStart: (m) => {
                        this.view.updateCaptions(false);
                        this.args.onDragStart(m);
                    },
                    onDrag: (s, e) => {
                        this.args.onDrag(s, e);
                        this.updatePositions();
                    },
                    onDragEnd: () => {
                        this.view.updateCaptions(true);
                    },
                    onClick: (m) => {
                        this.nav.args.onDragStart(m);
                        var md = CktoCp(m);
                        var intervall = setInterval(() => {
                            md.r = md.r - 0.05;
                            if (md.r < 0.00001) {
                                this.nav.args.onDragEnd();
                                clearInterval(intervall);
                            }
                            else
                                this.nav.args.onDrag(m, CptoCk(md));
                        }, 20);
                    },
                    parent: null,
                    pos: ArrAddR(this.args.pos, navR),
                    opacity: .8,
                    radius: navR,
                    nodeRadius: .13,
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
        var o = { v: { re: 0, im: 0 }, α: { re: -1, im: 0, value: 0 }, ζ: { re: 1, im: 0, value: 1 } };
        var h = { P: { re: 0, im: 0 }, θ: one };
        /**
         * create a euclidien and a hyperbolic tree view
         * same data
         * same initial layout
         * different states and
         */
        function loadHyperTree() {
            var uiRoot = ivis.controller.slide.initUi();
            var dSTo = null; // drag start transformation offset
            var dSTh = null; // drag start transformation hyperbolic origin preseving
            var offsetTwn = new TreeWithNavigation({
                dataloader: ivis.controller.slide.loader,
                navData: ivis.model.loaders.obj2data(o),
                layout: ivis.controller.slide.layout,
                t: (n) => CaddC(n.z, o.v),
                onDragStart: (m) => dSTo = clone(o),
                onDrag: (s, e) => CassignC(o.v, CaddC(dSTo.v, CsubC(e, s))),
                parent: uiRoot,
                pos: [25, 30],
                clip: true
            });
            var hyperbolicTwn = new TreeWithNavigation({
                dataloader: ivis.controller.slide.loader,
                navData: ivis.model.loaders.obj2data(h),
                layout: ivis.controller.slide.layout,
                t: (n) => h2e(h, n.z),
                onDragStart: (m) => dSTh = clone(h),
                onDrag: (s, e) => {
                    var mp = CktoCp(e);
                    mp.r = mp.r > .95 ? .95 : mp.r;
                    e = CptoCk(mp);
                    var newP = compose(dSTh, shift(h, s, e)).P;
                    CassignC(h.P, newP);
                },
                parent: uiRoot,
                pos: [525, 30],
            });
        }
        controller.loadHyperTree = loadHyperTree;
    })(controller = ivis.controller || (ivis.controller = {}));
})(ivis || (ivis = {}));
