namespace ivis.ui
{
    /**
     * Disk with Nodes and links
     */
    export interface TreeOnUnitDiskConfig
    {
        parent:      any,
        data:        N,
        transform:   (n:N) => R2,
        transformR:  (n:N) => number
        onDragStart: (m:R2)  => void,
        onDrag:      (m:R2)  => void,

        pos:         [number, number],
        radius:      number,
        nodeRadius:  number,
        caption:     boolean
        opacity?:    number,
        clip?:       boolean,
    }

    export interface TreeOnUnitDisk
    {
        update:() => void
    }



    export abstract class UiNode
    {
        args: {
            model: {},
            transformation: {},
            plexxCss : {}
        }

        constructor()
        {
        }

        updateModel() {}
        updateViewModel(sel:[string]) {}

        updateAll() {}
    }
}
