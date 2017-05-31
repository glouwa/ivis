var svg = d3.select("#map-austria");
function UnitDisk(args) {
    var plexxObj = svg.append('g')
        .attr("transform", "translate(" + args.pos + ")");
    var unitDiscBg = plexxObj.append('circle')
        .attr("r", args.radius)
        .attr("fill", "#f9fbe7")
        .attr("fill-opacity", args.opacity)
        .call(d3.drag()
        .on("drag", d => args.onZ([d3.event.x / args.radius, d3.event.y / args.radius])));
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
            .attr("fill", "#90caf9")
            .attr("fill-opacity", .8)
            .attr("pointer-events", 'none')
            .attr("stroke", "#777")
            .attr("cx", d => args.transform(d)[0])
            .attr("cy", d => args.transform(d)[1]);
        plexxObj.links = linkLayer.selectAll(".link")
            .data(flat(plexxObj.data, n => n.parent))
            .enter().append("path")
            .attr("class", "link")
            .attr("pointer-events", 'none')
            .attr("stroke", "gray")
            .attr("d", d => "M " + args.transform(d) + " L " + args.transform(d.parent));
    };
    plexxObj.create();
    return plexxObj;
}
