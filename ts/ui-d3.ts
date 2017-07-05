namespace ivis.ui.D3
{
    var svg = null

    export function initD3(args)
    {
        svg = d3.select("#hypertree")
            .append('svg')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("viewBox", "-0 0 1050 1000")

    }

    export class UnitDiskD3 implements TreeOnUnitDisk
    {
        args : ivis.ui.TreeOnUnitDiskConfig

        layers : any
        layersSvg : HTMLElement
        cellLayer : any
        nodeLayer : any
        linkLayer : any
        arcLayer : any
        textLayer : any

        nodes : any
        links : any
        captions : any
        arcs : any
        cells : any
        selection : any
        hover: N

        drag : any
        voronoi : any
        voroLayout : any

        constructor(args : ivis.ui.TreeOnUnitDiskConfig)
        {
            this.args = args
            this.selection = this.args.data
            var dragStartPoint = null
            var dragStartElement = null
            var d3mouseElem = () => d3.event.sourceEvent.target.__data__
            this.drag = d3.drag()
                .on("start", () => args.onDragStart(dragStartPoint = this.ti(d3.mouse(this.layersSvg)), dragStartElement = d3mouseElem()))
                .on("drag",  () => args.onDrag(dragStartPoint, this.ti(d3.mouse(this.layersSvg)), dragStartElement))
                .on("end",   () => args.onDragEnd())

            this.voronoi = d3.voronoi()
                .x(d=> d.cache.re)
                .y(d=> d.cache.im)
                .extent([[-1.6,-1.6], [1.6,1.6]])

            var mainGroup = svg.append('g')
                .attr("class", args.class)
                .attr("transform", "translate(" + args.pos + ")")

            mainGroup.append("clipPath")
                .attr("id", "circle-clip")
                .append("circle")
                    .attr("r", 1)

            var unitDiscBg = mainGroup.append('circle')
                .attr("class", "background-circle")
                .attr("r", 1)            
                .attr("transform", "scale(" + args.radius + ")")
                .on("click", () => this.onClick(null))

            this.layers = mainGroup.append('g')
                .attr("class", "layers")
                .attr("transform", "scale(" + args.radius + ")")

            this.layersSvg = this.layers._groups[0][0]
            this.cellLayer = this.layers.append('g')
            this.linkLayer = this.layers.append('g')
            this.arcLayer = this.layers.append('g')
            this.nodeLayer = this.layers.append('g')
            this.textLayer = this.layers.append('g')

            if (args.clip)
                this.cellLayer.attr("clip-path", "url(#circle-clip)")

            this.create()
        }

        private create() : void
        {
            var allNodes = dfsFlat(this.args.data, n=>true)
            var allLinks = dfsFlat(this.args.data, n=>n.parent)

            this.nodes = this.nodeLayer.selectAll(".node")
                .data(allNodes)
                .enter().append("circle")
                    .attr("class", "node")
                    .attr("r", d => this.nodeRi(d))                    
                    .on("dblclick", d=> this.onDblClick(d))
                    .on("click", d=> this.onClick(d))
                    .on("mouseover", d=> this.updateHover(d))                    
                    .on("mouseout", d=> this.updateHover(d))                    
                    .call(this.drag)
                    .call(this.updateNode)
                    .call(this.updateNodeColor)


            this.captions = this.textLayer.selectAll(".caption")
                .data(allNodes)
                .enter().append('text')
                    .attr("class", "caption")
                    .attr("dy", this.args.nodeRadius / 10)
                    .attr("dx", .01)
                    .text(this.args.caption)
                    .call(this.updateText)

            this.arcs = this.arcLayer.selectAll(".arc")
                .data(allLinks)
                .enter().append("path")
                    .attr("class", "arc")
                    .call(this.updateArc)

            this.voroLayout = this.voronoi(allNodes)
            this.cells = this.cellLayer.selectAll(".cell")
                .data(this.voroLayout.polygons())
                .enter().append('path')
                    .attr("class", "cell")
                    //.attr("fill", d => (d.data.children?'#fff':'#f5fef0')) //'rgba(150, 202, 152, .05)'
                    .on("dblclick", d=> this.onDblClick(d.data))
                    .on("click", d=> this.onClick(d.data))
                    .on("mouseover", d=> this.updateHover(d.data))
                    .on("mouseout", d=> this.updateHover(d.data))                    
                    .call(this.updateCell)
                    .call(this.updateCellColor)
                    .call(this.drag)
        }

        updatePositions() : void
        {            
            this.nodes.call(this.updateNode)            
            this.arcs.call(this.updateArc)
            this.captions.call(this.updateText)
            this.updateCells()
        }

        updateCells() : void
        {
            this.voroLayout = this.voronoi(dfsFlat(this.args.data, n=>true))
            this.cells.data(this.voroLayout.polygons())
            this.cells.call(this.updateCell)
        }

        showCaptions = true
        updateCaptions(visible:boolean) : void
        {
            this.showCaptions = visible
            this.captions.call(this.updateText)
            /*this.captions.transition()
                .duration(this.showCaptions?750:0)
                .attr("opacity", d=> this.showCaptions?1:0)*/
        }

        private updatePath(oldN, newN, arcColor, nodesColor, lastNodeColor)
        {
            if (oldN && oldN.ancestors) {
                delete oldN.nodeColor
                for (var a of oldN.ancestors()) {
                    delete a.isSelected
                    delete a.linkColor
                    delete a.nodeColor
                }
            }
            if (newN && newN.ancestors) {                
                for (var a of newN.ancestors()) {
                    a.isSelected = true
                    a.linkColor = arcColor
                    a.nodeColor = nodesColor
                }
                newN.nodeColor =  lastNodeColor
            }
            this.updateColors()
            this.updateCaptions(true)
        }

        updateSelection(n:N)
        {
            var oldSelection = this.selection
            this.selection = n
            this.updatePath(oldSelection, this.selection, "orange", "#fff59d", "#ffe082")
        }

        updateHover(n:N)
        {
            var oldHover = this.hover
            this.hover = n
            this.updatePath(oldHover, this.hover, "#42a5f5", undefined, /*"#bbdefb"*/ "#e3f2fd")
            this.updatePath(null, this.selection, "orange", "#fff59d", "#ffe082")
        }

        updateColors()
        {
            this.nodes.call(this.updateNodeColor)
            this.nodes.call(this.updateNodeStroke)
            this.arcs.call(this.updateArcColor)
        }

        //-----------------------------------------------------------------------------------------

        private onClick = d => {            
            d3.event.preventDefault()            
            this.args.onClick(this.ti(d3.mouse(this.layersSvg)), d)
        }

        private onDblClick = d => {            
            d3.event.preventDefault()            
            this.args.onDblClick(this.ti(d3.mouse(this.layersSvg)), d)
        }

        // snippets ------------------------------------------------------------------------------

        t  = (d:N) => {
            d.cache = d.cache || { re:0, im:0 }
            CassignC(d.cache, this.args.transform(d))
            return d.strCache = d.cache.re + ' ' + d.cache.im //CtoArr(newPosC).toString()
        }
        ti = (e:number[]) => ArrtoC(e)
        tr =                                                 (d:N) => ((d.parent && !d.isSelected)
                                                                       ? this.args.transformR(d)
                                                                       : .5+.5*this.args.transformR(d))

        private nodeRi =                                      d=> ((d.children && d.parent)
                                                                       ? (this.args.nodeRadius*.3)
                                                                       : this.args.nodeRadius)

        private transformStr =                                d=> " translate(" + this.t(d) + ")"
        private scaleStr     =                                d=> " scale(" + this.tr(d) +  ")"

        // element updates ------------------------------------------------------------------------

        private updateNode       = v=> v.attr("transform",    d=> this.transformStr(d) + this.scaleStr(d))        
        private updateCellColor  = v=> v.attr("fill",         d=> (d.data.children?'#fff':'#f5fef0')) //'rgba(150, 202, 152, .05)'
        private updateNodeColor  = v=> v.style("fill",        d=> (d.parent
                                                                       ? (d.nodeColor
                                                                            ? d.nodeColor
                                                                            : undefined)
                                                                       : this.args.rootColor))

        private updateNodeStroke = v=> v.style("stroke",      d=> (d.linkColor
                                                                       ? d.linkColor
                                                                       : undefined))

        private updateCell       = v=> v.attr("d",            d=> (d   ? "M"+d.join("L")+"Z" : null))
        private updateArcColor   = v=> v.style("stroke",      d=> (d.linkColor
                                                                       ? d.linkColor
                                                                       : undefined))

        private updateArc        = v=> v.attr("d",            d=> this.args.arc(d))
                                        .attr("stroke-width", d=> this.tr(d) / 130)
        private updateText       = v=> v.attr("transform",    d=> this.transformStr(d) + this.scaleStr(d))
                                        .attr("visibility",   d=> ((this.args.labelFilter(d) || !this.showCaptions)&&d.parent&&!d.isSelected)
                                                                       ? 'hidden'
                                                                       : 'visible')
    }
}

