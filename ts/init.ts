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
    z: C,
    zprime: C
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
    opacity?: number
}

/**
 * Contains a view disk an a navigation disc
 */
interface TreeWithNavigationConfig
{
    parent: any,
    dataloader: LoaderFunction,
    layout: LayoutFunction,
    t: (n:N) => R2
    onPan: (m:R2) => void

    pos: [number, number],
}

//----------------------------------------------------------------------------------------

type R2 = {x:number,y:number}
type Ck = {re:number,im:number}
type Cp = {t,r}
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
var CmulC =   (a:C, b:C)=>       ({ re:a.re * b.re - a.im * b.im,
                                    im:a.im * b.re + a.re * b.im })
var CdivC =   (a:C, b:C)=>       ({ re:(a.re * b.re + a.im * b.im) /
                                       (b.re * b.re + b.im * b.im),
                                    im:(a.im * b.re - a.re * b.im) /
                                       (b.re * b.re + b.im * b.im)})
var CaddC =   (a:C, b:C)=>       ({ re:a.re + b.re,                 im:a.im + b.im })
var CaddR =   (a:C, s:number)=>  ({ re:a.re + s,                    im:a.im })
var CtoArr =  (p:C)=>            ([ p.re,                           p.im ])
var CtoR2 =   (p:C)=>            ({ x:p.re,                         y:p.im })

function ArrAddR(p:[number, number], s:number) : [number,number] { return [ p[0] + s, p[1] + s ] }

//----------------------------------------------------------------------------------------

interface TreeOnUnitDisk // see plexx and d3 implementations
{
    update:() => void
}

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
        oneNode(node=> {
            this.navData = layoutAtCenter(node)
        })
        args.dataloader(d3h=> {
            this.data = args.layout(d3h) // data ok. calc init layout
            this.create()
        })
    }

    setS(ns) : void
    {
        this.args.onPan(ns)
        this.nav.update()
        this.view.update()
    }

    private create() : void
    {
        var navR = 55
        var navbg = new UnitDiskD3({ // navigation disk
            data:this.data,
            transform: (n:N)=> this.args.t(n),
            onPan: (m:R2) =>{},
            parent:null,
            pos:ArrAddR(this.args.pos, navR),
            radius:navR,
            nodeRadius:2,
        })

        this.nav = new UnitDiskD3({
            data:this.navData,
            transform: (n:N)=> R2neg(this.args.t(n)),
            onPan: (m:R2) => this.setS(R2neg(m)),
            parent:null,
            pos:ArrAddR(this.args.pos, navR),
            opacity:.8,
            radius:navR,
            nodeRadius:7,
        })

        this.view = new UnitDiskD3({ // view disk
            data:this.data,
            transform: (n:N)=> this.args.t(n),
            onPan: (m:R2) => this.setS(m),
            parent:null,
            pos:ArrAddR(this.args.pos, 240),
            radius:200,
            nodeRadius:7,
        })
    }
}

//----------------------------------------------------------------------------------------

/**
 * create a euclidien and a hyperbolic tree view
 * same data
 * same initial layout
 * different states and
 */
function init() {

    var uiRoot = selectedInitUi()

    var o = { x:0, y:0 }
    new TreeWithNavigation({        
        dataloader: selectedDataLoader,
        layout:     layoutRadial,
        t:          (n:N) => R2addR2(n,o), // simple paning. s = verschiebe vektor
        onPan:      (m:R2) => o=m,
        parent:     uiRoot,
        pos:        [0,0],
    })

    var s = { P:{ re:0, im:0 }, T:{ re:0, im:1 }}
    function h2e(z : C, p : C, t : C) : C
    {
        // (T * z + P) / ( 1 + Ccon(P) * T * z)
        // (s.T * R2toC(z) + s.P) / ( 1 + Ccon(s.P) * s.T * R2toC(z))
        var oben = CaddC(CmulC(s.T, z), s.P)
        var unten = CaddR(CmulC(CmulC(Ccon(s.P), s.T), z), 1)
        var zprime = CdivC(oben, unten)
        return zprime
    }
    function e2h(z : C, p : C, t : C) : C
    {
        var pp = Cneg(CmulC(Ccon(t), p))
        var tp = Ccon(t)
        return h2e(z, pp, tp)
    }

    new TreeWithNavigation({        
        dataloader: selectedDataLoader,
        layout:     selectedLayout,
        t:          (n:N) => CtoR2(e2h(R2toC(n), s.P, s.T)),
        //t:          (n:N) => R2addR2(n,o),
        onPan:      (m:R2) => { s.P = R2toC(m); o=m },
        parent:     uiRoot,
        pos:        [550,0],
    })
}




