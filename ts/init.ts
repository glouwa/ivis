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
    z:        C, // not used jet
    zprime:   C // not used jet. will be just cache
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
    t:           (n:N) => C
    onDragStart: (m:C) => void,
    onDrag:      (m:C) => void,
    //onDragθ:   (m:C) => void,

    pos:        [number, number],
    clip?:      boolean
}

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
            transform:   (n:N) => CtoR2(this.args.t(n)),
            onDragStart: (m:R2) => this.args.onDragStart(R2toC(m)),
            onDrag:      (m:R2) => this.args.onDrag(R2toC(m)),

            parent:      null,
            pos:         ArrAddR(this.args.pos, 240),
            radius:      200,
            nodeRadius:  7,
            clip:        this.args.clip
        })

        var navR = 55
        var navbg = new SelectedUnitDisk({ // navigation disk background
            data:        this.data,
            transform:   (n:N) => CtoR2(n.z),
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
            transform:   (n:N) => CtoR2(n),
            onDragStart: (m:R2) => this.args.onDragStart(R2toC(m)),
            onDrag:      (m:R2) => this.args.onDrag(R2toC(m)),

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
var o   = { v:{ re:0, im:0 } }
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

    function updateTransformation(newP)
    {
        CassignC(h.P, newP)
        CassignC(o.v, newP)
        offsetTwn.update()
        hyperbolicTwn.update()
    }

    var offsetTwn = new TreeWithNavigation({
        dataloader:  selectedDataLoader,
        navData:     obj2data(o),
        layout:      selectedLayout,
        t:           (n:N) => CaddC(n.z, o.v),
        //circleT:     (n:N) => 4
        //lineT:       (n1:N,n1:N) => [n1, n2]
        onDragStart: (m:C) => { dSP = m; dSTo = clone(o); dSTh = clone(h) },
        onDrag:      (m:C) => {
                          var dragVector = CsubC(m, dSP)                          
                          updateTransformation(CaddC(dSTh.P, dragVector))
                     },
        parent:      uiRoot,
        pos:         [25,30],
        clip:        true
    })

    var hyperbolicTwn = new TreeWithNavigation({
        dataloader:  selectedDataLoader,
        navData:     obj2data(h),
        layout:      selectedLayout,
        t:           (n:N) => h2e(h, n.z),
        onDragStart: (m:C) => { dSP = m; dSTo = clone(o); dSTh = clone(h) },
        onDrag:      (m:C) => {
                          mp = CktoCp(m); mp.r = mp.r>1?.95:mp.r; m = CptoCk(mp)
                          updateTransformation(compose(dSTh, shift(dSP, m)).P)
                     },
        parent:      uiRoot,
        pos:         [525,30],
    })
}

//----------------------------------------------------------------------------------------

function h2e(t:T, z:C) : C
{
    var oben = CaddC(CmulC(t.θ, z), t.P)
    var unten = CaddC(CmulC(CmulC(Ccon(t.P), t.θ), z), one)
    var zprime = CdivC(oben, unten)
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
    var θ = CdivC(CaddC(CmulC(t1.θ, t2.θ), CmulC(t1.θ, CmulC(Ccon(t1.P), t2.P))), divisor)
    var θp = CktoCp(θ); θp.r = 1
    return ({
        P: CdivC(CaddC(CmulC(t2.θ, t1.P), t2.P), divisor),
        θ: CptoCk(θp)
    })
}

function shift(s:C, e:C) : T
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

function arcCenter(a:C, b:C) // asuming a,b are in euclidien space
{
    var d = CsubC(CmulC(a.re, b.im), CmulC(b.re, a.im))
    var c = 1
}

//----------------------------------------------------------------------------------------

type R2 = { x:number, y:number }
type Ck = { re:number, im:number }
type Cp = { θ:number, r:number }
type C  = Ck

var R2toArr =    (p:R2)=>            ([ p.x,                            p.y ])
var R2assignR2 = (a, b)=>            {  a.x=b.x;                        a.y=b.y; }
var R2toC =      (p:R2)=>            ({ re:p.x,                         im:p.y })
var R2neg =      (p:R2)=>            ({ x:-p.x,                         y:-p.y })
var R2addR2 =    (a:R2, b:R2)=>      ({ x:a.x + b.x,                    y:a.y + b.y })
var R2subR2 =    (a:R2, b:R2)=>      ({ x:a.x - b.x,                    y:a.y - b.y })
var R2mulR =     (p:R2, s:number)=>  ({ x:p.x * s,                      y:p.y * s })
var R2divR =     (p:R2, s:number)=>  ({ x:p.x / s,                      y:p.y / s })

var CktoCp =     (k:Ck)=>            ({ θ:Math.atan2(k.im, k.re),       r:Math.sqrt(k.re*k.re + k.im*k.im) })
var CptoCk =     (p:Cp)=>            ({ re:p.r*Math.cos(p.θ),           im:p.r*Math.sin(p.θ) })

var CktoArr =     (p:Ck)=>           ([ p.re,                           p.im ])
var CkassignCk =  (a:Ck, b:Ck)=>     {  a.re=b.re;                      a.im=b.im; }
var CktoR2 =      (p:Ck)=>           ({ x:p.re,                         y:p.im })
var Ckneg =       (p:Ck)=>           ({ re:-p.re,                       im:-p.im })
var Ckcon =       (p:Ck)=>           ({ re:p.re,                        im:-p.im })
var CkaddC =      (a:Ck, b:Ck)=>     ({ re:a.re + b.re,                 im:a.im + b.im })
var CksubCk =     (a:Ck, b:Ck)=>     ({ re:a.re - b.re,                 im:a.im - b.im })
var CkmulR =      (p:Ck, s:number)=> ({ re:p.re * s,                    im:p.im * s })
var CkmulCk =     (a:Ck, b:Ck)=>     ({ re:a.re * b.re - a.im * b.im,   im:a.im * b.re + a.re * b.im })
var Ckpow =       (a:number)=>       ({ re:Math.cos(a),                 im:Math.sin(a) })
var Cklog =       (a:Ck)=>           CptoCk(Cplog(CktoCp(a)))
var CkdivCk =     (a:Ck, b:Ck)=>     CkdivCkImpl2(a, b)

var CpmulCp =     (a:Cp, b:Cp)=>     CktoCp({ re:a.r*b.r * Math.cos(a.θ+b.θ), im:a.r*b.r * Math.sin(a.θ+b.θ) })
var CpdivCp =     (a:Cp, b:Cp)=>     CktoCp({ re:a.r/b.r * Math.cos(a.θ-b.θ), im:a.r/b.r * Math.sin(a.θ-b.θ) })
var Cplog =       (a:Cp)=>           CplogImpl(a)
var CtoArr =      CktoArr
var CassignC =    CkassignCk
var CtoR2 =       CktoR2
var Cneg =        Ckneg
var Ccon =        Ckcon
var CaddC =       CkaddC
var CsubC =       CksubCk
var CmulR =       CkmulR
var CmulC =       CkmulCk
var Cpow =        Ckpow
var Clog =        Cklog
var CdivC =       CkdivCk

function ArrAddR(p:[number, number], s:number) : [number,number] { return [ p[0] + s, p[1] + s ] }

function CkdivCkImpl(a:Ck, b:Ck)
{
    var r = {
        re:(a.re * b.re + a.im * b.im) / (b.re * b.re + b.im * b.im),
        im:(a.im * b.re - a.re * b.im) / (b.re * b.re + b.im * b.im)
    }
    if (isNaN(r.re)) {r.re = 0; console.log('r.re=NaN') }
    if (isNaN(r.im)) {r.im = 0; console.log('r.im=NaN') }
    return r
}

function CkdivCkImpl2(a:Ck, b:Ck)
{
    var ap = CktoCp(a)
    var bp = CktoCp(b)
    return {
        re:ap.r/bp.r * Math.cos(ap.θ-bp.θ),
        im:ap.r/bp.r * Math.sin(ap.θ-bp.θ)
    }
}

function CplogImpl(a:Cp)
{
    if (isFinite(Math.log(a.r)))
        return { r:Math.log(a.r), θ:a.θ }
    else
        return { r:0, θ:0 }
}
