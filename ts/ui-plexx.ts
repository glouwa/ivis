var myCanvas = null
var renderContext = null

function initPlexx()
{
    myCanvas =       new Plexx.DrawingArea({ width: 1000, height: 500, align: "xMidYMid", })
    renderContext =  new Plexx.RenderContext({ id: "ivis-canvas-div"})
    myCanvas.run(renderContext);
}

function initPlexxDbg()
{
    initPlexx()
    new Plexx.DebugHelper("ivis-canvas-debug-panel", renderContext, myCanvas)
}

class UnitDiskPlexx implements TreeOnUnitDisk
{
    args : TreeOnUnitDiskConfig

    plexxObj : Plexx.Group
    positionUpdateable = []
    t = (d:N) => R2toArr(this.args.transform(d))

    constructor(args : TreeOnUnitDiskConfig)
    {
        this.args = args

        this.plexxObj = new Plexx.Group({ translation:args.pos});
        var unitDiscBg = new Plexx.Circle({ radius:args.radius, position:[0,0], colour:"#f9fbe7" });
        myCanvas.add(this.plexxObj)
        this.plexxObj.add(unitDiscBg)
        this.create()
    }

    update() : void
    {
        for(var i=0; i<this.positionUpdateable.length; i++)
            this.positionUpdateable[i].update()

        myCanvas.renderFrame(renderContext);
    }

    private create() : void
    {

        var model = this.args.data // create view stuff from data
        var s = this.args.radius
        dfs(model, (n : N)=> {

            var node = new Plexx.Circle({ // add blue circle
                radius: this.args.nodeRadius,
                position: [n.x * s, n.y * s],
                colour: "#90caf9"
            })
            node.model = n
            node = this.addMouseActHov(node)
            node.update = function(t) {
                console.log('UN');
                this.position = t(this.model)
            }
            this.plexxObj.add(node)
            this.positionUpdateable.push(node)

            if (n.parent) { // add line (root has no link)
                var link = new Plexx.Line({
                    points: [n.parent.x*s, n.parent.y*s, n.x*s, n.y*s],
                    width: 0.5,
                    type: Constants.LineType.Default,
                    colour: "black",
                    startArrow:null,
                    endArrow:null,
                    arrowScale:1,

                })
                link.model = n
                link.update = function(t)
                {
                    console.log('UL', t(this.model.parent).concat(t(this.model)));
                    this.points = t(this.model.parent).concat(t(this.model))
                    //this.points = [0, 0, 100, 100] doesnt work either
                }
                this.plexxObj.add(link)
                this.positionUpdateable.push(link)
            }
        })
    }

    private addMouseActHov(v)
    {
        v.isActive = false;
        v.on("mousedown", function (e) {
            v.isActive = !v.isActive;
            if (v.isActive)
                v.setColour("#e91e63");
            else
                v.setColour("#9c27b0");
        });

        v.on("mousein", function (e) {
            if(!v.isActive) v.setColour("#9c27b0");
        });

        v.on("mouseout", function (e) {
            if(!v.isActive) v.setColour(v.colour);
        });
        return v
    }
}

