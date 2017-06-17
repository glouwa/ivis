namespace ivis.ui.D3
{
    var svg = null

    export function initD3(args)
    {
        svg = d3.select("#ivis-canvas-div")
            .append('svg')
            .attr("width", "100%")
            .attr("viewBox", "0 0 1000 500")
    }

    export class UnitDiskD3 implements TreeOnUnitDisk
    {
        args : ivis.ui.TreeOnUnitDiskConfig

        layers : any
        layersSvg : HTMLElement
        nodeLayer : any
        linkLayer : any
        arcLayer : any

        nodes : any
        links : any
        captions : any
        arcs : any
        drag : any

        t  = (d:N) => R2toArr(this.args.transform(d))
        tr = (d:N) => this.args.transformR(d)
        ti = (e:number[]) => ArrtoC(e)

        constructor(args : ivis.ui.TreeOnUnitDiskConfig)
        {
            this.args = args                        
            var dragStartPoint = null
            this.drag = d3.drag()
                .on("start", () => args.onDragStart(dragStartPoint = this.ti(d3.mouse(this.layersSvg))))
                .on("drag",  () => args.onDrag(dragStartPoint, this.ti(d3.mouse(this.layersSvg))))
                .on("end",   () => args.onDragEnd())

            var mainGroup = svg.append('g')
                .attr("class", args.class)
                .attr("transform", "translate(" + args.pos + ")")

            var unitDiscBg = mainGroup.append('circle')
                .attr("class", "unitDiscBg")
                .attr("r", 1)
                .attr("transform", "scale(" + args.radius + ")")
                .attr("fill-opacity", args.opacity)
                .on("click", () => args.onClick(this.ti(d3.mouse(d3.event.srcElement))))
                .call(this.drag)

            this.layers = mainGroup.append('g')
                .attr("class", "layers")
                .attr("transform", "scale(" + args.radius + ")")
            this.layersSvg = this.layers._groups[0][0]
            this.linkLayer = this.layers.append('g')
            this.arcLayer = this.layers.append('g')
            this.nodeLayer = this.layers.append('g')

            if (args.clip)
            {
                mainGroup.append("clipPath")
                    .attr("id", "circle-clip")
                    .append("circle")
                        .attr("r", 1)
                this.layers.attr("clip-path", "url(#circle-clip)")
            }
            this.create()
        }

        updatePositions() : void
        {
            this.nodes.call(this.updateNode)
            this.arcs.call(this.updateArc)
        }

        updateCaptions(visible:boolean) : void
        {
            this.args.caption = visible
            this.captions.call(this.updateText)
            this.captions.transition()
                //.ease(d3.easeCubicInOut(750))
                .duration(this.args.caption?750:0)
                .attr("opacity", d=> this.args.caption?1:0)
        }

        private create() : void
        {
            this.nodes = this.nodeLayer.selectAll(".node")
                .data(dfsFlat(this.args.data, n=>true))
                .enter().append("g")
                    .attr("class", "node")
                    .on("click", () => this.args.onClick(this.ti(d3.mouse(this.layersSvg))))
                    .call(this.drag)
                    .call(this.updateNode)

            this.nodes.append("circle")
                .attr("r", this.args.nodeRadius)

            this.captions = this.nodes.append("text")
                .attr("dy", this.args.nodeRadius/6)
                .call(this.updateText)

            this.arcs = this.arcLayer.selectAll(".arc")
                .data(dfsFlat(this.args.data, n=>n.parent))
                .enter().append("path")
                    .attr("class", "arc")
                    .call(this.updateArc)
        }

        private updateNode = x=> x.attr("transform", d=> "translate(" + this.t(d) + ") scale(" + this.tr(d) +  ")")
        private updateText = x=> x.text(d=> (this.args.caption?(d.name?d.name:(d.data?(d.data.name?d.data.name:""):"")):""))
        private updateArc  = x=> x.attr("d", d=> {
            var arcP1 = R2toC(this.args.transform(d))
            var arcP2 = R2toC(this.args.transform(d.parent))
            var arcC = arcCenter(arcP1, arcP2)
            var r = CktoCp(CsubC(R2toC(this.args.transform(d.parent)), arcC.c)).r
            var d2SvglargeArcFlag : string = arcC.d>0?'1':'0'
            if (isNaN(r))
                r = 0
            var s = this.t(d)
            var e = this.t(d.parent)
            return "M" +s+ " A " +r+ " " +r+ ", 0, 0, " + d2SvglargeArcFlag+ ", " +e
        })        
    }
}
