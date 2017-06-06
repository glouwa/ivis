/**
 * Created by julian on 31.05.17.
 */

//----------------------------------------------------------------------------------------

/**
 * Node
 */
interface N {
    id:       string,
    parent:   N,
    children: Array<N>,
    data:     any,
    depth:    number,
    x:        number,
    y:        number,
    z:        C, // not used jet
    zprime:   C // not used jet
}

/**
 * Disk with Nodes and links
 */
interface TreeOnUnitDiskConfig
{
    parent:      any,
    data:        N,
    transform:   (n:N) => R2,
    onDragStart: (m:R2)  => void,
    onDrag:      (m:R2)  => void,

    pos:         [number, number],
    radius:      number,
    nodeRadius:  number,
    opacity?:    number,
    clip?:       boolean
}

/**
 * Contains a view disk an a navigation disc
 */
interface TreeWithNavigationConfig
{
    parent:      any,
    dataloader:  LoaderFunction,
    navData:     N,
    layout:      LayoutFunction,
    t:           (n:N) => R2
    onDragStart: (m:R2)  => void,
    onDrag:      (m:R2)  => void,
    //onDragθ:     (m:R2)  => void,

    pos:        [number, number],
    clip?:      boolean
}

//----------------------------------------------------------------------------------------

type R2 = { x:number, y:number }
type Ck = { re:number, im:number }
type Cp = { θ:number, r:number }
type C = Ck

var R2assignR2 = (a, b)=>        { a.x=b.x;                         a.y=b.y; }
var CassignR2 = (a, b)=>         { a.re=b.x;                        a.im=b.y; }


var R2neg =   (p:R2)=>           ({ x:-p.x,                         y:-p.y })
var R2mulR =  (p:R2, s:number)=> ({ x:p.x * s,                      y:p.y * s })
var R2divR =  (p:R2, s:number)=> ({ x:p.x / s,                      y:p.y / s })
var R2addR2 = (a:R2, b:R2)=>     ({ x:a.x + b.x,                    y:a.y + b.y })
var R2subR2 = (a:R2, b:R2)=>     ({ x:a.x - b.x,                    y:a.y - b.y })
var R2toArr = (p:R2)=>           ([ p.x,                            p.y ])
var R2toC =   (p:R2)=>           ({ re:p.x,                         im:p.y })

var Cneg =    (p:C)=>            ({ re:-p.re,                       im:-p.im })
var Ccon =    (p:C)=>            ({ re:p.re,                        im:-p.im })
var CmulR =   (p:C, s:number)=>  ({ re:p.re * s,                    im:p.im * s })
var CmulC =   (a:C, b:C)=>       ({ re:a.re * b.re - a.im * b.im,   im:a.im * b.re + a.re * b.im })
var CdivC =   (a:C, b:C)=>       ({ re:(a.re * b.re + a.im * b.im) / (b.re * b.re + b.im * b.im),
                                    im:(a.im * b.re - a.re * b.im) / (b.re * b.re + b.im * b.im)})
var CaddC =   (a:C, b:C)=>       ({ re:a.re + b.re,                 im:a.im + b.im })
var CaddR =   (a:C, s:number)=>  ({ re:a.re + s,                    im:a.im })
var CtoArr =  (p:C)=>            ([ p.re,                           p.im ])
var CtoR2 =   (p:C)=>            ({ x:p.re,                         y:p.im })

var CktoCp =   (k:Ck)=>          ({ θ:Math.atan2(k.im, k.re),       r:Math.sqrt(k.re*k.re + k.im*k.im) })
var CptoCk =   (p:Cp)=>          ({ re:p.r*Math.cos(p.θ),           im:p.r*Math.sin(p.θ) })

function ArrAddR(p:[number, number], s:number) : [number,number] { return [ p[0] + s, p[1] + s ] }

//----------------------------------------------------------------------------------------

/**
 * der graue kreis mit blauen punkten...
 * is hier aber nicht implementiert weils plexx und d3 gibt...
 *
 * see plexx and d3 implementations
 */
interface TreeOnUnitDisk
{
    update:() => void
}

/**
 * a viewdisk and a navigation disk together.
 * navdisk gets pan state as model
 */
class TreeWithNavigation
{
    args : TreeWithNavigationConfig
    data : N
    navData : N
    nav : TreeOnUnitDisk
    view : TreeOnUnitDisk

    constructor(args : TreeWithNavigationConfig)
    {
        this.args  = args        
        this.navData = args.navData,
        args.dataloader(d3h=> {
            this.data = args.layout(<N>d3.hierarchy(d3h)) // data ok. calc init layout
            this.create()
        })
    }

    update() : void
    {
        this.nav.update()
        this.view.update()
    }

