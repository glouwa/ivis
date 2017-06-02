var myCanvas = null;
var renderContext = null;
function initPlexx() {
    myCanvas = new Plexx.DrawingArea({ width: 1000, height: 500, align: "xMidYMid", });
    renderContext = new Plexx.RenderContext({ id: "ivis-canvas-div" });
    var debugPanel = new Plexx.DebugHelper("ivis-canvas-debug-panel", renderContext, myCanvas);
    myCanvas.run(renderContext);
}
class UnitDiskPlexx {
    constructor(args) {
        this.positionUpdateable = [];
        this.t = (d) => R2toArr(this.args.transform(d));
        this.args = args;
        this.plexxObj = new Plexx.Group({ translation: args.pos });
        var unitDiscBg = new Plexx.Circle({ radius: args.radius, position: [0, 0], colour: "#f9fbe7" });
        myCanvas.add(this.plexxObj);
        this.plexxObj.add(unitDiscBg);
        this.create();
    }
    update() {
        for (var i = 0; i < this.positionUpdateable.length; i++)
            this.positionUpdateable[i].update();
        myCanvas.renderFrame(renderContext);
    }
    create() {
        // create view stuff from data
        var model = this.args.data;
        var s = this.args.radius;
        dfs(model, (n) => {
            // add blue circle
            var node = new Plexx.Circle({
                radius: this.args.nodeRadius,
                position: [n.x * s, n.y * s],
                colour: "#90caf9"
            });
            node.model = n;
            node = this.addMouseActHov(node);
            node.update = function (t) {
                console.log('UN');
                this.position = t(this.model);
            };
            this.plexxObj.add(node);
            this.positionUpdateable.push(node);
            // add line (root has no link)
            if (n.parent) {
                var link = new Plexx.Line({
                    points: [n.parent.x * s, n.parent.y * s, n.x * s, n.y * s],
                    width: 0.5,
                    type: Constants.LineType.Default,
                    colour: "black",
                    startArrow: null,
                    endArrow: null,
                    arrowScale: 1,
                });
                link.model = n;
                link.update = function (t) {
                    console.log('UL', t(this.model.parent).concat(t(this.model)));
                    this.points = t(this.model.parent).concat(t(this.model));
                    //this.points = [0, 0, 100, 100] doesnt work either
                };
                this.plexxObj.add(link);
                this.positionUpdateable.push(link);
            }
        });
    }
    addMouseActHov(v) {
        v.isActive = false;
        v.on("mousedown", function (e) {
            v.isActive = !v.isActive;
            if (v.isActive)
                v.setColour("#e91e63");
            else
                v.setColour("#9c27b0");
        });
        v.on("mousein", function (e) {
            if (!v.isActive)
                v.setColour("#9c27b0");
        });
        v.on("mouseout", function (e) {
            if (!v.isActive)
                v.setColour(v.colour);
        });
        return v;
    }
}
