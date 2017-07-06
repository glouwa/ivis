var hidePan
namespace ivis.controller
{
    var slideNr = -1
    var slides_ = {}
    slides_.index = [
        { ds:"fromFile('carnivora-en.xml')", ls:'layoutBergé',       name:"Example treeml file<br><small>Tree of Life - Carnivores. |N| = 364</small>" },
        { ds:"fromFile('flare.csv')",        ls:'layoutBergé',       name:"Example csv file<br><small>D3 file format. |N| = 252</small>" },
        { ds:"fromFile('sample-skos.xml')",  ls:'layoutBergé',       name:"Example skos file (VERY SLOW)<br><small>|N| = 2405. USE λ = ~0.6 !</small>" },
        { ds:"nTreeAtFirst",                 ls:'layoutBergé',       name:"Deep path example<br><small>|N| = 101</small>" },
        { ds:"code",                         ls:'layoutBergé',       name:"Reflection <br><small>Namespaces and classes. |N| = 49</small>" },
        { ds:"nTree",                        ls:'layoutBergé',       name:"Balanced tree <br><small>|N| = 2⁷ -1 = 127</small>" },
        { ds:"nTree",                        ls:'layoutBuchheim',    name:"Balanced tree<br><small>Buchheim et al. layout. |N| = 2⁷ -1 = 127</small>" },
        { ds:"star_(5)",                     ls:'layoutUnitVectors', arc:"arc('0', '1')", name:"Unit vectors<br><small>|N| = 5</small>" },
        { ds:"deepStar",                     ls:'layoutUnitLines',   arc:"arc('0', '1')", name:"Unit lines<br><small>|N| = 125</small>" },
        { ds:"star_(50)",                    ls:'layoutSpiral',      name:"Ball feeling<br><small>Negative curvature</small>" },
        { ds:"star_(50)",                    ls:'layoutSpiral',      arc:"arc('0', '1')", name:"Ball feeling<br><small>Positive curvature</small>" },
        { ds:"path_(50)",                    ls:'layoutSpiral',      name:"Path spiral<br><small>|N| = 51</small>" },
        { ds:"path_(500)",                   ls:'layoutSpiral',      name:"Path spiral<br><small>|N| = 501</small>" },
    ]
    slides_.wiki = [
        { ds:"fromFile('carnivora-en.xml')", ls:'layoutBergé',       name:"Carnivora" },
        { ds:"fromFile('carnivora-de.xml')", ls:'layoutBergé',       name:"Raubtiere" },
        { ds:"fromFile('primates.xml')",     ls:'layoutBergé',       name:"Primates" },
        { ds:"fromFile('whales.xml')",       ls:'layoutBergé',       name:"Whales" },
        { ds:"fromFile('paarhufer.xml')",    ls:'layoutBergé',       name:"Paarhufer" },
        //{ ds:"fromFile('mammal.xml')",     ls:'layoutBergé',       name:"Mammals" },
    ]
    var slides = null

    export var slide = {
        initUi:null,
        unitDisk:null,
        loader:null,
        layout:null,
        arc:null,
        captions:null,
        weight:null,
        magic:null,
        space:null,
    }    