    private create() : void
    {
        this.view = new SelectedUnitDisk({ // view disk
            data:        this.data,
            transform:   (n:N) => this.args.t(n),
            onDragStart: this.args.onDragStart,
            onDrag:      (m:R2) => this.args.onDrag(m),

            parent:      null,
            pos:         ArrAddR(this.args.pos, 240),
            radius:      200,
            nodeRadius:  7,
            clip:        this.args.clip
        })

        var navR = 55
        var navbg = new SelectedUnitDisk({ // navigation disk background
            data:        this.data,
            transform:   (n:N) => n,
            onDragStart: (m:R2) => {},
            onDrag:      (m:R2) => {},

            parent:      null,
            pos:         ArrAddR(this.args.pos, navR),
            radius:      navR,
            nodeRadius:  2,
            clip:        true
        })

        this.nav = new SelectedUnitDisk({ // navigation disk with transformation parameters as nodes
            data:        this.navData,
            transform:   (n:N) => (n),
            onDragStart: this.args.onDragStart,
            onDrag:      (m:R2) => this.args.onDrag((m)),

            parent:      null,
            pos:         ArrAddR(this.args.pos, navR),
            opacity:     .8,
            radius:      navR,
            nodeRadius:  7,
            clip:        false
        })        
    }
}

//----------------------------------------------------------------------------------------

var one = { re:1, im:0 }
var o = { v:{ x:0, y:0 } }
var h = { P:{ re:0, im:0 }, θ:one }

/**
 * create a euclidien and a hyperbolic tree view
 * same data
 * same initial layout
 * different states and
 */
function init() {

    var uiRoot = selectedInitUi()
    var dSP = null  // drag start point
    var dSTo = null // drag start transformation offset
    var dSTh = null // drag start transformation hyperbolic origin preseving

    var offsetTwn = new TreeWithNavigation({
        dataloader:  selectedDataLoader,
        navData:     obj2data(o, x=>x),
        layout:      selectedLayout,
        t:           (n:N) => R2addR2(n, o.v),
        onDragStart: (p:R2) => {
                          dSP = p
                          dSTo = clone(o)
                          dSTh = clone(h)
                     },
        onDrag:      (m:R2) => {
                          var dragVector = R2subR2(m, dSP)
                          var newP = R2addR2(CtoR2(dSTh.P), dragVector)
                          var newV = R2addR2(dSTo.v, dragVector)

                          R2assignR2(h.P, newP) // x,y wird als position der nac nodes verwendet
                          CassignR2(h.P, newP)  // re,im als parameter für die transformation
                          R2assignR2(o.v, newV)
                          offsetTwn.update()
                          hyperbolicTwn.update()
                     },
        parent:      uiRoot,
        pos:         [25,30],
        clip:        true
    })

    var hyperbolicTwn = new TreeWithNavigation({
        dataloader:  selectedDataLoader,
        navData:     obj2data(h, x=>CtoR2(x)),
        layout:      selectedLayout,
        t:           (n:N) => CtoR2(h2e(R2toC(n), h.P, h.θ)),
        onDragStart: (p:R2) => {
                          dSP = p
                          dSTo = clone(o)
                          dSTh = clone(h)
                     },
        onDrag:      (m:R2) => {
                          var dragVector = R2subR2(m, dSP)
                          var newP = R2addR2(CtoR2(dSTh.P), dragVector)
                          var newV = R2addR2(dSTo.v, dragVector)

                          R2assignR2(h.P, newP)
                          CassignR2(h.P, newP)
                          R2assignR2(o.v, newV)
                          offsetTwn.update()
                          hyperbolicTwn.update()
                     },
        parent:      uiRoot,
        pos:         [525,30],
    })
}

function h2e(z:C, P:C, θ:C) : C
{
    var oben = CaddC(CmulC(θ, z), P)
    var unten = CaddR(CmulC(CmulC(Ccon(P), θ), z), 1)
    var zprime = CdivC(oben, unten)
    if (isNaN(zprime.re) || isNaN(zprime.im)) {
        //console.warn("zprime is nan")
        zprime = { re:0, im:0 }
    }

    return zprime
}
function e2h(z:C, p:C, t:C) : C
{
    var pp = Cneg(CmulC(Ccon(t), p))
    var tp = Ccon(t)
    return h2e(z, pp, tp)
}

function compose(P1:C, θ1:C, P2:C, θ2:C)
{
    var divisor = CaddC(CmulC(θ2, CmulC(P1, Ccon(P2))), one)
    return {
        P:CdivC(CaddC(CmulC(θ2, P1), P2), divisor),
        θ:CdivC(CaddC(CmulC(θ1, θ2), CmulC(θ1, CmulC(Ccon(P1), P2))), divisor)
    }
}

function shift(s:C, e:C, P:C)
{
    //var a = e2h(s, Cneg(P))
    return compose()
}


function clone(o)
{
    return JSON.parse(JSON.stringify(o))
}
