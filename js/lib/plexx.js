var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Plexx;
(function (Plexx) {
    var ClickNodeVisitor = (function () {
        function ClickNodeVisitor(renderContext, mouseEvent, lastEvent) {
            this.isAlreadyHoveringAPrimitiveNode = false;
            this.renderContext = renderContext;
            this.mouseEvent = mouseEvent;
            this.lastEvent = lastEvent;
            this.event = new Plexx.PlexxEvent("none", new Plexx.Mathlib.Vec2(0, 0));
            this.nodeCounter = 0;
            this.transformationMatrixStack = new Plexx.Mathlib.StackMat3();
            this.transformationMatrixStack.push(new Plexx.Mathlib.Mat3().setIdentity());
            this.drawingAreaMatrixStack = new Plexx.Mathlib.StackMat3();
            this.drawingAreaMatrixStack.push(new Plexx.Mathlib.Mat3().setIdentity());
            this.boundingBoxVectors = [];
        }
        ClickNodeVisitor.prototype.visitDrawingAreaNode = function (drawingArea) {
            var clickEvent = "none";
            this.nodeCounter++;
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(drawingArea.translationNode.getInverseTransformationMatrix()));
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(drawingArea.rotationNode.getInverseTransformationMatrix()));
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(drawingArea.scaleNode.getInverseTransformationMatrix()));
            this.drawingAreaMatrixStack.push(this.drawingAreaMatrixStack.top().multiply(drawingArea.scaleNode.getInverseTransformationMatrix()));
            var mousePosition = new Plexx.Mathlib.Vec3(this.mouseEvent.position.x, this.mouseEvent.position.y, 1);
            var mousePositionRelative = this.drawingAreaMatrixStack.top().transpose().multiplyVec3(mousePosition);
            var self = this;
            var childrenReverseOrder = drawingArea.getChildren().slice().reverse();
            childrenReverseOrder.forEach(function (childNode) {
                clickEvent = childNode.accept(self);
            });
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.drawingAreaMatrixStack.pop();
            return new Plexx.PlexxEvent(clickEvent, new Plexx.Mathlib.Vec2(0, 0));
        };
        ClickNodeVisitor.prototype.visitGroupNode = function (groupNode) {
            var _this = this;
            var self = this;
            this.nodeCounter++;
            var eventType = "none";
            var groupEventType = "none";
            var childsReverseOrder = groupNode.getChildren().slice().reverse();
            var clickEventInChildes = false;
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(groupNode.translationNode.getInverseTransformationMatrix()));
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(groupNode.rotationNode.getInverseTransformationMatrix()));
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(groupNode.scaleNode.getInverseTransformationMatrix()));
            var mousePosition = new Plexx.Mathlib.Vec3(this.mouseEvent.position.x, this.mouseEvent.position.y, 1);
            var mousePositionRelative = this.drawingAreaMatrixStack.top().transpose().multiplyVec3(mousePosition);
            var draggingPosition = mousePosition;
            var clickEvent = "none";
            if (groupNode.isHidden) {
                if (groupNode.mouseOver && groupNode.eventMap["mouseout"]) {
                    this.event.type = "mouseout";
                    groupNode.eventMap["mouseout"]({
                        sender: groupNode,
                        mousePos: {
                            x: mousePositionRelative.x,
                            y: mousePositionRelative.y
                        }
                    });
                    groupNode.mouseOver = false;
                }
            }
            if (groupNode.isDragging) {
                if (this.mouseEvent.type === "mousemove") {
                    console.log("is dragging");
                    clickEvent = "dragging";
                    var diffX = mousePositionRelative.x - groupNode.draggingPoint.x;
                    var diffY = mousePositionRelative.y - groupNode.draggingPoint.y;
                    groupNode.setTranslation([groupNode.translationNode.translation[0] + diffX, groupNode.translationNode.translation[1] + diffY]);
                    groupNode.draggingPoint.x = mousePositionRelative.x;
                    groupNode.draggingPoint.y = mousePositionRelative.y;
                    if (groupNode.eventMap["dragmove"]) {
                        groupNode.eventMap["dragmove"]({
                            sender: groupNode,
                            mousePos: {
                                x: mousePositionRelative.x,
                                y: mousePositionRelative.y
                            }
                        });
                    }
                    this.isAlreadyHoveringAPrimitiveNode = true;
                    this.event.type = "dragging";
                    groupNode.isDragging = true;
                    if (groupNode.eventMap["dragmove"]) {
                        groupNode.eventMap["dragmove"]({
                            sender: groupNode,
                            mousePos: {
                                x: mousePositionRelative.x,
                                y: mousePositionRelative.y
                            }
                        });
                    }
                    this.transformationMatrixStack.pop();
                    this.transformationMatrixStack.pop();
                    this.transformationMatrixStack.pop();
                    return;
                }
                else if (this.mouseEvent.type === "mouseup") {
                    console.log("is dragging end");
                    var diffX = mousePositionRelative.x - groupNode.draggingPoint.x;
                    var diffY = mousePositionRelative.y - groupNode.draggingPoint.y;
                    groupNode.setTranslation([groupNode.translationNode.translation[0] + diffX, groupNode.translationNode.translation[1] + diffY]);
                    groupNode.draggingPoint = new Plexx.Mathlib.Vec2(mousePositionRelative.x, mousePositionRelative.y);
                    this.event.type = "draggingend";
                    groupNode.isDragging = false;
                    groupNode.draggingPoint = null;
                    if (groupNode.eventMap["dragend"]) {
                        groupNode.eventMap["dragend"]({
                            sender: groupNode,
                            mousePos: {
                                x: mousePositionRelative.x,
                                y: mousePositionRelative.y
                            }
                        });
                    }
                    this.transformationMatrixStack.pop();
                    this.transformationMatrixStack.pop();
                    this.transformationMatrixStack.pop();
                    return;
                }
            }
            childsReverseOrder.forEach(function (childNode) {
                groupEventType = childNode.accept(self);
                if (groupEventType !== "none" && groupEventType !== "mouseout") {
                    clickEventInChildes = true;
                    _this.event.type = groupEventType;
                    if (_this.mouseEvent.type === "click") {
                        if (groupNode.eventMap["click"]) {
                            clickEvent = "click";
                            _this.event.type = clickEvent;
                            groupNode.eventMap["click"]({
                                sender: groupNode,
                                mousePos: {
                                    x: mousePositionRelative.x,
                                    y: mousePositionRelative.y
                                }
                            });
                        }
                    }
                    else if (_this.mouseEvent.type === "mousedown") {
                        if (groupNode.draggable) {
                            groupNode.isDragging = true;
                            groupNode.draggingPoint = new Plexx.Mathlib.Vec2(mousePositionRelative.x, mousePositionRelative.y);
                            console.log("start dragging");
                        }
                        if (groupNode.eventMap["mousedown"]) {
                            clickEvent = "mousedown";
                            _this.event.type = clickEvent;
                            groupNode.eventMap["mousedown"]({
                                sender: groupNode,
                                mousePos: {
                                    x: mousePositionRelative.x,
                                    y: mousePositionRelative.y
                                }
                            });
                        }
                    }
                    else if (_this.mouseEvent.type === "mouseup") {
                        if (groupNode.eventMap["mouseup"]) {
                            clickEvent = "mouseup";
                            _this.event.type = clickEvent;
                            groupNode.eventMap["mouseup"]({
                                sender: groupNode,
                                mousePos: {
                                    x: mousePositionRelative.x,
                                    y: mousePositionRelative.y
                                }
                            });
                        }
                    }
                    else if (_this.mouseEvent.type === "mousemove") {
                        if (groupNode.eventMap["mousemove"]) {
                            clickEvent = "mousemove";
                            _this.event.type = clickEvent;
                            groupNode.eventMap["mousemove"]({
                                sender: groupNode,
                                mousePos: {
                                    x: mousePositionRelative.x,
                                    y: mousePositionRelative.y
                                }
                            });
                        }
                    }
                    if (!groupNode.mouseOver) {
                        groupNode.mouseOver = true;
                        if (groupNode.eventMap["mousein"]) {
                            _this.event.type = "mousein";
                            groupNode.eventMap["mousein"]({
                                sender: groupNode,
                                mousePos: {
                                    x: mousePositionRelative.x,
                                    y: mousePositionRelative.y
                                }
                            });
                        }
                    }
                }
                else if (groupEventType === "mouseout") {
                    if (groupNode.mouseOver) {
                        groupNode.mouseOver = false;
                        if (groupNode.eventMap["mouseout"]) {
                            groupNode.eventMap["mouseout"]({
                                sender: groupNode,
                                mousePos: {
                                    x: mousePositionRelative.x,
                                    y: mousePositionRelative.y
                                }
                            });
                        }
                    }
                }
            });
            if (!clickEventInChildes) {
                if (groupNode.mouseOver) {
                    groupNode.mouseOver = false;
                    if (groupNode.eventMap["mouseout"]) {
                        groupNode.eventMap["mouseout"]({
                            sender: groupNode,
                            mousePos: {
                                x: mousePositionRelative.x,
                                y: mousePositionRelative.y
                            }
                        });
                    }
                }
            }
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            return eventType;
        };
        ClickNodeVisitor.prototype.visitTransformationNode = function (transformationNode) {
            var clickEvent = "none";
            this.nodeCounter++;
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(transformationNode.getInverseTransformationMatrix()));
            var self = this;
            transformationNode.getChildren().forEach(function (childNode) {
                childNode.accept(self);
            });
            this.transformationMatrixStack.pop();
            return clickEvent;
        };
        ClickNodeVisitor.prototype.visitPrimitiveNode = function (primitiveNode) {
            var clickEvent = "none";
            this.nodeCounter++;
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(primitiveNode.translationNode.getInverseTransformationMatrix()));
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(primitiveNode.rotationNode.getInverseTransformationMatrix()));
            this.transformationMatrixStack.push(this.transformationMatrixStack.top().multiply(primitiveNode.scaleNode.getInverseTransformationMatrix()));
            var mousePosition = new Plexx.Mathlib.Vec3(this.mouseEvent.position.x, this.mouseEvent.position.y, 1);
            var mousePositionRelative = this.drawingAreaMatrixStack.top().transpose().multiplyVec3(mousePosition);
            var mousePositionTransformed = this.transformationMatrixStack.top().transpose().multiplyVec3(mousePosition);
            if (primitiveNode.isHidden || this.isAlreadyHoveringAPrimitiveNode) {
                if (primitiveNode.mouseOver && primitiveNode.eventMap["mouseout"]) {
                    clickEvent = "mouseout";
                    primitiveNode.eventMap["mouseout"]({
                        sender: primitiveNode,
                        mousePos: {
                            x: mousePositionRelative.x,
                            y: mousePositionRelative.y
                        }
                    });
                    primitiveNode.mouseOver = false;
                }
            }
            else if (primitiveNode.isDragging && this.mouseEvent.type === "mousemove") {
                clickEvent = "dragging";
                var diffX = mousePositionRelative.x - primitiveNode.draggingPoint.x;
                var diffY = mousePositionRelative.y - primitiveNode.draggingPoint.y;
                var boundingBox = primitiveNode.getBoundingBox();
                boundingBox.translate(new Plexx.Mathlib.Vec2(primitiveNode.translationNode.translation[0], primitiveNode.translationNode.translation[1]));
                if (primitiveNode.draggingSpace.length === 4) {
                    if (boundingBox.getMin().x + diffX < primitiveNode.draggingSpace[0]) {
                        diffX = primitiveNode.draggingSpace[0] - boundingBox.getMin().x;
                        mousePositionRelative.x = primitiveNode.draggingPoint.x + diffX;
                    }
                    if (boundingBox.getMax().x + diffX > primitiveNode.draggingSpace[0] + primitiveNode.draggingSpace[2]) {
                        diffX = primitiveNode.draggingSpace[0] + primitiveNode.draggingSpace[2] - boundingBox.getMax().x;
                        mousePositionRelative.x = primitiveNode.draggingPoint.x + diffX;
                    }
                    if (boundingBox.getMin().y + diffY < primitiveNode.draggingSpace[1]) {
                        diffY = primitiveNode.draggingSpace[1] - boundingBox.getMin().y;
                        mousePositionRelative.y = primitiveNode.draggingPoint.y + diffY;
                    }
                    if (boundingBox.getMax().y + diffY > primitiveNode.draggingSpace[1] + primitiveNode.draggingSpace[3]) {
                        diffY = primitiveNode.draggingSpace[1] + primitiveNode.draggingSpace[3] - boundingBox.getMax().y;
                        mousePositionRelative.y = primitiveNode.draggingPoint.y + diffY;
                    }
                }
                primitiveNode.setTranslation([primitiveNode.translationNode.translation[0] + diffX, primitiveNode.translationNode.translation[1] + diffY]);
                primitiveNode.draggingPoint.x = mousePositionRelative.x;
                primitiveNode.draggingPoint.y = mousePositionRelative.y;
                if (primitiveNode.eventMap["dragmove"]) {
                    primitiveNode.eventMap["dragmove"]({
                        sender: primitiveNode,
                        mousePos: {
                            x: mousePositionRelative.x,
                            y: mousePositionRelative.y
                        }
                    });
                }
                this.isAlreadyHoveringAPrimitiveNode = true;
            }
            else if (primitiveNode.isDragging && this.mouseEvent.type === "mouseup") {
                clickEvent = "draggingend";
                var diffX = mousePositionRelative.x - primitiveNode.draggingPoint.x;
                var diffY = mousePositionRelative.y - primitiveNode.draggingPoint.y;
                var boundingBox = primitiveNode.getBoundingBox();
                boundingBox.translate(new Plexx.Mathlib.Vec2(primitiveNode.translationNode.translation[0], primitiveNode.translationNode.translation[1]));
                if (primitiveNode.draggingSpace.length === 4) {
                    if (boundingBox.getMin().x + diffX < primitiveNode.draggingSpace[0]) {
                        diffX = primitiveNode.draggingSpace[0] - boundingBox.getMin().x;
                        mousePositionRelative.x = primitiveNode.draggingPoint.x + diffX;
                    }
                    if (boundingBox.getMax().x + diffX > primitiveNode.draggingSpace[0] + primitiveNode.draggingSpace[2]) {
                        diffX = primitiveNode.draggingSpace[0] + primitiveNode.draggingSpace[2] - boundingBox.getMax().x;
                        mousePositionRelative.x = primitiveNode.draggingPoint.x + diffX;
                    }
                    if (boundingBox.getMin().y + diffY < primitiveNode.draggingSpace[1]) {
                        diffY = primitiveNode.draggingSpace[1] - boundingBox.getMin().y;
                        mousePositionRelative.y = primitiveNode.draggingPoint.y + diffY;
                    }
                    if (boundingBox.getMax().y + diffY > primitiveNode.draggingSpace[1] + primitiveNode.draggingSpace[3]) {
                        diffY = primitiveNode.draggingSpace[1] + primitiveNode.draggingSpace[3] - boundingBox.getMax().y;
                        mousePositionRelative.y = primitiveNode.draggingPoint.y + diffY;
                    }
                }
                primitiveNode.draggingPoint.x = mousePositionRelative.x;
                primitiveNode.draggingPoint.y = mousePositionRelative.y;
                if (primitiveNode.eventMap["dragend"]) {
                    primitiveNode.eventMap["dragend"]({
                        sender: primitiveNode,
                        mousePos: {
                            x: mousePositionRelative.x,
                            y: mousePositionRelative.y
                        }
                    });
                }
                primitiveNode.draggingPoint = null;
                primitiveNode.isDragging = false;
                this.isAlreadyHoveringAPrimitiveNode = true;
            }
            else if (primitiveNode.hitBox(this.renderContext, new Plexx.Mathlib.Vec2(mousePositionTransformed.x, mousePositionTransformed.y))) {
                clickEvent = "mousein";
                this.isAlreadyHoveringAPrimitiveNode = true;
                if (this.mouseEvent.type === "click") {
                    if (primitiveNode.eventMap["click"]) {
                        clickEvent = "click";
                        this.event.type = clickEvent;
                        primitiveNode.eventMap["click"]({
                            sender: primitiveNode,
                            mousePos: {
                                x: mousePositionRelative.x,
                                y: mousePositionRelative.y
                            }
                        });
                    }
                }
                else if (this.mouseEvent.type === "mousedown") {
                    if (primitiveNode.draggable) {
                        primitiveNode.isDragging = true;
                        primitiveNode.draggingPoint = new Plexx.Mathlib.Vec2(0, 0);
                        primitiveNode.draggingPoint.x = mousePositionRelative.x;
                        primitiveNode.draggingPoint.y = mousePositionRelative.y;
                    }
                    if (primitiveNode.eventMap["mousedown"]) {
                        clickEvent = "mousedown";
                        this.event.type = clickEvent;
                        primitiveNode.eventMap["mousedown"]({
                            sender: primitiveNode,
                            mousePos: {
                                x: mousePositionRelative.x,
                                y: mousePositionRelative.y
                            }
                        });
                    }
                }
                else if (this.mouseEvent.type === "mouseup") {
                    if (primitiveNode.eventMap["mouseup"]) {
                        clickEvent = "mouseup";
                        this.event.type = clickEvent;
                        primitiveNode.eventMap["mouseup"]({
                            sender: primitiveNode,
                            mousePos: {
                                x: mousePositionRelative.x,
                                y: mousePositionRelative.y
                            }
                        });
                    }
                }
                else if (this.mouseEvent.type === "mousemove") {
                    if (primitiveNode.eventMap["mousemove"]) {
                        clickEvent = "mousemove";
                        this.event.type = clickEvent;
                        primitiveNode.eventMap["mousemove"]({
                            sender: primitiveNode,
                            mousePos: {
                                x: mousePositionRelative.x,
                                y: mousePositionRelative.y
                            }
                        });
                    }
                }
                if (!primitiveNode.mouseOver) {
                    primitiveNode.mouseOver = true;
                    if (primitiveNode.eventMap["mousein"]) {
                        clickEvent = "mousein";
                        primitiveNode.eventMap["mousein"]({
                            sender: primitiveNode,
                            mousePos: {
                                x: mousePositionRelative.x,
                                y: mousePositionRelative.y
                            }
                        });
                    }
                }
            }
            else if (primitiveNode.mouseOver && primitiveNode.eventMap["mouseout"]) {
                this.event.type = "mouseout";
                primitiveNode.eventMap["mouseout"]({
                    sender: primitiveNode,
                    mousePos: {
                        x: mousePositionRelative.x,
                        y: mousePositionRelative.y
                    }
                });
                primitiveNode.mouseOver = false;
            }
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            return clickEvent;
        };
        return ClickNodeVisitor;
    }());
    Plexx.ClickNodeVisitor = ClickNodeVisitor;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var RenderNodeVisitor = (function () {
        function RenderNodeVisitor(renderContext) {
            this.renderContext = renderContext;
            this.transformationMatrixStack = new Plexx.Mathlib.StackMat3();
            this.transformationMatrixStack.push(new Plexx.Mathlib.Mat3().setIdentity());
        }
        RenderNodeVisitor.prototype.visitDrawingAreaNode = function (drawingArea) {
            var currentRenderType = this.renderContext.getRenderType();
            var thisRenderNodeVisitor = this;
            this.transformationMatrixStack.push(drawingArea.translationNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(drawingArea.rotationNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(drawingArea.scaleNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            if (currentRenderType === Plexx.RenderType.CANVAS2D) {
                Plexx.DrawingArea.clearCanvas2d(this.renderContext);
                drawingArea.updateCanvas2d(this.renderContext, this.transformationMatrixStack.top());
            }
            else if (currentRenderType === Plexx.RenderType.SVG) {
                this.renderContext.clearSVG();
                drawingArea.updateSvg(this.renderContext, this.transformationMatrixStack.top());
            }
            else if (currentRenderType === Plexx.RenderType.WEBGL) {
                drawingArea.updateWebGl(this.renderContext, this.transformationMatrixStack.top());
            }
            drawingArea.getChildren().forEach(function (childNode) {
                childNode.accept(thisRenderNodeVisitor);
            });
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
        };
        RenderNodeVisitor.prototype.visitPrimitiveNode = function (primitiveNode) {
            var currentRenderType = this.renderContext.getRenderType();
            this.transformationMatrixStack.push(primitiveNode.translationNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(primitiveNode.rotationNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(primitiveNode.scaleNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            if (!primitiveNode.isHidden) {
                if (currentRenderType === Plexx.RenderType.WEBGL) {
                    primitiveNode.updateWebGl(this.renderContext, this.transformationMatrixStack.top());
                }
                else if (currentRenderType === Plexx.RenderType.CANVAS2D) {
                    primitiveNode.updateCanvas2d(this.renderContext, this.transformationMatrixStack.top());
                }
                else if (currentRenderType === Plexx.RenderType.SVG) {
                    var svgObject = primitiveNode.generateSvg(this.renderContext, this.transformationMatrixStack.top())
                        .generateSvgElement();
                    this.renderContext.getSVG().appendChild(svgObject);
                }
            }
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
        };
        RenderNodeVisitor.prototype.visitTransformationNode = function (transformationNode) {
            var _this = this;
            this.transformationMatrixStack.push(transformationNode.getTransformationMatrix());
            transformationNode.getChildren().forEach(function (childNode) {
                childNode.accept(_this);
            });
            this.transformationMatrixStack.pop();
        };
        RenderNodeVisitor.prototype.visitGroupNode = function (groupNode) {
            var thisRenderNodeVisitor = this;
            this.transformationMatrixStack.push(groupNode.translationNode.getTransformationMatrix().multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(groupNode.rotationNode.getTransformationMatrix().multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(groupNode.scaleNode.getTransformationMatrix().multiply(this.transformationMatrixStack.top()));
            if (!groupNode.isHidden) {
                groupNode.getChildren().forEach(function (childNode) {
                    childNode.accept(thisRenderNodeVisitor);
                });
            }
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
        };
        return RenderNodeVisitor;
    }());
    Plexx.RenderNodeVisitor = RenderNodeVisitor;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var SvgNodeVisitor = (function () {
        function SvgNodeVisitor(renderContext) {
            this.intentLevel = 0;
            this.renderContext = renderContext;
            this.transformationMatrixStack = new Plexx.Mathlib.StackMat3();
            this.transformationMatrixStack.push(new Plexx.Mathlib.Mat3().setIdentity());
            this.text = "";
        }
        SvgNodeVisitor.prototype.getCurrentIntent = function () {
            var intentText = "";
            for (var index = 1; index <= this.intentLevel; index++) {
                intentText += SvgNodeVisitor.intendWidth;
            }
            return intentText;
        };
        SvgNodeVisitor.prototype.visitGroupNode = function (groupNode) {
            var _this = this;
            this.transformationMatrixStack.push(groupNode.translationNode.getTransformationMatrix().multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(groupNode.rotationNode.getTransformationMatrix().multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(groupNode.scaleNode.getTransformationMatrix().multiply(this.transformationMatrixStack.top()));
            var thisSvgNodeVisitor = this;
            var text = "";
            var nodeText = "";
            console.log("Group", this.transformationMatrixStack.top());
            if (!groupNode.isHidden) {
                this.intentLevel++;
                groupNode.getChildren().forEach(function (childNode) {
                    nodeText = childNode.accept(thisSvgNodeVisitor).toString();
                    if (nodeText !== "") {
                        text += _this.getCurrentIntent();
                        text += nodeText;
                        text += "\n";
                    }
                });
                this.intentLevel--;
            }
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            return text;
        };
        SvgNodeVisitor.prototype.visitTransformationNode = function (transformationNode) {
            var _this = this;
            this.transformationMatrixStack.push(transformationNode.getTransformationMatrix());
            transformationNode.getChildren().forEach(function (childNode) {
                childNode.accept(_this);
            });
            this.transformationMatrixStack.pop();
        };
        SvgNodeVisitor.prototype.visitDrawingAreaNode = function (drawingArea) {
            var _this = this;
            this.transformationMatrixStack.push(drawingArea.translationNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(drawingArea.rotationNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(drawingArea.scaleNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            var thisSvgNodeVisitor = this;
            var text = "";
            var nodeText;
            text = drawingArea.generateSvg(this.renderContext, this.transformationMatrixStack.top()).getStartTag();
            text += "\n";
            text += "  <rect width=\"" + drawingArea.getClientWidth() + "\" height=\"" + drawingArea.getClientHeight() + "\" x=\"0\"" + " y=\"0\"" + " fill=\"" + drawingArea.getBackgroundColor() + "\" transform=\"" + "\"/>\n";
            console.log("DrawingArea", this.transformationMatrixStack.top());
            var xmlTag = new Plexx.XMLTag("rect");
            xmlTag.addAttribute("width", String(this.renderContext.getWidth()));
            xmlTag.addAttribute("height", String(this.renderContext.getHeight()));
            xmlTag.addAttribute("x", String(0));
            xmlTag.addAttribute("y", String(0));
            xmlTag.addAttribute("fill", String(drawingArea.getColour()));
            xmlTag.addAttribute("stroke", "none");
            text += xmlTag.generateSvgText();
            this.intentLevel++;
            drawingArea.getChildren().forEach(function (childNode) {
                nodeText = childNode.accept(thisSvgNodeVisitor).toString();
                if (nodeText !== "") {
                    text += _this.getCurrentIntent();
                    text += nodeText;
                    text += "\n";
                }
            });
            this.intentLevel--;
            text += drawingArea.generateSvg(this.renderContext, this.transformationMatrixStack.top()).getEndTag();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            return text;
        };
        SvgNodeVisitor.prototype.visitPrimitiveNode = function (primitiveNode) {
            this.transformationMatrixStack.push(primitiveNode.translationNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(primitiveNode.rotationNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            this.transformationMatrixStack.push(primitiveNode.scaleNode.getTransformationMatrix()
                .multiply(this.transformationMatrixStack.top()));
            var text = "";
            console.log("Primitive", this.transformationMatrixStack.top());
            if (!primitiveNode.isHidden) {
                text = primitiveNode.generateSvg(this.renderContext, this.transformationMatrixStack.top()).generateSvgText();
            }
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            this.transformationMatrixStack.pop();
            return text;
        };
        return SvgNodeVisitor;
    }());
    SvgNodeVisitor.intendWidth = "  ";
    Plexx.SvgNodeVisitor = SvgNodeVisitor;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var SceneGraphNode = (function () {
        function SceneGraphNode(name) {
            this.id = 0;
            this.name = name;
            this.childNodes = [];
            this.parentNode = null;
            this.rootNode = null;
        }
        SceneGraphNode.prototype.add = function (node) {
            node.parentNode = this;
            if (this instanceof Plexx.DrawingArea) {
                node.setRootNode(this);
            }
            this.childNodes.push(node);
        };
        SceneGraphNode.prototype.getChildren = function () {
            return this.childNodes;
        };
        SceneGraphNode.prototype.getName = function () {
            return this.name;
        };
        SceneGraphNode.mergeInterfaces = function (valueList, defaultValueList) {
            var mergedValues = valueList;
            for (var key in defaultValueList) {
                if (defaultValueList.hasOwnProperty(key) && !valueList.hasOwnProperty(key)) {
                    mergedValues[key] = defaultValueList[key];
                }
            }
            return mergedValues;
        };
        SceneGraphNode.prototype.toString = function () {
            var text = this.getName() + " { ";
            for (var key in this.values) {
                if (this.values.hasOwnProperty(key)) {
                    text += key + ": " + this.values[key] + "; ";
                }
            }
            text += "}";
            return text;
        };
        SceneGraphNode.prototype.setValues = function (values) {
            this.values = values;
        };
        SceneGraphNode.prototype.setParent = function (parentNode) {
            this.parentNode = parentNode;
            if (parentNode.getRootNode() !== null) {
                this.rootNode = parentNode.getRootNode();
            }
        };
        SceneGraphNode.prototype.getParent = function () {
            return this.parentNode;
        };
        SceneGraphNode.prototype.setRootNode = function (rootNode) {
            this.rootNode = rootNode;
            this.childNodes.forEach(function (childNode) {
                childNode.setRootNode(rootNode);
            });
        };
        SceneGraphNode.prototype.getRootNode = function () {
            return this.rootNode;
        };
        return SceneGraphNode;
    }());
    Plexx.SceneGraphNode = SceneGraphNode;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var PrimitiveNode = (function (_super) {
        __extends(PrimitiveNode, _super);
        function PrimitiveNode(name, values) {
            var _this = _super.call(this, name) || this;
            _this.draggable = false;
            _this.isDragging = false;
            _this.translation = values.translation || [0, 0];
            _this.scale = values.scale || [1, 1];
            _this.scalePoint = values.scalePoint || [0, 0];
            _this.rotation = values.rotation || 0;
            _this.rotationPoint = values.rotationPoint || [0, 0];
            _this.translationNode = new Plexx.TranslationNode(values);
            _this.scaleNode = new Plexx.ScaleNode(values);
            _this.rotationNode = new Plexx.RotationNode(values);
            _this.eventMap = {};
            _this.mouseOver = false;
            _this.isHidden = false;
            _this.draggable = values.draggable;
            _this.draggingSpace = values.draggingSpace || [];
            return _this;
        }
        PrimitiveNode.prototype.on = function (eventName, callback) {
            this.eventMap[eventName] = callback;
        };
        PrimitiveNode.prototype.setTranslation = function (translation) {
            this.translation = translation;
            this.translationNode.translation = translation;
        };
        PrimitiveNode.prototype.addTranslation = function (translation) {
            this.translation[0] += translation[0];
            this.translation[1] += translation[1];
            this.translationNode.translation[0] += translation[0];
            this.translationNode.translation[1] += translation[1];
        };
        PrimitiveNode.prototype.setRotation = function (rotation) {
            this.rotation = rotation;
            this.rotationNode.rotation = rotation;
        };
        PrimitiveNode.prototype.addRotation = function (rotation) {
            this.rotation += rotation;
            this.rotationNode.rotation += rotation;
        };
        PrimitiveNode.prototype.setScale = function (scale) {
            this.scale = scale;
            this.scaleNode.scale = scale;
        };
        PrimitiveNode.prototype.addScale = function (scale) {
            this.scale[0] += scale[0];
            this.scale[1] += scale[1];
            this.scaleNode.scale[0] += scale[0];
            this.scaleNode.scale[1] += scale[1];
        };
        PrimitiveNode.prototype.accept = function (nodeVisitor) {
            return nodeVisitor.visitPrimitiveNode(this);
        };
        PrimitiveNode.prototype.updateWebGl = function (renderContext, currentTransformationMatrix) {
            return false;
        };
        PrimitiveNode.prototype.updateCanvas2d = function (renderContext, currentTransformationMatrix) {
            return false;
        };
        PrimitiveNode.prototype.generateSvg = function (renderContext, preTransformationMatrix) {
            var xmlTag = new Plexx.XMLTag("primitiveNode");
            return xmlTag;
        };
        PrimitiveNode.prototype.clone = function () {
            return null;
        };
        PrimitiveNode.prototype.hitBox = function (renderContext, mousePosition) {
            return false;
        };
        PrimitiveNode.prototype.getBoundingBox = function () {
            return null;
        };
        PrimitiveNode.prototype.executeClickEvent = function () {
            console.log("YEAH I WAS CLICKED!");
        };
        PrimitiveNode.prototype.getTransformationInterface = function () {
            return {
                translation: this.translation,
                scale: this.scale,
                scalePoint: this.scalePoint,
                rotation: this.rotation,
                rotationPoint: this.rotationPoint
            };
        };
        PrimitiveNode.prototype.initWebGlShader = function (renderContext) {
            var gl = renderContext.getWebGLRenderingContext();
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            this.shaderProgram = gl.createProgram();
            gl.shaderSource(vertexShader, Plexx.Rectangle.vertexShaderSource);
            gl.compileShader(vertexShader);
            gl.shaderSource(fragmentShader, Plexx.Rectangle.fragmentShaderSource);
            gl.compileShader(fragmentShader);
            gl.attachShader(this.shaderProgram, vertexShader);
            gl.attachShader(this.shaderProgram, fragmentShader);
            gl.linkProgram(this.shaderProgram);
        };
        PrimitiveNode.prototype.initWebGlBuffers = function (renderContext) {
            var gl = renderContext.getWebGLRenderingContext();
            this.buffer = gl.createBuffer();
        };
        PrimitiveNode.prototype.initWebGlTextures = function (renderContext) {
        };
        return PrimitiveNode;
    }(Plexx.SceneGraphNode));
    PrimitiveNode.vertexShaderSource = "attribute vec2 aVertexPosition;                                                                       \n" +
        "                                                                                                      \n" +
        "uniform int matrix_size;                                                                              \n" +
        "uniform mat3 matrix;                                                                                  \n" +
        "uniform vec2 resolution;                                                                              \n" +
        "                                                                                                      \n" +
        "void main() {                                                                                         \n" +
        "  vec2 pos = (matrix * vec3(aVertexPosition, 1)).xy;                                                  \n" +
        "  vec2 tmp1 = pos / (resolution);                                                                     \n" +
        "  vec2 tmp2 = tmp1 * 2.0;                                                                             \n" +
        "  vec2 tmp3 = tmp2 - 1.0;                                                                             \n" +
        "  gl_Position = vec4(tmp3 , 0, 1);                                                                    \n" +
        "}                                                                                                     \n";
    PrimitiveNode.fragmentShaderSource = "precision mediump float;                                                                              \n" +
        "                                                                                                      \n" +
        "uniform vec4 colour;                                                                                  \n" +
        "                                                                                                      \n" +
        "void main() {                                                                                         \n" +
        "  gl_FragColor = colour;                                                                              \n" +
        "}                                                                                                     \n";
    Plexx.PrimitiveNode = PrimitiveNode;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var LeafNode = (function (_super) {
        __extends(LeafNode, _super);
        function LeafNode() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.vertexShaderSource = "attribute Vec2 aVertexPosition;                                                                       \n" +
                "                                                                                                      \n" +
                "uniform int matrix_size;                                                                              \n" +
                "uniform Mat3 matrix;                                                                                  \n" +
                "uniform Vec2 resolution;                                                                              \n" +
                "                                                                                                      \n" +
                "void main() {                                                                                         \n" +
                "  Vec2 pos = (matrix * Vec3(aVertexPosition, 1)).xy;                                                  \n" +
                "  Vec2 tmp1 = pos / (resolution);                                                                     \n" +
                "  Vec2 tmp2 = tmp1 * 2.0;                                                                             \n" +
                "  Vec2 tmp3 = tmp2 - 1.0;                                                                             \n" +
                "  gl_Position = vec4(tmp3 , 0, 1);                                                                    \n" +
                "}                                                                                                     \n";
            _this.fragmentShaderSource = "precision mediump float;                                                                              \n" +
                "                                                                                                      \n" +
                "uniform vec4 colour;                                                                                  \n" +
                "                                                                                                      \n" +
                "void main() {                                                                                         \n" +
                "  gl_FragColor = colour;                                                                              \n" +
                "}                                                                                                     \n";
            return _this;
        }
        LeafNode.prototype.updateCanvas2d = function (renderContext, currentTransformationMatrix) {
            return false;
        };
        LeafNode.prototype.updateSvg = function (renderContext, currentTransformationMatrix) {
            var svgObject = this.generateXmlTag(renderContext, currentTransformationMatrix).generateSvgElement();
            renderContext.getSVG().appendChild(svgObject);
            return true;
        };
        LeafNode.prototype.updateWebGl = function (renderContext, currentTransformationMatrix) {
            return false;
        };
        LeafNode.prototype.toSVGString = function (renderContext, preTransformationMatrix) {
            var svgString = "";
            svgString = this.generateXmlTag(renderContext, preTransformationMatrix).getEmptyElementTag() + "\n";
            return svgString;
        };
        LeafNode.prototype.generateXmlTag = function (renderContext, preTransformationMatrix) {
            return null;
        };
        return LeafNode;
    }(Plexx.SceneGraphNode));
    Plexx.LeafNode = LeafNode;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var CompositeNode = (function (_super) {
        __extends(CompositeNode, _super);
        function CompositeNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CompositeNode.prototype.render = function (renderContext, preRenderMatrix) {
            return false;
        };
        CompositeNode.prototype.toSVGString = function (renderContext) {
            var xmlComment = new XMLComment(this.getName());
            return xmlComment.getLineCommentTag();
        };
        return CompositeNode;
    }(Plexx.SceneGraphNode));
    Plexx.CompositeNode = CompositeNode;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(values) {
            var _this = _super.call(this, values.name || "Group") || this;
            _this.translation = values.translation || [0, 0];
            _this.scale = values.scale || [1, 1];
            _this.rotation = values.rotation || 0;
            _this.scalePoint = values.scalePoint || [0, 0];
            _this.rotationPoint = values.rotationPoint || [0, 0];
            _this.scaleNode = new Plexx.ScaleNode({ scale: _this.scale, scalePoint: _this.scalePoint });
            _this.rotationNode = new Plexx.RotationNode({ rotation: _this.rotation, rotationPoint: _this.rotationPoint });
            _this.translationNode = new Plexx.TranslationNode({ translation: _this.translation });
            _this.eventMap = {};
            _this.isHidden = false;
            _this.mouseOver = false;
            _this.mouseOverExecuted = false;
            _this.draggable = values.draggable;
            _this.draggingSpace = values.draggingSpace;
            _this.isDragging = values.isDragging;
            console.log("[PLEXX] " + "CREATE " + _this.toString());
            return _this;
        }
        Group.prototype.on = function (eventName, callback) {
            this.eventMap[eventName] = callback;
            console.log("group ADD EVENT");
        };
        Group.prototype.hitBox = function (renderContext, mousePosition) {
            return false;
        };
        Group.prototype.executeClickEvent = function () {
            console.log("YEAH I WAS CLICKED!");
        };
        Group.prototype.toString = function () {
            var groupString = this.getName() + " { ";
            groupString += "translation: " + this.translation + "; ";
            groupString += "scale: " + this.scale + "; ";
            groupString += "rotation: " + this.rotation + "; ";
            groupString += "}";
            return groupString;
        };
        Group.prototype.accept = function (nodeVisitor) {
            return nodeVisitor.visitGroupNode(this);
        };
        Group.prototype.getTranslationNode = function () {
            return this.translationNode;
        };
        Group.prototype.getRotationNode = function () {
            return this.rotationNode;
        };
        Group.prototype.getScaleNode = function () {
            return this.scaleNode;
        };
        Group.prototype.clone = function () {
            var newGroup = new Plexx.Group({
                translation: this.translation,
                scale: this.scale,
                scalePoint: this.scalePoint,
                rotation: this.rotation,
                rotationPoint: this.rotationPoint
            });
            this.getChildren().forEach(function (childNode) {
                newGroup.add(childNode.clone());
            });
            return newGroup;
        };
        Group.prototype.setTranslation = function (translation) {
            this.translation = translation;
            this.translationNode.translation = translation;
        };
        Group.prototype.addTranslation = function (translation) {
            this.translation[0] += translation[0];
            this.translation[1] += translation[1];
            this.translationNode.translation[0] += translation[0];
            this.translationNode.translation[1] += translation[1];
        };
        Group.prototype.setRotation = function (rotation, rotationPoint) {
            this.rotation = rotation;
            this.rotationNode.rotation = rotation;
            if (rotationPoint)
                this.rotationNode.rotationPoint = rotationPoint;
        };
        Group.prototype.addRotation = function (rotation) {
            this.rotation += rotation;
            this.rotationNode.rotation += rotation;
        };
        Group.prototype.setScale = function (scale, scalePoint) {
            this.scale = scale;
            this.scaleNode.scale = scale;
            if (scalePoint)
                this.scaleNode.scalePoint = scalePoint;
        };
        Group.prototype.addScale = function (scale) {
            this.scale[0] += scale[0];
            this.scale[1] += scale[1];
            this.scaleNode.scale[0] += scale[0];
            this.scaleNode.scale[1] += scale[1];
        };
        Group.prototype.generateSvg = function (renderContext, preTransformationMatrix) {
            var xmlTag = new Plexx.XMLTag("g");
            xmlTag.addAttribute("transform", "matrix(" + preTransformationMatrix.at(0) + " " + preTransformationMatrix.at(1) + " " + preTransformationMatrix.at(3) + " " + preTransformationMatrix.at(4) + " " + preTransformationMatrix.at(6) + " " + preTransformationMatrix.at(7) + ")");
            return xmlTag;
        };
        return Group;
    }(Plexx.CompositeNode));
    Plexx.Group = Group;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var DrawingArea = (function (_super) {
        __extends(DrawingArea, _super);
        function DrawingArea(values) {
            var _this = _super.call(this, "DrawingArea") || this;
            _this.eventQueue = [];
            _this.frameCounter = 0;
            _this.lastState = new Plexx.PlexxEvent("none", new Plexx.Mathlib.Vec2(0, 0));
            _this.width = values.width;
            _this.height = values.height;
            _this.align = values.align || "xMidYMid";
            _this.background = values.background || "#FFFFFF";
            _this.canvasColour = new Plexx.Colour(_this.background);
            _this.setRootNode(_this);
            _this.translationNode = new Plexx.TranslationNode({});
            _this.scaleNode = new Plexx.ScaleNode({});
            _this.rotationNode = new Plexx.RotationNode({});
            return _this;
        }
        DrawingArea.prototype.clone = function () {
            return new Plexx.DrawingArea({
                width: this.width,
                height: this.height,
                align: this.align,
                background: this.background
            });
        };
        DrawingArea.prototype.toString = function () {
            var text = this.getName() + " { ";
            text += "width: " + this.width + "; ";
            text += "height: " + this.height + "; ";
            text += "background: " + this.background + "; ";
            text += "align: " + this.align + "; ";
            return text;
        };
        DrawingArea.prototype.renderSingleFrame = function (renderContext) {
            this.init(renderContext);
            this.accept(new Plexx.RenderNodeVisitor(renderContext));
        };
        DrawingArea.prototype.accept = function (nodeVisitor) {
            return nodeVisitor.visitDrawingAreaNode(this);
        };
        DrawingArea.prototype.run = function (renderContext) {
            this.init(renderContext);
            this.renderFrame(renderContext);
        };
        DrawingArea.prototype.init = function (renderContext) {
            var currentRenderType;
            this.renderContext = renderContext;
            renderContext.setHeight(this.height);
            renderContext.setWidth(this.width);
            renderContext.setCanvasNode(this);
            currentRenderType = renderContext.getRenderType();
            renderContext.changeRenderType(currentRenderType);
            this.resizePlexx();
            switch (currentRenderType) {
                case Plexx.RenderType.CANVAS2D:
                    this.initCanvas2d(renderContext);
                    break;
                case Plexx.RenderType.SVG:
                    this.initSvg(renderContext);
                    break;
                case Plexx.RenderType.WEBGL:
                    this.initWebGl(renderContext);
                    break;
            }
            this.accept(new Plexx.InitNodeVisitor(renderContext));
            this.accept(new Plexx.RenderNodeVisitor(renderContext));
            window.addEventListener("resize", this.resizePlexx.bind(this), false);
        };
        DrawingArea.prototype.renderFrame = function (renderContext) {
            var _this = this;
            requestAnimationFrame(function () { return _this.renderFrame(renderContext); });
            var currentMouseEvent = null;
            var currentTime = new Date();
            if (!this.lastTimeRendered)
                this.lastTimeRendered = currentTime;
            this.renderTime = (currentTime.getTime() - this.lastTimeRendered.getTime()) / 1000;
            this.frameCounter += 1;
            if (this.renderTime >= 1.0) {
                this.currentFramesPerSecond = this.frameCounter;
                this.frameCounter = 0;
                this.lastTimeRendered = currentTime;
            }
            if (this.eventQueue.length > 0) {
                while (this.eventQueue.length > 0) {
                    currentMouseEvent = this.eventQueue.shift();
                    this.newState = this.accept(new Plexx.ClickNodeVisitor(renderContext, currentMouseEvent, this.lastState));
                    this.lastState = this.newState;
                }
                this.accept(new Plexx.RenderNodeVisitor(renderContext));
            }
        };
        DrawingArea.getMousePosition = function (canvas, evt, renderContext) {
            var rect = canvas.getBoundingClientRect();
            var mousePosition = new Plexx.Mathlib.Vec2(0, 0);
            mousePosition.x = Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * renderContext.getWidth());
            mousePosition.y = renderContext.getHeight() - Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * renderContext.getHeight());
            return mousePosition;
        };
        DrawingArea.prototype.resizePlexx = function () {
            var clientHeight = this.renderContext.getClientHeight();
            var clientWidth = this.renderContext.getClientWidth();
            var scale = [];
            var scaleX = 0;
            var scaleY = 0;
            if (this.align === "none") {
                scaleX = clientWidth / this.width;
                scaleY = clientHeight / this.height;
                scale = [scaleX, scaleY];
                this.renderContext.setWidth(clientWidth);
                this.renderContext.setHeight(clientHeight);
                this.scaleNode = new Plexx.ScaleNode({
                    scale: scale
                });
                this.renderContext.setStylePosition("relative");
                this.renderContext.setStyleTop(String(0) + "px");
                this.renderContext.setStyleLeft(String(0) + "px");
            }
            else {
                if (this.height * clientWidth / this.width > clientHeight) {
                    scaleY = clientHeight / this.height;
                    scale = [scaleY, scaleY];
                    this.renderContext.setWidth(this.width * scaleY);
                    this.renderContext.setHeight(clientHeight);
                    this.scaleNode = new Plexx.ScaleNode({
                        scale: scale
                    });
                }
                else {
                    scaleX = clientWidth / this.width;
                    scale = [scaleX, scaleX];
                    this.renderContext.setWidth(clientWidth);
                    this.renderContext.setHeight(this.height * scaleX);
                    this.scaleNode = new Plexx.ScaleNode({
                        scale: scale
                    });
                }
                this.renderContext.setStylePosition("relative");
                if (this.align.substring(1, 4) === "Min") {
                    this.renderContext.setStyleLeft(String(0) + "px");
                }
                else if (this.align.substring(1, 4) === "Mid") {
                    this.renderContext.setStyleLeft(String((clientWidth - this.width * scale[0]) / 2) + "px");
                }
                else if (this.align.substring(1, 4) === "Max") {
                    this.renderContext.setStyleLeft(String(clientWidth - this.width * scale[0]) + "px");
                }
                if (this.align.substring(5, 8) === "Min") {
                    this.renderContext.setStyleTop(String(clientHeight - this.height * scale[1]) + "px");
                }
                else if (this.align.substring(5, 8) === "Mid") {
                    this.renderContext.setStyleTop(String((clientHeight - this.height * scale[1]) / 2) + "px");
                }
                else if (this.align.substring(5, 8) === "Max") {
                    this.renderContext.setStyleTop(String(0) + "px");
                }
            }
            this.accept(new Plexx.InitNodeVisitor(this.renderContext));
            this.accept(new Plexx.RenderNodeVisitor(this.renderContext));
        };
        DrawingArea.prototype.initCanvas2d = function (renderContext) {
            var self = this;
            var mouseEventTypes = ["mousemove", "mousedown", "mouseup", "mouseleave", "click"];
            var _loop_1 = function (index) {
                var mouseEventType = mouseEventTypes[index];
                renderContext.getCanvas2D().addEventListener(mouseEventType, function (evt) {
                    var mousePosition = Plexx.DrawingArea.getMousePosition(renderContext.getCanvas2D(), evt, renderContext);
                    self.eventQueue.push(new Plexx.MouseEvent(mouseEventType, mousePosition));
                }, false);
            };
            for (var index = 0; index < mouseEventTypes.length; index++) {
                _loop_1(index);
            }
            renderContext.getCanvas2D().style.backgroundColor = this.canvasColour.getRGBString();
        };
        DrawingArea.prototype.initWebGl = function (renderContext) {
            var self = this;
            var mouseEventTypes = ["mousemove", "mousedown", "mouseup", "mouseleave", "click"];
            var _loop_2 = function (index) {
                var mouseEventType = mouseEventTypes[index];
                renderContext.getCanvasWebGL().addEventListener(mouseEventType, function (evt) {
                    var mousePosition = Plexx.DrawingArea.getMousePosition(renderContext.getCanvasWebGL(), evt, renderContext);
                    self.eventQueue.push(new Plexx.MouseEvent(mouseEventType, mousePosition));
                }, false);
            };
            for (var index = 0; index < mouseEventTypes.length; index++) {
                _loop_2(index);
            }
            var gl = renderContext.getCanvasWebGL().getContext("webgl", { stencil: true });
            gl.clearColor(this.canvasColour.getR() * this.canvasColour.getA(), this.canvasColour.getG() * this.canvasColour.getA(), this.canvasColour.getB() * this.canvasColour.getA(), this.canvasColour.getA());
            gl.enable(gl.BLEND);
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        };
        DrawingArea.prototype.initSvg = function (renderContext) {
            var self = this;
            var mouseEventTypes = ["mousemove", "mousedown", "mouseup", "mouseleave", "click"];
            var _loop_3 = function (index) {
                var mouseEventType = mouseEventTypes[index];
                renderContext.getSVG().addEventListener(mouseEventType, function (evt) {
                    var mousePosition = Plexx.DrawingArea.getMousePosition(renderContext.getSVG(), evt, renderContext);
                    self.eventQueue.push(new Plexx.MouseEvent(mouseEventType, mousePosition));
                }, false);
            };
            for (var index = 0; index < mouseEventTypes.length; index++) {
                _loop_3(index);
            }
            renderContext.setCanvasNode(this);
            renderContext.getSVG().setAttributeNS(null, "preserveAspectRatio", "" + "none");
            renderContext.getSVG().setAttributeNS(null, "shape-rendering", "geometricPrecision");
            renderContext.getSVG().style.background = this.canvasColour.getRGBString();
        };
        DrawingArea.clearCanvas2d = function (renderContext) {
            renderContext.getCanvas2dContext().clearRect(0, 0, renderContext.getCanvas2D().width, renderContext.getCanvas2D().height);
            return true;
        };
        DrawingArea.prototype.updateCanvas2d = function (renderContext, preTransformationMatrix) {
            renderContext.getCanvas2dContext().clearRect(0, 0, renderContext.getCanvas2D().width, renderContext.getCanvas2D().height);
            var currentRenderType = renderContext.getRenderType();
            var currentTime = new Date();
            return 0;
        };
        DrawingArea.prototype.updateSvg = function (renderContext, preTransformationMatrix) {
            this.lastTimeRendered = new Date();
            var currentTime = new Date();
            this.renderTime = (currentTime.getTime() - this.lastTimeRendered.getTime()) / 1000;
            return 0;
        };
        DrawingArea.prototype.updateWebGl = function (renderContext, preTransformationMatrix) {
            this.lastTimeRendered = new Date();
            renderContext.setCanvasNode(this);
            var gl = renderContext.getWebGLRenderingContext();
            gl.clearColor(this.canvasColour.getR() * this.canvasColour.getA(), this.canvasColour.getG() * this.canvasColour.getA(), this.canvasColour.getB() * this.canvasColour.getA(), this.canvasColour.getA());
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND);
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.viewport(0, 0, this.renderContext.getWidth(), this.renderContext.getHeight());
            var currentTime = new Date();
            this.renderTime = (currentTime.getTime() - this.lastTimeRendered.getTime()) / 1000;
            return 0;
        };
        DrawingArea.prototype.generateSvg = function (renderContext, preTransformationMatrix) {
            var xmlTag = new Plexx.XMLTag("svg");
            xmlTag.addAttribute("viewBox", "0 0 " + renderContext.getWidth() + " " + renderContext.getHeight());
            xmlTag.addAttribute("version", "1.1");
            xmlTag.addAttribute("baseProfile", "full");
            xmlTag.addAttribute("xmlns", "http://www.w3.org/2000/svg");
            xmlTag.addAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            xmlTag.addAttribute("preserveAspectRatio", "" + "xMidyMid");
            xmlTag.addAttribute("shape-rendering", "geometricPrecision");
            return xmlTag;
        };
        DrawingArea.prototype.getHeight = function () {
            return this.height;
        };
        DrawingArea.prototype.getWidth = function () {
            return this.width;
        };
        DrawingArea.prototype.getClientWidth = function () {
            return this.renderContext.getClientWidth();
        };
        DrawingArea.prototype.getClientHeight = function () {
            return this.renderContext.getClientHeight();
        };
        DrawingArea.prototype.getColour = function () {
            return this.canvasColour.getCss3String();
        };
        DrawingArea.prototype.toSVGString = function (renderContext) {
            var svgString = "";
            var xmlTag = new Plexx.XMLTag("svg");
            svgString = svgString + xmlTag.getEndTag() + "\n";
            return svgString;
        };
        DrawingArea.prototype.getCurrentFramesPerSeconds = function () {
            return this.currentFramesPerSecond;
        };
        DrawingArea.prototype.getBackgroundColor = function () {
            return this.background;
        };
        return DrawingArea;
    }(Plexx.CompositeNode));
    Plexx.DrawingArea = DrawingArea;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Colour = (function () {
        function Colour(colour) {
            this.colourLiterals = {
                "black": "#000000",
                "red": "#ff0000",
                "green": "#00ff00",
                "blue": "#0000ff",
                "yellow": "#ffff00",
                "cyan": "#00ffff",
                "pink": "#ff00ff",
                "grey": "#c0c0c0",
                "white": "#ffffff"
            };
            var colourValues;
            if (colour) {
                colourValues = this.parseColourString(colour);
                if (colourValues == null) {
                    console.log("[FDGL] " + Colour.nodeTypeName + "Error: Colour (" + colour + ") not recognized! Fallback to default colour value");
                }
            }
            else {
                colourValues = this.parseColourString(Constants.DEFAULT_CANVAS_COLOUR);
                console.log("[FDGL] " + Colour.nodeTypeName + " No colour value set, fallback to default colour.");
            }
            this.colorValueR = colourValues[0];
            this.colorValueG = colourValues[1];
            this.colorValueB = colourValues[2];
            this.colorValueA = colourValues[3];
        }
        Colour.prototype.parseColourString = function (colourString) {
            var parseableColourString = colourString.toLowerCase();
            var colourValues = [];
            if (parseableColourString.charAt(0) != "#") {
                if (!String(this.colourLiterals[colourString])) {
                    return null;
                }
                else {
                    parseableColourString = this.colourLiterals[colourString];
                }
            }
            if (this.isHexValue(parseableColourString.substring(1, parseableColourString.length - 1))) {
                colourValues[0] = +("0x" + parseableColourString[1] + parseableColourString[2]);
                colourValues[1] = +("0x" + parseableColourString[3] + parseableColourString[4]);
                colourValues[2] = +("0x" + parseableColourString[5] + parseableColourString[6]);
                if (parseableColourString.length == 9) {
                    colourValues[3] = +("0x" + parseableColourString[7] + parseableColourString[8]);
                }
                else {
                    colourValues[3] = 0xFF;
                }
                return colourValues;
            }
            return null;
        };
        Colour.prototype.isHexValue = function (element) {
            var elementLowercase = element.toUpperCase();
            var hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
            for (var index = 0; index <= elementLowercase.length; index++) {
                var currentValue = elementLowercase[index];
                var isHex = false;
                for (var hexCharIndex = 0; hexCharIndex <= hexChars.length; hexCharIndex++) {
                    if (currentValue == hexChars[hexCharIndex]) {
                        isHex = true;
                    }
                }
                if (isHex == false)
                    return false;
            }
            return true;
        };
        Colour.prototype.setColour = function (colour) {
            var colourValues = [];
            colourValues = this.parseColourString(colour);
            if (colourValues != null) {
                this.colorValueR = colourValues[0];
                this.colorValueG = colourValues[1];
                this.colorValueB = colourValues[2];
                this.colorValueA = colourValues[3];
            }
            else {
                colourValues = this.parseColourString(Constants.DEFAULT_COLOUR);
                this.colorValueR = colourValues[0];
                this.colorValueG = colourValues[1];
                this.colorValueB = colourValues[2];
                this.colorValueA = colourValues[3];
            }
        };
        Colour.prototype.getRHex = function () {
            return this.colorValueR;
        };
        Colour.prototype.getGHex = function () {
            return this.colorValueG;
        };
        Colour.prototype.getBHex = function () {
            return this.colorValueB;
        };
        Colour.prototype.getAHex = function () {
            return this.colorValueA;
        };
        Colour.prototype.getR = function () {
            return this.colorValueR / 0xFF;
        };
        Colour.prototype.getG = function () {
            return this.colorValueG / 0xFF;
        };
        Colour.prototype.getB = function () {
            return this.colorValueB / 0xFF;
        };
        Colour.prototype.getA = function () {
            return this.colorValueA / 0xFF;
        };
        Colour.prototype.getRGBString = function () {
            var textstring = "#";
            var colorStringR = this.colorValueR.toString(16);
            var colorStringG = this.colorValueG.toString(16);
            var colorStringB = this.colorValueB.toString(16);
            if (colorStringR.length == 1)
                textstring += "0" + colorStringR;
            else
                textstring += colorStringR;
            if (colorStringG.length == 1)
                textstring += "0" + colorStringG;
            else
                textstring += colorStringG;
            if (colorStringB.length == 1)
                textstring += "0" + colorStringB;
            else
                textstring += colorStringB;
            return textstring;
        };
        Colour.prototype.getRGBAString = function () {
            var textstring = "#";
            var colorStringR = this.colorValueR.toString(16);
            var colorStringG = this.colorValueG.toString(16);
            var colorStringB = this.colorValueB.toString(16);
            var colorStringA = this.colorValueA.toString(16);
            if (colorStringR.length == 1)
                textstring += "0" + colorStringR;
            else
                textstring += colorStringR;
            if (colorStringG.length == 1)
                textstring += "0" + colorStringG;
            else
                textstring += colorStringG;
            if (colorStringB.length == 1)
                textstring += "0" + colorStringB;
            else
                textstring += colorStringB;
            if (colorStringA.length == 1)
                textstring += "0" + colorStringA;
            else
                textstring += colorStringA;
            return textstring;
        };
        Colour.prototype.getCss3String = function () {
            var textstring = "";
            textstring += "rgba(";
            textstring += this.colorValueR.toString() + ",";
            textstring += this.colorValueG.toString() + ",";
            textstring += this.colorValueB.toString() + ",";
            textstring += (this.colorValueA / 0xFF) + ")";
            return textstring;
        };
        return Colour;
    }());
    Colour.nodeTypeName = "ColourNode";
    Plexx.Colour = Colour;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var TransformationNode = (function (_super) {
        __extends(TransformationNode, _super);
        function TransformationNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TransformationNode.prototype.getTransformationMatrix = function () {
            return this.transformationMatrix;
        };
        TransformationNode.prototype.getInverseTransformationMatrix = function () {
            return this.inverseTransformationMatrix;
        };
        TransformationNode.prototype.accept = function (nodeVisitor) {
            return nodeVisitor.visitTransformationNode(this);
        };
        return TransformationNode;
    }(Plexx.SceneGraphNode));
    Plexx.TransformationNode = TransformationNode;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var TranslationNode = (function (_super) {
        __extends(TranslationNode, _super);
        function TranslationNode(values) {
            var _this = _super.call(this, "TranslationNode") || this;
            _this.translation = values.translation || [0, 0];
            return _this;
        }
        TranslationNode.prototype.setTranslation = function (translation) {
            this.translation = translation;
        };
        TranslationNode.prototype.toString = function () {
            var translationString = this.getName() + " { ";
            translationString += "translation: " + this.translation + "; ";
            translationString += "}";
            return translationString;
        };
        TranslationNode.prototype.clone = function () {
            return new TranslationNode({
                translation: this.translation
            });
        };
        TranslationNode.prototype.getTransformationMatrix = function () {
            var translationMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, this.translation[0], this.translation[1], 1]);
            return translationMatrix;
        };
        TranslationNode.prototype.getInverseTransformationMatrix = function () {
            var translationMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, -this.translation[0], -this.translation[1], 1]);
            return translationMatrix;
        };
        return TranslationNode;
    }(Plexx.TransformationNode));
    Plexx.TranslationNode = TranslationNode;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var ScaleNode = (function (_super) {
        __extends(ScaleNode, _super);
        function ScaleNode(values) {
            var _this = _super.call(this, "ScaleNode") || this;
            _this.scale = values.scale || [1, 1];
            _this.scalePoint = values.scalePoint || [0, 0];
            return _this;
        }
        ScaleNode.prototype.clone = function () {
            return new ScaleNode({
                scale: this.scale,
                scalePoint: this.scalePoint
            });
        };
        ScaleNode.prototype.toString = function () {
            var scaleString = this.getName() + " { ";
            scaleString += "scale: " + this.scale + "; ";
            scaleString += "scalePoint: " + this.scalePoint + "; ";
            scaleString += "}";
            return scaleString;
        };
        ScaleNode.prototype.getTransformationMatrix = function () {
            var r = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, -this.scalePoint[0], -this.scalePoint[1], 1]);
            var k = new Plexx.Mathlib.Mat3([this.scale[0], 0, 0, 0, this.scale[1], 0, 0, 0, 1]);
            var rv = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, this.scalePoint[0], this.scalePoint[1], 1]);
            var p = r.copy().multiply(k);
            var an = p.copy().multiply(rv);
            return an;
        };
        ScaleNode.prototype.getInverseTransformationMatrix = function () {
            var r = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, -this.scalePoint[0], -this.scalePoint[1], 1]);
            var k = new Plexx.Mathlib.Mat3([1 / this.scale[0], 0, 0, 0, 1 / this.scale[1], 0, 0, 0, 1]);
            var rv = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, this.scalePoint[0], this.scalePoint[1], 1]);
            var p = r.copy().multiply(k);
            var an = p.copy().multiply(rv);
            return an;
        };
        return ScaleNode;
    }(Plexx.TransformationNode));
    Plexx.ScaleNode = ScaleNode;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var RotationNode = (function (_super) {
        __extends(RotationNode, _super);
        function RotationNode(values) {
            var _this = _super.call(this, "Rotation") || this;
            _this.rotation = values.rotation || 0;
            _this.rotationPoint = values.rotationPoint || [0, 0];
            return _this;
        }
        RotationNode.prototype.toString = function () {
            var rotationString = this.getName() + " { ";
            rotationString += "rotation: " + this.rotation + "; ";
            rotationString += "rotationPoint: " + this.rotationPoint + "; ";
            rotationString += "}";
            return rotationString;
        };
        RotationNode.prototype.getTransformationMatrix = function () {
            var sinR = Math.sin(-this.rotation * Math.PI / 180);
            var cosR = Math.cos(-this.rotation * Math.PI / 180);
            console.log("rotation Point", this.rotationPoint);
            var mTranslate1 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, -this.rotationPoint[0], -this.rotationPoint[1], 1]);
            var mRotate = new Plexx.Mathlib.Mat3([cosR, -sinR, 0, sinR, cosR, 0, 0, 0, 1]);
            var mTranslate2 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, this.rotationPoint[0], this.rotationPoint[1], 1]);
            return mTranslate1.multiply(mRotate).multiply(mTranslate2);
        };
        RotationNode.prototype.getInverseTransformationMatrix = function () {
            var sinR = Math.sin(this.rotation * Math.PI / 180);
            var cosR = Math.cos(this.rotation * Math.PI / 180);
            var mTranslate1 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, -this.rotationPoint[0], -this.rotationPoint[1], 1]);
            var mRotate = new Plexx.Mathlib.Mat3([cosR, -sinR, 0, sinR, cosR, 0, 0, 0, 1]);
            var mTranslate2 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, this.rotationPoint[0], this.rotationPoint[1], 1]);
            return mTranslate1.multiply(mRotate).multiply(mTranslate2);
        };
        RotationNode.prototype.clone = function () {
            return new RotationNode({
                rotation: this.rotation,
                rotationPoint: this.rotationPoint
            });
        };
        return RotationNode;
    }(Plexx.TransformationNode));
    Plexx.RotationNode = RotationNode;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var DebugHelper = (function () {
        function DebugHelper(debugpanelId, renderContext, rootNode) {
            this.panelSVGExportCSS = "<style>" +
                "nav {" +
                "    background-color: #1C1C1C;" +
                "    list-style-type: none;" +
                "    padding-top: 1px;" +
                "    padding-bottom: 1px;" +
                "    height: 1.4em;" +
                "    width: auto;" +
                "}" +
                ".fdgl-debugpanel ul, fdgl-debugpanel li {" +
                "    padding: 0;" +
                "}" +
                ".fdgl-debugpanel ul {" +
                "    background: #556070;" +
                "    list-style: none;" +
                "    width: 100%;" +
                "    height: auto;" +
                "    margin: 0;" +
                "}" +
                ".fdgl-debugpanel li {" +
                "    float: left;" +
                "    position: relative;" +
                "    text-align: center;" +
                "    width: auto;" +
                "    margin: 0 .2em 0 .1em;" +
                "}" +
                ".fdgl-debugpanel a {" +
                "    background: #556070;" +
                "    color: #FFFFFF;" +
                "    display: block;" +
                "    font: 12px 'Lucida Grande', LucidaGrande, Lucida, Helvetica, Arial, sans-serif;" +
                "    padding: 0.1em 5px;" +
                "    text-align: center;" +
                "    float: left;" +
                "    width: 50px;" +
                "    text-decoration: none;" +
                "    cursor: pointer;" +
                "    -webkit-user-select: none;" +
                "    -moz-user-select: none;" +
                "    -ms-user-select: none;" +
                "}" +
                "li#fdgl-debugpanel-left {" +
                "    float: left;" +
                "}" +
                "li#fdgl-debugpanel-center {" +
                "    color: #FFFFFF;" +
                "    display: block;" +
                "    font: 12px 'Lucida Grande', LucidaGrande, Lucida, Helvetica, Arial, sans-serif;" +
                "    padding: 2px 25px;" +
                "    text-align: center;" +
                "    text-decoration: none;" +
                "}" +
                "li#fdgl-debugpanel-right{" +
                "    float: right;" +
                "}" +
                "li#fdgl-debugpanel-right a{" +
                "    width: 100px;" +
                "}" +
                ".opt li {" +
                "    float: left;" +
                "    position: relative;" +
                "    width: auto;" +
                "    padding: 10px;" +
                "}" +
                "</style>";
            this.debugpanelId = debugpanelId;
            this.renderContext = renderContext;
            this.rootNode = rootNode;
            this.debugPanelElement = document.getElementById(this.debugpanelId);
            this.debugPanelElement.setAttribute("id", this.debugpanelId);
            this.debugPanelElement.setAttribute("class", "fdgl-debugpanel");
            this.debugPanelElement.style.width = document.getElementById(renderContext.getId()).style.width;
            this.debugPanelElement.innerHTML += this.panelSVGExportCSS;
            var fdglElement = document.getElementsByClassName("plexx")[0];
            var parentFdglElement = fdglElement.parentNode;
            parentFdglElement.insertBefore(this.debugPanelElement, fdglElement.nextSibling);
            this.renderInfo = document.createElement("li");
            this.renderInfo.setAttribute("id", "resolutionInfo");
            var currentTime = new Date();
            this.renderInfo.innerHTML = rootNode.getWidth() + "x" + rootNode.getHeight();
            this.debugPanelElement.appendChild(this.renderInfo);
            this.debugPanelElementList = document.createElement("ul");
            this.debugPanelElement.appendChild(this.debugPanelElementList);
            this.initDebugPanelLeftElement();
            this.initDebugPanelCenterElement();
            this.initDebugPanelRightElement();
        }
        DebugHelper.prototype.initDebugPanelLeftElement = function () {
            var _this = this;
            var optionCanvas = document.createElement("a");
            var optionSVG = document.createElement("a");
            var optionWebGL = document.createElement("a");
            optionCanvas.type = "submit";
            optionCanvas.innerHTML = "Canvas";
            optionCanvas.id = "rendertypeCanvas";
            optionCanvas.style.color = "white";
            optionCanvas.style.backgroundColor = "blue";
            optionCanvas.onclick = function (e) {
                _this.renderContext.changeRenderType(Plexx.RenderType.CANVAS2D);
                _this.rootNode.run(_this.renderContext);
                _this.updateInfo(_this.renderContext, _this.rootNode);
                optionCanvas.style.color = "white";
                optionCanvas.style.backgroundColor = "blue";
                optionSVG.style.color = "blue";
                optionSVG.style.backgroundColor = "white";
                if (_this.renderContext.isWebGLEnabled()) {
                    optionWebGL.style.color = "blue";
                    optionWebGL.style.backgroundColor = "white";
                }
            };
            optionSVG.type = "submit";
            optionSVG.innerHTML = "SVG";
            optionSVG.id = "rendertypeSVG";
            optionSVG.style.color = "blue";
            optionSVG.style.backgroundColor = "white";
            optionSVG.onclick = function (e) {
                _this.renderContext.changeRenderType(Plexx.RenderType.SVG);
                _this.rootNode.run(_this.renderContext);
                _this.updateInfo(_this.renderContext, _this.rootNode);
                optionCanvas.style.color = "blue";
                optionCanvas.style.backgroundColor = "white";
                optionSVG.style.color = "white";
                optionSVG.style.backgroundColor = "blue";
                if (_this.renderContext.isWebGLEnabled()) {
                    optionWebGL.style.color = "blue";
                    optionWebGL.style.backgroundColor = "white";
                }
            };
            optionWebGL.type = "submit";
            optionWebGL.innerHTML = "WebGL";
            optionWebGL.id = "rendertypeWebGL";
            optionWebGL.style.color = "black";
            optionWebGL.style.backgroundColor = "grey";
            if (this.renderContext.isWebGLEnabled()) {
                optionWebGL.style.color = "blue";
                optionWebGL.style.backgroundColor = "white";
                optionWebGL.onclick = function (e) {
                    _this.renderContext.changeRenderType(Plexx.RenderType.WEBGL);
                    _this.rootNode.run(_this.renderContext);
                    optionCanvas.style.color = "blue";
                    optionCanvas.style.backgroundColor = "white";
                    optionSVG.style.color = "blue";
                    optionSVG.style.backgroundColor = "white";
                    optionWebGL.style.color = "white";
                    optionWebGL.style.backgroundColor = "blue";
                };
            }
            if (!this.renderContext.isWebGLEnabled()) {
            }
            var leftOptionsUl = document.createElement("ul");
            var optionCanvasLi = document.createElement("li");
            var optionSVGLi = document.createElement("li");
            var optionWebGLLi = document.createElement("li");
            var optionsLi = document.createElement("li");
            optionSVGLi.setAttribute("class", "opt");
            optionWebGLLi.setAttribute("class", "opt");
            optionCanvasLi.setAttribute("class", "opt");
            optionsLi.id = "left";
            optionCanvasLi.appendChild(optionCanvas);
            optionSVGLi.appendChild(optionSVG);
            optionWebGLLi.appendChild(optionWebGL);
            leftOptionsUl.appendChild(optionCanvasLi);
            leftOptionsUl.appendChild(optionSVGLi);
            leftOptionsUl.appendChild(optionWebGLLi);
            optionsLi.appendChild(leftOptionsUl);
            this.debugPanelElementList.appendChild(optionsLi);
        };
        DebugHelper.prototype.initDebugPanelCenterElement = function () {
            var centerOptionsUl = document.createElement("ul");
            var infoLi = document.createElement("li");
            infoLi.id = "fdgl-debugpanel-center";
            this.debugPanelElement.appendChild(this.renderInfo);
            this.debugPanelElementList.appendChild(infoLi);
            infoLi.appendChild(this.renderInfo);
            var optionLines = document.createElement("a");
            optionLines.type = "submit";
            optionLines.innerHTML = "Lines";
            optionLines.style.color = "white";
            optionLines.style.backgroundColor = "grey";
            optionLines.onclick = function (e) {
            };
        };
        DebugHelper.prototype.initDebugPanelRightElement = function () {
            var _this = this;
            var exportSVG = document.createElement("a");
            exportSVG.type = "submit";
            exportSVG.innerHTML = "export SVG";
            exportSVG.onclick = function (e) {
                var s = new XMLSerializer();
                var str = _this.rootNode.accept(new Plexx.SvgNodeVisitor(_this.renderContext));
                var date = new Date();
                var timestamp = "plexx-snapshot-" +
                    date.getFullYear() + "-" +
                    date.getMonth() + "-" +
                    date.getDay() + "-" +
                    date.getHours() + "-" +
                    date.getMinutes() + "-" +
                    date.getSeconds();
                var filename = _this.renderContext.getId() + "." + timestamp + ".svg";
                var downloadableElement = document.createElement("a");
                downloadableElement.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(str));
                downloadableElement.setAttribute("download", filename);
                var event = document.createEvent("MouseEvents");
                event.initEvent("click", true, true);
                downloadableElement.dispatchEvent(event);
            };
            var debugPanelRightElement = document.createElement("li");
            debugPanelRightElement.id = "fdgl-debugpanel-right";
            this.debugPanelElementList.appendChild(debugPanelRightElement);
            debugPanelRightElement.appendChild(exportSVG);
            this.debugPanelElement.appendChild(this.debugPanelElementList);
        };
        DebugHelper.prototype.updateInfo = function (renderContext, rootNode) {
            this.renderInfo.innerHTML = rootNode.getWidth() + "x" + rootNode.getHeight();
        };
        return DebugHelper;
    }());
    Plexx.DebugHelper = DebugHelper;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Mathlib;
    (function (Mathlib) {
        function factorial(n) {
            var r = 1;
            for (var i = 2; i <= n; i++)
                r = r * i;
            return r;
        }
        Mathlib.factorial = factorial;
        function sortArrayOfPoint2DByX(unsortedPoints) {
            var sortedPoints = unsortedPoints.slice(0);
            sortedPoints.sort(sortArrayOfPoint2DByXCompare);
            return sortedPoints;
        }
        Mathlib.sortArrayOfPoint2DByX = sortArrayOfPoint2DByX;
        function sortArrayOfPoint2DByY(unsortedPoints) {
            var sortedPoints = unsortedPoints.slice(0);
            sortedPoints.sort(sortArrayOfPoint2DByYCompare);
            return sortedPoints;
        }
        Mathlib.sortArrayOfPoint2DByY = sortArrayOfPoint2DByY;
        function sortArrayOfPoint2DByXCompare(a, b) {
            if (a.x < b.x)
                return -1;
            if (a.x > b.x)
                return 1;
            return 0;
        }
        function sortArrayOfPoint2DByYCompare(a, b) {
            if (a.y < b.y)
                return -1;
            if (a.y > b.y)
                return 1;
            return 0;
        }
        var Vec2 = (function () {
            function Vec2(x, y) {
                this.x = 0;
                this.y = 0;
                this.x = x;
                this.y = y;
            }
            return Vec2;
        }());
        Mathlib.Vec2 = Vec2;
        var Vec3 = (function () {
            function Vec3(x, y, z) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.x = x;
                this.y = y;
                this.z = z;
            }
            Vec3.prototype.add = function (v0) {
                return new Vec3(this.x + v0.x, this.y + v0.y, this.z + v0.z);
            };
            Vec3.prototype.multiply = function (n) {
                return new Vec3(this.x * n, this.y * n, this.z * n);
            };
            return Vec3;
        }());
        Mathlib.Vec3 = Vec3;
        var Mat3 = (function () {
            function Mat3(values) {
                if (values) {
                    this.values = values;
                }
                else {
                    this.values = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                }
            }
            Mat3.prototype.multiply = function (multi) {
                var result = [];
                var resultMatrix;
                result[0] = this.values[0] * multi.values[0] + this.values[1] * multi.values[3] + this.values[2] * multi.values[6];
                result[1] = this.values[0] * multi.values[1] + this.values[1] * multi.values[4] + this.values[2] * multi.values[7];
                result[2] = this.values[0] * multi.values[2] + this.values[1] * multi.values[5] + this.values[2] * multi.values[8];
                result[3] = this.values[3] * multi.values[0] + this.values[4] * multi.values[3] + this.values[5] * multi.values[6];
                result[4] = this.values[3] * multi.values[1] + this.values[4] * multi.values[4] + this.values[5] * multi.values[7];
                result[5] = this.values[3] * multi.values[2] + this.values[4] * multi.values[5] + this.values[5] * multi.values[8];
                result[6] = this.values[6] * multi.values[0] + this.values[7] * multi.values[3] + this.values[8] * multi.values[6];
                result[7] = this.values[6] * multi.values[1] + this.values[7] * multi.values[4] + this.values[8] * multi.values[7];
                result[8] = this.values[6] * multi.values[2] + this.values[7] * multi.values[5] + this.values[8] * multi.values[8];
                resultMatrix = new Mat3(result);
                return resultMatrix;
            };
            Mat3.prototype.multiplyVec3 = function (multi) {
                var result = [];
                var resultVector;
                result[0] = this.values[0] * multi.x + this.values[1] * multi.y + this.values[2] * multi.z;
                result[1] = this.values[3] * multi.x + this.values[4] * multi.y + this.values[5] * multi.z;
                result[2] = this.values[6] * multi.x + this.values[7] * multi.y + this.values[8] * multi.z;
                resultVector = new Vec3(result[0], result[1], result[2]);
                return resultVector;
            };
            Mat3.prototype.copy = function () {
                return new Plexx.Mathlib.Mat3(this.values);
            };
            Mat3.prototype.setIdentity = function () {
                this.values[0] = 1;
                this.values[1] = 0;
                this.values[2] = 0;
                this.values[3] = 0;
                this.values[4] = 1;
                this.values[5] = 0;
                this.values[6] = 0;
                this.values[7] = 0;
                this.values[8] = 1;
                return this;
            };
            Mat3.prototype.setEmpty = function () {
                this.values[0] = 0;
                this.values[1] = 0;
                this.values[2] = 0;
                this.values[3] = 0;
                this.values[4] = 0;
                this.values[5] = 0;
                this.values[6] = 0;
                this.values[7] = 0;
                this.values[8] = 0;
                return this;
            };
            Mat3.prototype.getArray = function () {
                return this.values;
            };
            Mat3.prototype.at = function (index) {
                return this.values[index];
            };
            Mat3.prototype.all = function () {
                return this.values;
            };
            Mat3.prototype.inverse = function () {
                var aMatrix = new Plexx.Mathlib.Mat3();
                var bMatrix = new Plexx.Mathlib.Mat3();
                var cMatrix = new Plexx.Mathlib.Mat3();
                var a = 0;
                var b = 0;
                var c = 0;
                var d = 0;
                var e = 0;
                var f = 0;
                var g = 0;
                var h = 0;
                var i = 0;
                a = this.values[0];
                b = this.values[1];
                c = this.values[2];
                d = this.values[3];
                e = this.values[4];
                f = this.values[5];
                g = this.values[6];
                h = this.values[7];
                i = this.values[8];
                aMatrix.values[0] = e * i - f * h;
                aMatrix.values[1] = -(d * i - f * g);
                aMatrix.values[2] = d * h - e * g;
                aMatrix.values[3] = -(b * i - c * h);
                aMatrix.values[4] = a * i - c * g;
                aMatrix.values[5] = -(a * h - b * g);
                aMatrix.values[6] = b * f - c * e;
                aMatrix.values[7] = -(a * f - c * d);
                aMatrix.values[8] = a * e - b * d;
                bMatrix = aMatrix.transpose();
                var detA = this.det();
                cMatrix.values[0] = 1 / detA * bMatrix.values[0];
                cMatrix.values[1] = 1 / detA * bMatrix.values[1];
                cMatrix.values[2] = 1 / detA * bMatrix.values[2];
                cMatrix.values[3] = 1 / detA * bMatrix.values[3];
                cMatrix.values[4] = 1 / detA * bMatrix.values[4];
                cMatrix.values[5] = 1 / detA * bMatrix.values[5];
                cMatrix.values[6] = 1 / detA * bMatrix.values[6];
                cMatrix.values[7] = 1 / detA * bMatrix.values[7];
                cMatrix.values[8] = 1 / detA * bMatrix.values[8];
                return cMatrix;
            };
            Mat3.prototype.det = function () {
                var t1;
                var t2;
                var t3;
                var t4;
                var t5;
                var t6;
                var det;
                t1 = this.values[0] * this.values[4] * this.values[8];
                t2 = this.values[1] * this.values[5] * this.values[6];
                t3 = this.values[2] * this.values[3] * this.values[7];
                t4 = this.values[6] * this.values[4] * this.values[2];
                t5 = this.values[7] * this.values[5] * this.values[0];
                t6 = this.values[8] * this.values[3] * this.values[1];
                det = t1 + t2 + t3 - t4 - t5 - t6;
                return det;
            };
            Mat3.prototype.transpose = function () {
                var aMatrix = new Plexx.Mathlib.Mat3();
                aMatrix.values[0] = this.values[0];
                aMatrix.values[1] = this.values[3];
                aMatrix.values[2] = this.values[6];
                aMatrix.values[3] = this.values[1];
                aMatrix.values[4] = this.values[4];
                aMatrix.values[5] = this.values[7];
                aMatrix.values[6] = this.values[2];
                aMatrix.values[7] = this.values[5];
                aMatrix.values[8] = this.values[8];
                return aMatrix;
            };
            return Mat3;
        }());
        Mathlib.Mat3 = Mat3;
        var StackMat3 = (function () {
            function StackMat3() {
                this.stack = new Array();
            }
            StackMat3.prototype.pop = function () {
                return this.stack.pop();
            };
            StackMat3.prototype.push = function (transformationMatrix) {
                this.stack.push(transformationMatrix);
            };
            StackMat3.prototype.top = function () {
                return this.stack[this.stack.length - 1];
            };
            return StackMat3;
        }());
        Mathlib.StackMat3 = StackMat3;
    })(Mathlib = Plexx.Mathlib || (Plexx.Mathlib = {}));
})(Plexx || (Plexx = {}));
var XMLComment = (function () {
    function XMLComment(commentText) {
        this.commentText = commentText;
    }
    XMLComment.prototype.getLineCommentTag = function () {
        return "<!-- " + this.commentText + " -->";
    };
    XMLComment.prototype.getBlockCommentTag = function () {
        return "<!--\n" + this.commentText + "\n-->";
    };
    return XMLComment;
}());
var Plexx;
(function (Plexx) {
    var XMLTag = (function () {
        function XMLTag(name) {
            this.attributeList = [];
            this.name = name;
            this.content = "";
        }
        XMLTag.prototype.addAttribute = function (attributeName, attributeValue) {
            var newValueIndex = this.attributeList.length;
            this.attributeList[newValueIndex] = [attributeName, attributeValue];
        };
        XMLTag.prototype.setContent = function (content) {
            this.content = content;
        };
        XMLTag.prototype.getStartTag = function () {
            var xmlString = "";
            xmlString += "<" + this.name;
            for (var attributeIndex = 0; attributeIndex < this.attributeList.length; attributeIndex++) {
                xmlString += " " + this.attributeList[attributeIndex][0] + "=\"" + this.attributeList[attributeIndex][1] + "\"";
            }
            xmlString += ">";
            return xmlString;
        };
        XMLTag.prototype.getEndTag = function () {
            var xmlString;
            xmlString = "</" + this.name + ">";
            return xmlString;
        };
        XMLTag.prototype.getEmptyElementTag = function () {
            var xmlString = "";
            xmlString += "<" + this.name + "";
            for (var attributeIndex = 0; attributeIndex < this.attributeList.length; attributeIndex++) {
                xmlString += " " + this.attributeList[attributeIndex][0] + "=\"" + this.attributeList[attributeIndex][1] + "\"";
            }
            xmlString += "/>";
            return xmlString;
        };
        XMLTag.prototype.generateSvgText = function () {
            var svgText = "";
            if (this.content === "") {
                svgText += this.getEmptyElementTag();
            }
            else {
                svgText += this.getStartTag();
                svgText += this.content;
                svgText += this.getEndTag();
            }
            return svgText;
        };
        XMLTag.prototype.generateSvgElement = function () {
            var svgElement = document.createElementNS(Constants.SVG_NAMESPACE, this.name);
            for (var attributeIndex = 0; attributeIndex < this.attributeList.length; attributeIndex++) {
                svgElement.setAttribute(this.attributeList[attributeIndex][0], this.attributeList[attributeIndex][1]);
            }
            if (this.content !== "") {
                var textElement = document.createTextNode(this.content);
                svgElement.appendChild(textElement);
            }
            return svgElement;
        };
        return XMLTag;
    }());
    Plexx.XMLTag = XMLTag;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var MouseEvent = (function () {
        function MouseEvent(type, position) {
            this.type = type;
            this.position = position;
        }
        return MouseEvent;
    }());
    Plexx.MouseEvent = MouseEvent;
})(Plexx || (Plexx = {}));
var Constants;
(function (Constants) {
    Constants.SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    Constants.SVG_INDENT = "  ";
    Constants.DEFAULT_CANVAS_WIDTH = 1000;
    Constants.DEFAULT_CANVAS_HEIGHT = 1000;
    Constants.DEFAULT_CANVAS_COLOUR = "white";
    Constants.DEFAULT_COLOUR = "green";
    Constants.DEFAULT_X = 0;
    Constants.DEFAULT_Y = 0;
    Constants.DEFAULT_HEIGHT = 100;
    Constants.DEFAULT_WIDTH = 100;
    Constants.DEFAULT_CIRCLE_SIDES = 100;
    Constants.PRIMITIVES_POINTS_CIRCLE_SIDES = 100;
    var PointsType;
    (function (PointsType) {
        PointsType[PointsType["HollowCircle"] = 1] = "HollowCircle";
        PointsType[PointsType["HollowDiamond"] = 2] = "HollowDiamond";
    })(PointsType = Constants.PointsType || (Constants.PointsType = {}));
    var LineType;
    (function (LineType) {
        LineType[LineType["Default"] = 1] = "Default";
    })(LineType = Constants.LineType || (Constants.LineType = {}));
    Constants.PolyLineTyp = { Default: "Default" };
    Constants.POINTS_DEFAULT_TYPE_ID = 1;
    Constants.POINTS_DEFAULT_SIZE = 1;
})(Constants || (Constants = {}));
var Plexx;
(function (Plexx) {
    var RenderType;
    (function (RenderType) {
        RenderType[RenderType["CANVAS2D"] = 0] = "CANVAS2D";
        RenderType[RenderType["SVG"] = 1] = "SVG";
        RenderType[RenderType["WEBGL"] = 2] = "WEBGL";
    })(RenderType = Plexx.RenderType || (Plexx.RenderType = {}));
    var RenderContext = (function () {
        function RenderContext(values) {
            var elementOfDomId = document.getElementById(values.id);
            if (elementOfDomId == null) {
                console.log("[FDGL] Can\'t create render context for " + values.id + ". Element in DOM not found!");
            }
            this.domId = values.id;
            this.width = 100;
            this.height = 100;
            this.changeRenderType(values.renderType || RenderType.CANVAS2D);
        }
        RenderContext.prototype.changeRenderType = function (renderType) {
            var plexxElement = document.getElementById(this.domId);
            if (this.renderType === RenderType.CANVAS2D) {
                plexxElement.removeChild(this.canvas2D);
            }
            else if (this.renderType === RenderType.SVG) {
                plexxElement.removeChild(this.svg);
            }
            else if (this.renderType === RenderType.WEBGL) {
                plexxElement.removeChild(this.canvasWebGL);
            }
            if (renderType === RenderType.CANVAS2D) {
                this.initCanvas2D();
                document.getElementById(this.domId).appendChild(this.canvas2D);
            }
            else if (renderType === RenderType.SVG) {
                this.initSVG();
                document.getElementById(this.domId).appendChild(this.svg);
            }
            else if (renderType === RenderType.WEBGL) {
                this.initWebGLCanvas();
                document.getElementById(this.domId).appendChild(this.canvasWebGL);
            }
            this.renderType = renderType;
        };
        RenderContext.prototype.getRenderType = function () {
            return this.renderType;
        };
        RenderContext.prototype.initCanvas2D = function () {
            this.canvas2D = document.createElement("canvas");
            this.canvas2D.id = "canvas";
            this.canvas2D.width = String(this.width);
            this.canvas2D.height = String(this.height);
            this.canvas2D.style.position = this.stylePosition;
            this.canvas2D.style.top = this.styleTop;
            this.canvas2D.style.left = this.styleLeft;
        };
        RenderContext.prototype.clearSVG = function () {
            while (this.svg.hasChildNodes()) {
                this.svg.removeChild(this.svg.lastChild);
            }
        };
        RenderContext.prototype.initSVG = function () {
            this.svg = document.createElementNS(Constants.SVG_NAMESPACE, "svg");
            this.svg.viewBox = String("0 0 " + this.width + " " + this.height);
            this.svg.width = String(this.width);
            this.svg.height = String(this.height);
            this.svg.preserveAspectRatio = "none";
            this.svg.setAttributeNS(null, "width", this.width);
            this.svg.setAttributeNS(null, "height", this.height);
            this.svg.setAttributeNS(null, "viewBox", "0 0 " + this.width + " " + this.height);
            this.svg.style.position = this.stylePosition;
            this.svg.style.top = this.styleTop;
            this.svg.style.left = this.styleLeft;
        };
        RenderContext.prototype.initWebGLCanvas = function () {
            this.canvasWebGL = document.createElement("canvas");
            this.canvasWebGL.setAttribute("id", "webGLCanvas");
            this.canvasWebGL.setAttribute("height", String(this.height));
            this.canvasWebGL.setAttribute("width", String(this.width));
            this.canvasWebGL.style.position = this.stylePosition;
            this.canvasWebGL.style.top = this.styleTop;
            this.canvasWebGL.style.left = this.styleLeft;
        };
        RenderContext.prototype.getId = function () {
            return this.domId;
        };
        RenderContext.prototype.getCanvas2D = function () {
            return this.canvas2D;
        };
        RenderContext.prototype.getCanvas2dContext = function () {
            return this.canvas2D.getContext("2d");
        };
        RenderContext.prototype.getSVG = function () {
            return this.svg;
        };
        RenderContext.prototype.getCanvasWebGL = function () {
            return this.canvasWebGL;
        };
        RenderContext.prototype.getWebGLRenderingContext = function () {
            var gl;
            if (!this.canvasWebGL) {
                this.initWebGLCanvas();
            }
            gl = this.canvasWebGL.getContext("webgl", { stencil: true });
            return gl;
        };
        RenderContext.prototype.getHeight = function () {
            return this.height;
        };
        RenderContext.prototype.getWidth = function () {
            return this.width;
        };
        RenderContext.prototype.setHeight = function (height) {
            this.height = height;
            if (this.canvas2D)
                this.canvas2D.height = String(this.height);
            if (this.svg) {
                this.svg.height = String(this.height);
                this.svg.setAttributeNS(null, "height", this.height);
                this.svg.setAttributeNS(null, "viewBox", "0 0 " + this.width + " " + this.height);
            }
            if (this.canvasWebGL)
                this.canvasWebGL.setAttribute("height", String(this.height));
        };
        RenderContext.prototype.setWidth = function (width) {
            this.width = width;
            if (this.canvas2D)
                this.canvas2D.width = String(this.width);
            if (this.svg) {
                this.svg.width = String(this.width);
                this.svg.setAttributeNS(null, "width", this.width);
                this.svg.setAttributeNS(null, "viewBox", "0 0 " + this.width + " " + this.height);
            }
            if (this.canvasWebGL)
                this.canvasWebGL.setAttribute("width", String(this.width));
        };
        RenderContext.prototype.setCanvasNode = function (canvasNode) {
            this.canvasNode = canvasNode;
        };
        RenderContext.prototype.isWebGLEnabled = function () {
            var gl = null;
            if (this.canvasWebGL == null)
                this.initWebGLCanvas();
            try {
                gl = this.canvasWebGL.getContext("webgl");
            }
            catch (x) {
                gl = null;
            }
            return gl != null;
        };
        RenderContext.prototype.getClientWidth = function () {
            return document.getElementById(this.domId).clientWidth;
        };
        RenderContext.prototype.getClientHeight = function () {
            return document.getElementById(this.domId).clientHeight;
        };
        RenderContext.prototype.setStylePosition = function (stylePosition) {
            this.stylePosition = stylePosition;
            if (this.canvas2D)
                this.canvas2D.style.position = this.stylePosition;
            if (this.svg)
                this.svg.style.position = this.stylePosition;
            if (this.canvasWebGL)
                this.canvasWebGL.style.position = this.stylePosition;
        };
        RenderContext.prototype.setStyleTop = function (styleTop) {
            this.styleTop = styleTop;
            if (this.canvas2D)
                this.canvas2D.style.top = this.styleTop;
            if (this.svg)
                this.svg.style.top = this.styleTop;
            if (this.canvasWebGL)
                this.canvasWebGL.style.top = this.styleTop;
        };
        RenderContext.prototype.setStyleLeft = function (styleLeft) {
            this.styleLeft = styleLeft;
            if (this.canvas2D)
                this.canvas2D.style.left = this.styleLeft;
            if (this.svg)
                this.svg.style.left = this.styleLeft;
            if (this.canvasWebGL)
                this.canvasWebGL.style.left = this.styleLeft;
        };
        return RenderContext;
    }());
    Plexx.RenderContext = RenderContext;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line(values) {
            var _this = _super.call(this, { name: "Line" }) || this;
            _this.points = values.points;
            _this.width = values.width || Constants.DEFAULT_HEIGHT;
            _this.type = values.type || Constants.LineType.Default;
            _this.colour = values.colour;
            _this.colourNode = new Plexx.Colour(values.colour);
            _this.startArrow = values.startArrow || Line.startArrowDefault;
            _this.endArrow = values.endArrow || Line.endArrowDefault;
            _this.arrowScale = values.arrowScale || Line.arrowScaleDefault;
            var lineStartPosX = 0;
            var lineStartPosY = -_this.width / 2;
            var x1 = _this.points[0];
            var y1 = _this.points[1];
            var x2 = _this.points[2];
            var y2 = _this.points[3];
            var length = Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
            var lineLength = length;
            _this.setRotation(Math.atan2(y2 - y1, x2 - x1) / Math.PI * 180, [0, 0]);
            _this.setTranslation([x1, y1]);
            console.log(_this.rotation);
            if (_this.startArrow) {
                _this.startArrowNode = new Plexx.Triangle({
                    positionA: [0, 0],
                    positionB: [5 * _this.arrowScale, _this.width / 2 + _this.arrowScale],
                    positionC: [5 * _this.arrowScale, -_this.width / 2 - _this.arrowScale],
                    colour: _this.colour
                });
                lineLength -= 5 * _this.arrowScale;
                lineStartPosX = 5 * _this.arrowScale;
                _this.add(_this.startArrowNode);
            }
            if (_this.endArrow) {
                _this.endArrowNode = new Plexx.Triangle({
                    positionA: [length, 0],
                    positionB: [length - 5 * _this.arrowScale, _this.width / 2 + _this.arrowScale],
                    positionC: [length - 5 * _this.arrowScale, -_this.width / 2 - _this.arrowScale],
                    colour: _this.colour
                });
                lineLength -= 5 * _this.arrowScale;
                _this.add(_this.endArrowNode);
            }
            _this.lineNode = new Plexx.Rectangle({
                width: lineLength,
                height: _this.width,
                position: [lineStartPosX, lineStartPosY],
                colour: _this.colour
            });
            console.log("Line", lineStartPosX, lineStartPosY);
            _this.add(_this.lineNode);
            return _this;
        }
        Line.prototype.setColour = function (colour) {
            this.colourNode.setColour(colour);
            if (this.startArrowNode)
                this.startArrowNode.setColour(colour);
            if (this.endArrowNode)
                this.endArrowNode.setColour(colour);
            this.lineNode.setColour(colour);
        };
        Line.prototype.setPoints = function (points) {
            this.points[0] = points[0];
            this.points[1] = points[1];
            this.points[2] = points[2];
            this.points[3] = points[3];
            var lineStartPosX = 0;
            var lineStartPosY = -this.width / 2;
            var x1 = points[0];
            var y1 = points[1];
            var x2 = points[2];
            var y2 = points[3];
            var length = Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
            var lineLength = length;
            this.setRotation(Math.atan2(y2 - y1, x2 - x1) / Math.PI * 180, [0, 0]);
            this.setTranslation([x1, y1]);
            if (this.startArrow) {
                this.startArrowNode.positionA = [0, 0];
                this.startArrowNode.positionB = [5 * this.arrowScale, this.width / 2 + 2 * this.arrowScale];
                this.startArrowNode.positionC = [5 * this.arrowScale, -this.width / 2 - 2 * this.arrowScale];
                lineLength -= 5 * this.arrowScale;
                lineStartPosX = 5 * this.arrowScale;
            }
            if (this.endArrow) {
                this.endArrowNode.positionA = [length, 0];
                this.endArrowNode.positionB = [length - 5 * this.arrowScale, this.width / 2 + 2 * this.arrowScale];
                this.endArrowNode.positionC = [length - 5 * this.arrowScale, -this.width / 2 - 2 * this.arrowScale];
                lineLength -= 5 * this.arrowScale;
            }
            this.lineNode.setWidth(lineLength);
            this.lineNode.setHeight(this.width);
            this.lineNode.setPosition([lineStartPosX, lineStartPosY]);
        };
        return Line;
    }(Plexx.Group));
    Line.startArrowDefault = false;
    Line.endArrowDefault = false;
    Line.arrowScaleDefault = 10;
    Plexx.Line = Line;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(values) {
            var _this = _super.call(this, "Rectangle", values) || this;
            _this.width = values.width;
            _this.height = values.height;
            _this.position = new Plexx.Mathlib.Vec2(values.position[0], values.position[1]);
            _this.colour = values.colour || "green";
            _this.colourNode = new Plexx.Colour(_this.colour);
            _this.borderColour = values.borderColour || "#00000000";
            _this.borderWidth = values.borderWidth;
            _this.borderColourNode = new Plexx.Colour(_this.borderColour);
            console.log("[PLEXX] " + _this.toString() + " created");
            return _this;
        }
        Rectangle.prototype.setColour = function (colour) {
            this.colourNode.setColour(colour);
        };
        Rectangle.prototype.clone = function () {
            return new Rectangle({
                width: this.width,
                height: this.height,
                position: [this.position.x, this.position.y],
                colour: this.colour,
                translation: this.translation,
                scale: this.scale,
                scalePoint: this.scalePoint,
                rotation: this.rotation,
                rotationPoint: this.rotationPoint
            });
        };
        Rectangle.prototype.toString = function () {
            var rectangleString = this.getName() + " { ";
            rectangleString += "width: " + this.width + "; ";
            rectangleString += "height: " + this.height + "; ";
            rectangleString += "position: [" + this.position.x + ", " + this.position.y + "]; ";
            rectangleString += "colour: " + this.colour + "; ";
            rectangleString += "translation: " + this.translation + "; ";
            rectangleString += "scale: " + this.scale + "; ";
            rectangleString += "rotation: " + this.rotation + "; ";
            rectangleString += "}";
            return rectangleString;
        };
        Rectangle.prototype.setWidth = function (width) {
            this.width = width;
        };
        Rectangle.prototype.getWidth = function () {
            return this.width;
        };
        Rectangle.prototype.setHeight = function (height) {
            this.height = height;
        };
        Rectangle.prototype.getHeight = function () {
            return this.height;
        };
        Rectangle.prototype.setPosition = function (position) {
            this.position = new Plexx.Mathlib.Vec2(position[0], position[1]);
        };
        Rectangle.prototype.getPosition = function () {
            return [this.position.x, this.position.y];
        };
        Rectangle.prototype.hitBox = function (renderContext, position) {
            var x = position.x;
            var y = position.y;
            return (x >= this.position.x && x <= this.position.x + this.width && y >= this.position.y && y <= this.position.y + this.height);
        };
        Rectangle.prototype.getBoundingBox = function () {
            var min = new Plexx.Mathlib.Vec2(0, 0);
            var max = new Plexx.Mathlib.Vec2(0, 0);
            var boundingBox = null;
            console.log("Rectangle", boundingBox);
            min.x = this.position.x;
            min.y = this.position.y;
            max.x = this.position.x + this.width;
            max.y = this.position.y + this.height;
            console.log("Rectangle", max, min);
            boundingBox = new Plexx.BoundingBox2d(min, max);
            console.log("Rectangle", boundingBox);
            return boundingBox;
        };
        Rectangle.prototype.updateCanvas2d = function (renderContext, preTransformationMatrix) {
            var context = renderContext.getCanvas2D().getContext("2d");
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = preTransformationMatrix.copy().multiply(mirrorMatrix);
            context.save();
            context.setTransform(resultMatrix.at(0), resultMatrix.at(1), resultMatrix.at(3), resultMatrix.at(4), resultMatrix.at(6), resultMatrix.at(7));
            context.fillStyle = this.colourNode.getCss3String();
            context.fillRect(this.position.x, this.position.y, this.width, this.height);
            context.strokeStyle = this.borderColourNode.getCss3String();
            context.lineWidth = this.borderWidth;
            context.strokeRect(this.position[0], this.position[1], this.width, this.height);
            context.restore();
            return true;
        };
        Rectangle.prototype.generateSvg = function (renderContext, preTransformationMatrix) {
            var xmlTag = new Plexx.XMLTag("rect");
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = preTransformationMatrix.copy().multiply(mirrorMatrix);
            xmlTag.addAttribute("width", String(this.width));
            xmlTag.addAttribute("height", String(this.height));
            xmlTag.addAttribute("x", String(this.position.x));
            xmlTag.addAttribute("y", String(this.position.y));
            xmlTag.addAttribute("fill", String(this.colourNode.getCss3String()));
            xmlTag.addAttribute("stroke", "none");
            xmlTag.addAttribute("transform", "matrix(" + resultMatrix.at(0) + " " + resultMatrix.at(1) + " " + resultMatrix.at(3) + " " + resultMatrix.at(4) + " " + resultMatrix.at(6) + " " + resultMatrix.at(7) + ")");
            return xmlTag;
        };
        Rectangle.prototype.updateWebGl = function (renderContext, preTransformationMatrix) {
            var gl = renderContext.getWebGLRenderingContext();
            gl.useProgram(this.shaderProgram);
            this.shaderProgram.resolutionLocation = gl.getUniformLocation(this.shaderProgram, "resolution");
            this.shaderProgram.matrix = gl.getUniformLocation(this.shaderProgram, "matrix");
            this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            this.shaderProgram.colourValues = gl.getUniformLocation(this.shaderProgram, "colour");
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            var x = this.position.x;
            var y = this.position.y;
            var w = this.width;
            var h = this.height;
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                x, y,
                x + w, y,
                x, y + h,
                x, y + h,
                x + w, y,
                x + w, y + h
            ]), gl.STATIC_DRAW);
            gl.uniform2f(this.shaderProgram.resolutionLocation, renderContext.getWidth(), renderContext.getHeight());
            var tM = new Float32Array(preTransformationMatrix.all());
            gl.uniformMatrix3fv(this.shaderProgram.matrix, false, tM);
            gl.uniform4f(this.shaderProgram.colourValues, this.colourNode.getR(), this.colourNode.getG(), this.colourNode.getB(), this.colourNode.getA());
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            return true;
        };
        return Rectangle;
    }(Plexx.PrimitiveNode));
    Plexx.Rectangle = Rectangle;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Triangle = (function (_super) {
        __extends(Triangle, _super);
        function Triangle(values) {
            var _this = _super.call(this, "Triangle", values) || this;
            _this.positionA = values.positionA;
            _this.positionB = values.positionB;
            _this.positionC = values.positionC;
            _this.colour = values.colour || "black";
            _this.colourNode = new Plexx.Colour(values.colour);
            console.log("CREATE " + _this.toString());
            return _this;
        }
        Triangle.prototype.clone = function () {
            return new Triangle({
                positionA: this.positionA,
                positionB: this.positionB,
                positionC: this.positionC,
                colour: this.colour,
                translation: this.translation,
                scale: this.scale,
                scalePoint: this.scalePoint,
                rotation: this.rotation,
                rotationPoint: this.rotationPoint
            });
        };
        Triangle.prototype.setColour = function (colour) {
            this.colourNode.setColour(colour);
        };
        Triangle.prototype.toString = function () {
            var triangleString = this.getName() + " { ";
            triangleString += "positionA: " + this.positionA + "; ";
            triangleString += "positionB: " + this.positionB + "; ";
            triangleString += "positionC: " + this.positionC + "; ";
            triangleString += "colour: " + this.colour + "; ";
            triangleString += "translation: " + this.translation + "; ";
            triangleString += "translation: " + this.translation + "; ";
            triangleString += "scale: " + this.scale + "; ";
            triangleString += "rotation: " + this.rotation + "; ";
            triangleString += "}";
            return triangleString;
        };
        Triangle.prototype.hitBox = function (renderContext, position) {
            var x = position.x;
            var y = position.y;
            var a;
            var b;
            var c;
            a = new Plexx.Mathlib.Mat3([1, this.positionA[0], this.positionA[1], 1, this.positionB[0], this.positionB[1], 1, x, y]);
            b = new Plexx.Mathlib.Mat3([1, this.positionB[0], this.positionB[1], 1, this.positionC[0], this.positionC[1], 1, x, y]);
            c = new Plexx.Mathlib.Mat3([1, this.positionC[0], this.positionC[1], 1, this.positionA[0], this.positionA[1], 1, x, y]);
            return (a.det() <= 0 && b.det() <= 0 && c.det() <= 0);
        };
        Triangle.prototype.getBoundingBox = function () {
            var pointsX = [];
            var pointsY = [];
            pointsX.push(this.positionA[0]);
            pointsX.push(this.positionB[0]);
            pointsX.push(this.positionC[0]);
            pointsY.push(this.positionA[1]);
            pointsY.push(this.positionB[1]);
            pointsY.push(this.positionC[1]);
            return new Plexx.BoundingBox2d(new Plexx.Mathlib.Vec2(pointsX[0], pointsY[0]), new Plexx.Mathlib.Vec2(pointsX[2], pointsY[2]));
        };
        Triangle.prototype.generateSvg = function (renderContext, transformationMatrix) {
            var xmlTag = new Plexx.XMLTag("polygon");
            var points;
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = transformationMatrix.copy().multiply(mirrorMatrix);
            points = this.positionA[0] + "," + this.positionA[1];
            points += " " + this.positionB[0] + "," + this.positionB[1];
            points += " " + this.positionC[0] + "," + this.positionC[1];
            xmlTag.addAttribute("points", points);
            xmlTag.addAttribute("fill", this.colourNode.getCss3String());
            xmlTag.addAttribute("transform", "matrix(" + resultMatrix.at(0) + " " + resultMatrix.at(1) + " " + resultMatrix.at(3) + " " + resultMatrix.at(4) + " " + resultMatrix.at(6) + " " + resultMatrix.at(7) + ")");
            xmlTag.addAttribute("stroke", "none");
            return xmlTag;
        };
        Triangle.prototype.updateCanvas2d = function (renderContext, preTransformationMatrix) {
            var context = renderContext.getCanvas2D().getContext("2d");
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = preTransformationMatrix.copy().multiply(mirrorMatrix);
            context.save();
            context.beginPath();
            context.setTransform(resultMatrix.at(0), resultMatrix.at(1), resultMatrix.at(3), resultMatrix.at(4), resultMatrix.at(6), resultMatrix.at(7));
            context.moveTo(this.positionA[0], this.positionA[1]);
            context.lineTo(this.positionB[0], this.positionB[1]);
            context.lineTo(this.positionC[0], this.positionC[1]);
            context.fillStyle = this.colourNode.getCss3String();
            context.strokeStyle = "none";
            context.fill();
            context.closePath();
            context.restore();
            return true;
        };
        Triangle.prototype.updateWebGl = function (renderContext, transformationMatrix) {
            var gl = renderContext.getWebGLRenderingContext();
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, Triangle.vertexShaderSource);
            gl.compileShader(vertexShader);
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, Triangle.fragmentShaderSource);
            gl.compileShader(fragmentShader);
            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
            gl.useProgram(shaderProgram);
            var positionLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            var resolutionLocation = gl.getUniformLocation(shaderProgram, "resolution");
            gl.uniform2f(resolutionLocation, renderContext.getCanvasWebGL().getAttribute("width"), renderContext.getCanvasWebGL().getAttribute("height"));
            var tM = new Float32Array(transformationMatrix.all());
            var matrix = gl.getUniformLocation(shaderProgram, "matrix");
            gl.uniformMatrix3fv(matrix, false, tM);
            var colourValues = gl.getUniformLocation(shaderProgram, "colour");
            gl.uniform4f(colourValues, this.colourNode.getR(), this.colourNode.getG(), this.colourNode.getB(), this.colourNode.getA());
            var polygonVertices = new Float32Array(6);
            polygonVertices[0] = this.positionA[0];
            polygonVertices[1] = this.positionA[1];
            polygonVertices[2] = this.positionB[0];
            polygonVertices[3] = this.positionB[1];
            polygonVertices[4] = this.positionC[0];
            polygonVertices[5] = this.positionC[1];
            gl.bufferData(gl.ARRAY_BUFFER, polygonVertices, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
            return true;
        };
        return Triangle;
    }(Plexx.PrimitiveNode));
    Plexx.Triangle = Triangle;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Text = (function (_super) {
        __extends(Text, _super);
        function Text(textValues) {
            var _this = _super.call(this, "Text", textValues) || this;
            _this.text = textValues.text;
            _this.position = textValues.position ? new Plexx.Mathlib.Vec2(textValues.position[0], textValues.position[1]) : new Plexx.Mathlib.Vec2(0, 0);
            _this.colour = textValues.colour ? new Plexx.Colour(textValues.colour) : new Plexx.Colour("black");
            _this.fontSize = textValues.fontSize || 14;
            _this.fontFamily = textValues.fontFamily || "DejaVu Sans";
            _this.textVerticalAlignment = textValues.textVerticalAlignment || "bottom";
            _this.textHorizontalAlignment = textValues.textHorizontalAlignment || "left";
            _this.helperCanvas = document.createElement("canvas");
            _this.offset = _this.calculateOffset();
            console.log("[PLEXX]", _this.toString(), "created");
            return _this;
        }
        Text.prototype.getText = function () {
            return this.text;
        };
        Text.prototype.setText = function (text) {
            this.text = text;
            this.offset = this.calculateOffset();
        };
        Text.prototype.getPosition = function () {
            return [this.position.x, this.position.y];
        };
        Text.prototype.setPosition = function (position) {
            this.position = new Plexx.Mathlib.Vec2(position[0], position[1]);
        };
        Text.prototype.getColour = function () {
            return this.colour.getRGBAString();
        };
        Text.prototype.setColour = function (colour) {
            this.colour = new Plexx.Colour(colour);
        };
        Text.prototype.getFontSize = function () {
            return this.fontSize;
        };
        Text.prototype.setFontSize = function (fontSize) {
            this.fontSize = fontSize;
            this.offset = this.calculateOffset();
        };
        Text.prototype.getFontFamily = function () {
            return this.fontFamily;
        };
        Text.prototype.setFontFamily = function (fontFamily) {
            this.fontFamily = fontFamily;
            this.offset = this.calculateOffset();
        };
        Text.prototype.getTextVerticalAlignment = function () {
            return this.textVerticalAlignment;
        };
        Text.prototype.setTextVerticalAlignment = function (textVerticalAlignment) {
            this.textVerticalAlignment = textVerticalAlignment;
            this.offset = this.calculateOffset();
        };
        Text.prototype.getTextHorizontalAlignment = function () {
            return this.textHorizontalAlignment;
        };
        Text.prototype.setTextHorizontalAlignment = function (textHorizontalAlignment) {
            this.textHorizontalAlignment = textHorizontalAlignment;
            this.offset = this.calculateOffset();
        };
        Text.prototype.clone = function () {
            return new Text({
                position: [this.position.x, this.position.y],
                text: this.text,
                colour: this.colour.getRGBAString(),
                fontSize: this.fontSize,
                fontFamily: this.fontFamily,
                textVerticalAlignment: this.textVerticalAlignment,
                textHorizontalAlignment: this.textHorizontalAlignment,
                translation: this.translation,
                scale: this.scale,
                scalePoint: this.scalePoint,
                rotation: this.rotation,
                rotationPoint: this.rotationPoint
            });
        };
        Text.prototype.toString = function () {
            var text = "";
            text += this.getName() + " { ";
            text += "position: " + "[" + this.position.x + ", " + this.position.y + "]" + "; ";
            text += "text: \"" + this.text + "\"; ";
            text += "colour: \"" + this.colour.getCss3String() + "\"; ";
            text += "fontSize: " + this.fontSize + "; ";
            text += "fontFamily: \"" + this.fontFamily + "\"; ";
            text += "textVerticalAlignment: \"" + this.textVerticalAlignment + "\"; ";
            text += "textHorizontalAlignment: \"" + this.textHorizontalAlignment + "\"; ";
            text += "}";
            return text;
        };
        Text.prototype.hitBox = function (renderContext, position) {
            var x = position.x;
            var y = position.y;
            var textWidth = this.getTextWidth();
            var textHeightBaseline = this.getTextHeight("Y", this.fontFamily, this.fontSize);
            var textHeightFull = this.getTextHeight("Yy", this.fontFamily, this.fontSize);
            var baselineOffset = textHeightFull - textHeightBaseline;
            return x >= (this.position.x + this.offset.x) && x <= (this.position.x + this.offset.x + textWidth) && y >= (this.position.y + this.offset.y - baselineOffset) && y <= (this.position.y + this.offset.y + textHeightBaseline);
        };
        Text.getValidTextureSize = function (size) {
            var validSize = 2;
            while (size > validSize) {
                validSize *= 2;
            }
            return validSize;
        };
        Text.prototype.generateSvg = function (renderContext, preTransformationMatrix) {
            var xmlTag = new Plexx.XMLTag("text");
            var textWidth = this.getTextWidth();
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var translate1 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, 0, -(this.position.y + this.offset.y), 1]);
            var mirrorMatrix2 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, 0, 1]);
            var translate2 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, 0, (this.position.y + this.offset.y), 1]);
            var tmp = (translate1.copy().multiply(mirrorMatrix2)).copy().multiply(translate2);
            var resultMatrix = (tmp.copy().multiply(preTransformationMatrix)).multiply(mirrorMatrix);
            xmlTag.addAttribute("x", String(this.position.x + this.offset.x));
            xmlTag.addAttribute("y", String(this.position.y + this.offset.y));
            xmlTag.addAttribute("transform", "matrix(" + resultMatrix.at(0) +
                " " + resultMatrix.at(1) +
                " " + resultMatrix.at(3) +
                " " + resultMatrix.at(4) +
                " " + resultMatrix.at(6) +
                " " + resultMatrix.at(7) +
                ")");
            xmlTag.addAttribute("fill", this.colour.getCss3String());
            xmlTag.addAttribute("textLength", String(textWidth));
            xmlTag.addAttribute("style", "font-family: " + this.fontFamily + ";" +
                "font-size: " + this.fontSize + ";");
            xmlTag.setContent(this.text);
            return xmlTag;
        };
        Text.prototype.updateCanvas2d = function (renderContext, transformationMatrix) {
            var context = renderContext.getCanvas2dContext();
            var mirrorMatrix = new Plexx.Mathlib.Mat3([
                1, 0, 0,
                0, -1, 0,
                0, renderContext.getHeight(), 1
            ]);
            var translate1 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, 0, -(this.position.y + this.offset.y), 1]);
            var mirrorMatrix2 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, 0, 1]);
            var translate2 = new Plexx.Mathlib.Mat3([1, 0, 0, 0, 1, 0, 0, (this.position.y + this.offset.y), 1]);
            var tmp = (translate1.copy().multiply(mirrorMatrix2)).copy().multiply(translate2);
            var resultMatrix = (tmp.copy().multiply(transformationMatrix)).multiply(mirrorMatrix);
            context.save();
            context.setTransform(resultMatrix.at(0), resultMatrix.at(1), resultMatrix.at(3), resultMatrix.at(4), resultMatrix.at(6), resultMatrix.at(7));
            context.fillStyle = this.colour.getCss3String();
            context.font = this.fontSize + "px" + " " + this.fontFamily;
            context.fillText(this.text, (this.position.x + this.offset.x), (this.position.y + this.offset.y));
            context.restore();
            return true;
        };
        Text.prototype.updateWebGl = function (renderContext, transformationMatrix) {
            var gl = renderContext.getWebGLRenderingContext();
            var canvasHeight = renderContext.getHeight();
            var canvasWidth = renderContext.getWidth();
            var n;
            this.createCanvasTexture(transformationMatrix);
            gl.useProgram(this.shaderProgram);
            var tM = new Float32Array(transformationMatrix.all());
            var matrix = gl.getUniformLocation(this.shaderProgram, "matrix");
            gl.uniformMatrix3fv(matrix, false, tM);
            n = this.initVertexBuffers(gl, canvasWidth, canvasHeight, transformationMatrix);
            this.initTexture(gl, n);
            return true;
        };
        Text.prototype.calculateOffset = function () {
            var offsetX = 0;
            var offsetY = 0;
            var textWidth;
            var textHeight;
            textWidth = this.getTextWidth();
            textHeight = this.fontSize;
            if (this.textHorizontalAlignment === "left") {
                offsetX = 0;
            }
            else if (this.textHorizontalAlignment === "center") {
                offsetX = -textWidth / 2;
            }
            else if (this.textHorizontalAlignment === "right") {
                offsetX = -textWidth;
            }
            if (this.textVerticalAlignment === "bottom") {
                offsetY = 0;
            }
            else if (this.textVerticalAlignment === "middle") {
                offsetY = -textHeight / 2;
            }
            else if (this.textVerticalAlignment === "top") {
                offsetY = -textHeight;
            }
            return new Plexx.Mathlib.Vec2(offsetX, offsetY);
        };
        Text.prototype.getTextWidth = function () {
            var textWidth;
            textWidth = this.calculateTextWidth(this.text, this.fontFamily, this.fontSize);
            return textWidth;
        };
        Text.prototype.calculateTextWidth = function (text, fontFamily, fontSize) {
            var textWidth;
            var helperContext = this.helperCanvas.getContext("2d");
            helperContext.font = fontSize + "px" + " " + fontFamily;
            textWidth = helperContext.measureText(text).width;
            return textWidth;
        };
        Text.prototype.getTextHeight = function (text, fontFamily, fontSize) {
            var bufferData;
            var helperContext = this.helperCanvas.getContext("2d");
            var canvasWidth = this.fontSize * 4;
            var canvasHeight = this.fontSize * 4;
            var textPositionX = canvasWidth / 2;
            var textPositionY = canvasHeight / 2;
            var topMarginFound = false;
            var bottomMarginFound = false;
            var topMargin = 0;
            var bottomMargin = canvasHeight;
            var x;
            var y;
            var height;
            this.helperCanvas.width = canvasWidth;
            this.helperCanvas.height = canvasHeight;
            helperContext.fillStyle = "#FFFFFFFF";
            helperContext.font = fontSize + "px" + " " + fontFamily;
            helperContext.fillText(text, textPositionX, textPositionY);
            bufferData = helperContext.getImageData(0, 0, canvasWidth, canvasHeight).data;
            y = canvasHeight;
            while (!bottomMarginFound) {
                for (x = 0; x < this.helperCanvas.width; x++) {
                    if (bufferData[(y * (this.helperCanvas.width * 4)) + (x * 4) + 3] > 0) {
                        bottomMargin = y;
                        bottomMarginFound = true;
                        break;
                    }
                }
                y--;
                if (y === 0) {
                    bottomMarginFound = true;
                    bottomMargin = 0;
                }
            }
            y = 0;
            while (!topMarginFound) {
                for (x = 0; (!topMarginFound && x < this.helperCanvas.width); x++) {
                    if (bufferData[(y * (this.helperCanvas.width * 4)) + (x * 4) + 3] > 0) {
                        topMargin = y;
                        topMarginFound = true;
                        break;
                    }
                }
                y++;
                if (y === this.helperCanvas.height) {
                    topMarginFound = true;
                    topMargin = this.helperCanvas.height;
                }
            }
            height = bottomMargin - topMargin;
            helperContext.clearRect(0, 0, canvasWidth, canvasHeight);
            return height;
        };
        Text.prototype.getBoundingBox = function () {
            var min = new Plexx.Mathlib.Vec2(0, 0);
            var max = new Plexx.Mathlib.Vec2(0, 0);
            var boundingBox;
            var tempCanvas = document.createElement("canvas");
            var tempContext = tempCanvas.getContext("2d");
            tempContext.font = this.fontSize + "px" + " " + this.fontFamily;
            var textWidth = tempContext.measureText(this.text).width;
            var textHeightBaseline = this.getTextHeight("Y", this.fontFamily, this.fontSize);
            var textHeightFull = this.getTextHeight("Yy", this.fontFamily, this.fontSize);
            var baselineOffset = textHeightFull - textHeightBaseline;
            min.x = this.position[0] + this.offset.x;
            min.y = this.position[1] + this.offset.y - baselineOffset;
            max.x = this.position[0] + this.offset.x + textWidth;
            max.y = this.position[1] + this.offset.y + textHeightBaseline;
            boundingBox = new Plexx.BoundingBox2d(min, max);
            return boundingBox;
        };
        Text.prototype.createCanvasTexture = function (transformationMatrix) {
            var textureCanvas = document.createElement("canvas");
            var context;
            var scaledTextWidth;
            var scale = Math.max(transformationMatrix.values[0], transformationMatrix.values[4]);
            var scaledFontSize = this.fontSize * scale;
            scaledTextWidth = this.calculateTextWidth(this.text, this.fontFamily, scaledFontSize) * 2;
            textureCanvas.width = Text.getValidTextureSize(scaledTextWidth) * 2;
            textureCanvas.height = Text.getValidTextureSize(scaledFontSize) * 2;
            context = textureCanvas.getContext("2d");
            context.font = scaledFontSize + "px" + " " + this.fontFamily;
            context.fillStyle = this.colour.getCss3String();
            context.fillText(this.text, 0, textureCanvas.height / 2);
            this.textureCanvas = textureCanvas;
        };
        Text.prototype.initVertexBuffers = function (gl, canvasWidth, canvasHeight, transformationMatrix) {
            var scale = Math.max(transformationMatrix.values[0], transformationMatrix.values[4]);
            var height = this.textureCanvas.height / scale;
            var width = this.textureCanvas.width / scale;
            var x = this.position.x + this.offset.x;
            var y = this.position.y + this.offset.y - height / 2;
            var verticesTextureCoordinates = new Float32Array([
                x, y + height, 0.0, 1.0,
                x, y, 0.0, 0.0,
                x + width, y + height, 1.0, 1.0,
                x + width, y, 1.0, 0.0,
            ]);
            var n = 4;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, verticesTextureCoordinates, gl.STATIC_DRAW);
            var FSIZE = verticesTextureCoordinates.BYTES_PER_ELEMENT;
            var u_Resolution = gl.getUniformLocation(this.shaderProgram, "u_Resolution");
            gl.uniform2f(u_Resolution, canvasWidth, canvasHeight);
            var a_Position = gl.getAttribLocation(this.shaderProgram, "a_Position");
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
            gl.enableVertexAttribArray(a_Position);
            var a_TextureCoordinates = gl.getAttribLocation(this.shaderProgram, "a_TextureCoordinates");
            gl.vertexAttribPointer(a_TextureCoordinates, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
            gl.enableVertexAttribArray(a_TextureCoordinates);
            return n;
        };
        Text.prototype.initTexture = function (gl, n) {
            var canvasTexture = gl.createTexture();
            var u_Sampler = gl.getUniformLocation(this.shaderProgram, "u_Sampler");
            this.loadTexture(gl, n, canvasTexture, u_Sampler);
        };
        Text.prototype.loadTexture = function (gl, n, texture, u_Sampler) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureCanvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.uniform1i(u_Sampler, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
        };
        Text.prototype.initWebGlShader = function (renderContext) {
            var gl = renderContext.getCanvasWebGL().getContext("webgl");
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            this.shaderProgram = gl.createProgram();
            gl.shaderSource(vertexShader, Text.VSHADER_SOURCE);
            gl.compileShader(vertexShader);
            gl.shaderSource(fragmentShader, Text.FSHADER_SOURCE);
            gl.compileShader(fragmentShader);
            gl.attachShader(this.shaderProgram, vertexShader);
            gl.attachShader(this.shaderProgram, fragmentShader);
            gl.linkProgram(this.shaderProgram);
        };
        return Text;
    }(Plexx.PrimitiveNode));
    Text.VSHADER_SOURCE = "\n            attribute vec4 a_Position;\n            attribute vec2 a_TextureCoordinates;\n            varying vec2 v_TextureCoordinates;\n            uniform vec2 u_Resolution;\n            uniform mat3 matrix;\n\n            void main() {\n              vec2 tmp1 = (matrix * vec3(a_Position.x, a_Position.y, 1)).xy / u_Resolution;\n              vec2 tmp2 = tmp1 * 2.0;\n              vec2 tmp3 = tmp2 - 1.0;\n              gl_Position = vec4(tmp3 , a_Position.z, a_Position.w);\n              v_TextureCoordinates = a_TextureCoordinates;\n            }\n            ";
    Text.FSHADER_SOURCE = "\n            precision mediump float;\n            uniform sampler2D u_Sampler;\n            varying vec2 v_TextureCoordinates;\n\n            void main() {\n              gl_FragColor = texture2D(u_Sampler, v_TextureCoordinates);\n            }\n            ";
    Plexx.Text = Text;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Circle = (function (_super) {
        __extends(Circle, _super);
        function Circle(values) {
            var _this = _super.call(this, "Circle", values) || this;
            _this.radius = values.radius;
            _this.position = new Plexx.Mathlib.Vec2(values.position[0], values.position[1]);
            _this.colour = values.colour;
            _this.borderColour = values.borderColour || values.colour;
            _this.borderWidth = values.borderWidth || 0;
            _this.colourNode = new Plexx.Colour(_this.colour);
            _this.borderColourNode = new Plexx.Colour(_this.borderColour);
            console.log("[PLEXX] " + _this.toString() + " created");
            return _this;
        }
        Circle.prototype.toString = function () {
            var circleString = this.getName() + " { ";
            circleString += "radius: " + this.radius + "; ";
            circleString += "position: " + this.position + "; ";
            circleString += "colour: " + this.colour + "; ";
            circleString += "borderColour: " + this.borderColour + "; ";
            circleString += "borderWidth: " + this.borderWidth + "; ";
            circleString += "}";
            return circleString;
        };
        Circle.prototype.setColour = function (colour) {
            this.colourNode.setColour(colour);
        };
        Circle.prototype.hitBox = function (renderContext, position) {
            var x = position.x;
            var y = position.y;
            if (Math.pow((x - this.position.x), 2) + Math.pow((y - this.position.y), 2) < Math.pow(this.radius, 2)) {
                return true;
            }
            else
                return false;
        };
        Circle.prototype.getBoundingBox = function () {
            var min = new Plexx.Mathlib.Vec2(0, 0);
            var max = new Plexx.Mathlib.Vec2(0, 0);
            var boundingBox;
            min.x = this.position.x - this.radius;
            min.y = this.position.y - this.radius;
            max.x = this.position.x + this.radius;
            max.y = this.position.y + this.radius;
            boundingBox = new Plexx.BoundingBox2d(min, max);
            return boundingBox;
        };
        Circle.prototype.updateCanvas2d = function (renderContext, preTransformationMatrix) {
            var context = renderContext.getCanvas2D().getContext("2d");
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = preTransformationMatrix.copy().multiply(mirrorMatrix);
            context.save();
            context.beginPath();
            context.setTransform(resultMatrix.at(0), resultMatrix.at(1), resultMatrix.at(3), resultMatrix.at(4), resultMatrix.at(6), resultMatrix.at(7));
            context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
            context.fillStyle = this.colourNode.getCss3String();
            context.fill();
            if (this.borderWidth !== 0) {
                context.strokeStyle = this.borderColourNode.getCss3String();
                context.lineWidth = this.borderWidth;
                context.stroke();
            }
            context.closePath();
            context.restore();
            return true;
        };
        Circle.prototype.generateSvg = function (renderContext, preTransformationMatrix) {
            var xmlTag = new Plexx.XMLTag("circle");
            var svgElement = document.createElementNS(Constants.SVG_NAMESPACE, "circle");
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = preTransformationMatrix.copy().multiply(mirrorMatrix);
            xmlTag.addAttribute("cx", String(this.position.x));
            xmlTag.addAttribute("cy", String(this.position.y));
            xmlTag.addAttribute("transform", "matrix(" + resultMatrix.at(0) +
                " " + resultMatrix.at(1) +
                " " + resultMatrix.at(3) +
                " " + resultMatrix.at(4) +
                " " + resultMatrix.at(6) +
                " " + resultMatrix.at(7) +
                ")");
            xmlTag.addAttribute("r", String(this.radius));
            xmlTag.addAttribute("fill", String(this.colourNode.getCss3String()));
            xmlTag.addAttribute("stroke", "none");
            console.log(xmlTag.generateSvgText());
            return xmlTag;
        };
        Circle.prototype.updateWebGl = function (renderContext, transformationMatrix) {
            var gl = renderContext.getWebGLRenderingContext();
            gl.useProgram(this.shaderProgram);
            this.shaderProgram.resolutionLocation = gl.getUniformLocation(this.shaderProgram, "resolution");
            this.shaderProgram.matrix = gl.getUniformLocation(this.shaderProgram, "matrix");
            this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            this.shaderProgram.colourValues = gl.getUniformLocation(this.shaderProgram, "colour");
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.uniform2f(this.shaderProgram.resolutionLocation, renderContext.getCanvasWebGL().getAttribute("width"), renderContext.getCanvasWebGL().getAttribute("height"));
            var tM = new Float32Array(transformationMatrix.all());
            gl.uniformMatrix3fv(this.shaderProgram.matrix, false, tM);
            gl.uniform4f(this.shaderProgram.colourValues, this.colourNode.getR(), this.colourNode.getG(), this.colourNode.getB(), this.colourNode.getA());
            var polygonVertices = new Float32Array(2 * (Circle.CIRCLE_SIDES));
            var canvasHeight = renderContext.getHeight();
            for (var i = 0; i < Circle.CIRCLE_SIDES; i++) {
                polygonVertices[2 * i] = this.radius * Math.cos(2 * Math.PI / Circle.CIRCLE_SIDES * i) + this.position.x;
                polygonVertices[(2 * i) + 1] = this.radius * Math.sin(2 * Math.PI / Circle.CIRCLE_SIDES * i) + this.position.y;
            }
            gl.bufferData(gl.ARRAY_BUFFER, polygonVertices, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, Circle.CIRCLE_SIDES);
            return true;
        };
        Circle.prototype.clone = function () {
            return null;
        };
        return Circle;
    }(Plexx.PrimitiveNode));
    Circle.CIRCLE_SIDES = 120;
    Plexx.Circle = Circle;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Ellipse = (function (_super) {
        __extends(Ellipse, _super);
        function Ellipse(values) {
            var _this = _super.call(this, "Ellipse", values) || this;
            _this.circleSides = 128;
            _this.radiusX = values.radiusX;
            _this.radiusY = values.radiusY;
            _this.position = new Plexx.Mathlib.Vec2(values.position[0], values.position[1]);
            _this.colour = new Plexx.Colour(values.colour);
            console.log("[PLEXX] " + _this.toString() + " created");
            return _this;
        }
        Ellipse.prototype.toString = function () {
            var ellipseString = this.getName() + " { ";
            ellipseString += "radiusX: " + this.radiusX + "; ";
            ellipseString += "radiusY: " + this.radiusY + "; ";
            ellipseString += "position: " + this.position + "; ";
            ellipseString += "colour: " + this.position + "; ";
            ellipseString += "}";
            return ellipseString;
        };
        Ellipse.prototype.setColour = function (colour) {
            this.colour.setColour(colour);
        };
        Ellipse.prototype.updateCanvas2d = function (renderContext, preTransformationMatrix) {
            var context = renderContext.getCanvas2D().getContext("2d");
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = preTransformationMatrix.copy().multiply(mirrorMatrix);
            context.save();
            context.beginPath();
            context.setTransform(resultMatrix.at(0), resultMatrix.at(1), resultMatrix.at(3), resultMatrix.at(4), resultMatrix.at(6), resultMatrix.at(7));
            context.translate(this.position.x, this.position.y);
            context.scale(this.radiusX, this.radiusY);
            context.arc(0, 0, 1, 0, 2 * Math.PI, false);
            context.fillStyle = this.colour.getCss3String();
            context.fill();
            context.strokeStyle = "none";
            context.closePath();
            context.restore();
            return true;
        };
        Ellipse.prototype.hitBox = function (renderContext, position) {
            var x = position.x;
            var y = position.y;
            if (Math.pow((x - this.position.x), 2) / Math.pow(this.radiusX, 2) + Math.pow((y - this.position.y), 2) / Math.pow(this.radiusY, 2) < 1) {
                return true;
            }
            else
                return false;
        };
        Ellipse.prototype.getBoundingBox = function () {
            var min = new Plexx.Mathlib.Vec2(0, 0);
            var max = new Plexx.Mathlib.Vec2(0, 0);
            var boundingBox;
            min.x = this.position.x - this.radiusX;
            min.y = this.position.y - this.radiusY;
            max.x = this.position.x + this.radiusX;
            max.y = this.position.y + this.radiusY;
            boundingBox = new Plexx.BoundingBox2d(min, max);
            return boundingBox;
        };
        Ellipse.prototype.generateSvg = function (renderContext, preTransformationMatrix) {
            var xmlTag = new Plexx.XMLTag("ellipse");
            var SVGObject = document.createElementNS(Constants.SVG_NAMESPACE, "ellipse");
            var canvasHeight = renderContext.getHeight();
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = preTransformationMatrix.copy().multiply(mirrorMatrix);
            xmlTag.addAttribute("cx", String(this.position.x));
            xmlTag.addAttribute("cy", String(this.position.y));
            xmlTag.addAttribute("rx", String(this.radiusX));
            xmlTag.addAttribute("ry", String(this.radiusY));
            xmlTag.addAttribute("fill", this.colour.getCss3String());
            xmlTag.addAttribute("transform", "matrix(" + resultMatrix.at(0) + " " + resultMatrix.at(1) + " " + resultMatrix.at(3) + " " + resultMatrix.at(4) + " " + resultMatrix.at(6) + " " + resultMatrix.at(7) + ")");
            xmlTag.addAttribute("stroke", "none");
            return xmlTag;
        };
        Ellipse.prototype.updateWebGl = function (renderContext, transformationMatrix) {
            var gl = renderContext.getWebGLRenderingContext();
            gl.useProgram(this.shaderProgram);
            var positionLocation = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            var resolutionLocation = gl.getUniformLocation(this.shaderProgram, "resolution");
            gl.uniform2f(resolutionLocation, renderContext.getCanvasWebGL().getAttribute("width"), renderContext.getCanvasWebGL().getAttribute("height"));
            var tM = new Float32Array(transformationMatrix.all());
            var matrix = gl.getUniformLocation(this.shaderProgram, "matrix");
            gl.uniformMatrix3fv(matrix, false, tM);
            var colourValues = gl.getUniformLocation(this.shaderProgram, "colour");
            gl.uniform4f(colourValues, this.colour.getR(), this.colour.getG(), this.colour.getB(), this.colour.getA());
            var polygonVertices = new Float32Array(2 * (this.circleSides));
            var canvasHeight = renderContext.getHeight();
            for (var i = 0; i < this.circleSides; i++) {
                polygonVertices[2 * i] = this.radiusX * Math.cos(2 * Math.PI / this.circleSides * i) + this.position.x;
                polygonVertices[(2 * i) + 1] = this.radiusY * Math.sin(2 * Math.PI / this.circleSides * i) + this.position.y;
            }
            gl.bufferData(gl.ARRAY_BUFFER, polygonVertices, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.circleSides);
            return true;
        };
        return Ellipse;
    }(Plexx.PrimitiveNode));
    Plexx.Ellipse = Ellipse;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Polygon = (function (_super) {
        __extends(Polygon, _super);
        function Polygon(values) {
            var _this = _super.call(this, "Polygon", values) || this;
            _this.points = values.points;
            _this.colour = values.colour;
            _this.colourNode = new Plexx.Colour(_this.colour);
            console.log("[FDGL] " + _this.toString() + " created");
            return _this;
        }
        Polygon.prototype.clone = function () {
            return new Polygon({
                points: this.points,
                colour: this.colour
            });
        };
        Polygon.prototype.setColour = function (colour) {
            this.colourNode.setColour(colour);
        };
        Polygon.prototype.toString = function () {
            var polygonString = this.getName() + " { ";
            polygonString += "position: ";
            for (var index = 0; index < this.points.length / 2; index++) {
                if (index === 0) {
                    polygonString += "(" + this.points[2 * index] + ", " + this.points[2 * index + 1] + ")";
                }
                else {
                    polygonString += ", (" + this.points[2 * index] + ", " + this.points[2 * index + 1] + ")";
                }
            }
            polygonString += "}";
            return polygonString;
        };
        Polygon.prototype.hitBox = function (renderContext, position) {
            var tempCanvas = document.createElement("canvas");
            var tempContext = tempCanvas.getContext("2d");
            var x = position.x;
            var y = position.y;
            var isPointInsidePath;
            tempContext.save();
            tempContext.beginPath();
            tempContext.lineTo(this.points[0], this.points[1]);
            for (var i = 1; i < this.points.length / 2; i++) {
                tempContext.lineTo(this.points[2 * i], this.points[2 * i + 1]);
            }
            tempContext.fillStyle = this.colourNode.getCss3String();
            tempContext.fill();
            tempContext.strokeStyle = "none";
            tempContext.lineWidth = 0;
            tempContext.closePath();
            isPointInsidePath = tempContext.isPointInPath(x, y);
            tempContext.restore();
            return isPointInsidePath;
        };
        Polygon.prototype.updateCanvas2d = function (renderContext, transformationMatrix) {
            var context = renderContext.getCanvas2D().getContext("2d");
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = transformationMatrix.copy().multiply(mirrorMatrix);
            context.save();
            context.beginPath();
            context.setTransform(resultMatrix.at(0), resultMatrix.at(1), resultMatrix.at(3), resultMatrix.at(4), resultMatrix.at(6), resultMatrix.at(7));
            context.moveTo(this.points[0], this.points[1]);
            for (var i = 1; i < this.points.length / 2; i++) {
                context.lineTo(this.points[2 * i], this.points[2 * i + 1]);
            }
            context.fillStyle = this.colourNode.getCss3String();
            context.fill();
            context.strokeStyle = "none";
            context.lineWidth = 0;
            context.closePath();
            context.restore();
            return true;
        };
        Polygon.prototype.generateSvg = function (renderContext, transformationMatrix) {
            var xmlTag = new Plexx.XMLTag("path");
            var points = "";
            var mirrorMatrix = new Plexx.Mathlib.Mat3([1, 0, 0, 0, -1, 0, 0, renderContext.getHeight(), 1]);
            var resultMatrix = transformationMatrix.copy().multiply(mirrorMatrix);
            points = this.points[0] + "," + this.points[1];
            for (var i = 1; i < this.points.length / 2; i++) {
                points += " " + this.points[2 * i] + "," + this.points[2 * i + 1];
            }
            xmlTag.addAttribute("d", "M " + points + " z");
            xmlTag.addAttribute("transform", "matrix(" + resultMatrix.at(0) + " " + resultMatrix.at(1) + " " + resultMatrix.at(3) + " " + resultMatrix.at(4) + " " + resultMatrix.at(6) + " " + resultMatrix.at(7) + ")");
            xmlTag.addAttribute("fill", this.colourNode.getCss3String());
            return xmlTag;
        };
        Polygon.prototype.updateWebGl = function (renderContext, transformationMatrix) {
            var gl = renderContext.getCanvasWebGL().getContext("webgl", { stencil: true });
            gl.useProgram(this.shaderProgram);
            var positionLocation = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            var matrixValues = new Float32Array(transformationMatrix.all());
            var matrix = gl.getUniformLocation(this.shaderProgram, "matrix");
            gl.uniformMatrix3fv(matrix, false, matrixValues);
            var colourValues = gl.getUniformLocation(this.shaderProgram, "colour");
            gl.uniform4f(colourValues, this.colourNode.getR(), this.colourNode.getG(), this.colourNode.getB(), this.colourNode.getA());
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            var resolutionLocation = gl.getUniformLocation(this.shaderProgram, "resolution");
            gl.uniform2f(resolutionLocation, renderContext.getCanvasWebGL().getAttribute("width"), renderContext.getCanvasWebGL().getAttribute("height"));
            gl.clearStencil(0x0);
            gl.enable(gl.STENCIL_TEST);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.colorMask(false, false, false, false);
            var numberOfPoints = this.points.length / 2;
            gl.stencilOp(gl.INVERT, gl.INVERT, gl.INVERT);
            gl.stencilFunc(gl.ALWAYS, 1, 0);
            for (var i = 1; i <= numberOfPoints - 2; i++) {
                var polygonVertices_1 = new Float32Array(this.points.length);
                polygonVertices_1[0] = this.points[0];
                polygonVertices_1[1] = this.points[1];
                polygonVertices_1[2] = this.points[i * 2];
                polygonVertices_1[3] = this.points[i * 2 + 1];
                polygonVertices_1[4] = this.points[i * 2 + 2];
                polygonVertices_1[5] = this.points[i * 2 + 3];
                var stencilStepBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, stencilStepBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, polygonVertices_1, gl.STATIC_DRAW);
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.deleteBuffer(stencilStepBuffer);
            }
            gl.colorMask(true, true, true, true);
            gl.stencilFunc(gl.EQUAL, 1, 1);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            var xValues = [];
            var yValues = [];
            var xIndex = 0;
            var yIndex = 0;
            for (var i = 0; i < this.points.length; i++) {
                if (i % 2 === 0) {
                    xValues[xIndex] = this.points[i];
                    xIndex++;
                }
                else {
                    yValues[yIndex] = this.points[i];
                    yIndex++;
                }
            }
            var minX = Math.min.apply(Plexx.Mathlib, xValues);
            var minY = Math.min.apply(Plexx.Mathlib, yValues);
            var maxX = Math.max.apply(Plexx.Mathlib, xValues);
            var maxY = Math.max.apply(Plexx.Mathlib, yValues);
            var polygonVertices = new Float32Array(8);
            polygonVertices[0] = minX;
            polygonVertices[1] = minY;
            polygonVertices[2] = minX;
            polygonVertices[3] = maxY;
            polygonVertices[4] = maxX;
            polygonVertices[5] = maxY;
            polygonVertices[6] = maxX;
            polygonVertices[7] = minY;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, polygonVertices, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.deleteBuffer(buffer);
            gl.clearColor(1, 1, 1, 1);
            gl.clearStencil(gl.STENCIL_BUFFER_BIT);
            gl.disable(gl.STENCIL_TEST);
            return true;
        };
        return Polygon;
    }(Plexx.PrimitiveNode));
    Plexx.Polygon = Polygon;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Vec2 = Plexx.Mathlib.Vec2;
    var Line2D = (function () {
        function Line2D(a, b) {
            this.a = a;
            this.b = b;
        }
        Line2D.prototype.copy = function () {
            return new Line2D(new Vec2(this.a.x, this.a.y), new Vec2(this.b.x, this.b.y));
        };
        Line2D.prototype.intersect = function (l) {
            var p = new Vec2(0, 0);
            var x1 = this.a.x;
            var y1 = this.a.y;
            var x2 = this.b.x;
            var y2 = this.b.y;
            var x3 = l.a.x;
            var y3 = l.a.y;
            var x4 = l.b.x;
            var y4 = l.b.y;
            p.x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
            p.y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
            return p;
        };
        Line2D.prototype.parallelTranslate = function (s) {
            var phi = 90 + (Math.atan2(this.b.y - this.a.y, this.b.x - this.a.x) / (Math.PI)) * 180;
            console.log("phi", phi);
            var xDiff = s * Math.cos(phi * Math.PI / 180);
            console.log("xDiff", xDiff);
            var yDiff = s * Math.sin(phi * Math.PI / 180);
            console.log("yDiff", yDiff);
            console.log("point a", this.a);
            console.log("point b", this.b);
            this.a.x += xDiff;
            this.a.y += yDiff;
            this.b.x += xDiff;
            this.b.y += yDiff;
            console.log("point a", this.a);
            console.log("point b", this.b);
        };
        return Line2D;
    }());
    Plexx.Line2D = Line2D;
    var PolyLine = (function (_super) {
        __extends(PolyLine, _super);
        function PolyLine(values) {
            var _this = _super.call(this, { name: "PolyLine" }) || this;
            if (values.points.length % 2 !== 0) {
                _this.points = values.points.filter(function (value, index, array) {
                    return index < (values.points.length - 1);
                });
            }
            else
                _this.points = values.points;
            _this.width = values.width || Constants.DEFAULT_HEIGHT;
            _this.type = values.type || Constants.PolyLineTyp.Default;
            _this.colour = values.colour;
            _this.colourNode = new Plexx.Colour(_this.colour);
            var polygonPoints = [];
            var firstPoint = new Vec2(_this.points[0], _this.points[1]);
            var secondPoint = new Vec2(_this.points[2], _this.points[3]);
            var firstCenterLine = new Line2D(firstPoint, secondPoint);
            var firstTopLine = firstCenterLine.copy();
            var firstBottomLine = firstCenterLine.copy();
            firstTopLine.parallelTranslate(_this.width / 2);
            firstBottomLine.parallelTranslate(-_this.width / 2);
            polygonPoints.push(firstTopLine.a);
            polygonPoints.push(firstBottomLine.a);
            var oldLeftLine = firstTopLine;
            var oldRightLine = firstBottomLine;
            for (var i = 1; i < (_this.points.length / 2) - 1; i++) {
                var currentCenterLine = new Line2D(new Vec2(_this.points[2 * i], _this.points[2 * i + 1]), new Vec2(_this.points[2 * i + 2], _this.points[2 * i + 3]));
                var currentLeftLine = currentCenterLine.copy();
                var currentRightLine = currentCenterLine.copy();
                currentLeftLine.parallelTranslate(_this.width / 2);
                currentRightLine.parallelTranslate(-_this.width / 2);
                polygonPoints.push(oldLeftLine.intersect(currentLeftLine));
                polygonPoints.push(oldRightLine.intersect(currentRightLine));
                oldLeftLine = currentLeftLine;
                oldRightLine = currentRightLine;
            }
            polygonPoints.push(oldLeftLine.b);
            polygonPoints.push(oldRightLine.b);
            var pointsClockwiseFirstSegment = [];
            var pointsClockwiseSecondSegment = [];
            pointsClockwiseFirstSegment = polygonPoints.filter(function (value, index, array) {
                return index % 2 === 0;
            });
            pointsClockwiseSecondSegment = polygonPoints.filter(function (value, index, array) {
                return index % 2 !== 0;
            });
            console.log(pointsClockwiseSecondSegment[0]);
            pointsClockwiseSecondSegment = pointsClockwiseSecondSegment.reverse();
            console.log(pointsClockwiseSecondSegment[0]);
            var polygonPointsClockwise = [];
            for (var i = 0; i < pointsClockwiseFirstSegment.length; i++) {
                polygonPointsClockwise.push(pointsClockwiseFirstSegment[i]);
                console.log(pointsClockwiseFirstSegment[i]);
            }
            for (var i = 0; i < pointsClockwiseSecondSegment.length; i++) {
                polygonPointsClockwise.push(pointsClockwiseSecondSegment[i]);
                console.log(pointsClockwiseSecondSegment[i]);
            }
            console.log(polygonPointsClockwise.length);
            var polygonPointsArray = [];
            for (var i = 0; i < polygonPointsClockwise.length; i++) {
                polygonPointsArray.push(polygonPointsClockwise[i].x);
                polygonPointsArray.push(polygonPointsClockwise[i].y);
            }
            console.log(polygonPointsClockwise.length);
            _this.polygonNode = new Plexx.Polygon({ points: polygonPointsArray, colour: _this.colour });
            _this.add(_this.polygonNode);
            console.log("[PLEXX] " + _this.toString() + " created");
            return _this;
        }
        PolyLine.prototype.setColour = function (colour) {
            this.colourNode.setColour(colour);
        };
        PolyLine.prototype.toString = function () {
            var text = this.getName() + " { ";
            for (var property in this) {
                if (this.hasOwnProperty(property))
                    text += property + ":" + " " + this[property] + ";";
            }
            text += "}";
            return text;
        };
        return PolyLine;
    }(Plexx.Group));
    Plexx.PolyLine = PolyLine;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var InitNodeVisitor = (function () {
        function InitNodeVisitor(renderContext) {
            var _this = this;
            this.visitDrawingAreaNode = function (drawingArea) {
                var thisInitNodeVisitor = _this;
                drawingArea.getChildren().forEach(function (childNode) {
                    childNode.accept(thisInitNodeVisitor);
                });
            };
            this.renderContext = renderContext;
        }
        InitNodeVisitor.prototype.visitLeafNode = function (leafNode) {
        };
        InitNodeVisitor.prototype.visitCompositeNode = function (compositeNode) {
            var _this = this;
            compositeNode.getChildren().forEach(function (childNode) {
                childNode.accept(_this);
            });
        };
        InitNodeVisitor.prototype.visitGroupNode = function (groupNode) {
            var thisInitNodeVisitor = this;
            groupNode.getChildren().forEach(function (childNode) {
                childNode.accept(thisInitNodeVisitor);
            });
        };
        InitNodeVisitor.prototype.visitTransformationNode = function (transformationNode) {
            var _this = this;
            transformationNode.getChildren().forEach(function (childNode) {
                childNode.accept(_this);
            });
        };
        InitNodeVisitor.prototype.visitPrimitiveNode = function (primitiveNode) {
            primitiveNode.initWebGlShader(this.renderContext);
            primitiveNode.initWebGlBuffers(this.renderContext);
        };
        return InitNodeVisitor;
    }());
    Plexx.InitNodeVisitor = InitNodeVisitor;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var BoundingBox2d = (function () {
        function BoundingBox2d(min, max) {
            this.min = new Plexx.Mathlib.Vec2(min.x, min.y);
            this.max = new Plexx.Mathlib.Vec2(max.x, max.y);
        }
        BoundingBox2d.prototype.expandBy = function (bb) {
            if (bb.min.x < this.min.x)
                this.min.x = bb.min.x;
            if (bb.max.x > this.max.x)
                this.max.x = bb.max.x;
            if (bb.min.y < this.min.y)
                this.min.y = bb.min.y;
            if (bb.max.y > this.max.y)
                this.max.y = bb.max.y;
        };
        BoundingBox2d.prototype.contains = function (v) {
            if (this.min.x >= v.x && this.max.x <= v.x && this.min.y >= v.y && this.max.y <= v.y)
                return true;
            else
                return false;
        };
        BoundingBox2d.prototype.getMin = function () {
            return this.min;
        };
        BoundingBox2d.prototype.getMax = function () {
            return this.max;
        };
        BoundingBox2d.prototype.transform = function (m) {
            var minXminY = new Plexx.Mathlib.Vec3(this.min.x, this.min.y, 1);
            var minXmaxY = new Plexx.Mathlib.Vec3(this.min.x, this.max.y, 1);
            var maxXmaxY = new Plexx.Mathlib.Vec3(this.max.y, this.max.y, 1);
            var maxXminY = new Plexx.Mathlib.Vec3(this.max.y, this.min.y, 1);
            var a = m.multiplyVec3(minXminY);
            var b = m.multiplyVec3(minXmaxY);
            var c = m.multiplyVec3(maxXmaxY);
            var d = m.multiplyVec3(maxXminY);
            var vArray = [];
            vArray.push(new Plexx.Mathlib.Vec2(a.x, a.x));
            vArray.push(new Plexx.Mathlib.Vec2(b.x, b.x));
            vArray.push(new Plexx.Mathlib.Vec2(c.x, c.x));
            vArray.push(new Plexx.Mathlib.Vec2(d.x, d.x));
            var sortedByX = Plexx.Mathlib.sortArrayOfPoint2DByX(vArray);
            var sortedByY = Plexx.Mathlib.sortArrayOfPoint2DByY(vArray);
            var newMin = new Plexx.Mathlib.Vec2(sortedByX[0].x, sortedByY[0].y);
            var newMax = new Plexx.Mathlib.Vec2(sortedByX[sortedByX.length - 1].x, sortedByY[sortedByY.length - 1].y);
            return new BoundingBox2d(newMin, newMax);
        };
        BoundingBox2d.prototype.translate = function (d) {
            this.min.x += d.x;
            this.min.y += d.y;
            this.max.x += d.x;
            this.max.y += d.y;
        };
        return BoundingBox2d;
    }());
    Plexx.BoundingBox2d = BoundingBox2d;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var PlexxEvent = (function () {
        function PlexxEvent(type, position) {
            this.type = type;
            this.position = position;
        }
        return PlexxEvent;
    }());
    Plexx.PlexxEvent = PlexxEvent;
})(Plexx || (Plexx = {}));
var Plexx;
(function (Plexx) {
    var Points = (function (_super) {
        __extends(Points, _super);
        function Points(values) {
            var _this = _super.call(this, { name: "Points" }) || this;
            _this.type = values.type || Constants.POINTS_DEFAULT_TYPE_ID;
            _this.size = values.size || Constants.POINTS_DEFAULT_SIZE;
            _this.colour = values.colour;
            _this.colourNode = new Plexx.Colour(_this.colour);
            _this.points = values.points;
            _this.borderSize = values.borderSize || Plexx.Points.defaultBorderSize;
            if (_this.type == Constants.PointsType.HollowDiamond) {
                for (var i = 0; i < _this.points.length / 2; i++) {
                    _this.add(new Plexx.Rectangle({
                        width: _this.size,
                        height: _this.size,
                        position: [_this.points[2 * i] - _this.size / 2, _this.points[2 * i + 1] - _this.size / 2],
                        colour: "#00000000",
                        borderColour: _this.colour,
                        borderWidth: 5,
                        rotation: 45.0,
                        rotationPoint: [_this.points[2 * i], _this.points[2 * i + 1]]
                    }));
                }
            }
            else if (_this.type == Constants.PointsType.HollowCircle) {
                for (var i = 0; i < _this.points.length / 2; i++) {
                    console.log(i);
                    _this.add(new Plexx.Circle({
                        radius: _this.size / 2,
                        colour: "#00000000",
                        borderColour: _this.colour,
                        borderWidth: 5,
                        position: [_this.points[2 * i], _this.points[2 * i + 1]]
                    }));
                }
            }
            return _this;
        }
        Points.prototype.setColour = function (colour) {
            this.colour = colour;
            this.colourNode = new Plexx.Colour(this.colour);
        };
        return Points;
    }(Plexx.Group));
    Points.defaultBorderSize = 5;
    Plexx.Points = Points;
})(Plexx || (Plexx = {}));
//# sourceMappingURL=plexx.js.map