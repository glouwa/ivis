var svg = null;
function initD3(args) {
    svg = d3.select("#ivis-canvas-div")
        .append('svg')
        .attr("width", "1000")
        .attr("height", "500");
}
function UnitDiskD3(args) {
    var plexxObj = svg.append('g')
        .attr("transform", "translate(" + args.pos + ")");
    var unitDiscBg = plexxObj.append('circle')
        .attr("class", "unitDiscBg")
        .attr("r", args.radius)
        .attr("fill-opacity", args.opacity)
        .call(d3.drag()
        .on("drag", d => args.onS({ x: d3.event.x / args.radius, y: d3.event.y / args.radius })));
    var linkLayer = plexxObj.append('g');
    var nodeLayer = plexxObj.append('g');
    plexxObj.data = args.data;
    plexxObj.update = function () {
        plexxObj.nodes
            .attr("cx", d => args.transform(d)[0])
            .attr("cy", d => args.transform(d)[1]);
        plexxObj.links
            .attr("d", d => "M " + args.transform(d) + " L " + args.transform(d.parent));
    };
    plexxObj.create = function () {
        plexxObj.nodes = nodeLayer.selectAll(".node")
            .data(flat(plexxObj.data, n => true))
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", args.r)
            .attr("cx", d => args.transform(d)[0])
            .attr("cy", d => args.transform(d)[1]);
        plexxObj.links = linkLayer.selectAll(".link")
            .data(flat(plexxObj.data, n => n.parent))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d => "M " + args.transform(d) + " L " + args.transform(d.parent));
    };
    plexxObj.create();
    return plexxObj;
}
