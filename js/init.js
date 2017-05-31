/**
 * Created by julian on 31.05.17.
 */
function dfs(n, fpre, fpost) {
    if (fpre)
        fpre(n);
    if (n.children)
        for (var i = 0; i < n.children.length; i++)
            dfs(n.children[i], fpre, fpost);
    if (fpost)
        fpost(n);
}
function flat(n, f) {
    var r = [];
    dfs(n, n => { if (!f || f(n))
        r.push(n); });
    return r;
}
function R2inv(p) { return { x: -p.x, y: -p.y }; }
function R2mulR(p1, s) { return { x: p1.x * s, y: p1.y * s }; }
function R2addR2(p1, p2) { return { x: p1.x + p2.x, y: p1.y + p2.y }; }
function R2toC(p) { return { re: p.x, im: p.y }; }
function R2toArr(p) { return [p.x, p.y]; }
function Cinv(p) { return { re: -p.re, im: -p.im }; }
function CmulR(p1, s) { return { re: p1.re * s, im: p1.im * s }; }
function CaddC(p1, p2) { return { re: p1.re + p2.re, im: p1.im + p2.im }; }
function CtoR2(p) { return { x: p.re, y: p.im }; }
function CtoArr(p) { return [p.re, p.im]; }
function HyperboicTree(args) {
    args.dataloader(d3h => {
        data = args.layout(d3h); // data ok. calc init layout
        var z = { x: 0, y: 0 }; // common state
        function setz(nz) {
            z = nz;
            nav.update();
            view.update();
        }
        var navR = 50; // create components
        var navbg = UnitDisk({
            r: 2,
            radius: navR + 5,
            pos: [55 + args.pos[0], 55 + args.pos[1]],
            data: data,
            transform: p => R2toArr(R2mulR(args.t(p, z), navR)),
            onZ: p => { }
        });
        var nav = UnitDisk({
            r: 7,
            opacity: .8,
            radius: navR + 5,
            pos: [55 + args.pos[0], 55 + args.pos[1]],
            data: layoutAtCenter(oneNode),
            transform: p => R2toArr(R2inv(R2mulR(args.t(p, z), navR))),
            onZ: p => setz(R2inv(p))
        });
        var viewR = 190;
        var view = UnitDisk({
            r: 7,
            radius: viewR + 10,
            pos: [240 + args.pos[0], 240 + args.pos[1]],
            data: data,
            transform: p => R2toArr(R2mulR(args.t(p, z), viewR)),
            onZ: p => setz(p)
        });
    });
}
var initUi = null;
var UnitDisk = null;
var dataLoader = null;
var layout = null;
function init() {
    initUi();
    HyperboicTree({
        pos: [0, 0],
        dataloader: dataLoader,
        layout: layoutRadial,
        t: (p, z) => R2addR2(p, z)
    });
    HyperboicTree({
        pos: [550, 0],
        dataloader: dataLoader,
        layout: layout,
        t: (p, z) => R2addR2(p, z)
    });
}
function setRenderer(e) {
    initUi = eval('init' + e.value);
    UnitDisk = eval('UnitDisk' + e.value);
    document.getElementById("ivis-canvas-div").innerText = '';
    document.getElementById("ivis-canvas-debug-panel").innerText = '';
    init();
}
function setDataSource(e) {
    dataLoader = eval(e.value);
    document.getElementById("ivis-canvas-div").innerText = '';
    document.getElementById("ivis-canvas-debug-panel").innerText = '';
    init();
}
function setLayout(e) {
    layout = eval(e.value);
    document.getElementById("ivis-canvas-div").innerText = '';
    document.getElementById("ivis-canvas-debug-panel").innerText = '';
    init();
}
window.onload = function () {
    initUi = eval('init' + document.getElementById("rendererSelect").value);
    UnitDisk = eval('UnitDisk' + document.getElementById("rendererSelect").value);
    dataLoader = eval(document.getElementById("dataSourceSelect").value);
    layout = eval(document.getElementById("layoutSelect").value);
    init();
};