    export function init(s)
    {        
        slides = slides_[s]
        var rendererOptions = ['D3', 'Plexx', 'PlexxDbg']
        var loaderOptions = [
            { text:"flare.csv (d3)", value:"fromFile('flare.csv')"         },
            { text:"sample.xml",     value:"fromFile('sample.xml')"        },
            { text:"sample.json",    value:"fromFile('sample.json')"       },
            { text:"sample-skos.xml",value:"fromFile('sample-skos.xml')",  },
            { text:"Tree of life 1", value:"fromFile('carnivora-en.xml')"  },
            { text:"Tree of life 2", value:"fromFile('primates.xml')"      },
            { text:"Tree of life 3", value:"fromFile('placentalia.xml')"   },
            { text:"Modules",        value:"code",                         },
            { text:"⋆ Star 1+4",     value:"star_(5)",                     },
            { text:"⋆ Star 1+50",    value:"star_(50)",                    },
            { text:"⋆ Star 1+500",   value:"star_(500)",                   },
            { text:"⋆ Star 4✕30",    value:"deepStar",                     },
            { text:"⊶ Path 50",     value:"path_(50)",                    },
            { text:"⊶ Path 500",    value:"path_(500)",                   },
            { text:"⊶ Path 5000",   value:"path_(5000)",                  },
            { text:"𝕋 2⁷ -1",        value:"nTree",                        },
            { text:"𝕋 1+10✕10",      value:"nTreeAtFirst",                 },
            { text:"User Uploaded",  value:"fromFile('user-uploaded.xml')" },
        ]
        var spaceOptions = [
            { text:"Hyperbolic",      value:"HyperbolicTransformation", },
            { text:"Euclidean",       value:"PanTransformation",        },
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
            { text:"0.42",             value:".42",              },
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
            { text:"Negative curvature", value:"arc('1', '0')",  },
            { text:"Positive curvature", value:"arc('0', '1')",  },
            { text:"Strait line",        value:"arcLine",        },
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
                    .attr('value', (d:{value:string}) => d.value)
                    .text((d:{text:string}) => d.text)
        }

        buildCombo('#dataSourceSelect', loaderOptions,  ()=> setDataSource(d3.event.target.value))
        buildCombo('#spaceSelect',      spaceOptions,   ()=> setSpace(d3.event.target.value))
        buildCombo('#layoutSelect',     layoutOptions,  ()=> setLayout(d3.event.target.value))
        buildCombo('#weightSelect',     weightOptions,  ()=> setWeight(d3.event.target.value))
        buildCombo('#magicSelect',      magicOptions,   ()=> setMagic(d3.event.target.value))
        buildCombo('#arcSelect',        arcOptions,     ()=> setArc(d3.event.target.value))
        buildCombo('#captionSelect',    captionOptions, ()=> setCaption(d3.event.target.value))

        var rendererSelect   = <HTMLInputElement>document.getElementById("rendererSelect")
        var spaceSelect      = <HTMLInputElement>document.getElementById("spaceSelect")
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
        slide.space = eval('ivis.controller.'+spaceSelect.value)
        next(1)
    }

    export function next(d)
    {
        slideNr = slideNr + d + slides.length

        var newDs = slides[slideNr%slides.length].ds
        var newLs = slides[slideNr%slides.length].ls
        var newName = slides[slideNr%slides.length].name
        var newArc = slides[slideNr%slides.length].arc
                   ? slides[slideNr%slides.length].arc
                   : ("arc('1', '0')")

        var dataSourceSelect = <HTMLInputElement>document.getElementById("dataSourceSelect")
        var layoutSelect     = <HTMLInputElement>document.getElementById("layoutSelect")
        var arcSelect        = <HTMLInputElement>document.getElementById("arcSelect")

        dataSourceSelect.value = newDs
        layoutSelect.value = newLs
        arcSelect.value = newArc
        document.getElementById('slideName').innerHTML = newName

        slide.arc = eval('ivis.ui.'+arcSelect.value)
        slide.loader = eval('ivis.model.loaders.'+dataSourceSelect.value)
        slide.layout = eval('ivis.model.layouts.'+layoutSelect.value)
        ivis.controller.reCreate()
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

    function setDataSource(name)
    {
        slide.loader = eval('ivis.model.loaders.'+name)        
        ivis.controller.reCreate()
    }

    function setSpace(name)
    {
        slide.space = eval('ivis.controller.'+name)
        ivis.controller.reCreate()
    }

    function setLayout(name)
    {
        slide.layout = eval('ivis.model.layouts.'+name)        
        ivis.controller.reLayout()
    }

    function setWeight(name)
    {
        slide.weight = eval(name)
        ivis.controller.reLayout()
    }

    function setMagic(name)
    {
        slide.magic = eval(name)
        ivis.controller.reLayout()
    }

    function setArc(name)
    {
        slide.arc = eval('ivis.ui.'+name)        
        ivis.controller.reDraw()
    }

    function setCaption(name)
    {
        slide.captions = eval(name)
    }    
}
