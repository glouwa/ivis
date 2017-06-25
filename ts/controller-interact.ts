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
        clip?:       boolean,
    }

    /**
     * a viewdisk and a navigation disk together.
     * navdisk gets pan state as model
     */
    class TreeWithNavigation // Interaction
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
                this.data = args.layout(<N>d3.hierarchy(d3h).sum(slide.weight)) // data ok. calc init layout
                this.create()
            })
        }

        private create() : void
        {
            this.view = new ivis.controller.slide.unitDisk({ // view disk
                class:       'unitDisc',
                data:        this.data,
                transform:   (n:N) => this.args.viewTT.transformPoint(n),
                transformR:  (n:N) => this.nodeR(this.args.viewTT.transformPoint(n)),
                onDragStart: (m:C, n:N) => this.onDragStart(m, n, this.args.viewTT),
                onDrag:      (s:C, e:C, n:N) => this.onDrag(s, e, n, this.args.viewTT),
                onDragEnd:   () => this.onDragEnd(),
                onClick:     (m:C) => this.onClick(m, this.args.viewTT),
                arc:         this.args.arc,
                caption:     this.caption(.7),

                parent:      null,
                pos:         ArrAddR(this.args.pos, 240),                
                radius:      200,
                nodeRadius:  .04,
                clip:        this.args.clip,                
            })

            var navR = 55
            new ivis.controller.slide.unitDisk({ // navigation disk background
                class:       'unitDiscParamBg',
                data:        this.data,
                transform:   (n:N) => n.z,
                transformR:  (n:N) => 1,
                onDragStart: (m:C, n:N) => {},
                onDrag:      (s:C, e:C) => {},
                onDragEnd:   () => {},
                onClick:     (m:C) => {},
                arc:         this.args.arc,
                caption:     (n:N) => "",

                parent:      null,
                pos:         ArrAddR(this.args.pos, navR),                
                radius:      navR,
                nodeRadius:  .03,
                clip:        true
            })

            this.nav = new ivis.controller.slide.unitDisk({ // navigation disk with transformation parameters as nodes
                class:       'unitDiscParam',
                data:        this.navData,
                transform:   (n:N) => n,
                transformR:  (n:N) => 1,
                onDragStart: (m:C, n:N) => this.onDragStart(m, n, this.args.navTT),
                onDrag:      (s:C, e:C, n:N) => this.onDrag(s, e, n, this.args.navTT),
                onDragEnd:   () => this.onDragEnd(),
                onClick:     (m:C) => this.onClick(m, this.args.navTT),
                arc:         this.args.arc,
                caption:     this.caption(Number.POSITIVE_INFINITY),

                parent:      null,
                pos:         ArrAddR(this.args.pos, navR),
                opacity:     .8,
                radius:      navR,
                nodeRadius:  .13,
                clip:        false,
            })
        }

        private updatePositions() : void
        {
            this.nav.updatePositions()
            this.view.updatePositions()
        }

        private onDragStart(m:C, n:N, tt:Transformation) : void
        {
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
            if (ivis.controller.slide.captions)
                this.view.updateCaptions(true)
        }

        private onClick(m:C, tt:Transformation) : void
        {
            this.onDragStart(m, null, tt)
            var md = CktoCp(m)
            var step = 0
            var initR = md.r
            var steps = 33
            var intervall = setInterval(() => {            
                md.r = initR * (1 - sigmoid(step++/steps))
                if (step > steps) {
                   this.onDragEnd()
                   clearInterval(intervall)
                }
                else {
                   this.onDrag(m, CptoCk(md), null, tt)
                }
            },1)
        }

        private caption(maxR:number) : (n:N) => string
        {
            return function(n:N) : string
            {
                if (CktoCp(n.cache).r > maxR) return ""
                if (n.name) return n.name
                if (n.data && n.data.name) return n.data.name
                return ""
            }
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

    interface Transformation
    {
        transformPoint: (n:N) => C,
        onDragStart:    (m:C) => void,
        onDragP:        (s:C, e:C) => void,
        onDragθ:        (s:C, e:C) => void
    }

    class HyperbolicTransformation implements Transformation
    {
        tp : any
        dST : any
        constructor(tp)  { this.tp = tp }
        transformPoint = (n:N) => h2e(h, n.z)
        onDragStart =    (m:C) => this.dST = clone(this.tp)
        onDragP =        (s:C, e:C) => CassignC(this.tp.P, compose(this.dST, shift(this.tp, s, maxR(e, .95))).P)
        onDragθ:         (s:C, e:C) => {}
    }

    class StandardPanAndZoomTransformation implements Transformation
    {
        tp : any
        dST : any
        constructor(tp)  { this.tp = tp }
        transformPoint = (n:N) => {
                             var s = CktoCp(this.tp.λ).θ
                             var w = CktoCp(this.tp.θ).θ
                             var zp = CktoCp(n.z)
                             var rz = CptoCk({ θ:zp.θ+w, r:zp.r })
                             return CmulR(CaddC(rz, CdivR(this.tp.P, s)), s)
                         }
        onDragStart =    (m:C) => this.dST = clone(this.tp)
        onDragP =        (s:C, e:C) => CassignC(this.tp.P, CaddC(this.dST.P, CsubC(e, s)))
        onDragθ =        (s:C, e:C) => CassignC(this.tp.θ, onUnitCircle(e))
        onDragλ =        (s:C, e:C) => CassignC(this.tp.λ, onUnitCircle(e))
    }

    var h:T = { P:{ re:0, im:0 }, θ:{ re:1, im:0 } }
    var o   = { P:{ re:0, im:0 }, θ:{ re:-1, im:0 }, λ:{ re:0.5403023058681398, im:-0.8414709848078965 } }

    /**
     * create a euclidien and a hyperbolic tree view
     * same data
     * same initial layout
     * different states and transformations
     */
    export function loadHyperTree()
    {
        var uiRoot = ivis.controller.slide.initUi()

        new TreeWithNavigation({
            dataloader:  ivis.controller.slide.loader,
            navData:     ivis.model.loaders.obj2data(o),
            layout:      ivis.controller.slide.layout,
            viewTT:      new StandardPanAndZoomTransformation(o),
            navTT:       new StandardPanAndZoomTransformation(o),
            arc:         ivis.ui.arcLine,
            parent:      uiRoot,
            pos:         [25,30],
            clip:        true
        })

        new TreeWithNavigation({
            dataloader:  ivis.controller.slide.loader,
            navData:     ivis.model.loaders.obj2data(h),
            layout:      ivis.controller.slide.layout,
            viewTT:      new HyperbolicTransformation(h),
            navTT:       new StandardPanAndZoomTransformation(h),
            arc:         ivis.controller.slide.arc,
            parent:      uiRoot,
            pos:         [525,30],
        })
    }
}

