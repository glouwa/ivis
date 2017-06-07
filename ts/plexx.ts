declare namespace Plexx {
    class ClickNodeVisitor implements NodeVisitorInterface {
        private renderContext;
        private mouseEvent;
        private lastEvent;
        private event;
        private transformationMatrixStack;
        private isAlreadyHoveringAPrimitiveNode;
        private drawingAreaMatrixStack;
        private boundingBoxVectors;
        private nodeCounter;
        private eventFound;
        constructor(renderContext: RenderContext, mouseEvent: MouseEvent, lastEvent: PlexxEvent);
        visitDrawingAreaNode(drawingArea: Plexx.DrawingArea): any;
        visitGroupNode(groupNode: Plexx.Group): PlexxEventType;
        visitTransformationNode(transformationNode: Plexx.TransformationNode): PlexxEventType;
        visitPrimitiveNode(primitiveNode: Plexx.PrimitiveNodeinterface): PlexxEventType;
    }
}
declare namespace Plexx {
    interface NodeVisitorInterface {
        visitDrawingAreaNode(drawingArea: Plexx.DrawingArea): any;
        visitPrimitiveNode(primitiveNode: Plexx.PrimitiveNode): any;
        visitTransformationNode(transformationNode: Plexx.TransformationNode): any;
        visitGroupNode(compositeNode: Plexx.Group): any;
    }
}
declare namespace Plexx {
    class RenderNodeVisitor implements Plexx.NodeVisitorInterface {
        private transformationMatrixStack;
        private renderContext;
        constructor(renderContext: RenderContext);
        visitDrawingAreaNode(drawingArea: Plexx.DrawingArea): void;
        visitPrimitiveNode(primitiveNode: Plexx.PrimitiveNodeinterface): void;
        visitTransformationNode(transformationNode: Plexx.TransformationNode): void;
        visitGroupNode(groupNode: Plexx.Group): void;
    }
}
declare namespace Plexx {
    class SvgNodeVisitor implements Plexx.NodeVisitorInterface {
        private renderContext;
        transformationMatrixStack: Plexx.Mathlib.StackMat3;
        private text;
        private intentLevel;
        private static intendWidth;
        constructor(renderContext: RenderContext);
        private getCurrentIntent();
        visitGroupNode(groupNode: Plexx.Group): String;
        visitTransformationNode(transformationNode: Plexx.TransformationNode): void;
        visitDrawingAreaNode(drawingArea: Plexx.DrawingArea): String;
        visitPrimitiveNode(primitiveNode: Plexx.PrimitiveNodeinterface): String;
    }
}
declare namespace Plexx {
    abstract class SceneGraphNode {
        private id;
        private name;
        private childNodes;
        private parentNode;
        private values;
        private rootNode;
        constructor(name: string);
        abstract accept(nodeVisitor: NodeVisitorInterface): any;
        abstract clone(): Plexx.SceneGraphNode;
        add(node: SceneGraphNode): void;
        getChildren(): Array<SceneGraphNode>;
        getName(): string;
        static mergeInterfaces<T>(valueList: T, defaultValueList: T): T;
        toString(): string;
        setValues<T>(values: T): void;
        protected setParent(parentNode: SceneGraphNode): void;
        protected setRootNode(rootNode: DrawingArea): void;
        protected getRootNode(): DrawingArea;
    }
}
declare namespace Plexx {
    interface PrimitiveNodeinterface {
        translationNode: TranslationNode;
        rotationNode: RotationNode;
        scaleNode: ScaleNode;
        updateCanvas2d(renderContext: RenderContext, currentTransformationMatrix: Mathlib.Mat3): boolean;
        updateWebGl(renderContext: RenderContext, currentTransformationMatrix: Mathlib.Mat3): boolean;
        generateSvg(renderContext: RenderContext, currentTransformationMatrix: Mathlib.Mat3): XMLTag;
        initWebGlShader(renderContext: RenderContext): any;
        initWebGlBuffers(renderContext: RenderContext): any;
        initWebGlTextures(renderContext: RenderContext): any;
        getBoundingBox(): BoundingBox2d;
        toString(): string;
        clone(): PrimitiveNode;
        hitBox(renderContext: RenderContext, position: Mathlib.Vec2): boolean;
        executeClickEvent(): void;
        on(mouseEventName: string, callback: (object: any) => {}): any;
        eventMap: {
            [eventName: string]: (event: any) => void;
        };
        setTranslation(translation: number[]): any;
        mouseOver: boolean;
        mouseOverExecuted: boolean;
        translation: number[];
        isHidden: boolean;
        draggable: boolean;
        isDragging: boolean;
        draggingPoint: Mathlib.Vec2;
        draggingSpace: number[];
    }
    type callback = (data: string) => void;
    interface TransformationsInterface {
        translation?: number[];
        scale?: number[];
        scalePoint?: number[];
        rotation?: number;
        rotationPoint?: number[];
        draggable?: boolean;
        draggingSpace?: number[];
    }
    class PrimitiveNode extends SceneGraphNode implements PrimitiveNodeinterface {
        translationNode: TranslationNode;
        rotationNode: RotationNode;
        scaleNode: ScaleNode;
        draggable: boolean;
        isDragging: boolean;
        draggingPoint: Mathlib.Vec2;
        translation: number[];
        scale: number[];
        scalePoint: number[];
        rotation: number;
        rotationPoint: number[];
        eventMap: {
            [eventName: string]: (event: any) => void;
        };
        mouseOver: boolean;
        mouseOverExecuted: boolean;
        isHidden: boolean;
        draggingSpace: number[];
        protected shaderProgram: any;
        protected buffer: any;
        protected texture: any;
        protected static vertexShaderSource: string;
        protected static fragmentShaderSource: string;
        constructor(name: string, values: TransformationsInterface);
        on(eventName: string, callback: (event: any) => void): void;
        setTranslation(translation: number[]): void;
        addTranslation(translation: number[]): void;
        setRotation(rotation: number): void;
        addRotation(rotation: number): void;
        setScale(scale: number[]): void;
        addScale(scale: number[]): void;
        accept(nodeVisitor: NodeVisitorInterface): any;
        updateWebGl(renderContext: RenderContext, currentTransformationMatrix: Mathlib.Mat3): boolean;
        updateCanvas2d(renderContext: RenderContext, currentTransformationMatrix: Mathlib.Mat3): boolean;
        generateSvg(renderContext: RenderContext, preTransformationMatrix: Mathlib.Mat3): XMLTag;
        clone(): PrimitiveNode;
        hitBox(renderContext: RenderContext, mousePosition: Mathlib.Vec2): boolean;
        getBoundingBox(): BoundingBox2d;
        executeClickEvent(): void;
        getTransformationInterface(): TransformationsInterface;
        initWebGlShader(renderContext: RenderContext): void;
        initWebGlBuffers(renderContext: RenderContext): void;
        initWebGlTextures(renderContext: Plexx.RenderContext): void;
    }
}
declare namespace Plexx {
    abstract class LeafNode extends SceneGraphNode {
        updateCanvas2d(renderContext: Plexx.RenderContext, currentTransformationMatrix: Plexx.Mathlib.Mat3): boolean;
        updateSvg(renderContext: Plexx.RenderContext, currentTransformationMatrix: Plexx.Mathlib.Mat3): boolean;
        updateWebGl(renderContext: Plexx.RenderContext, currentTransformationMatrix: Plexx.Mathlib.Mat3): boolean;
        toSVGString(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): string;
        generateXmlTag(renderContext: Plexx.RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): Plexx.XMLTag;
        protected vertexShaderSource: string;
        protected fragmentShaderSource: string;
    }
}
declare namespace Plexx {
    abstract class CompositeNode extends SceneGraphNode {
        render(renderContext: RenderContext, preRenderMatrix: Plexx.Mathlib.Mat3): boolean;
        toSVGString(renderContext: RenderContext): string;
    }
}
declare namespace Plexx {
    interface GroupInterface extends TransformationsInterface {
        name?: string;
        draggable?: boolean;
        draggingSpace?: number[];
        isDragging?: boolean;
    }
    interface GroupVisitorInterface {
        executeClickEvent(): void;
        on(mouseEventName: string, callback: (e: any) => {}): any;
        eventMap: {
            [eventName: string]: (e: any) => void;
        };
        mouseOver: boolean;
        mouseOverExecuted: boolean;
    }
    class Group extends Plexx.CompositeNode implements GroupVisitorInterface {
        translationNode: Plexx.TranslationNode;
        rotationNode: Plexx.RotationNode;
        scaleNode: Plexx.ScaleNode;
        eventMap: {
            [eventName: string]: (e: any) => void;
        };
        translation: number[];
        scale: number[];
        rotation: number;
        scalePoint: number[];
        rotationPoint: number[];
        isHidden: boolean;
        isDragging: boolean;
        draggable: boolean;
        draggingSpace: number[];
        draggingPoint: Mathlib.Vec2;
        mouseOver: boolean;
        mouseOverExecuted: boolean;
        constructor(values: Plexx.GroupInterface);
        on(eventName: string, callback: (e: any) => void): void;
        hitBox(renderContext: Plexx.RenderContext, mousePosition: Plexx.Mathlib.Vec2): boolean;
        executeClickEvent(): void;
        toString(): string;
        accept(nodeVisitor: Plexx.NodeVisitorInterface): number;
        getTranslationNode(): TranslationNode;
        getRotationNode(): RotationNode;
        getScaleNode(): ScaleNode;
        clone(): Group;
        setTranslation(translation: number[]): void;
        addTranslation(translation: number[]): void;
        setRotation(rotation: number, rotationPoint?: number[]): void;
        addRotation(rotation: number): void;
        setScale(scale: number[]): void;
        addScale(scale: number[]): void;
        generateSvg(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): XMLTag;
    }
}
declare namespace Plexx {
    interface DrawingAreaInterface {
        width: number;
        height: number;
        align?: AlignOptions;
        background?: string;
    }
    type AlignOptions = "none" | "xMinYMin" | "xMinYMid" | "xMinYMax" | "xMidYMin" | "xMidYMid" | "xMidYMax" | "xMaxYMin" | "xMaxYMid" | "xMaxYMax";
    class DrawingArea extends Plexx.CompositeNode {
        renderContext: RenderContext;
        eventQueue: Array<MouseEvent>;
        translationNode: Plexx.TranslationNode;
        rotationNode: Plexx.RotationNode;
        scaleNode: Plexx.ScaleNode;
        x: number;
        y: number;
        private width;
        private height;
        private background;
        private align;
        private canvasColour;
        private lastTimeRendered;
        private renderTime;
        private currentFramesPerSecond;
        private frameCounter;
        private lastState;
        private newState;
        constructor(values: DrawingAreaInterface);
        clone(): Plexx.DrawingArea;
        toString(): string;
        renderSingleFrame(renderContext: Plexx.RenderContext): void;
        accept(nodeVisitor: Plexx.NodeVisitorInterface): any;
        run(renderContext: Plexx.RenderContext): void;
        private init(renderContext);
        private renderFrame(renderContext);
        private static getMousePosition(canvas, evt, renderContext);
        private resizePlexx();
        private initCanvas2d(renderContext);
        private initWebGl(renderContext);
        private initSvg(renderContext);
        static clearCanvas2d(renderContext: RenderContext): boolean;
        updateCanvas2d(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): number;
        updateSvg(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): number;
        updateWebGl(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): number;
        generateSvg(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): XMLTag;
        getHeight(): number;
        getWidth(): number;
        getClientWidth(): number;
        getClientHeight(): number;
        getColour(): string;
        toSVGString(renderContext: RenderContext): string;
        getCurrentFramesPerSeconds(): number;
        getBackgroundColor(): string;
    }
}
declare namespace Plexx {
    class Colour {
        static nodeTypeName: string;
        private colorValueR;
        private colorValueG;
        private colorValueB;
        private colorValueA;
        private colourLiterals;
        constructor(colour?: string);
        private parseColourString(colourString);
        private isHexValue(element);
        setColour(colour: string): void;
        getRHex(): number;
        getGHex(): number;
        getBHex(): number;
        getAHex(): number;
        getR(): number;
        getG(): number;
        getB(): number;
        getA(): number;
        getRGBString(): string;
        getRGBAString(): string;
        getCss3String(): string;
    }
}
declare namespace Plexx {
    abstract class TransformationNode extends SceneGraphNode {
        private transformationMatrix;
        private inverseTransformationMatrix;
        getTransformationMatrix(): Plexx.Mathlib.Mat3;
        getInverseTransformationMatrix(): Plexx.Mathlib.Mat3;
        accept(nodeVisitor: Plexx.NodeVisitorInterface): number;
    }
}
declare namespace Plexx {
    interface TranslationInterface {
        translation?: number[];
    }
    class TranslationNode extends TransformationNode {
        translation: number[];
        constructor(values: TranslationInterface);
        setTranslation(translation: number[]): void;
        toString(): string;
        clone(): TranslationNode;
        getTransformationMatrix(): Plexx.Mathlib.Mat3;
        getInverseTransformationMatrix(): Plexx.Mathlib.Mat3;
    }
}
declare namespace Plexx {
    interface ScaleNodeInterface {
        scale?: number[];
        scalePoint?: number[];
    }
    class ScaleNode extends TransformationNode {
        scale: number[];
        scalePoint: number[];
        constructor(values: ScaleNodeInterface);
        clone(): ScaleNode;
        toString(): string;
        getTransformationMatrix(): Plexx.Mathlib.Mat3;
        getInverseTransformationMatrix(): Plexx.Mathlib.Mat3;
    }
}
declare namespace Plexx {
    interface RotationNodeInterface {
        rotation?: number;
        rotationPoint?: number[];
    }
    class RotationNode extends TransformationNode {
        rotation: number;
        rotationPoint: number[];
        constructor(values: RotationNodeInterface);
        toString(): string;
        getTransformationMatrix(): Plexx.Mathlib.Mat3;
        getInverseTransformationMatrix(): Plexx.Mathlib.Mat3;
        clone(): Plexx.RotationNode;
    }
}
declare namespace Plexx {
    class DebugHelper {
        private debugPanelElement;
        private debugPanelElementList;
        private renderInfo;
        private debugpanelId;
        private renderContext;
        private rootNode;
        private panelSVGExportCSS;
        constructor(debugpanelId: string, renderContext: RenderContext, rootNode: Plexx.DrawingArea);
        initDebugPanelLeftElement(): void;
        initDebugPanelCenterElement(): void;
        initDebugPanelRightElement(): void;
        updateInfo(renderContext: RenderContext, rootNode: Plexx.DrawingArea): void;
    }
}
declare namespace Plexx.Mathlib {
    function factorial(n: number): number;
    function sortArrayOfPoint2DByX(unsortedPoints: Vec2[]): Vec2[];
    function sortArrayOfPoint2DByY(unsortedPoints: Vec2[]): Vec2[];
    class Vec2 {
        x: number;
        y: number;
        constructor(x: number, y: number);
    }
    class Vec3 {
        x: number;
        y: number;
        z: number;
        constructor(x: number, y: number, z: number);
        add(v0: Vec3): Vec3;
        multiply(n: number): Vec3;
    }
    class Mat3 {
        values: number[];
        constructor(values?: number[]);
        multiply(multi: Mat3): Mat3;
        multiplyVec3(multi: Vec3): Vec3;
        copy(): Plexx.Mathlib.Mat3;
        setIdentity(): this;
        setEmpty(): this;
        getArray(): number[];
        at(index: number): number;
        all(): number[];
        inverse(): Plexx.Mathlib.Mat3;
        det(): number;
        transpose(): Plexx.Mathlib.Mat3;
    }
    class StackMat3 {
        stack: Array<Plexx.Mathlib.Mat3>;
        constructor();
        pop(): Plexx.Mathlib.Mat3;
        push(transformationMatrix: Plexx.Mathlib.Mat3): void;
        top(): Plexx.Mathlib.Mat3;
    }
}
declare class XMLComment {
    commentText: string;
    constructor(commentText: string);
    getLineCommentTag(): string;
    getBlockCommentTag(): string;
}
declare namespace Plexx {
    class XMLTag {
        private name;
        private attributeList;
        private content;
        constructor(name: string);
        addAttribute(attributeName: string, attributeValue: string): void;
        setContent(content: string): void;
        getStartTag(): string;
        getEndTag(): string;
        getEmptyElementTag(): string;
        generateSvgText(): string;
        generateSvgElement(): any;
    }
}
declare namespace Plexx {
    import Vec2 = Plexx.Mathlib.Vec2;
    type MouseEventType = "mouseenter" | "mouseover" | "mousemove" | "mousedown" | "mouseup" | "click" | "dbclick" | "contextmenu" | "wheel" | "mouseleave" | "mouseout" | "mouseout" | "select" | "pointerlockchange" | "pointerlockerror";
    class MouseEvent {
        position: Vec2;
        type: MouseEventType;
        constructor(type: MouseEventType, position: Vec2);
    }
}
declare namespace Constants {
    var SVG_NAMESPACE: string;
    var SVG_INDENT: string;
    var DEFAULT_CANVAS_WIDTH: number;
    var DEFAULT_CANVAS_HEIGHT: number;
    var DEFAULT_CANVAS_COLOUR: string;
    var DEFAULT_COLOUR: string;
    var DEFAULT_X: number;
    var DEFAULT_Y: number;
    var DEFAULT_HEIGHT: number;
    var DEFAULT_WIDTH: number;
    var DEFAULT_CIRCLE_SIDES: number;
    var PRIMITIVES_POINTS_CIRCLE_SIDES: number;
    enum PointsType {
        HollowCircle = 1,
        HollowDiamond = 2,
    }
    enum LineType {
        Default = 1,
    }
    var PolyLineTyp: {
        Default: string;
    };
    var POINTS_DEFAULT_TYPE_ID: number;
    var POINTS_DEFAULT_SIZE: number;
}
declare namespace Plexx {
    interface RenderContextInterface {
        id: string;
        renderType?: RenderType;
    }
    enum RenderType {
        CANVAS2D = 0,
        SVG = 1,
        WEBGL = 2,
    }
    class RenderContext {
        private renderType;
        private canvas2D;
        private svg;
        private canvasWebGL;
        private domId;
        private canvasNode;
        private width;
        private height;
        private stylePosition;
        private styleTop;
        private styleLeft;
        constructor(values: RenderContextInterface);
        changeRenderType(renderType: RenderType): void;
        getRenderType(): RenderType;
        initCanvas2D(): void;
        clearSVG(): void;
        initSVG(): void;
        initWebGLCanvas(): void;
        getId(): string;
        getCanvas2D(): any;
        getCanvas2dContext(): any;
        getSVG(): any;
        getCanvasWebGL(): any;
        getWebGLRenderingContext(): WebGLRenderingContext;
        getHeight(): number;
        getWidth(): number;
        setHeight(height: number): void;
        setWidth(width: number): void;
        setCanvasNode(canvasNode: DrawingArea): void;
        isWebGLEnabled(): boolean;
        getClientWidth(): number;
        getClientHeight(): number;
        setStylePosition(stylePosition: string): void;
        setStyleTop(styleTop: string): void;
        setStyleLeft(styleLeft: string): void;
    }
}
declare namespace Plexx {
    interface LineInterface extends Plexx.TransformationsInterface {
        points: number[];
        width: number;
        type: Constants.LineType;
        colour: string;
        startArrow: boolean;
        endArrow: boolean;
        arrowScale: number;
    }
    class Line extends Plexx.Group implements LineInterface {
        points: number[];
        width: number;
        type: Constants.LineType;
        colour: string;
        private colourNode;
        startArrow: boolean;
        endArrow: boolean;
        arrowScale: number;
        private static startArrowDefault;
        private static endArrowDefault;
        private static arrowScaleDefault;
        private startArrowNode;
        private endArrowNode;
        private lineNode;
        constructor(values: LineInterface);
        setColour(colour: string): void;
        setPoints(points: number[]): void;
    }
}
declare namespace Plexx {
    interface RectangleInterface extends Plexx.TransformationsInterface {
        width: number;
        height: number;
        position: number[];
        colour?: string;
        borderColour?: string;
        borderWidth?: number;
    }
    class Rectangle extends Plexx.PrimitiveNode {
        private width;
        private height;
        private position;
        private colour;
        private borderColour;
        private borderWidth;
        private colourNode;
        private borderColourNode;
        constructor(values: RectangleInterface);
        setColour(colour: string): void;
        clone(): Rectangle;
        toString(): string;
        setWidth(width: number): void;
        getWidth(): number;
        setHeight(height: number): void;
        getHeight(): number;
        setPosition(position: number[]): void;
        getPosition(): number[];
        hitBox(renderContext: RenderContext, position: Plexx.Mathlib.Vec2): boolean;
        getBoundingBox(): Plexx.BoundingBox2d;
        updateCanvas2d(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): boolean;
        generateSvg(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): XMLTag;
        updateWebGl(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): boolean;
    }
}
declare namespace Plexx {
    interface TriangleInterface extends Plexx.TransformationsInterface {
        positionA: number[];
        positionB: number[];
        positionC: number[];
        colour?: string;
    }
    class Triangle extends Plexx.PrimitiveNode {
        positionA: number[];
        positionB: number[];
        positionC: number[];
        private colourNode;
        colour: string;
        constructor(values: TriangleInterface);
        clone(): Triangle;
        setColour(colour: string): void;
        toString(): string;
        hitBox(renderContext: RenderContext, position: Plexx.Mathlib.Vec2): boolean;
        getBoundingBox(): BoundingBox2d;
        generateSvg(renderContext: RenderContext, transformationMatrix: Plexx.Mathlib.Mat3): XMLTag;
        updateCanvas2d(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): boolean;
        updateWebGl(renderContext: RenderContext, transformationMatrix: Plexx.Mathlib.Mat3): boolean;
    }
}
declare namespace Plexx {
    type TextVertical = "bottom" | "middle" | "top";
    type TextHorizontal = "left" | "center" | "right";
    interface TextInterface extends TransformationsInterface {
        text: string;
        position: number[];
        colour?: string;
        fontSize?: number;
        fontFamily?: string;
        textVerticalAlignment?: TextVertical;
        textHorizontalAlignment?: TextHorizontal;
    }
    class Text extends PrimitiveNode {
        private text;
        private position;
        private colour;
        private fontSize;
        private fontFamily;
        private textVerticalAlignment;
        private textHorizontalAlignment;
        private textureCanvas;
        private helperCanvas;
        private offset;
        constructor(textValues: TextInterface);
        getText(): string;
        setText(text: string): void;
        getPosition(): number[];
        setPosition(position: number[]): void;
        getColour(): string;
        setColour(colour: string): void;
        getFontSize(): number;
        setFontSize(fontSize: number): void;
        getFontFamily(): string;
        setFontFamily(fontFamily: string): void;
        getTextVerticalAlignment(): TextVertical;
        setTextVerticalAlignment(textVerticalAlignment: TextVertical): void;
        getTextHorizontalAlignment(): TextHorizontal;
        setTextHorizontalAlignment(textHorizontalAlignment: TextHorizontal): void;
        clone(): Text;
        toString(): string;
        hitBox(renderContext: RenderContext, position: Plexx.Mathlib.Vec2): boolean;
        private static getValidTextureSize(size);
        generateSvg(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): XMLTag;
        updateCanvas2d(renderContext: RenderContext, transformationMatrix: Plexx.Mathlib.Mat3): boolean;
        updateWebGl(renderContext: RenderContext, transformationMatrix: Plexx.Mathlib.Mat3): boolean;
        private calculateOffset();
        private getTextWidth();
        private calculateTextWidth(text, fontFamily, fontSize);
        getTextHeight(text: string, fontFamily: string, fontSize: number): number;
        getBoundingBox(): BoundingBox2d;
        private createCanvasTexture(transformationMatrix);
        private static VSHADER_SOURCE;
        private static FSHADER_SOURCE;
        private initVertexBuffers(gl, canvasWidth, canvasHeight, transformationMatrix);
        private initTexture(gl, n);
        private loadTexture(gl, n, texture, u_Sampler);
        initWebGlShader(renderContext: RenderContext): void;
    }
}
declare namespace Plexx {
    interface CircleInterface extends Plexx.TransformationsInterface {
        radius: number;
        position: number[];
        colour?: string;
        borderColour?: string;
        borderWidth?: number;
    }
    class Circle extends Plexx.PrimitiveNode {
        private radius;
        private position;
        private colour;
        private borderColour;
        private borderWidth;
        private static CIRCLE_SIDES;
        private colourNode;
        private borderColourNode;
        constructor(values: CircleInterface);
        toString(): string;
        setColour(colour: string): void;
        hitBox(renderContext: RenderContext, position: Plexx.Mathlib.Vec2): boolean;
        getBoundingBox(): Plexx.BoundingBox2d;
        updateCanvas2d(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): boolean;
        generateSvg(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): Plexx.XMLTag;
        updateWebGl(renderContext: RenderContext, transformationMatrix: Plexx.Mathlib.Mat3): boolean;
        clone(): Circle;
    }
}
declare namespace Plexx {
    interface EllipseInterface extends Plexx.TransformationsInterface {
        radiusX: number;
        radiusY: number;
        position: number[];
        colour?: string;
    }
    class Ellipse extends Plexx.PrimitiveNode {
        radiusX: number;
        radiusY: number;
        position: Mathlib.Vec2;
        private colour;
        private circleSides;
        constructor(values: EllipseInterface);
        toString(): string;
        setColour(colour: string): void;
        updateCanvas2d(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): boolean;
        hitBox(renderContext: RenderContext, position: Plexx.Mathlib.Vec2): boolean;
        getBoundingBox(): Plexx.BoundingBox2d;
        generateSvg(renderContext: RenderContext, preTransformationMatrix: Plexx.Mathlib.Mat3): Plexx.XMLTag;
        updateWebGl(renderContext: RenderContext, transformationMatrix: Plexx.Mathlib.Mat3): boolean;
    }
}
declare namespace Plexx {
    interface PolygonInterface extends Plexx.TransformationsInterface {
        points: number[];
        colour: string;
    }
    class Polygon extends Plexx.PrimitiveNode {
        private points;
        private colour;
        private colourNode;
        constructor(values: PolygonInterface);
        clone(): Polygon;
        setColour(colour: string): void;
        toString(): string;
        hitBox(renderContext: RenderContext, position: Plexx.Mathlib.Vec2): boolean;
        updateCanvas2d(renderContext: RenderContext, transformationMatrix: Plexx.Mathlib.Mat3): boolean;
        generateSvg(renderContext: RenderContext, transformationMatrix: Plexx.Mathlib.Mat3): XMLTag;
        updateWebGl(renderContext: RenderContext, transformationMatrix: Plexx.Mathlib.Mat3): boolean;
    }
}
declare namespace Plexx {
    import Vec2 = Plexx.Mathlib.Vec2;
    class Line2D {
        a: Vec2;
        b: Vec2;
        constructor(a: Vec2, b: Vec2);
        copy(): Line2D;
        intersect(l: Line2D): Vec2;
        parallelTranslate(s: number): void;
    }
    interface PolyLineInterface extends Plexx.TransformationsInterface {
        points: number[];
        width?: number;
        type?: string;
        colour?: string;
    }
    class PolyLine extends Plexx.Group {
        private points;
        private width;
        private type;
        private colour;
        private colourNode;
        private polygonNode;
        constructor(values: PolyLineInterface);
        setColour(colour: string): void;
        toString(): string;
    }
}
declare namespace Plexx {
    class InitNodeVisitor implements Plexx.NodeVisitorInterface {
        private renderContext;
        constructor(renderContext: RenderContext);
        visitLeafNode(leafNode: Plexx.LeafNode): void;
        visitCompositeNode(compositeNode: Plexx.CompositeNode): void;
        visitGroupNode(groupNode: Plexx.Group): void;
        visitTransformationNode(transformationNode: Plexx.TransformationNode): void;
        visitDrawingAreaNode: (drawingArea: DrawingArea) => void;
        visitPrimitiveNode(primitiveNode: Plexx.PrimitiveNodeinterface): void;
    }
}
declare namespace Plexx {
    class BoundingBox2d {
        private min;
        private max;
        constructor(min: Mathlib.Vec2, max: Mathlib.Vec2);
        expandBy(bb: BoundingBox2d): void;
        contains(v: Mathlib.Vec2): boolean;
        getMin(): Mathlib.Vec2;
        getMax(): Mathlib.Vec2;
        transform(m: Mathlib.Mat3): BoundingBox2d;
        translate(d: Mathlib.Vec2): void;
    }
}
declare namespace Plexx {
    import Point2D = Plexx.Mathlib.Vec2;
    type PlexxEventType = "mousemove" | "mousein" | "mouseout" | "click" | "mouseup" | "mousedown" | "dragging" | "draggingend" | "none";
    class PlexxEvent {
        position: Point2D;
        type: PlexxEventType;
        constructor(type: PlexxEventType, position: Point2D);
    }
}
declare namespace Plexx {
    interface PointsInterface extends Plexx.TransformationsInterface {
        points: number[];
        type: Constants.PointsType;
        size: number;
        colour: string;
        borderSize?: number;
    }
    class Points extends Plexx.Group implements PointsInterface {
        points: number[];
        type: Constants.PointsType;
        colour: string;
        size: number;
        borderSize: number;
        private colourNode;
        private static defaultBorderSize;
        constructor(values: PointsInterface);
        setColour(colour: string): void;
    }
}
