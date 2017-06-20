var ivis;
(function (ivis) {
    var ui;
    (function (ui) {
        var plexx;
        (function (plexx) {
            var myCanvas = null;
            var renderContext = null;
            function initPlexx() {
                myCanvas = new Plexx.DrawingArea({ width: 1000, height: 500, align: "xMidYMid", });
                renderContext = new Plexx.RenderContext({ id: "ivis-canvas-div" });
                myCanvas.run(renderContext);
            }
            plexx.initPlexx = initPlexx;
            function initPlexxDbg() {
                initPlexx();
                new Plexx.DebugHelper("ivis-canvas-debug-panel", renderContext, myCanvas);
            }
            plexx.initPlexxDbg = initPlexxDbg;
            class UnitDiskPlexx {
                constructor(args) {
                    this.positionUpdateable = [];
                    this.t = (d) => CtoArr(CmulR(this.args.transform(d), this.args.radius));
                    this.ti = (e) => CdivR(R2toC(e), this.args.radius); //R2toC(CdivC(e, this.args.radius))
                    this.tr = (d) => this.args.nodeRadius * this.args.radius * this.args.transformR(d); //* 200//* this.args.radius
                    this.args = args;
                    this.plexxObj = new Plexx.Group({ translation: args.pos });
                    var unitDiscBg = new Plexx.Circle({
                        radius: args.radius,
                        position: [0, 0],
                        colour: (args.opacity ? "#f9fbe7cc" : "#f9fbe7"),
                        opacity: .5,
                    });
                    var dragFlag = false;
                    var dragStartPoint = null;
                    var dragStartElement = null;
                    unitDiscBg.on("mousedown", e => {
                        dragFlag = true;
                        dragStartPoint = this.ti(e.mousePos);
                        args.onDragStart(dragStartPoint, null);
                    });
                    unitDiscBg.on("mousemove", e => {
                        if (dragFlag)
                            args.onDrag(dragStartPoint, this.ti(e.mousePos), null);
                    });
                    unitDiscBg.on("mouseup", e => {
                        dragFlag = false;
                        args.onDrag(dragStartPoint, this.ti(e.mousePos), null);
                    });
                    myCanvas.add(this.plexxObj);
                    this.plexxObj.add(unitDiscBg);
                    this.create();
                }
                updatePositions() {
                    for (var i = 0; i < this.positionUpdateable.length; i++)
                        this.positionUpdateable[i].update();
                    //myCanvas.renderFrame(renderContext);
                }
                updateCaptions(visible) {
                }
                create() {
                    var model = this.args.data; // create view stuff from data
                    var s = this.args.radius;
                    let args = this.args;
                    dfs(model, (n) => {
                        this.plexxObj.add(new NodeCircle({
                            model: n,
                            t: this.t,
                            ti: this.ti,
                            tr: this.tr,
                            positionUpdateable: this.positionUpdateable,
                        }));
                        if (n.parent)
                            this.plexxObj.add(new LinkLine({
                                model: n,
                                t: this.t,
                                ti: this.ti,
                                positionUpdateable: this.positionUpdateable,
                            }));
                    });
                }
            }
            plexx.UnitDiskPlexx = UnitDiskPlexx;
            class NodeCircle extends Plexx.Circle {
                constructor(args) {
                    super({
                        position: [0, 0],
                        radius: args.tr(args.model),
                        translation: args.t(args.model),
                        colour: "#90caf9",
                    });
                    this.isActive = false;
                    this.args = args;
                    this.addMouseActHov(this);
                    this.args.positionUpdateable.push(this);
                    this.on("dragmove", function (e) {
                        console.log("event: ", e);
                    });
                }
                update(t) {
                    this.radius = this.args.tr(this.args.model);
                    this.setTranslation(this.args.t(this.args.model));
                }
                addMouseActHov(v) {
                    this.on("mousedown", e => {
                        this.isActive = !this.isActive;
                        if (this.isActive)
                            this.setColour("#e91e63");
                        else
                            this.setColour("#9c27b0");
                    });
                    this.on("mousein", e => {
                        if (!this.isActive)
                            this.setColour("#9c27b0");
                    });
                    this.on("mouseout", e => {
                        if (!this.isActive)
                            this.setColour("#90caf9");
                    });
                }
            }
            class LinkLine extends Plexx.Line {
                constructor(args) {
                    super({
                        points: args.t(args.model.parent).concat(args.t(args.model)),
                        width: 0.5,
                        type: Constants.LineType.Default,
                        colour: "#777777",
                        endArrow: true,
                        arrowScale: 1,
                    });
                    this.args = args;
                    this.args.positionUpdateable.push(this);
                }
                update() {
                    this.setPoints(this.args.t(this.args.model.parent).concat(this.args.t(this.args.model)));
                }
            }
        })(plexx = ui.plexx || (ui.plexx = {}));
    })(ui = ivis.ui || (ivis.ui = {}));
})(ivis || (ivis = {}));
