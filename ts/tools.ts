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

window.onload = function()
{
    selectedInitUi = eval('init' + (<HTMLInputElement>document.getElementById("rendererSelect")).value)
    SelectedUnitDisk = eval('UnitDisk' + (<HTMLInputElement>document.getElementById("rendererSelect")).value)
    selectedDataLoader = eval((<HTMLInputElement>document.getElementById("dataSourceSelect")).value)
    selectedLayout = eval((<HTMLInputElement>document.getElementById("layoutSelect")).value)
    init()
}
