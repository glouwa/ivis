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
 * loader, layout, uifactory interfaces
 */
type InitUiFunction = (args) => void
type LoaderFunction = (ok : (root:N) => void) => void
type LayoutFunction = (root : N) => N

//----------------------------------------------------------------------------------------

function dfs(n, fpre, idx=0) {
    if (fpre) fpre(n, idx)
    if (n.children)
        for (var i=0; i < n.children.length; i++)
            dfs(n.children[i], fpre, i)
}

function dfsFlat(n, f?) {
    var r = []
    dfs(n, n=> { if(!f || f(n)) r.push(n) })
    return r
}

function clone(o)
{
    var str = JSON.stringify(o)
    console.log(str)
    return JSON.parse(str)
}

function sigmoid(x)
{
    return .5 + .5 * Math.tanh(x*6-3)
}

//----------------------------------------------------------------------------------------

interface T { P:C, θ:C }
function makeT(a, b) { return { P:a, θ:b }}
var one = { re:1, im:0 }

//----------------------------------------------------------------------------------------

function h2e(t:T, z:C) : C
{
    var oben = CaddC(CmulC(t.θ, z), t.P)
    var unten = CaddC(CmulC(CmulC(Ccon(t.P), t.θ), z), one)
    return CdivC(oben, unten)
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

function shift(h:T, s:C, e:C) : T
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

function arcCenter(a:C, b:C)
{
    var d = a.re * b.im - b.re * a.im
    var br = CktoCp(b).r
    var ar = CktoCp(a).r
    var numerator = CsubC(CmulR(a, (1 + br*br)), CmulR(b, (1 + ar*ar)))
    return { c:CmulC({ re:0, im:1 }, CdivR(numerator, 2*d)), d:d }
}

//----------------------------------------------------------------------------------------

type R2 = { x:number, y:number }
type Ck = { re:number, im:number }
type Cp = { θ:number, r:number }
type C  = Ck

var R2toArr =     (p:R2)=>           ([ p.x,                            p.y ])
var R2assignR2 =  (a, b)=>           {  a.x=b.x;                        a.y=b.y; }
var R2toC =       (p:R2)=>           ({ re:p.x,                         im:p.y })
var R2neg =       (p:R2)=>           ({ x:-p.x,                         y:-p.y })
var R2addR2 =     (a:R2, b:R2)=>     ({ x:a.x + b.x,                    y:a.y + b.y })
var R2subR2 =     (a:R2, b:R2)=>     ({ x:a.x - b.x,                    y:a.y - b.y })
var R2mulR =      (p:R2, s:number)=> ({ x:p.x * s,                      y:p.y * s })
var R2divR =      (p:R2, s:number)=> ({ x:p.x / s,                      y:p.y / s })

var CktoCp =      (k:Ck)=>           ({ θ:Math.atan2(k.im, k.re),       r:Math.sqrt(k.re*k.re + k.im*k.im) })
var CptoCk =      (p:Cp)=>           ({ re:p.r*Math.cos(p.θ),           im:p.r*Math.sin(p.θ) })

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
var CkdivR =      (p:Ck, s:number)=> ({ re:p.re / s,                    im:p.im / s })
var CkdivCk =     (a:Ck, b:Ck)=>     CkdivCkImpl2(a, b)
var Cklog =       (a:Ck)=>           CptoCk(Cplog(CktoCp(a)))


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
var CdivR =       CkdivR

var ArrtoC =      (p:number[])=>     ({ re:p[0],                        im:p[1] })
var ArrtoR2 =     (p:number[])=>     ({ x:p[0],                         y:p[1]  })
function ArrAddR(p:[number, number], s:number) : [number,number] { return [ p[0] + s, p[1] + s ] }
function ArrDivR(p:[number, number], s:number) : [number,number] { return [ p[0] / s, p[1] / s ] }

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

function maxR(c:C, v:number)
{
    var mp = CktoCp(c);
    mp.r = mp.r>v?v:mp.r;
    return CptoCk(mp)
}

function onUnitCircle(c:C)
{
    var mp = CktoCp(c);
    mp.r = 1
    return CptoCk(mp)
}
