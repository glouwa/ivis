
/**
 * Created by julian on 31.05.17.
 */

function visit(n, fpre, fpost) {
    if (fpre)
        fpre(n)
    if (n.children)
        for (var i=0; i<n.children.length; i++)
            visit(n.children[i], fpre, fpost)
    if (fpost)
        fpost(n)
}

function flat(n, f)
{
    var r = []
    visit(n, n=> { if(f(n)) r.push(n) })
    return r
}

function init() {

    var testZ = null
    function HyperboicTree(args)
    {
        args.dataloader(d3h=> {

            // data ok. calc init layout
            var data = d3h
            data = args.layout(data)

            // common state
            var z = { x:0, y:0 }
            function setz(x, y)
            {
                z.x = x; z.y = y
                nav.update()
                view.update()
            }
            testZ = setz

            // create components
            var navR = 50
            var navbg = UnitDisk({
                radius:navR+5,
                r:2,
                pos:[55+args.pos[0], 55+args.pos[1]],
                data:data,
                transform:p=> [(p.x+z.x)*navR, (p.y+z.y)*navR], // plexx coord
                onZ: p=>{}
            })
            var nav = UnitDisk({
                opacity:.8,
                radius:navR+5,
                r:7,
                pos:[55+args.pos[0], 55+args.pos[1]],
                data:layoutOneAtCenter(oneNode),
                transform:p=> [-(p.x+z.x)*navR, -(p.y+z.y)*navR], // plexx coord
                onZ: p=> setz(-p[0], -p[1])
            })

            var viewR = 190
            var view = UnitDisk({
                radius:viewR+10,
                r:7,
                pos:[240+args.pos[0], 240+args.pos[1]],
                data:data,
                transform:p=> [(p.x+z.x)*viewR, (p.y+z.y)*viewR],
                onZ: p=> setz(p[0], p[1])
            })
        })
    }

    // init --------------------------------------------------------------------

    HyperboicTree({
        pos:[0,0],
        dataloader:generated,
        layout:layoutDemo,
    })

    HyperboicTree({
        pos:[550,0],
        dataloader:d3csv,
        layout:layoutRadial,
    })

}

window.onload = init;

