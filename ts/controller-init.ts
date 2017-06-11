window.onload = function()
{
    var name = (<HTMLInputElement>document.getElementById("rendererSelect")).value

    selectedInitUi = eval('ivis.ui.'+name+'.init' + name)
    SelectedUnitDisk = eval('ivis.ui.'+name+'.UnitDisk' + name)
    next(1)
}

namespace ivis.controller {
    export var runtimeRoot = {
    }
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
    selectedInitUi = eval('ivis.ui.'+name+'.init' + name)

    if (name.endsWith("Dbg")) name = name.slice(0, -3)
    SelectedUnitDisk = eval('UnitDisk' + name)
    resetDom()
    ivis.controller.init()
}

function setDataSource(name, reset=true)
{
    selectedDataLoader = eval('ivis.loaders.'+name)
    if (reset) {
        resetDom()
        ivis.controller.init()
    }
}

function setLayout(name)
{
    selectedLayout = eval('ivis.layouts.'+name)
    resetDom()
    ivis.controller.init()
}

//----------------------------------------------------------------------------------------

var slide = -1
var slides = [
    { ds:'jsonFile',     ls:'layoutRadial',      name:"data from json" },
    { ds:'code',         ls:'layoutRadial',      name:"Code (modules)" },
    { ds:'code',         ls:'layoutRadial',      name:"Code (class hierarchy)" },
    { ds:'code',         ls:'layoutRadial',      name:"viewmodel " },
    { ds:'nTree',        ls:'layoutHyperbolic',  name:"Wedge layout" },
    { ds:'d3csvFlare',   ls:'layoutRadial',      name:"Point transformation seems to work" },
    { ds:'nTree',        ls:'layoutRadial',      name:"Full tree. Nodes on unit circle. |Tree| = 5³ -1 = 124" },
    { ds:'star1',        ls:'layoutRadial',      name:"Unit vectors, almost" },
    { ds:'star1',        ls:'layoutUnitVectors', name:"Unit vectors " },
    { ds:'deepStar',     ls:'layoutUnitLines',   name:"Unit lines" },
    { ds:'star2',        ls:'layoutSpiral',      name:"Star spiral" },
    { ds:'path1',        ls:'layoutSpiral',      name:"Path spiral" },
    { ds:'path1',        ls:'layoutRadial',      name:"Line from [0,0] to [1,1]" },
    { ds:'path2',        ls:'layoutSpiral',      name:"Hypnotoad. 1000 nodes" },
    { ds:'nTreeAtFirst', ls:'layoutRadial',      name:"Center is never magnified" },

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

