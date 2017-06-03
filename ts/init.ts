/**
 * Created by julian on 31.05.17.
 */

//----------------------------------------------------------------------------------------

/**
 * Node
 */
interface N {
    id: string,
    parent: N,
    children: Array<N>,
    data: any,
    depth: 0,
    x: number,
    y: number,
    z: C, // not used jet
    zprime: C // not used jet
}

/**
 * Disk with Nodes and links
 */
interface TreeOnUnitDiskConfig
{
    parent: any,
    data: N,
    transform: (n:N) => R2,
    onPan: (m:R2)  => void,

    pos: [number, number],
    radius: number,
    nodeRadius: number,
    opacity?: number,
    clip?: boolean
}

/**
 * Contains a view disk an a navigation disc
 */
interface TreeWithNavigationConfig
{
    parent: any,
    dataloader: LoaderFunction,
    navData: N,
    layout: LayoutFunction,
    t: (n:N) => R2
    onPan: (m:R2) => void

    pos: [number, number],
    clip?: boolean
}

//----------------------------------------------------------------------------------------

type R2 = {x:number,y:number}
type Ck = {re:number,im:number}
type Cp = {θ:number,r:number}
type C = Ck

var R2neg =   (p:R2)=>           ({ x:-p.x,                         y:-p.y })
var R2mulR =  (p:R2, s:number)=> ({ x:p.x * s,                      y:p.y * s })
var R2divR =  (p:R2, s:number)=> ({ x:p.x / s,                      y:p.y / s })
var R2addR2 = (a:R2, b:R2)=>     ({ x:a.x + b.x,                    y:a.y + b.y })
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
            this.data = args.layout(d3h) // data ok. calc init layout
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
        var navR = 55
        var navbg = new UnitDiskD3({ // navigation disk background
            data:this.data,
            transform: (n:N) => n,
            onPan: (m:R2) => {},
            parent:null,
            pos:ArrAddR(this.args.pos, navR),
            radius:navR,
            nodeRadius:2,
            clip: true
        })

        this.nav = new UnitDiskD3({ // navigation disk with transformation parameters as nodes
            data:this.navData,
            transform: (n:N) => R2neg(this.args.t(n)),
            onPan: (m:R2) => this.args.onPan(R2neg(m)),
            parent:null,
            pos:ArrAddR(this.args.pos, navR),
            opacity:.8,
            radius:navR,
            nodeRadius:7,
            clip: false
        })

        this.view = new UnitDiskD3({ // view disk
            data:this.data,
            transform: (n:N) => this.args.t(n),
            onPan: (m:R2) => this.args.onPan(m),
            parent:null,
            pos:ArrAddR(this.args.pos, 240),
            radius:200,
            nodeRadius:7,
            clip: this.args.clip
        })
    }
}

//----------------------------------------------------------------------------------------

var o = { v:{ x:0, y:0 } }
var s = { P:{ re:0, im:0 }, θ:{ re:1, im:0 } }

/**
 * create a euclidien and a hyperbolic tree view
 * same data
 * same initial layout
 * different states and
 */
function init() {

    var uiRoot = selectedInitUi()

    var offsetTwn = new TreeWithNavigation({
        dataloader: selectedDataLoader,
        navData:    obj2data(o, x=>x),
        layout:     selectedLayout,
        t:          (n:N) => R2addR2(n,o.v),
        onPan:      (m:R2) => { s.P=R2toC(m); o.v=m; offsetTwn.update(); hyperbolicTwn.update(); },
        parent:     uiRoot,
        pos:        [0,30],
        clip:       true
    })

    var hyperbolicTwn = new TreeWithNavigation({
        dataloader: selectedDataLoader,
        navData:    obj2data(s, x=>CtoR2(x)),
        layout:     selectedLayout,
        t:          (n:N) => CtoR2(h2e(R2toC(n), s.P, s.θ)),
        onPan:      (m:R2) => { s.P=R2toC(m); o.v=m; offsetTwn.update(); hyperbolicTwn.update(); },
        parent:     uiRoot,
        pos:        [550,30],
    })
}

function h2e(z:C, p:C, t:C) : C
{
    var oben = CaddC(CmulC(t, z), p)
    var unten = CaddR(CmulC(CmulC(Ccon(p), t), z), 1)
    var zprime = CdivC(oben, unten)
    return zprime
}
function e2h(z:C, p:C, t:C) : C
{
    var pp = Cneg(CmulC(Ccon(t), p))
    var tp = Ccon(t)
    return h2e(z, pp, tp)
}



