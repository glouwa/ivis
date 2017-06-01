/**
 * Created by julian on 31.05.17.
 *
 * n is immer eine Node
 * s state. enthält pan position. später dann vermutlich theta und P
 * p is immer ein point
 * d wie immer bei d3
 * e is immer ein event arg. es gibt ja kein error handling
 */

//import * as d3 from "d3";

function dfs(n, fpre, fpost) {
    if (fpre)
        fpre(n)
    if (n.children)
        for (var i=0; i<n.children.length; i++)
            dfs(n.children[i], fpre, fpost)
    if (fpost)
        fpost(n)
}

function flat(n, f) {
    var r = []
    dfs(n, n=> { if(!f || f(n)) r.push(n) })
    return r
}

/*
 * R2 = { x:Number , y:Number }
 * R2-Arr = [ x, y ]
 */
var R2neg =   (p)=>       ({ x:-p.x,                           y:-p.y })
var R2mulR =  (p1, s)=>   ({ x:p1.x * s,                       y:p1.y * s })
var R2addR2 = (p1, p2)=>  ({ x:p1.x +p2.x,                     y:p1.y + p2.y })
var R2toArr = (p)=>       ([ p.x,                              p.y ])
var R2toC =   (p)=>       ({ re:p.x,                           im:p.y })

/*
 * C = { re:Number , im:Number }
 * C-Arr = [ re, im ]
 */
var Ccon =    (p)=>       ({ re:p.re,                          im:-p.im })
var CmulR =   (p1, s)=>   ({ re:p1.re * s,                     im:p1.im * s })
var CmulC =   (p1, p2)=>  ({ re:p1.re * p2.re - p1.im * p2.im, im:p1.im * p2.re + p1.re * p2.im })
var CaddC =   (p1, p2)=>  ({ re:p1.re + p2.re,                 im:p1.im + p2.im })
var CtoArr =  (p)=>       ([ p.re,                             p.im ])
var CtoR2 =   (p)=>       ({ x:p.re,                           y:p.im })

function HyperboicTree(args)
{
    args.dataloader(d3h=> {

        var data = args.layout(d3h) // data ok. calc init layout

        var s = { x:0, y:0 }    // common state. wird vermutlich mehr rein kommen. theta und P?
        function setS(ns) {
            s = ns
            nav.update()
            view.update()
        }

        var navR = 50           // create components
        var navbg = UnitDisk({
            r:2,
            radius:navR+5,            
            pos:[55+args.pos[0], 55+args.pos[1]],
            data:data,
            transform: n=> R2toArr(R2mulR(args.t(n, s), navR)),
            onS: s=>{}
        })
        var nav = UnitDisk({
            r:7,
            opacity:.8,
            radius:navR+5,            
            pos:[55+args.pos[0], 55+args.pos[1]],
            data:layoutAtCenter(oneNode),
            transform: n=> R2toArr(R2neg(R2mulR(args.t(n, s), navR))),
            onS: s=> setS(R2neg(s))
        })

        var viewR = 190
        var view = UnitDisk({
            r:7,
            radius:viewR+10,            
            pos:[240+args.pos[0], 240+args.pos[1]],
            data:data,
            transform: n=> R2toArr(R2mulR(args.t(n, s), viewR)),
            onS: s=> setS(s)
        })
    })
}

var initUi = null
var UnitDisk = null
var dataLoader = null
var layout = null

function init() {

    initUi()

    HyperboicTree({
        pos:[0,0],
        dataloader:dataLoader,
        layout:layoutRadial,
        t: (n,s)=> R2addR2(n,s) // simple paning. s = verschiebe vektor
    })

    HyperboicTree({
        pos:[550,0],
        dataloader:dataLoader,
        layout:layout,
        t: (n,s)=> R2addR2(n,s) // todo: return z prime = .. S.46 oder 47
    })
}

function resetDom()
{
    document.getElementById("ivis-canvas-div").innerText = ''
    document.getElementById("ivis-canvas-debug-panel").innerText = ''
}

function setRenderer(e)
{
    initUi = eval('init' + e.value)
    UnitDisk = eval('UnitDisk' + e.value)
    resetDom()
    init()
}

function setDataSource(e)
{
    dataLoader = eval(e.value)
    resetDom()
    init()
}

function setLayout(e)
{
    layout = eval(e.value)
    resetDom()
    init()
}

window.onload = function()
{
    initUi = eval('init' + document.getElementById("rendererSelect").value)
    UnitDisk = eval('UnitDisk' + document.getElementById("rendererSelect").value)
    dataLoader = eval(document.getElementById("dataSourceSelect").value)
    layout = eval(document.getElementById("layoutSelect").value)
    init()
}

