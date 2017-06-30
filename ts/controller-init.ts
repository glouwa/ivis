var hidePan
namespace ivis.controller
{
    var slideNr = -1
    var slides = [
        { ds:"fromFile('carnivora-de.xml')", ls:'layoutBergé',       name:"Tree of Life Carnivores" },
        { ds:"code",                         ls:'layoutBergé',       name:"Code (modules)" },
        { ds:"fromFile('sample.xml')",       ls:'layoutBuchheim',    name:"data from file" },
        { ds:"nTree",                        ls:'layoutBergé',       name:"Wedge layout" },
        { ds:"fromFile('flare.csv')",        ls:'layoutBuchheim',    name:"Point transformation seems to work" },
        { ds:"nTree",                        ls:'layoutBuchheim',    name:"Full tree. Nodes on unit circle. |Tree| = 2⁸ -1 = 124" },
        { ds:"star_(5)",                     ls:'layoutUnitVectors', name:"Unit vectors " },
        { ds:"deepStar",                     ls:'layoutUnitLines',   name:"Unit lines" },
        { ds:"star_(50)",                    ls:'layoutSpiral',      name:"Star spiral" },
        { ds:"path_(50)",                    ls:'layoutSpiral',      name:"Path spiral" },
        { ds:"path_(500)",                   ls:'layoutSpiral',      name:"Hypnotoad. 1000 nodes" },
        { ds:"nTreeAtFirst",                 ls:'layoutBuchheim',    name:"Center is never magnified" },
    ]

