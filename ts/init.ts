/**
 * Created by julian on 31.05.17.
 *
 * n is immer eine Node
 * s state. enthält pan position. später dann vermutlich theta und P
 * p is immer ein point
 * d wie immer bei d3
 * e is immer ein event arg. es gibt ja kein error handling
 */

//----------------------------------------------------------------------------------------

/**
 * im wesentlichen von d3 übernommen
 */
interface N {
    id: string,
    parent: N,
    children: Array<N>,
    data: any,
    depth: 0,
    x: number,
    y: number
}

type LoaderFunction = (ok : (root:N) => void) => void
type LayoutFunction = (root : N) => N
type InitUiFunction = (args) => void

//----------------------------------------------------------------------------------------

/**
 * werden abhängig von den html selects gewählt
 */
var selectedInitUi = null
var SelectedUnitDisk = null
var selectedDataLoader = null
var selectedLayout = null

function init() {

    var uiRoot = selectedInitUi()

    new HyperbolicTree({
        parent:uiRoot,
        pos:[0,0],
        dataloader:selectedDataLoader,
        layout:layoutRadial,
        t: (n,s) => R2addR2(n,s) // simple paning. s = verschiebe vektor
    })

    new HyperbolicTree({
        parent:uiRoot,
        pos:[550,0],
        dataloader:selectedDataLoader,
        layout:selectedLayout,
        t: (n,s) => R2addR2(n,s) // todo: return z prime = .. S.46 oder 47
    })
}

//----------------------------------------------------------------------------------------

function dfs(n, fpre, fpost?) {
    if (fpre) fpre(n)
    if (n.children)
        for (var i=0; i<n.children.length; i++)
            dfs(n.children[i], fpre, fpost)

    if (fpost) fpost(n)
}

function flat(n, f?) {
    var r = []
    dfs(n, n=> { if(!f || f(n)) r.push(n) })
    return r
}

function resetDom()
{
    document.getElementById("ivis-canvas-div").innerText = ''
    document.getElementById("ivis-canvas-debug-panel").innerText = ''
}

function setRenderer(e)
{
    selectedInitUi = eval('init' + e.value)
    SelectedUnitDisk = eval('UnitDisk' + e.value)
    resetDom()
    init()
}

function setDataSource(e)
{
    selectedDataLoader = eval(e.value)
    resetDom()
    init()
}

function setLayout(e)
{
    selectedLayout = eval(e.value)
    resetDom()
    init()
}

//----------------------------------------------------------------------------------------

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

//----------------------------------------------------------------------------------------

window.onload = function()
{
    selectedInitUi = eval('init' + (<HTMLInputElement>document.getElementById("rendererSelect")).value)
    SelectedUnitDisk = eval('UnitDisk' + (<HTMLInputElement>document.getElementById("rendererSelect")).value)
    selectedDataLoader = eval((<HTMLInputElement>document.getElementById("dataSourceSelect")).value)
    selectedLayout = eval((<HTMLInputElement>document.getElementById("layoutSelect")).value)
    init()
}
