namespace ivis.controller
{
    var slideNr = -1
    var slides = [
        { ds:'ToL',          ls:'layoutBergé',       name:"Tree of Life Carnivores" },
        { ds:'code',         ls:'layoutBergé',       name:"Code (modules)" },
        { ds:'fileXml',      ls:'layoutBuchheim',    name:"data from file" },
        { ds:'nTree',        ls:'layoutBergé',       name:"Wedge layout" },
        { ds:'d3csvFlare',   ls:'layoutBuchheim',    name:"Point transformation seems to work" },
        { ds:'nTree',        ls:'layoutBuchheim',    name:"Full tree. Nodes on unit circle. |Tree| = 2⁸ -1 = 124" },        
        { ds:'star_(5)',     ls:'layoutUnitVectors', name:"Unit vectors " },
        { ds:'deepStar',     ls:'layoutUnitLines',   name:"Unit lines" },
        { ds:'star_(50)',    ls:'layoutSpiral',      name:"Star spiral" },
        { ds:'path_(50)',    ls:'layoutSpiral',      name:"Path spiral" },        
        { ds:'path_(500)',   ls:'layoutSpiral',      name:"Hypnotoad. 1000 nodes" },
        { ds:'nTreeAtFirst', ls:'layoutBuchheim',    name:"Center is never magnified" },
    ]

    export var slide = {
        initUi:null,
        unitDisk:null,
        loader:null,
        layout:null,
        arc:null,
        captions:null,
        weight:null,
    }

    export function init()
    {
        var rendererOptions = ['D3', 'Plexx', 'PlexxDbg']
        var loaderOptions = [
            { text:"flare.csv (d3)", value:"d3csvFlare",         },
            { text:"sample.xml",     value:"fileXml",            },
            { text:"sample.json",    value:"fileJson",           },
            { text:"Tree of life",   value:"ToL",                },
            { text:"Modules",        value:"code",               },
            { text:"⋆ Star 1+4",     value:"star_(5)",           },            
            { text:"⋆ Star 1+50",    value:"star_(50)",          },
            { text:"⋆ Star 1+500",   value:"star_(500)",         },
            { text:"⋆ Star 4✕50",    value:"deepStar",           },
            { text:"⊶ Path 50",     value:"path_(50)",          },
            { text:"⊶ Path 500",    value:"path_(500)",         },
            { text:"⊶ Path 5000",   value:"path_(5000)",        },
            { text:"𝕋 5³ -1",        value:"nTree",              },
            { text:"𝕋 1+10✕10",      value:"nTreeAtFirst",       },
            { text:"User Uploaded",  value:"userUploaded",       },
        ]
        var layoutOptions = [
            { text:"Bergé at al.",    value:"layoutBergé",       },
            { text:"Lamping at al.",  value:"layoutLamping",     },
            { text:"Buchheim et al.", value:"layoutBuchheim",    },
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

        var weightOptions = [
            { text:"Child count",     value:"d=>1",              },
            { text:"Leaf count",      value:"d=>d.children?0:1"  },
            { text:"Non",             value:"d=>0",              },
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

        d3.select('#weightSelect')
            .on('change', ()=> setWeight(d3.event.target.value))
            .selectAll('option')
            .data(weightOptions)
            .enter().append('option')
                .attr('value', d=> d.value)
                .text(d=> d.text)

        var rendererSelect   = <HTMLInputElement>document.getElementById("rendererSelect")
        var arcSelect        = <HTMLInputElement>document.getElementById("arcSelect")
        var captionSelect    = <HTMLInputElement>document.getElementById("captionSelect")
        var weightSelect     = <HTMLInputElement>document.getElementById("weightSelect")

        document.querySelector('#userfile').addEventListener('change', function(e) {
            console.log(this);
            var file = this.files[0];
            var fd = new FormData();
            fd.append("userfile", file);
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/fileupload', true);
            
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    let percentComplete = (e.loaded / e.total) * 100;
                    console.log(percentComplete + '% uploaded');
                }
            };

            xhr.onload = function() {
                if (this.status == 200) {
                    let resp = JSON.parse(this.response);
                    console.log('Server got:', resp);
                };
            };

            xhr.send(fd);
        }, false);
        
        slide.initUi = eval('ivis.ui.'+rendererSelect.value+'.init' + rendererSelect.value)
        slide.unitDisk = eval('ivis.ui.'+rendererSelect.value+'.UnitDisk' + rendererSelect.value)
        slide.arc = eval('ivis.ui.' + arcSelect.value)
        slide.captions = eval(captionSelect.value)
        slide.weight = eval(weightSelect.value)
        next(1)
    }

    export function next(d)
    {
        slideNr = slideNr + d + slides.length

        var newDs = slides[slideNr%slides.length].ds
        var newLs = slides[slideNr%slides.length].ls
        var newName = slides[slideNr%slides.length].name

        var dataSourceSelect = <HTMLInputElement>document.getElementById("dataSourceSelect")
        var layoutSelect     = <HTMLInputElement>document.getElementById("layoutSelect")

        dataSourceSelect.value = newDs
        layoutSelect.value = newLs
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
        ivis.controller.loadSlide()
    }

    function setDataSource(name, reset=true)
    {
        slide.loader = eval('ivis.model.loaders.'+name)
        if (reset) {
            resetDom()
            ivis.controller.loadSlide()
        }
    }

    function setLayout(name)
    {
        slide.layout = eval('ivis.model.layouts.'+name)
        resetDom()
        ivis.controller.loadSlide()
    }

    function setArc(name)
    {
        slide.arc = eval('ivis.ui.'+name)
        resetDom()
        ivis.controller.loadSlide()
    }

    function setCaption(name)
    {
        slide.captions = eval(name)
    }

    function setWeight(name)
    {
        slide.weight = eval(name)
        resetDom()
        ivis.controller.loadSlide()
    }

    function resetDom()
    {
        document.getElementById("ivis-canvas-div").innerText = ''
        document.getElementById("ivis-canvas-debug-panel").innerText = ''
    }
}
