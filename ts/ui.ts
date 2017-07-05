namespace ivis.ui
{
    /**
     * Disk with Nodes and links
     */
    export interface TreeOnUnitDiskConfig
    {
        parent:      any,
        class:       string,
        data:        N,
        transform:   (n:N) => C,
        transformR:  (n:N) => number
        onDragStart: (m:C, n:N) => void,
        onDrag:      (s:C, e:C, n:N) => void,
        onDragEnd:   () => void,
        onClick:     (m:C) => void,
        arc:         (n:N) => string,
        caption:     (n:N) => string,

        pos:         [number, number],
        radius:      number,
        nodeRadius:  number,        
        opacity?:    number,
        clip?:       boolean,
    }

    export interface TreeOnUnitDisk
    {
        args: TreeOnUnitDiskConfig,

        updatePositions:() => void,
        updateCaptions:(visible:boolean) => void,
    }

    export function arc(a, b) : (d) => string
    {
        return function(d) : string
        {
            var arcP1 = d.cache                             //this.args.transform(d)
            var arcP2 = d.parent.cache                      //this.args.transform(d.parent)
            var arcC = arcCenter(arcP1, arcP2)
            var r = CktoCp(CsubC(arcP2, arcC.c)).r
            var d2SvglargeArcFlag : string = arcC.d>0?a:b
            if (isNaN(r))
                r = 0
            var s = d.strCache                              //this.t(d)
            var e = d.parent.strCache                       //this.t(d.parent)
            return "M" +s+ " A " +r+ " " +r+ ", 0, 0, " + d2SvglargeArcFlag+ ", " +e
        }
    }

    export function arcLine(d)
    {
        var s = d.strCache                                  //this.t(d)
        var e = d.parent.strCache                           //this.t(d.parent)
        return "M" +s+ " L " +e
    }

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
}
