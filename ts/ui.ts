namespace ivis.ui
{
    /**
     * Disk with Nodes and links
     */
    export interface TreeOnUnitDiskConfig
    {
        parent:      any,
        class:       string,
        data:        N,
        transform:   (n:N) => R2,
        transformR:  (n:N) => number
        onDragStart: (m:C) => void,
        onDrag:      (s:C, m:C) => void,
        onClick:     (m:C) => void,

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
