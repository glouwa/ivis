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
        transform:   (n:N) => C,
        transformR:  (n:N) => number
        onDragStart: (m:C, n:N) => void,
        onDrag:      (s:C, e:C, n:N) => void,
        onDragEnd:   () => void,
        onClick:     (m:C) => void,

        pos:         [number, number],
        radius:      number,
        nodeRadius:  number,
        caption:     boolean,
        opacity?:    number,
        clip?:       boolean,
    }

    export interface TreeOnUnitDisk
    {
        args: TreeOnUnitDiskConfig,
        updatePositions:() => void,
        updateCaptions:(visible:boolean) => void,
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
