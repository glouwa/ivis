namespace ivis.controller
{    
    interface TreeWithNavigationConfig
    {
        parent:      any,
        dataloader:  LoaderFunction,
        navData:     N,
        layout:      LayoutFunction,
        viewTT:      TypedependentTransformation,
        navTT:       TypedependentTransformation,

        pos:         [number, number],
        clip?:       boolean
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
            args.dataloader(d3h=> {
                this.data = args.layout(<N>d3.hierarchy(d3h)) // data ok. calc init layout
                this.create()
            })
        }

        updatePositions() : void
        {
            this.nav.updatePositions()
            this.view.updatePositions()
        }

        private create() : void
        {
            this.view = new ivis.controller.slide.unitDisk({ // view disk
                class:       'unitDisc',
                data:        this.data,
                transform:   (n:N) => CtoR2(this.args.viewTT.transformPoint(n)),
                transformR:  (n:N) => this.nodeR(CtoR2(this.args.viewTT.transformPoint(n))),
                onDragStart: (m:C) => this.onDragStart(m, this.args.viewTT),
                onDrag:      (s:C, e:C) => this.onDrag(s, e, this.args.viewTT),
                onDragEnd:   () => this.onDragEnd(),
                onClick:     (m:C) => this.onClick(m),
                parent:      null,
                pos:         ArrAddR(this.args.pos, 240),
                radius:      200,
                nodeRadius:  .04,
                clip:        this.args.clip,
                caption:     true
            })

            var navR = 55
            var navbg = new ivis.controller.slide.unitDisk({ // navigation disk background
                class:       'unitDiscParamBg',
                data:        this.data,
                transform:   (n:N) => CtoR2(n.z),
                transformR:  (n:N) => 1,
                onDragStart: (m:C) => {},
                onDrag:      (s:C, e:C) => {},
                onDragEnd:   () => {},
                onClick:     (m:C) => {},

                parent:      null,
                pos:         ArrAddR(this.args.pos, navR),
                radius:      navR,
                nodeRadius:  .04,
                clip:        true
            })

            this.nav = new ivis.controller.slide.unitDisk({ // navigation disk with transformation parameters as nodes
                class:       'unitDiscParam',
                data:        this.navData,
                transform:   (n:N) => CtoR2(n),
                transformR:  (n:N) => 1,
                onDragStart: (m:C) => this.onDragStart(m, this.args.navTT),
                onDrag:      (s:C, e:C) => this.onDrag(s, e, this.args.navTT),
                onDragEnd:   () => this.onDragEnd(),
                onClick:     (m:C) => this.onClick(m),
                parent:      null,
                pos:         ArrAddR(this.args.pos, navR),
                opacity:     .8,
                radius:      navR,
                nodeRadius:  .13,
                clip:        false,
                caption:     true
            })
        }

        private onDragStart(m:C, tt:TypedependentTransformation) : void
        {
            this.view.updateCaptions(false)
            tt.onDragStart(m)
        }

        private onDrag(s:C, e:C, tt:TypedependentTransformation) : void
        {
            tt.onDrag(s, e)
            this.updatePositions()
        }

        private onDragEnd() : void
        {
            this.view.updateCaptions(true)
        }

        private onClick(m:C) : void
        {
            this.nav.args.onDragStart(m)
            var md = CktoCp(m)
            var intervall = setInterval(()=> {
                md.r = md.r - 0.05
                if (md.r < 0.00001) {
                   this.nav.args.onDragEnd()
                   clearInterval(intervall)
                }
                else
                   this.nav.args.onDrag(m, CptoCk(md))
            },20)
        }

        private nodeR(np:R2) : number
        {
            var r = Math.sqrt(np.x*np.x + np.y*np.y)
            if (r > 1)
                r = 1
            return Math.sin(Math.acos(r))
        }
    }

    //----------------------------------------------------------------------------------------

    interface TypedependentTransformation
    {
        transformPoint: (n:N) => C,
        onDragStart:    (m:C) => void,
        onDrag:         (s:C, e:C) => void
    }

    var h:T = { P:{ re:0, im:0 }, θ:one }
    class HyperbolicTransformation implements TypedependentTransformation
    {
        dST : any
        public transformPoint(n:N) { return h2e(h, n.z) }
        public onDragStart(m:C)    { this.dST = clone(h) }
        public onDrag(s:C, e:C)    {
            var mp = CktoCp(e); mp.r = mp.r>.95?.95:mp.r; e = CptoCk(mp)
            var newP = compose(this.dST, shift(h, s, e)).P
            CassignC(h.P, newP)
        }
        //onDragθ:   (m:C) => void,
        //onDragP:   (m:C) => void,
    }

    var o   = { Δ:{ re:0, im:0 }, φ:{ re:-1, im:0, value:0 }, λ:{ re:1, im:0, value:1 } }
    class StandardPanAndZoomTransformation implements TypedependentTransformation
    {
        dST : any
        public transformPoint(n:N) { return CaddC(n.z, o.Δ) }
        public onDragStart(m:C)    { this.dST = clone(o) }
        public onDrag(s:C, e:C)    { CassignC(o.Δ, CaddC(this.dST.Δ, CsubC(e, s))) }
        //onDragΔ:   (m:C) => void,
        //onDragφ:   (m:C) => void,
        //onDragλ:   (m:C) => void,
    }

    /**
     * create a euclidien and a hyperbolic tree view
     * same data
     * same initial layout
     * different states and
     */
    export function loadHyperTree()
    {
        var uiRoot = ivis.controller.slide.initUi()

        var offsetTwn = new TreeWithNavigation({
            dataloader:  ivis.controller.slide.loader,
            navData:     ivis.model.loaders.obj2data(o),
            layout:      ivis.controller.slide.layout,
            viewTT:      new StandardPanAndZoomTransformation(),
            navTT:       new StandardPanAndZoomTransformation(),
            parent:      uiRoot,
            pos:         [25,30],
            clip:        true
        })

        var hyperbolicTwn = new TreeWithNavigation({
            dataloader:  ivis.controller.slide.loader,
            navData:     ivis.model.loaders.obj2data(h),
            layout:      ivis.controller.slide.layout,
            viewTT:      new HyperbolicTransformation(),
            navTT:       new HyperbolicTransformation(),
            parent:      uiRoot,
            pos:         [525,30],
        })
    }
}

