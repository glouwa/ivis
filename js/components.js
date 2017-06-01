class HyperbolicTree {
    constructor(args) {
        this.s = { x: 0, y: 0 }; // common state. wird vermutlich mehr rein kommen. theta und P?
        this.args = args;
        args.dataloader(d3h => {
            this.data = args.layout(d3h); // data ok. calc init layout
            this.create();
        });
    }
    update() {
        this.nav.update();
        this.view.update();
    }
    setS(ns) {
        this.s = ns;
        this.update();
    }
    create() {
        var navR = 50; // create components
        var navbg = new SelectedUnitDisk({
            r: 2,
            radius: navR + 5,
            pos: [55 + this.args.pos[0], 55 + this.args.pos[1]],
            data: this.data,
            transform: n => R2toArr(R2mulR(this.args.t(n, this.s), navR)),
            onS: s => { }
        });
        this.nav = new SelectedUnitDisk({
            r: 7,
            opacity: .8,
            radius: navR + 5,
            pos: [55 + this.args.pos[0], 55 + this.args.pos[1]],
            data: layoutAtCenter(oneNode),
            transform: n => R2toArr(R2neg(R2mulR(this.args.t(n, this.s), navR))),
            onS: s => this.setS(R2neg(s))
        });
        var viewR = 190;
        this.view = new SelectedUnitDisk({
            r: 7,
            radius: viewR + 10,
            pos: [240 + this.args.pos[0], 240 + this.args.pos[1]],
            data: this.data,
            transform: n => R2toArr(R2mulR(this.args.t(n, this.s), viewR)),
            onS: s => this.setS(s)
        });
    }
}
