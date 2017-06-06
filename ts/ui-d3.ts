var svg = null

function initD3(args)
{
    svg = d3.select("#ivis-canvas-div")
        .append('svg')
        .attr("width", "100%")
        .attr("viewBox", "0 0 1000 500")
}

class UnitDiskD3 implements TreeOnUnitDisk
{
    args : TreeOnUnitDiskConfig
    nodeLayer : any
    linkLayer : any
    nodes : any
    links : any
    t  = (d:N)  => R2toArr(R2mulR(this.args.transform(d), this.args.radius))
    ti = (e:R2) =>         R2divR(e, this.args.radius)

    constructor(args : TreeOnUnitDiskConfig)
    {
        this.args = args

        var mainGroup = svg.append('g')
            .attr("class", "unitDisc"+(args.opacity?"Param":""))
            .attr("transform", "translate(" + args.pos + ")");

        var unitDiscBg = mainGroup.append('circle')
            .attr("class", "unitDiscBg")
            .attr("r", args.radius)
            .attr("fill-opacity", args.opacity)
            .call(d3.drag()
                .on("start", d=> args.onDragStart(this.ti(d3.event)))
                .on("drag", d=> args.onDrag(this.ti(d3.event))))

        mainGroup.append("clipPath")
            .attr("id", "circle-clip")
            .append("circle")
                .attr("r", args.radius)

        var layers = mainGroup.append('g')
        this.linkLayer = layers.append('g')
        this.nodeLayer = layers.append('g')
        if (args.clip) layers.attr("clip-path", "url(#circle-clip)")
        this.create()
    }

    update() : void
    {
        this.nodes.attr("transform", d=> "translate(" + this.t(d) + " )")
        this.links.attr("d", d=> "M "+ this.t(d) + " L " + this.t(d.parent))
    }

    private create() : void
    {
        this.nodes = this.nodeLayer.selectAll(".node")
            .data(dfsFlat(this.args.data, n=>true))
            .enter().append("g")
                .attr("class", "node")
                .attr("transform", d=> "translate(" + this.t(d) + " )")

        this.nodes.append("circle")
            .attr("r", this.args.nodeRadius)

        this.nodes.append("text")
            .text(d=> (d.name?d.name:""))

        this.links = this.linkLayer.selectAll(".link")
            .data(dfsFlat(this.args.data, n=>n.parent))
            .enter().append("path")
                .attr("class", "link")
                .attr("d", d=> "M "+ this.t(d) + " L " + this.t(d.parent))
    }
}
