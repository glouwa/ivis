function layoutOneAtCenter(root) {
    root.x = 0;
    root.y = 0;
    return root;
}
function layoutDemo(root) {
    root.x = 0;
    root.y = 0;
    root.children[0].x = 1;
    root.children[0].y = 0;
    root.children[1].x = 0;
    root.children[1].y = 1;
    root.children[2].x = -1;
    root.children[2].y = 0;
    root.children[3].x = 0;
    root.children[3].y = -1;
    for (var i = 0; i < nrDn; i++) {
        a = i / nrDn * 2 * Math.PI; //+ 2*Math.PI/nrDn/2
        r = i / nrDn * 0.3 + 0.3;
        root.children[4 + i].x = r * Math.cos(a);
        root.children[4 + i].y = r * Math.sin(a);
    }
    return root;
}
function layoutRadial(root) {
    root = d3.tree().size([2 * Math.PI, 1])(root);
    visit(root, n => {
        var a = n.x - Math.PI / 2;
        n.x = n.y * Math.cos(a);
        n.y = n.y * Math.sin(a);
    });
    return root;
}
