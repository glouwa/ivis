var myCanvas = null
var renderContext = null

function initPlexx()
{
    myCanvas =       new Plexx.DrawingArea({ width: "1000", height: "500", align: "xMidYMid", });
    renderContext =  new Plexx.RenderContext({ id: "ivis-canvas-div"});
    var debugPanel = new Plexx.DebugHelper("ivis-canvas-debug-panel", renderContext, myCanvas);
    myCanvas.run(renderContext);
}

function UnitDiskPlexx(args)
{
    var plexxObj = new Plexx.Group({ translation:args.pos});
    var unitDiscBg = new Plexx.Circle({ radius:args.radius, position:[0,0], colour:"#f9fbe7", /*draggable:true,*/ });
    //unitDiscBg.on("mousedown", function (e) { console.log('mouseDown', e) });

    myCanvas.add(plexxObj);
    plexxObj.data = args.data
    plexxObj.add(unitDiscBg);
    plexxObj.positionUpdateable = []
    plexxObj.update = function()
    {
        // all nodes and links are in positionUpdateable
        // if transformatin dependency is changed, all get update msg
        // the all know their model (node) and will calculate their new position
        for(var i=0; i<plexxObj.positionUpdateable.length; i++)
            plexxObj.positionUpdateable[i].update(args.transform)

        myCanvas.renderFrame(renderContext);
    }

    plexxObj.create = function()
    {
        // create view stuff from data
        var model = args.data
        var s = args.radius
        dfs(model, n=> {
            // add blue circle
            var node = new Plexx.Circle({
                radius: args.r,
                position: [n.x*s, n.y*s],
                colour: "#90caf9"
            })
            node.model = n
            node = addMouseActHov(node)
            node.update = function(t) {
                console.log('UN');
                this.position = t(this.model)
            }
            plexxObj.add(node)
            plexxObj.positionUpdateable.push(node)

            // add line (root has no link)
            if (n.parent) {
                var link = new Plexx.Line({
                    points: [n.parent.x*s, n.parent.y*s, n.x*s, n.y*s],
                    width: 0.5,
                    type: Constants.LineType.Default,
                    colour: "black",
                })
                link.model = n
                link.update = function(t)
                {
                    console.log('UL', t(this.model.parent).concat(t(this.model)));
                    this.points = t(this.model.parent).concat(t(this.model))
                    //this.points = [0, 0, 100, 100] doesnt work either
                }
                plexxObj.add(link)
                plexxObj.positionUpdateable.push(link)
            }
        })
    }

    plexxObj.create()
    return plexxObj
}

function addMouseActHov(v)
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
