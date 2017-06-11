var svg = null;
function initD3(args) {
    svg = d3.select("#ivis-canvas-div")
        .append('svg')
        .attr("width", "100%")
        .attr("viewBox", "0 0 1000 500");
}
class UnitDiskD3 {
    constructor(args) {
        this.t = (d) => R2toArr(R2mulR(this.args.transform(d), this.args.radius));
        this.ti = (e) => R2divR(e, this.args.radius);
        this.tr = (d) => this.args.transformR(d);
        this.args = args;
        var mainGroup = svg.append('g')
            .attr("class", "unitDisc" + (args.opacity ? "Param" : ""))
            .attr("transform", "translate(" + args.pos + ")");
        var unitDiscBg = mainGroup.append('circle')
            .attr("class", "unitDiscBg")
            .attr("r", args.radius)
            .attr("fill-opacity", args.opacity)
            .call(d3.drag()
            .on("start", d => args.onDragStart(this.ti(d3.event)))
            .on("drag", d => args.onDrag(this.ti(d3.event))));
        mainGroup.append("clipPath")
            .attr("id", "circle-clip")
            .append("circle")
            .attr("r", args.radius);
        var layers = mainGroup.append('g');
        this.linkLayer = layers.append('g');
        this.arcLayer = layers.append('g');
        this.nodeLayer = layers.append('g');
        if (args.clip)
            layers.attr("clip-path", "url(#circle-clip)");
        this.create();
    }
    update() {
        this.nodes
            .attr("transform", d => "translate(" + this.t(d) + ") scale(" + this.tr(d) + ")");
        this.arcs
            .attr("d", d => this.d3arc(d, d.parent));
    }
    create() {
        this.nodes = this.nodeLayer.selectAll(".node")
            .data(dfsFlat(this.args.data, n => true))
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => "translate(" + this.t(d) + ") scale(" + this.tr(d) + ")");
        this.nodes.append("circle")
            .attr("r", this.args.nodeRadius);
        this.nodes.append("text")
            .text(d => (d.name ? d.name : ""));
        /*      this.links = this.linkLayer.selectAll(".link")
                    .data(dfsFlat(this.args.data, n=>n.parent))
                    .enter().append("path")
                        .attr("class", "link")
                        .attr("d", d=> "M "+ this.t(d) + " L " + this.t(d.parent))*/
        this.arcs = this.arcLayer.selectAll(".arc")
            .data(dfsFlat(this.args.data, n => n.parent))
            .enter().append("path")
            .attr("class", "arc")
            .attr("d", d => this.d3arc(d, d.parent));
    }
    d3arc(a, b) {
        var arcP1 = R2toC(this.args.transform(a));
        var arcP2 = R2toC(this.args.transform(b));
        var arcC = arcCenter(arcP1, arcP2);
        var c = arcC.c;
        if (!isNaN(c))
            console.log("hit");
        var r = CktoCp(CsubC(R2toC(this.args.transform(b)), c)).r * -200;
        if (isNaN(r))
            r = 0;
        var s = this.t(a);
        var e = this.t(b);
        //var d = s[0] * e[1] - e[0] * s[1]
        return "M" + s[0] + " " + s[1] + " A " + r + " " + r + ", 0, 0, " + (arcC.d > 0 ? 0 : 1) + ", " + e[0] + " " + e[1];
    }
}
