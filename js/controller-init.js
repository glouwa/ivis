var ivis;
(function (ivis) {
    var controller;
    (function (controller) {
        var slideNr = -1;
        var slides_ = {};
        slides_.index = [
            { ds: "code", ls: 'layoutBergé', name: "Reflection" },
            { ds: "fromFile('data/tolw/prod/carnivora-de.xml')", ls: 'layoutBergé', name: "Example treeml file" },
            { ds: "fromFile('data/flare.csv')", ls: 'layoutBergé', name: "Example csv file" },
            { ds: "nTreeAtFirst", ls: 'layoutBergé', name: "Deep path example" },
            { ds: "nTree", ls: 'layoutBergé', name: "Balanced tree" },
            { ds: "nTree", ls: 'layoutBuchheim', name: "Balanced tree" },
            { ds: "star_(5)", ls: 'layoutUnitVectors', arc: "arc('0', '1')", name: "Unit vectors" },
            { ds: "deepStar", ls: 'layoutUnitLines', arc: "arc('0', '1')", name: "Unit lines" },
            { ds: "star_(50)", ls: 'layoutSpiral', name: "Ball feeling" },
            { ds: "star_(50)", ls: 'layoutSpiral', arc: "arc('0', '1')", name: "Ball feeling" },
            { ds: "path_(50)", ls: 'layoutSpiral', name: "Path spiral" },
            { ds: "path_(500)", ls: 'layoutSpiral', name: "Path spiral" },
        ];
        slides_.wiki = [
            { ds: "fromFile('data/tolw/prod/carnivora-de.xml')", ls: 'layoutBergé', name: "Raubtiere" },
            { ds: "fromFile('data/tolw/prod/cetacea-de.xml')", ls: 'layoutBergé', name: "Whale" },
            { ds: "fromFile('data/tolw/prod/primates-de.xml')", ls: 'layoutBergé', name: "Primaten" },
            { ds: "fromFile('data/tolw/prod/perissodactyla-de.xml')", ls: 'layoutBergé', name: "Unpaarhufer" },
            { ds: "fromFile('data/tolw/prod/insectivora-de.xml')", ls: 'layoutBergé', name: "Insektenfresser" },
            { ds: "fromFile('data/tolw/prod/artiodactyla-de.xml')", ls: 'layoutBergé', name: "Paarhufer" },
            { ds: "fromFile('data/otol/prod/carnivora-de.d3.json')", ls: 'layoutBergé', name: "Raubtiere 2" },
            { ds: "fromFile('data/otol/prod/cetacea-de.d3.json')", ls: 'layoutBergé', name: "Whale 2" },
            { ds: "fromFile('data/otol/prod/cetartiodactyla-de.d3.json')", ls: 'layoutBergé', name: "Unpaarhufer 2" },
            { ds: "fromFile('data/otol/prod/primates-de.d3.json')", ls: 'layoutBergé', name: "Primaten 2" },
            { ds: "fromFile('data/otol/prod/rodentia-de.d3.json')", ls: 'layoutBergé', name: "Nagetiere 2" },
        ];
        var slides = null;
        controller.slide = {
            initUi: null,
            unitDisk: null,
            loader: null,
            layout: null,
            arc: null,
            captions: null,
            weight: null,
            magic: null,
            space: null,
        };
        function init(s) {
            slides = slides_[s];
            var rendererOptions = ['D3', 'Plexx', 'PlexxDbg'];
            var loaderOptions = [
                { text: "Modules", value: "code", },
                { text: "flare.csv (d3)", value: "fromFile('data/flare.csv')" },
                { text: "sample.xml", value: "fromFile('data/sample.xml')" },
                { text: "sample.json", value: "fromFile('data/sample.json')" },
                { text: "sample-skos.xml", value: "fromFile('data/sample.skos.xml')", },
                { text: "Tree of life 1", value: "fromFile('data/tolw/prod/carnivora-de.xml')", },
                { text: "Tree of life 2", value: "fromFile('data/tolw/prod/cetacea-de.xml')", },
                { text: "Tree of life 3", value: "fromFile('data/tolw/prod/primates-de.xml')", },
                { text: "Tree of life 4", value: "fromFile('data/tolw/prod/perissodactyla-de.xml')", },
                { text: "Tree of life 5", value: "fromFile('data/tolw/prod/insectivora-de.xml')", },
                { text: "Tree of life 6", value: "fromFile('data/tolw/prod/artiodactyla-de.xml')", },
                { text: "Tree of life 7", value: "fromFile('data/otol/prod/carnivora-de.d3.json')", },
                { text: "Tree of life 8", value: "fromFile('data/otol/prod/cetacea-de.d3.json')", },
                { text: "Tree of life 9", value: "fromFile('data/otol/prod/cetartiodactyla-de.d3.json')", },
                { text: "Tree of life 10", value: "fromFile('data/otol/prod/primates-de.d3.json')", },
                { text: "Tree of life 11", value: "fromFile('data/otol/prod/rodentia-de.d3.json')", },
                { text: "⋆ Star 1+4", value: "star_(5)", },
                { text: "⋆ Star 1+50", value: "star_(50)", },
                { text: "⋆ Star 1+500", value: "star_(500)", },
                { text: "⋆ Star 4✕30", value: "deepStar", },
                { text: "⊶ Path 50", value: "path_(50)", },
                { text: "⊶ Path 500", value: "path_(500)", },
                { text: "⊶ Path 5000", value: "path_(5000)", },
                { text: "𝕋 2⁷ -1", value: "nTree", },
                { text: "𝕋 1+10✕10", value: "nTreeAtFirst", },
                { text: "User Uploaded", value: "fromFile('data/upload/user-uploaded.xml')" },
            ];
            var spaceOptions = [
                { text: "Hyperbolic", value: "HyperbolicTransformation", },
                { text: "Euclidean", value: "PanTransformation", },
            ];
            var layoutOptions = [
                { text: "Bergé et al.", value: "layoutBergé", },
                { text: "Lamping et al.", value: "layoutLamping", },
                { text: "Buchheim et al.", value: "layoutBuchheim", },
                { text: "DFS spiral", value: "layoutSpiral", },
                { text: "Unit vectors", value: "layoutUnitVectors", },
                { text: "Unit lines", value: "layoutUnitLines", },
            ];
            var weightOptions = [
                { text: "Child count", value: "d=>1", },
                { text: "Leaf count", value: "d=>d.children?0:1" },
                { text: "Non", value: "d=>0", },
            ];
            var magicOptions = [
                { text: "0.42", value: ".42", },
                { text: "0.1", value: ".1", },
                { text: "0.2", value: ".2", },
                { text: "0.3", value: ".3", },
                { text: "0.4", value: ".4", },
                { text: "0.5", value: ".5", },
                { text: "0.6", value: ".6", },
                { text: "0.7", value: ".7", },
                { text: "0.8", value: ".8", },
                { text: "0.9", value: ".9", },
            ];
            var arcOptions = [
                { text: "Negative curvature", value: "arc('1', '0')", },
                { text: "Positive curvature", value: "arc('0', '1')", },
                { text: "Straight line", value: "arcLine", },
            ];
            var captionOptions = [
                { text: "Show always", value: "false", },
                { text: "Hide on drag", value: "true", },
            ];
            d3.select('#rendererSelect')
                .on('change', () => setRenderer(d3.event.target.value))
                .selectAll('option')
                .data(rendererOptions)
                .enter().append('option')
                .attr('value', d => d)
                .text(d => d);
            $('#rendererSelect').material_select();
            $('#rendererSelect').change(function () { setRenderer(this.value); });
            function buildCombo(selector, data, onChange) {
                d3.select(selector)
                    .on('change', () => onChange(d3.event.target.value))
                    .selectAll('option')
                    .data(data)
                    .enter().append('option')
                    .attr('value', (d) => d.value)
                    .text((d) => d.text);
                $(selector).material_select();
                $(selector).change(function () { onChange(this.value); });
            }
            var dataSourceSelect = buildCombo('#dataSourceSelect', loaderOptions, setDataSource);
            var spaceSelect = buildCombo('#spaceSelect', spaceOptions, setSpace);
            var layoutSelect = buildCombo('#layoutSelect', layoutOptions, setLayout);
            var weightSelect = buildCombo('#weightSelect', weightOptions, setWeight);
            var magicSelect = buildCombo('#magicSelect', magicOptions, setMagic);
            var arcSelect = buildCombo('#arcSelect', arcOptions, setArc);
            var captionSelect = buildCombo('#captionSelect', captionOptions, setCaption);
            var rendererSelect = document.getElementById("rendererSelect" + ``);
            var spaceSelect = document.getElementById("spaceSelect");
            var arcSelect = document.getElementById("arcSelect");
            var captionSelect = document.getElementById("captionSelect");
            var weightSelect = document.getElementById("weightSelect");
            var magicSelect = document.getElementById("magicSelect");
            document.getElementById('userfileControl').addEventListener('change', function (e) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/fileupload', true);
                xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable)
                        var percentComplete = (e.loaded / e.total) * 100;
                };
                xhr.onload = function () {
                    if (this.status == 200) {
                        $("#dataSourceSelect").val("fromFile('user-uploaded.xml')").material_select();
                        setDataSource($("#dataSourceSelect").val());
                    }
                };
                var fd = new FormData();
                fd.append("userfile", document.getElementById('userfile').files[0]);
                xhr.send(fd);
            }, false);
            //$('.carousel').carousel({indicators: true, dist:-300})
            $('.dropdown-button').dropdown({
                inDuration: 300,
                outDuration: 225,
                constrainWidth: false,
                hover: false,
                gutter: 0,
                belowOrigin: true,
                alignment: 'right',
                stopPropagation: false // Stops event propagation
            });
            controller.slide.initUi = eval('ivis.ui.' + rendererSelect.value + '.init' + rendererSelect.value);
            controller.slide.unitDisk = eval('ivis.ui.' + rendererSelect.value + '.UnitDisk' + rendererSelect.value);
            controller.slide.arc = eval('ivis.ui.' + arcSelect.value);
            controller.slide.captions = eval(captionSelect.value);
            controller.slide.weight = eval(weightSelect.value);
            controller.slide.magic = eval(magicSelect.value);
            controller.slide.space = eval('ivis.controller.' + spaceSelect.value);
            next(1);
        }
        controller.init = init;
        function next(d) {
            slideNr = slideNr + d + slides.length;
            var newDs = slides[slideNr % slides.length].ds;
            var newLs = slides[slideNr % slides.length].ls;
            var newName = slides[slideNr % slides.length].name;
            var newArc = slides[slideNr % slides.length].arc
                ? slides[slideNr % slides.length].arc
                : ("arc('1', '0')");
            $("#dataSourceSelect").val(newDs).material_select();
            $("#layoutSelect").val(newLs).material_select();
            $("#arcSelect").val(newArc).material_select();
            document.getElementById('slideName').innerHTML = newName;
            controller.slide.arc = eval('ivis.ui.' + newArc);
            controller.slide.loader = eval('ivis.model.loaders.' + newDs);
            controller.slide.layout = eval('ivis.model.layouts.' + newLs);
            ivis.controller.reCreate();
        }
        controller.next = next;
        //----------------------------------------------------------------------------------------
        function setRenderer(name) {
            var withoutDbg = name.endsWith("Dbg") ? name.slice(0, -3) : name;
            var ns = 'ivis.ui.' + (withoutDbg == 'D3' ? withoutDbg : withoutDbg.toLowerCase()) + '.';
            var initUiName = ns + 'init' + name;
            var unitDiskName = ns + 'UnitDisk' + withoutDbg;
            controller.slide.initUi = eval(initUiName);
            controller.slide.unitDisk = eval(unitDiskName);
            ivis.controller.reCreate();
        }
        function setDataSource(name) {
            controller.slide.loader = eval('ivis.model.loaders.' + name);
            ivis.controller.reCreate();
        }
        function setSpace(name) {
            controller.slide.space = eval('ivis.controller.' + name);
            ivis.controller.reCreate();
        }
        function setLayout(name) {
            controller.slide.layout = eval('ivis.model.layouts.' + name);
            ivis.controller.reLayout();
        }
        function setWeight(name) {
            controller.slide.weight = eval(name);
            ivis.controller.reLayout();
        }
        function setMagic(name) {
            controller.slide.magic = eval(name);
            ivis.controller.reLayout();
        }
        function setArc(name) {
            controller.slide.arc = eval('ivis.ui.' + name);
            ivis.controller.reDraw();
        }
        function setCaption(name) {
            controller.slide.captions = eval(name);
        }
    })(controller = ivis.controller || (ivis.controller = {}));
})(ivis || (ivis = {}));
