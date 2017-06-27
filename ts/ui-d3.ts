namespace ivis.ui.D3
{
    var svg = null

    export function initD3(args)
    {
        svg = d3.select("#ivis-canvas-div")
            .append('svg')
            .attr("width", "100%")
            .attr("viewBox", hidePan?"0 0 1000 1000":"0 0 1000 500")
    }

    export class UnitDiskD3 implements TreeOnUnitDisk
    {
        args : ivis.ui.TreeOnUnitDiskConfig

        layers : any
        layersSvg : HTMLElement
        nodeLayer : any
        linkLayer : any
        arcLayer : any
        textLayer : any

        nodes : any
        links : any
        captions : any
        arcs : any

        drag : any
        d3mouseElem = () => d3.event.sourceEvent.target.__data__

        t  = (d:N) => {
            d.cache = d.cache || { re:0, im:0 }
            CassignC(d.cache, this.args.transform(d))
            return d.strCache = d.cache.re + ' ' + d.cache.im //CtoArr(newPosC).toString()
        }
        tr = (d:N) => this.args.transformR(d)
        ti = (e:number[]) => ArrtoC(e)

        constructor(args : ivis.ui.TreeOnUnitDiskConfig)
        {
            this.args = args                        
            var dragStartPoint = null
            var dragStartElement = null
            this.drag = d3.drag()
                .on("start", () => args.onDragStart(dragStartPoint = this.ti(d3.mouse(this.layersSvg)), dragStartElement = this.d3mouseElem()))
                .on("drag",  () => args.onDrag(dragStartPoint, this.ti(d3.mouse(this.layersSvg)), dragStartElement))
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
            this.textLayer = this.layers.append('g')

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
            this.captions.call(this.updateText)
        }

        showCaptions = true
        updateCaptions(visible:boolean) : void
        {
            this.showCaptions = visible
            this.captions.call(this.updateText)
            this.captions.transition()
                .duration(this.showCaptions?750:0)
                .attr("opacity", d=> this.showCaptions?1:0)
        }

        private create() : void
        {
            this.nodes = this.nodeLayer.selectAll(".node")
                .data(dfsFlat(this.args.data, n=>true))
                .enter().append("circle")
                    .attr("class", "node")
                    .attr("r", this.args.nodeRadius)
                    .on("click", this.openWiki)
                    .on("contextmenu", () => this.args.onClick(this.ti(d3.mouse(this.layersSvg))))
                    .call(this.drag)
                    .call(this.updateNode)                    

            this.captions = this.textLayer.selectAll(".caption")
                .data(dfsFlat(this.args.data, n=>true))
                .enter().append('text')
                    .attr("class", "caption")
                    .attr("dy", this.args.nodeRadius/6)
                    .call(this.updateText)

            this.arcs = this.arcLayer.selectAll(".arc")
                .data(dfsFlat(this.args.data, n=>n.parent))
                .enter().append("path")
                    .attr("class", "arc")
                    .call(this.updateArc)
        }

        private openWiki = d => {
            if (hidePan) {
                d3.event.preventDefault()
                document.getElementById('wiki').src = "https://de.m.wikipedia.org/wiki/"+this.args.caption(d)
            }
            else
                this.args.onClick(this.ti(d3.mouse(this.layersSvg)))
        }

        private transformStr = d=> " translate(" + this.t(d) + ")"
        private scaleStr     = d=> " scale(" + this.tr(d) +  ")"
        private calcText     = d=> (this.showCaptions?this.args.caption(d):"")

        private updateNode = x=> x.attr("transform", d=> this.transformStr(d) + this.scaleStr(d))
        private updateArc  = x=> x.attr("d", d=> this.args.arc(d))
        private updateText = x=> x.attr("transform", this.transformStr).text(this.calcText)
    }
}
