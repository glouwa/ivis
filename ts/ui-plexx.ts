namespace ivis.ui.plexx
{
    var myCanvas = null
    var renderContext = null

    export function initPlexx()
    {
        myCanvas =       new Plexx.DrawingArea({ width: 1000, height: 1000, align: "xMidYMid", })
        renderContext =  new Plexx.RenderContext({ id: "hypertree"})
        myCanvas.run(renderContext);
    }

    export function initPlexxDbg()
    {
        initPlexx()
        new Plexx.DebugHelper("plexxDbg", renderContext, myCanvas)
    }

    export class UnitDiskPlexx implements ivis.ui.TreeOnUnitDisk
    {
        args : ivis.ui.TreeOnUnitDiskConfig

        plexxObj : Plexx.Group
        positionUpdateable = []
        t  = (d:N)  => CtoArr(CmulR(this.args.transform(d), this.args.radius))
        ti = (e:R2) => CdivR(R2toC(e), this.args.radius) //R2toC(CdivC(e, this.args.radius))
        tr = (d:N)  => this.args.nodeRadius * this.args.radius * this.args.transformR(d) //* 200//* this.args.radius

        constructor(args : ivis.ui.TreeOnUnitDiskConfig)
        {
            this.args = args

            this.plexxObj = new Plexx.Group({ translation:args.pos});
            var unitDiscBg = new Plexx.Circle({
                radius:args.radius,
                position:[0,0],
                colour:(args.opacity?"#f9fbe7cc":"#f9fbe7"),
                opacity:.5,
            });

            var dragFlag = false
            var dragStartPoint = null
            var dragStartElement = null
            unitDiscBg.on("mousedown", e=> {
                dragFlag = true
                dragStartPoint = this.ti({
                        x:e.mousePos.x - e.sender.getParent().translation[0],
                        y:e.mousePos.y - e.sender.getParent().translation[1],
                    })
                args.onDragStart(dragStartPoint, null)
            })

            unitDiscBg.on("mousemove", e=> {
                if (dragFlag)
                    args.onDrag(dragStartPoint, this.ti({
                    x:e.mousePos.x - e.sender.getParent().translation[0],
                    y:e.mousePos.y - e.sender.getParent().translation[1],
                }), null)
            })

            unitDiscBg.on("mouseup", e=> {
                dragFlag = false
                args.onDrag(dragStartPoint, this.ti({
                    x:e.mousePos.x - e.sender.getParent().translation[0],
                    y:e.mousePos.y - e.sender.getParent().translation[1],
                }), null)
            })
            myCanvas.add(this.plexxObj)
            this.plexxObj.add(unitDiscBg)
            this.create()
        }

        updatePositions() : void
        {
            for(var i=0; i < this.positionUpdateable.length; i++)
                this.positionUpdateable[i].update()
        }

        updateCaptions(visible:boolean) : void
        {
        }

        private create() : void
        {
            var model = this.args.data // create view stuff from data
            var s = this.args.radius
            let args = this.args;

            dfs(model, (n : N)=> {

                this.plexxObj.add(new NodeCircle({
                    model: n,
                    t: this.t,
                    ti: this.ti,
                    tr: this.tr,
                    positionUpdateable: this.positionUpdateable,                    
                }))

                if (n.parent)
                    this.plexxObj.add(new LinkLine({
                        model: n,
                        t: this.t,
                        ti: this.ti,
                        positionUpdateable: this.positionUpdateable,
                    }))
            })
        }
    }

    class NodeCircle extends Plexx.Circle
    {
        args : any
        isActive : boolean = false

        constructor(args)
        {
            super({
                position: [0, 0],
                radius: args.tr(args.model),
                translation: args.t(args.model),
                colour: "#90caf9",
            })
            this.args = args
            this.addMouseActHov(this)
            this.args.positionUpdateable.push(this)

            this.on("dragmove", function (e) {
                console.log("event: ", e);
            });
        }

        update(t)
        {
            this.radius = this.args.tr(this.args.model)
            this.setTranslation(this.args.t(this.args.model))
        }

        private addMouseActHov(v)
        {
            this.on("mousedown", e => {
                this.isActive = !this.isActive;
                if (this.isActive)
                    this.setColour("#e91e63");
                else
                    this.setColour("#9c27b0");
            });

            this.on("mousein", e=> {
                if(!this.isActive) this.setColour("#9c27b0");
            });

            this.on("mouseout", e=> {
                if(!this.isActive) this.setColour("#90caf9");
            })
        }
    }

    class LinkLine extends Plexx.Line
    {
        args : any

        constructor(args)
        {
            super({
                points: args.t(args.model.parent).concat(args.t(args.model)),
                width: 0.5,
                type: Constants.LineType.Default,
                colour: "#777777",
                endArrow: true,
                startArrow: false,
                arrowScale:1,
            })
            this.args = args
            this.args.positionUpdateable.push(this)           
        }

        update()
        {
            this.setPoints(this.args.t(this.args.model.parent).concat(this.args.t(this.args.model)))
        }
    }
}
