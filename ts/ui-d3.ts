var svg = null

function initD3(args)
{
    svg = d3.select("#ivis-canvas-div")
        .append('svg')
        .attr("width", "1000")
        .attr("height", "500")
}

class UnitDiskD3 implements UnitDisk
{
    args : UnitDiskArgs
    nodeLayer : any
    linkLayer : any
    nodes : any
    links : any

    constructor(args : UnitDiskArgs)
    {
        this.args = args

        var mainGroup = svg.append('g')
            .attr("transform", "translate(" + args.pos + ")");

        var unitDiscBg = mainGroup.append('circle')
            .attr("class", "unitDiscBg")
            .attr("r", args.radius)
            .attr("fill-opacity", args.opacity)
            .call(d3.drag()
                .on("drag", d=> args.onS({
                    x:d3.event.x/args.radius,
                    y:d3.event.y/args.radius
                })))

        this.linkLayer = mainGroup.append('g')
        this.nodeLayer = mainGroup.append('g')
        this.create()
    }

    update() : void
    {
        this.nodes
            .attr("cx", d=> this.args.transform(d)[0])
            .attr("cy", d=> this.args.transform(d)[1])
        this.links
            .attr("d", d=> "M "+ this.args.transform(d) + " L " + this.args.transform(d.parent))
    }

    private create() : void
    {
        this.nodes = this.nodeLayer.selectAll(".node")
            .data(flat(this.args.data, n=>true))
            .enter().append("circle")
                .attr("class", "node")
                .attr("r", this.args.r)
                .attr("cx", d=> this.args.transform(d)[0])
                .attr("cy", d=> this.args.transform(d)[1])

        this.links = this.linkLayer.selectAll(".link")
            .data(flat(this.args.data, n=>n.parent))
            .enter().append("path")
                .attr("class", "link")
                .attr("d", d=> "M "+ this.args.transform(d) + " L " + this.args.transform(d.parent))
    }
}
