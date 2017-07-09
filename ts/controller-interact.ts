namespace ivis.controller
{    
    interface TreeWithNavigationConfig
    {        
        dataloader:  LoaderFunction,
        navData:     N,
        layout:      LayoutFunction,
        viewTT:      Transformation,
        navTT:       Transformation,
        arc:         (n:N) => string,

        parent:      any,
        pos:         [number, number],        
    }

    /**
     * a viewdisk and a navigation disk together.
     * navdisk gets pan state as model
     */
    export class TreeWithNavigation // Interaction
    {
        args : TreeWithNavigationConfig
        data : N
        navData : N
        nav : ivis.ui.TreeOnUnitDisk
        view : ivis.ui.TreeOnUnitDisk

        constructor(args : TreeWithNavigationConfig)
        {
            this.args  = args
            this.navData = args.navData,
            args.dataloader(d3h => {
                var model = <N>d3.hierarchy(d3h).sum(slide.weight)
                this.data = ivis.controller.slide.layout(model)
                this.create()
            })
        }

        private create() : void
        {
            var navR = 70
            new ivis.controller.slide.unitDisk({ // navigation disk background
                class:       'nav-background-disc',
                data:        this.data,
                transform:   (n:N) => n.z,
                transformR:  (n:N) => this.nodeR(this.args.viewTT.transformPoint(n)),
                onDragStart: (m:C, n:N) => {},
                onDrag:      (s:C, e:C) => {},
                onDragEnd:   () => {},
                onClick:     (m:C) => this.animateTo(m, this.args.viewTT),
                arc:         this.args.arc,
                caption:     (n:N) => "",
                labelFilter: (n:N) => true,

                parent:      null,
                pos:         ArrAddR([navR/2,navR/2], navR),
                radius:      navR,
                nodeRadius:  .05,
                clip:        true
            })

            this.nav = new ivis.controller.slide.unitDisk({ // navigation disk with transformation parameters as nodes
                class:       'nav-parameter-disc',
                data:        this.navData,
                transform:   (n:N) => n,
                transformR:  (n:N) => 1,
                onDragStart: (m:C, n:N) => this.onDragStart(m, n, this.args.navTT),
                onDrag:      (s:C, e:C, n:N) => this.onDrag(s, e, n, this.args.navTT),
                onDragEnd:   () => this.onDragEnd(),
                onClick:     (m:C) => this.animateTo(m, this.args.navTT),
                arc:         this.args.arc,
                caption:     this.caption,
                labelFilter: (n:N) => false,

                parent:      null,
                pos:         ArrAddR([navR/2,navR/2], navR),                
                radius:      navR,
                nodeRadius:  .18,
                clip:        false,
            })

            var radius = 470            
            this.view = new ivis.controller.slide.unitDisk({ // view disk
                class:       'unitDisc',
                data:        this.data,
                transform:   (n:N) => this.args.viewTT.transformPoint(n),
                transformR:  (n:N) => this.nodeR(this.args.viewTT.transformPoint(n)),
                onDragStart: (m:C, n:N) => this.onDragStart(m, n, this.args.viewTT),
                onDrag:      (s:C, e:C, n:N) => this.onDrag(s, e, n, this.args.viewTT),
                onDragEnd:   () => this.onDragEnd(),
                onDblClick:  (m:C, n:N) => this.animateTo(m, this.args.viewTT),
                onClick:     (m:C, n:N) => {
                                 this.view.updateSelection(n)
                                 this.args.onNodeSelect(n)
                             },
                arc:         this.args.arc,
                caption:     this.caption,
                labelFilter: (n:N) => CktoCp(n.cache).r > .5,

                parent:      null,
                pos:         ArrAddR([50,30], radius),
                voroBox:     [[-1.01,-1.01], [1.01,1.01]],
                radius:      radius,
                nodeRadius:  .04,
                rootColor:   "#fff59d",
                clip:        true,
            })
        }

        private updatePositions() : void
        {
            this.nav.updatePositions()
            this.view.updatePositions()
        }

        private updateLayout() : void
        {
            this.data.sum(slide.weight)
            ivis.controller.slide.layout(this.data)
            this.updatePositions()
        }

        //----------------------------------------------------------------------------------------

        private onDragStart(m:C, n:N, tt:Transformation) : void
        {
            if (this.intervallEvent) return

            if (ivis.controller.slide.captions)
                this.view.updateCaptions(false)
            tt.onDragStart(m)
        }

        private onDrag(s:C, e:C, n:N, tt:Transformation) : void
        {
            var postfix = n?(n.name?n.name:'P'):'P' // n.name bei parameter, n.data.name bei normalen nodes :(
            tt['onDrag'+postfix](s, e)
            this.updatePositions()
        }

        private onDragEnd() : void
        {
            this.view.updateCells()
            if (ivis.controller.slide.captions)
                this.view.updateCaptions(true)
        }

        private intervallEvent = null
        private animateTo(m:C, tt:Transformation) : void
        {
            if (this.intervallEvent) return

            this.onDragStart(m, null, tt)
            var md = CktoCp(m)
            var step = 0
            var initR = md.r
            var steps = 33
            this.intervallEvent = setInterval(() => {
                md.r = initR * (1 - sigmoid(step++/steps))
                if (step > steps) {
                   this.onDragEnd()
                   clearInterval(this.intervallEvent)
                   this.intervallEvent = null
                }
                else {
                   this.onDrag(m, CptoCk(md), null, tt)
                }
            },1)
        }

        private caption(n:N) : string
        {
            function findName(n:N) {
                if (n.name) return n.name
                if (n.data && n.data.name) return n.data.name
                return ""
            }
            function nodeCount(n:N) {
                if (n.links && !n.parent && n.children)
                    var count = n.links().length+1
                return count?  " " + count + " Nodes" : ""
            }


            return findName(n).replace('Wikipedia – Die freie ', '') + nodeCount(n)
        }

        private nodeR(np:C) : number
        {
            var r = Math.sqrt(np.re*np.re + np.im*np.im)
            if (r > 1)
                r = 1
            return Math.sin(Math.acos(r))
        }
    }

    //----------------------------------------------------------------------------------------

    export interface Transformation
    {
        transformPoint: (n:N) => C,
        onDragStart:    (m:C) => void,
        onDragP:        (s:C, e:C) => void,
        onDragθ:        (s:C, e:C) => void
    }

    export class HyperbolicTransformation implements Transformation
    {
        tp : any
        dST : any
        constructor(tp)  { this.tp = tp }
        transformPoint = (n:N) => h2e(h, n.z)
        onDragStart =    (m:C) => this.dST = clone(this.tp)
        onDragP =        (s:C, e:C) => CassignC(this.tp.P, compose(this.dST, shift(this.dST, s, maxR(e, .95))).P)
        onDragθ:         (s:C, e:C) => {}
        onDragλ =        (s:C, e:C) => {
                             CassignC(this.tp.λ, setR(e, 1))
                             var newλ = { θ:πify(CktoCp(this.tp.λ).θ), r:1 }
                             var normScale = newλ.θ / (2*Math.PI)
                             ivis.controller.slide.magic = normScale
                             ivis.controller.reLayout()
                         }
    }

    export class PanTransformation implements Transformation
    {
        tp : any
        dST : any
        constructor(tp)  { this.tp = tp }
        transformPoint = (n:N) => {
                             var s = CktoCp(this.tp.λ).θ / Math.PI
                             var w = CktoCp(this.tp.θ).θ
                             var zp = CktoCp(n.z)
                             var rz = CptoCk({ θ:zp.θ+w, r:zp.r })
                             return CmulR(CaddC(rz, CdivR(this.tp.P, s)), s)
                         }
        onDragStart =    (m:C) => this.dST = clone(this.tp)
        onDragP =        (s:C, e:C) => CassignC(this.tp.P, CaddC(this.dST.P, CsubC(maxR(e, .95), s)))
        onDragθ =        (s:C, e:C) => CassignC(this.tp.θ, setR(e, 1))
        onDragλ =        (s:C, e:C) => {
                             if (ivis.controller.slide.space == "PanTransformation") {
                                CassignC(this.tp.λ, setR(e, 1))
                             }
                             else {
                                 CassignC(this.tp.λ, setR(e, 1))
                                 var newλ = { θ:πify(CktoCp(this.tp.λ).θ), r:1 }
                                 var normScale = newλ.θ / (2*Math.PI)
                                 ivis.controller.slide.magic = normScale
                                 ivis.controller.reLayout()
                             }
                         }
    }

    var h:T = { P:{ re:0, im:0 }, θ:{ re:1, im:0 }, λ:CptoCk({ θ:Math.PI, r:1}) }
    //var o   = { P:{ re:0, im:0 }, θ:{ re:-1, im:0 }, λ:{ re:0.5403023058681398, im:-0.8414709848078965 } }

    var left = null
    var right = null

    /**
     * create a euclidien and a hyperbolic tree view
     * same data
     * same initial layout
     * different states and transformations
     */
    export function reCreate()
    {
        document.getElementById("hypertree").innerText = ''
        document.getElementById("plexxDbg").innerText = ''
        var uiRoot = ivis.controller.slide.initUi()

        left = new TreeWithNavigation({
            dataloader:   ivis.controller.slide.loader,
            navData:      ivis.model.loaders.obj2data(h),
            layout:       ivis.controller.slide.layout,
            viewTT:       new ivis.controller.slide.space(h),
            navTT:        new PanTransformation(h),
            arc:          ivis.controller.slide.arc,
            parent:       uiRoot,
            onNodeSelect: (n:N) => {
                if (document.getElementById('wiki'))
                    document.getElementById('wiki').src =
                        "https://de.m.wikipedia.org/wiki/"+n.data.name
            }
        })
    }

    export function reLayout()
    {
        left.updateLayout()
    }

    export function reDraw()
    {
        left.view.updatePositions()
    }
}