    export var slide = {
        initUi:null,
        unitDisk:null,
        loader:null,
        layout:null,
        arc:null,
        captions:null,
        weight:null,
        magic:null,
    }    
    export function init()
    {        
        var rendererOptions = ['D3', 'Plexx', 'PlexxDbg']
        var loaderOptions = [
            { text:"flare.csv (d3)", value:"fromFile('flare.csv')"         },
            { text:"sample.xml",     value:"fromFile('sample.xml')"        },
            { text:"sample.json",    value:"fromFile('sample.json')"       },
            { text:"sample-skos.xml",value:"fromFile('sample-skos.xml')",  },
            { text:"Tree of life 1", value:"fromFile('carnivora-de.xml')"  },
            { text:"Tree of life 2", value:"fromFile('primates.xml')"      },
            { text:"Tree of life 3", value:"fromFile('placentalia.xml')"   },
            { text:"Modules",        value:"code",                         },
            { text:"⋆ Star 1+4",     value:"star_(5)",                     },
            { text:"⋆ Star 1+50",    value:"star_(50)",                    },
            { text:"⋆ Star 1+500",   value:"star_(500)",                   },
            { text:"⋆ Star 4✕50",    value:"deepStar",                     },
            { text:"⊶ Path 50",     value:"path_(50)",                    },
            { text:"⊶ Path 500",    value:"path_(500)",                   },
            { text:"⊶ Path 5000",   value:"path_(5000)",                  },
            { text:"𝕋 5³ -1",        value:"nTree",                        },
            { text:"𝕋 1+10✕10",      value:"nTreeAtFirst",                 },
            { text:"User Uploaded",  value:"fromFile('user-uploaded.xml')" },
        ]
        var layoutOptions = [
            { text:"Bergé et al.",    value:"layoutBergé",       },
            { text:"Lamping et al.",  value:"layoutLamping",     },
            { text:"Buchheim et al.", value:"layoutBuchheim",    },
            { text:"DFS spiral",      value:"layoutSpiral",      },
            { text:"Unit vectors",    value:"layoutUnitVectors", },
            { text:"Unit lines",      value:"layoutUnitLines",   },
        ]
        var weightOptions = [
            { text:"Child count",     value:"d=>1",              },
            { text:"Leaf count",      value:"d=>d.children?0:1"  },
            { text:"Non",             value:"d=>0",              },
        ]
        var magicOptions = [
            { text:"0.5",              value:".5",               },
            { text:"0.1",              value:".1",               },
            { text:"0.2",              value:".2",               },
            { text:"0.3",              value:".3",               },
            { text:"0.4",              value:".4",               },
            { text:"0.5",              value:".5",               },
            { text:"0.6",              value:".6",               },
            { text:"0.7",              value:".7",               },
            { text:"0.8",              value:".8",               },
            { text:"0.9",              value:".9",               },
        ]
        var arcOptions = [            
            { text:"Negative",        value:"arc('1', '0')",     },
            { text:"Positive",        value:"arc('0', '1')",     },
            { text:"Strait line",     value:"arcLine",           },
        ]
        var captionOptions = [            
            { text:"Show always",     value:"false",             },
            { text:"Hide on drag",    value:"true",              },
        ]

        d3.select('#rendererSelect')
            .on('change', ()=> setRenderer(d3.event.target.value))
            .selectAll('option')
            .data(rendererOptions)
            .enter().append('option')
                .attr('value', d=> d)
                .text(d=> d)

        function buildCombo(selector, data, onChange)
        {
            d3.select(selector)
                .on('change', onChange)
                .selectAll('option')
                .data(data)
                .enter().append('option')
                    .attr('value', d=> d.value)
                    .text(d=> d.text)
        }

        buildCombo('#dataSourceSelect', loaderOptions,  ()=> setDataSource(d3.event.target.value))
        buildCombo('#layoutSelect',     layoutOptions,  ()=> setLayout(d3.event.target.value))
        buildCombo('#weightSelect',     weightOptions,  ()=> setWeight(d3.event.target.value))
        buildCombo('#magicSelect',      magicOptions,   ()=> setMagic(d3.event.target.value))
        buildCombo('#arcSelect',        arcOptions,     ()=> setArc(d3.event.target.value))
        buildCombo('#captionSelect',    captionOptions, ()=> setCaption(d3.event.target.value))

        var rendererSelect   = <HTMLInputElement>document.getElementById("rendererSelect")
        var arcSelect        = <HTMLInputElement>document.getElementById("arcSelect")
        var captionSelect    = <HTMLInputElement>document.getElementById("captionSelect")
        var weightSelect     = <HTMLInputElement>document.getElementById("weightSelect")
        var magicSelect      = <HTMLInputElement>document.getElementById("magicSelect")

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
                    var dataSourceSelect = <HTMLInputElement>document.getElementById("dataSourceSelect")
                    dataSourceSelect.value = "fromFile('user-uploaded.xml')"
                    setDataSource(dataSourceSelect.value)
                };
            };

            xhr.send(fd);
        }, false);
        
        slide.initUi = eval('ivis.ui.'+rendererSelect.value+'.init' + rendererSelect.value)
        slide.unitDisk = eval('ivis.ui.'+rendererSelect.value+'.UnitDisk' + rendererSelect.value)
        slide.arc = eval('ivis.ui.' + arcSelect.value)
        slide.captions = eval(captionSelect.value)
        slide.weight = eval(weightSelect.value)
        slide.magic = eval(magicSelect.value)
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
        var ns = 'ivis.ui.'+(withoutDbg=='D3'?withoutDbg:withoutDbg.toLowerCase())+'.'
        var initUiName = ns+'init'+name
        var unitDiskName = ns+'UnitDisk'+withoutDbg

        slide.initUi = eval(initUiName)
        slide.unitDisk = eval(unitDiskName)

        ivis.controller.reCreate()
    }

    function setDataSource(name, reset=true)
    {
        slide.loader = eval('ivis.model.loaders.'+name)
        if (reset)
            ivis.controller.reCreate()
    }

    function setLayout(name)
    {
        slide.layout = eval('ivis.model.layouts.'+name)        
        ivis.controller.reCreate()
    }

    function setArc(name)
    {
        slide.arc = eval('ivis.ui.'+name)        
        ivis.controller.reCreate()
    }

    function setCaption(name)
    {
        slide.captions = eval(name)
    }

    function setWeight(name)
    {
        slide.weight = eval(name)        
        ivis.controller.reCreate()
    }

    function setMagic(name)
    {
        slide.magic = eval(name)
        ivis.controller.reCreate()
    }
}
