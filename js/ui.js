var ivis;
(function (ivis) {
    var ui;
    (function (ui) {
        function arc(a, b) {
            return function (d) {
                var arcP1 = d.cache; //this.args.transform(d)
                var arcP2 = d.parent.cache; //this.args.transform(d.parent)
                var arcC = arcCenter(arcP1, arcP2);
                var r = CktoCp(CsubC(arcP2, arcC.c)).r;
                var d2SvglargeArcFlag = arcC.d > 0 ? a : b;
                if (isNaN(r))
                    r = 0;
                var s = d.strCache; //this.t(d)
                var e = d.parent.strCache; //this.t(d.parent)
                return "M" + s + " A " + r + " " + r + ", 0, 0, " + d2SvglargeArcFlag + ", " + e;
            };
        }
        ui.arc = arc;
        function arcLine(d) {
            var s = d.strCache; //this.t(d)
            var e = d.parent.strCache; //this.t(d.parent)
            return "M" + s + " L " + e;
        }
        ui.arcLine = arcLine;
        /*
            export abstract class UiNode
            {
                args: {
                    model: {},
                    transformation: {},
                    plexxCss : {}
                }
        
                constructor()
                {
                }
        
                updateModel() {}
                updateViewModel(sel:[string]) {}
        
                updateAll() {}
            }*/
    })(ui = ivis.ui || (ivis.ui = {}));
})(ivis || (ivis = {}));
