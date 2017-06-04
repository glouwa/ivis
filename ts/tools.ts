//----------------------------------------------------------------------------------------

/**
 * extendion interfaces
 */
type InitUiFunction = (args) => void
type LoaderFunction = (ok : (root:N) => void) => void
type LayoutFunction = (root : N) => N

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

//----------------------------------------------------------------------------------------

window.onload = function()
{
    selectedInitUi = eval('init' + (<HTMLInputElement>document.getElementById("rendererSelect")).value)
    next(1)
}

/**
 * extensions. set by html selects
 */
var selectedInitUi = null
var SelectedUnitDisk = null
var selectedDataLoader = null
var selectedLayout = null

function resetDom()
{
    document.getElementById("ivis-canvas-div").innerText = ''
    document.getElementById("ivis-canvas-debug-panel").innerText = ''
}

function setRenderer(name)
{
    selectedInitUi = eval('init' + name)
    SelectedUnitDisk = eval('UnitDisk' + name)
    resetDom()
    init()
}

function setDataSource(name, reset=true)
{
    selectedDataLoader = eval(name)
    if (reset) {
        resetDom()
        init()
    }
}

function setLayout(name)
{
    selectedLayout = eval(name)
    resetDom()
    init()
}

//----------------------------------------------------------------------------------------

var slide = -1
var slides = [
    { ds:'d3csvFlare',   ls:'layoutRadial',      name:"Left side: <b>z' = z-v</b> &emsp; Right side: <b>z' = h(z,θ,P)</b>" },
    { ds:'nTree',        ls:'layoutRadial',      name:"Nodes on unit circle. |Tree| = 5³ -1 = 124" },
    { ds:'star1',        ls:'layoutRadial',      name:"Unit vectors, almost" },
    { ds:'star1',        ls:'layoutUnitVectors', name:"Unit vectors" },
    { ds:'star2',        ls:'layoutSpiral',      name:"Star spiral" },
    { ds:'path1',        ls:'layoutSpiral',      name:"Path spiral" },
    { ds:'path1',        ls:'layoutRadial',      name:"Line from (0,0) to (1,1)" },
    { ds:'path2',        ls:'layoutSpiral',      name:"Hypnotoad. 1000 nodes" },
    { ds:'nTreeAtFirst', ls:'layoutRadial',      name:"Center is never magnified" }
]
function next(d)
{
    slide = slide + d + slides.length

    var newDs = slides[slide%slides.length].ds
    var newLs = slides[slide%slides.length].ls
    var newName = slides[slide%slides.length].name

    document.getElementById("dataSourceSelect").value = newDs
    document.getElementById("layoutSelect").value = newLs
    document.getElementById('slideName').innerHTML = newName
    setDataSource(newDs, false)
    setLayout(newLs)
}

