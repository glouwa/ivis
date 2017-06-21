namespace ivis.controller
{
    var slideNr = -1
    var slides = [
        { ds:'code',         ls:'layoutRadial',      name:"Code (modules)" },
        { ds:'file',     ls:'layoutRadial',      name:"data from file" },
        //{ ds:'code',         ls:'layoutRadial',      name:"viewmodel " },
        { ds:'nTree',        ls:'layoutHyperbolic',  name:"Wedge layout" },
        { ds:'d3csvFlare',   ls:'layoutRadial',      name:"Point transformation seems to work" },
        { ds:'nTree',        ls:'layoutRadial',      name:"Full tree. Nodes on unit circle. |Tree| = 2⁸ -1 = 124" },
        { ds:'star_(5)',     ls:'layoutRadial',      name:"Unit vectors, almost" },
        { ds:'star_(5)',     ls:'layoutUnitVectors', name:"Unit vectors " },
        { ds:'deepStar',     ls:'layoutUnitLines',   name:"Unit lines" },
        { ds:'star_(50)',    ls:'layoutSpiral',      name:"Star spiral" },
        { ds:'path_(50)',    ls:'layoutSpiral',      name:"Path spiral" },
        { ds:'path_(50)',    ls:'layoutRadial',      name:"Line from [0,0] to [1,1]" },
        { ds:'path_(500)',   ls:'layoutSpiral',      name:"Hypnotoad. 1000 nodes" },
        { ds:'nTreeAtFirst', ls:'layoutRadial',      name:"Center is never magnified" },
    ]

    export var slide = {
        initUi:null,
        unitDisk:null,
        loader:null,
        layout:null,
        arc:null,
        captions:null,
    }

    export function init()
    {
        var rendererOptions = ['D3', 'Plexx', 'PlexxDbg']
        var loaderOptions = [
            { text:"flare.csv (d3)", value:"d3csvFlare",         },
            { text:"data from file", value:"file",               },
            { text:"Code",           value:"code",               },
            { text:"⋆ Star 1+4",     value:"star_(5)",           },            
            { text:"⋆ Star 1+50",    value:"star_(50)",          },
            { text:"⋆ Star 1+500",   value:"star_(500)",         },
            { text:"⋆ Star 4✕50",    value:"deepStar",           },
            { text:"⊶ Path 50",     value:"path_(50)",          },
            { text:"⊶ Path 500",    value:"path_(500)",         },
            { text:"⊶ Path 5000",   value:"path_(5000)",        },
            { text:"𝕋 5³ -1",        value:"nTree",              },
            { text:"𝕋 1+10✕10",      value:"nTreeAtFirst",       },
        ]
        var layoutOptions = [
            { text:"Lamping at al.",  value:"layoutHyperbolic",  },
            { text:"Buchheim et al.", value:"layoutRadial",      },
            { text:"DFS spiral",      value:"layoutSpiral",      },
            { text:"Unit vectors",    value:"layoutUnitVectors", },
            { text:"Unit lines",      value:"layoutUnitLines",   },
        ]
        var arcOptions = [
            { text:"+Arc",            value:"arc('0', '1')",     },
            { text:"-Arc",            value:"arc('1', '0')",     },
            { text:"Line",            value:"arcLine",           },
        ]
        var captionOptions = [
            { text:"hide on drag",    value:"true",              },
            { text:"show always",     value:"false",             },
        ]

        d3.select('#rendererSelect')
            .on('change', ()=> setRenderer(d3.event.target.value))
            .selectAll('option')
            .data(rendererOptions)
            .enter().append('option')
                .attr('value', d=> d)
                .text(d=> d)

        d3.select('#dataSourceSelect')
            .on('change', ()=> setDataSource(d3.event.target.value))
            .selectAll('option')
            .data(loaderOptions)
            .enter().append('option')
                .attr('value', d=> d.value)
                .text(d=> d.text)

        d3.select('#layoutSelect')
            .on('change', ()=> setLayout(d3.event.target.value))
            .selectAll('option')
            .data(layoutOptions)
            .enter().append('option')
                .attr('value', d=> d.value)
                .text(d=> d.text)

        d3.select('#arcSelect')
            .on('change', ()=> setArc(d3.event.target.value))
            .selectAll('option')
            .data(arcOptions)
            .enter().append('option')
                .attr('value', d=> d.value)
                .text(d=> d.text)

        d3.select('#captionSelect')
            .on('change', ()=> setCaption(d3.event.target.value))
            .selectAll('option')
            .data(captionOptions)
            .enter().append('option')
                .attr('value', d=> d.value)
                .text(d=> d.text)

        var name = (<HTMLInputElement>document.getElementById("rendererSelect")).value
        slide.initUi = eval('ivis.ui.'+name+'.init' + name)
        slide.unitDisk = eval('ivis.ui.'+name+'.UnitDisk' + name)

        var arcName = (<HTMLInputElement>document.getElementById("arcSelect")).value
        slide.arc = eval('ivis.ui.' + arcName)

        var captionName = (<HTMLInputElement>document.getElementById("captionSelect")).value
        slide.captions = eval(captionName)

        next(1)
    }

    export function next(d)
    {
        slideNr = slideNr + d + slides.length

        var newDs = slides[slideNr%slides.length].ds
        var newLs = slides[slideNr%slides.length].ls
        var newName = slides[slideNr%slides.length].name

        document.getElementById("dataSourceSelect").value = newDs
        document.getElementById("layoutSelect").value = newLs
        document.getElementById('slideName').innerHTML = newName
        setDataSource(newDs, false)
        setLayout(newLs)
    }

    //----------------------------------------------------------------------------------------

    function setRenderer(name)
    {
        var withoutDbg = name.endsWith("Dbg")?name.slice(0, -3):name
        var ns = 'ivis.ui.'+withoutDbg.toLowerCase()+'.'
        var initUiName = ns+'init'+name
        var unitDiskName = ns+'UnitDisk'+withoutDbg

        slide.initUi = eval(initUiName)
        slide.unitDisk = eval(unitDiskName)

        resetDom()
        ivis.controller.loadHyperTree()
    }

    function setDataSource(name, reset=true)
    {
        slide.loader = eval('ivis.model.loaders.'+name)
        if (reset) {
            resetDom()
            ivis.controller.loadHyperTree()
        }
    }

    function setLayout(name)
    {
        slide.layout = eval('ivis.model.layouts.'+name)
        resetDom()
        ivis.controller.loadHyperTree()
    }

    function setArc(name)
    {
        slide.arc = eval('ivis.ui.'+name)
        resetDom()
        ivis.controller.loadHyperTree()
    }

    function setCaption(name)
    {
        slide.captions = eval(name)
    }

    function resetDom()
    {
        document.getElementById("ivis-canvas-div").innerText = ''
        document.getElementById("ivis-canvas-debug-panel").innerText = ''
    }
}
