var ivis;
(function (ivis) {
    var ui;
    (function (ui) {
        var D3;
        (function (D3) {
            var svg = null;
            function initD3(args) {
                svg = d3.select("#ivis-canvas-div")
                    .append('svg')
                    .attr("width", "100%")
                    .attr("viewBox", "0 0 1000 500");
            }
            D3.initD3 = initD3;
            class UnitDiskD3 {
                constructor(args) {
                    this.t = (d) => R2toArr(R2mulR(this.args.transform(d), this.args.radius));
                    this.ti = (e) => R2divR(e, this.args.radius);
                    this.tr = (d) => this.args.transformR(d);
                    this.updateNode = x => x.attr("transform", d => "translate(" + this.t(d) + ") scale(" + this.tr(d) + ")");
                    this.updateText = x => x.text(d => (d.name ? d.name : (d.data ? (d.data.name ? d.data.name : "") : "")));
                    this.updateArc = x => x.attr("d", d => {
                        var arcP1 = R2toC(this.args.transform(d));
                        var arcP2 = R2toC(this.args.transform(d.parent));
                        var arcC = arcCenter(arcP1, arcP2);
                        var r = CktoCp(CsubC(R2toC(this.args.transform(d.parent)), arcC.c)).r * this.args.radius;
                        var d2SvglargeArcFlag = arcC.d > 0 ? '1' : '0';
                        if (isNaN(r))
                            r = 0;
                        var s = this.t(d);
                        var e = this.t(d.parent);
                        return "M" + s + " A " + r + " " + r + ", 0, 0, " + d2SvglargeArcFlag + ", " + e;
                    });
                    this.args = args;
                    var mainGroup = svg.append('g')
                        .attr("class", "unitDisc" + (args.opacity ? "Param" : ""))
                        .attr("transform", "translate(" + args.pos + ")");
                    var unitDiscBg = mainGroup.append('circle')
                        .attr("class", "unitDiscBg")
                        .attr("r", args.radius)
                        .attr("fill-opacity", args.opacity)
                        .on("click", function () {
                        var mouseArr = ArrDivR(d3.mouse(this), args.radius);
                        args.onClick(ArrtoR2(mouseArr));
                    })
                        .call(d3.drag()
                        .on("start", () => { args.onDragStart(this.ti(d3.event)); this.captions.text(d => ""); })
                        .on("drag", () => args.onDrag(this.ti(d3.event)))
                        .on("end", () => this.captions.call(this.updateText)));
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
                create() {
                    this.nodes = this.nodeLayer.selectAll(".node")
                        .data(dfsFlat(this.args.data, n => true))
                        .enter().append("g")
                        .attr("class", "node")
                        .call(this.updateNode);
                    this.nodes.append("circle")
                        .attr("r", this.args.nodeRadius);
                    if (this.args.caption)
                        this.captions = this.nodes.append("text")
                            .call(this.updateText);
                    this.arcs = this.arcLayer.selectAll(".arc")
                        .data(dfsFlat(this.args.data, n => n.parent))
                        .enter().append("path")
                        .attr("class", "arc")
                        .call(this.updateArc);
                }
                update() {
                    this.nodes.call(this.updateNode);
                    this.arcs.call(this.updateArc);
                }
            }
            D3.UnitDiskD3 = UnitDiskD3;
        })(D3 = ui.D3 || (ui.D3 = {}));
    })(ui = ivis.ui || (ivis.ui = {}));
})(ivis || (ivis = {}));
