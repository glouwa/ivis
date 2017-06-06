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
var CsubC =   (a:C, b:C)=>       ({ re:a.re - b.re,                 im:a.im - b.im })
var CaddR =   (a:C, s:number)=>  ({ re:a.re + s,                    im:a.im })
var CtoArr =  (p:C)=>            ([ p.re,                           p.im ])
var CtoR2 =   (p:C)=>            ({ x:p.re,                         y:p.im })

var CktoCp =  (k:Ck)=>           ({ θ:Math.atan2(k.im, k.re),       r:Math.sqrt(k.re*k.re + k.im*k.im) })
var CptoCk =  (p:Cp)=>           ({ re:p.r*Math.cos(p.θ),           im:p.r*Math.sin(p.θ) })

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

interface T { P:C, θ:C }
function makeT(a, b) { return { P:a, θ:b }}

var one = { re:1, im:0 }
var o = { v:{ x:0, y:0 } }
var h:T = { P:{ re:0, im:0 }, θ:one }

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
        t:           (n:N) => CtoR2(h2e(h, R2toC(n))),
        onDragStart: (p:R2) => {
                          dSP = p
                          dSTo = clone(o)
                          dSTh = clone(h)
                     },
        onDrag:      (m:R2) => {

                          var newT = compose(dSTh, shift(R2toC(dSP), R2toC(m)))
                          var newP = CtoR2(newT.P)
                          var newV = CtoR2(newT.P)

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

function h2e(t:T, z:C) : C
{
    var oben = CaddC(CmulC(t.θ, z), t.P)
    var unten = CaddR(CmulC(CmulC(Ccon(t.P), t.θ), z), 1)
    var zprime = CdivC(oben, unten)
    if (isNaN(zprime.re) || isNaN(zprime.im)) {
        //console.warn("zprime is nan")
        zprime = { re:0, im:0 }
    }

    return zprime
}

function e2h(t:T, z:C) : C
{
    var θ = Cneg(CmulC(Ccon(t.θ), t.P))
    var P = Ccon(t.θ)
    return h2e(makeT(P, θ), z)
}

function compose(t1:T, t2:T) : T
{
    var divisor = CaddC(CmulC(t2.θ, CmulC(t1.P, Ccon(t2.P))), one)
    return ({
        P: CdivC(CaddC(CmulC(t2.θ, t1.P), t2.P), divisor),
        θ: CdivC(CaddC(CmulC(t1.θ, t2.θ), CmulC(t1.θ, CmulC(Ccon(t1.P), t2.P))), divisor)
    })
}

function shift(s:C, e:C)
{
    var p = h2e(h, { re:0, im:0 })
    var a = h2e(makeT(Cneg(p), one), s)
    var esuba = CsubC(e, a)
    var aec = Ccon(CmulC(a, e))
    var divisor = 1 - Math.pow(CktoCp(CmulC(a, e)).r, 2)
    var b = {
        re: CmulC(esuba, CaddC(one, aec)).re / divisor,
        im: CmulC(esuba, CsubC(one, aec)).im / divisor
    }
    return compose(makeT(Cneg(p), one), makeT(b, one))
}
