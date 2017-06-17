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
                    this.t = (d) => R2toArr(R2mulR(this.args.transform(d), this.args.radius));
                    this.ti = (e) => R2divR(e, this.args.radius);
                    this.args = args;
                    this.plexxObj = new Plexx.Group({ translation: args.pos });
                    var unitDiscBg = new Plexx.Circle({ radius: args.radius, position: [0, 0], colour: "#f9fbe7" });
                    var dragFlag = false;
                    unitDiscBg.on("mousedown", e => {
                        dragFlag = true;
                        args.onDragStart(this.ti(e.mousePos));
                    });
                    unitDiscBg.on("mousemove", e => {
                        if (dragFlag)
                            args.onDrag(this.ti(e.mousePos));
                    });
                    unitDiscBg.on("mouseup", e => {
                        dragFlag = false;
                        args.onDrag(this.ti(e.mousePos));
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
                            positionUpdateable: this.positionUpdateable,
                            onDrag: this.args.onDrag,
                            onDragStart: this.args.onDragStart,
                            radius: this.args.nodeRadius,
                            position: [0, 0],
                            translation: this.t(n),
                            colour: "#90caf9",
                        }));
                        if (n.parent)
                            this.plexxObj.add(new LinkLine({
                                model: n,
                                t: this.t,
                                ti: this.ti,
                                positionUpdateable: this.positionUpdateable,
                                points: this.t(n.parent).concat(this.t(n)),
                                width: 0.5,
                                type: Constants.LineType.Default,
                                colour: "#777777",
                                //startArrow:Plexx.Triangle,
                                endArrow: null,
                                arrowScale: 1,
                            }));
                    });
                }
            }
            plexx.UnitDiskPlexx = UnitDiskPlexx;
            class NodeCircle extends Plexx.Circle {
                constructor(args) {
                    super(args);
                    this.isActive = false;
                    this.args = args;
                    this.addMouseActHov(this);
                    this.args.positionUpdateable.push(this);
                    this.on("dragmove", function (e) {
                        console.log("event: ", e);
                    });
                }
                update(t) {
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
                            this.setColour(this.args.colour);
                    });
                }
            }
            class LinkLine extends Plexx.Line {
                constructor(args) {
                    super(args);
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
