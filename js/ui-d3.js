var svg = null;
function initD3(args) {
    svg = d3.select("#ivis-canvas-div")
        .append('svg')
        .attr("width", "1000")
        .attr("height", "500");
}
class UnitDiskD3 {
    constructor(args) {
        this.t = (d) => R2toArr(R2mulR(this.args.transform(d), this.args.radius));
        this.ti = (e) => R2divR(e, this.args.radius);
        this.args = args;
        var mainGroup = svg.append('g')
            .attr("transform", "translate(" + args.pos + ")");
        var unitDiscBg = mainGroup.append('circle')
            .attr("class", "unitDiscBg")
            .attr("r", args.radius)
            .attr("fill-opacity", args.opacity)
            .call(d3.drag().on("drag", d => args.onPan(this.ti(d3.event))));
        this.linkLayer = mainGroup.append('g');
        this.nodeLayer = mainGroup.append('g');
        this.create();
    }
    update() {
        this.nodes
            .attr("cx", d => this.t(d)[0])
            .attr("cy", d => this.t(d)[1]);
        this.links
            .attr("d", d => "M " + this.t(d) + " L " + this.t(d.parent));
    }
    create() {
        this.nodes = this.nodeLayer.selectAll(".node")
            .data(flat(this.args.data, n => true))
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", this.args.nodeRadius)
            .attr("cx", d => this.t(d)[0])
            .attr("cy", d => this.t(d)[1]);
        this.links = this.linkLayer.selectAll(".link")
            .data(flat(this.args.data, n => n.parent))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d => "M " + this.t(d) + " L " + this.t(d.parent));
    }
}
