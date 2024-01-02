export class CanvasWhiteboardPoint {
    x: number;
    y: number;
    t: number; //timeStamp when we draw the point
    constructor(x: number, y: number, t?:number) {
        this.x = x;
        this.y = y;
        this.t = typeof t == "undefined" ?  new Date().getTime() : t
    }
}

export class CanvasStroke {
    stroke:CanvasWhiteboardPoint[];

    constructor(linePositions?: CanvasWhiteboardPoint[]){

        this.stroke = typeof linePositions == "undefined" || !linePositions ? [] : [...linePositions];
    }

}

export enum CanvasWhiteboardUpdateType {
    START = 0,
    DRAG = 1,
    STOP = 2
}


export class CanvasWhiteboardShapeOptions {
    shouldFillShape?: boolean;
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    lineJoin?: string;
    lineCap?: string;

    constructor(shouldFillShape?:boolean, fillStyle?:string, strokeStyle?:string) {
        this.shouldFillShape = typeof shouldFillShape == "undefined" ? false : shouldFillShape;
        this.fillStyle = typeof fillStyle == "undefined" ?  null : fillStyle;
        this.strokeStyle = typeof strokeStyle == "undefined" ? "rgba(0,0,0,1)" : strokeStyle;
        this.lineWidth = 2;
        this.lineJoin = "round";
        this.lineCap = "round";
    }
}

export class CanvasWhiteboardUpdate {
    x: number;
    y: number;
    type: CanvasWhiteboardUpdateType;
    UUID: string;

    selectedShape: string;
    selectedShapeOptions: CanvasWhiteboardShapeOptions;

    static deserializeJson(json: any): CanvasWhiteboardUpdate {
        let parsedJson;
        try {
            parsedJson = JSON.parse(json);
            return new CanvasWhiteboardUpdate(
                parsedJson['x'],
                parsedJson['y'],
                parsedJson['type'],
                parsedJson['uuid'],
                parsedJson['selectedShape'],
                parsedJson['selectedShapeOptions']);
        } catch (e) {
            console.error("The canvas whiteboard update is not p1" +
                "arseable");
            return null;
        }
    }

    constructor(x?: number,
                y?: number,
                type?: CanvasWhiteboardUpdateType,
                UUID?: string,
                selectedShape?: string,
                selectedShapeOptions?: CanvasWhiteboardShapeOptions) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.UUID = UUID;
        this.selectedShape = selectedShape;
        this.selectedShapeOptions = selectedShapeOptions;
    }

    stringify(): string {
        let objectToSerialize = {
            x: this.x.toFixed(3),
            y: this.y.toFixed(3),
            type: this.type,
            uuid: this.UUID,
            selectedShape: this.selectedShape
        };

        if (this.selectedShapeOptions) {
            objectToSerialize["selectedShapeOptions"] = this.selectedShapeOptions;
        }

        return JSON.stringify(objectToSerialize);
    }
}


export abstract class CanvasWhiteboardShape {
    isVisible: boolean;
    protected positionPoint: CanvasWhiteboardPoint;
    protected options: CanvasWhiteboardShapeOptions;
    linePositions: CanvasWhiteboardPoint[]; //FOR AI PURPOSE

    constructor(positionPoint?: CanvasWhiteboardPoint, options?: CanvasWhiteboardShapeOptions) {
        this.positionPoint = positionPoint || new CanvasWhiteboardPoint(0, 0);
        this.options = options || new CanvasWhiteboardShapeOptions();
        this.isVisible = true;
    }

    abstract getShapeName(): string;

    abstract onUpdateReceived(update: CanvasWhiteboardUpdate);

    // noinspection TsLint
    onStopReceived(update: CanvasWhiteboardUpdate) {
    }

    abstract draw(context: CanvasRenderingContext2D);

    abstract drawPreview(context: CanvasRenderingContext2D);
}


export interface CanvasWhiteboardOptions {
    batchUpdateTimeoutDuration?: number;
    imageUrl?: string;
    aspectRatio?: number;
    strokeColor?: string;
    lineWidth?: number;
    drawButtonEnabled?: boolean;
    drawButtonClass?: string;
    drawButtonText?: string;
    clearButtonEnabled?: boolean;
    clearButtonClass?: string;
    clearButtonText?: string;
    undoButtonEnabled?: boolean;
    undoButtonClass?: string;
    undoButtonText?: string;
    redoButtonEnabled?: boolean;
    redoButtonClass?: string;
    redoButtonText?: string;
    saveDataButtonEnabled?: boolean;
    saveDataButtonClass?: string;
    saveDataButtonText?: string;

    profilButtonClass?:string;
    profilButtonEnabled?: boolean;
    profilButtonText?: string;

    cameraButtonClass?:string;
    cameraButtonEnabled?: boolean;
    cameraButtonText?:string;

    inviteFriendsButtonClass?:string;
    inviteFriendsButtonEnabled?: boolean;
    inviteFriendsButtonText?:string;

    colorPickerEnabled?: boolean;
    shouldDownloadDrawing?: boolean;
    startingColor?: string;
    scaleFactor?: number;
    drawingEnabled?: boolean;
    showStrokeColorPicker?: boolean;
    showFillColorPicker?: boolean;
    downloadedFileName?: string;
    lineJoin?: string;
    lineCap?: string;
    shapeSelectorEnabled?: boolean;
    showShapeSelector?: boolean;
    fillColor?: string;
}
//-------------------------------- SHAPE -------------------------------------/
export class CircleShape extends CanvasWhiteboardShape {
    radius: number;

    constructor(positionPoint?: CanvasWhiteboardPoint, options?: CanvasWhiteboardShapeOptions, radius?: number) {
        super(positionPoint, options);
        this.radius = radius || 0;
    }

    getShapeName(): string {
        return 'CircleShape';
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.positionPoint.x, this.positionPoint.y, this.radius, 0, Math.PI * 2, false);

        Object.assign(context, this.options);

        context.stroke();
        if (this.options.shouldFillShape) {
            context.fill();
        }

        context.closePath();
    }

    drawPreview(context: CanvasRenderingContext2D) {
        this.positionPoint = new CanvasWhiteboardPoint(context.canvas.width / 2, context.canvas.height / 2);
        this.radius = this.calculateRadius(context.canvas.width - 2, context.canvas.height / 2);
        this.draw(context);
    }

    onUpdateReceived(update: CanvasWhiteboardUpdate) {
        this.radius = this.calculateRadius(update.x, update.y);
    }

    calculateRadius(x: number, y: number): number {
        return Math.sqrt(Math.pow(x - this.positionPoint.x, 2) + Math.pow(y - this.positionPoint.y, 2));
    }
}


export class RectangleShape extends CanvasWhiteboardShape {
    width: number;
    height: number;

    constructor(positionPoint?: CanvasWhiteboardPoint,
                options?: CanvasWhiteboardShapeOptions,
                width?: number,
                height?: number) {
        super(positionPoint, options);
        this.width = width || 0;
        this.height = height || 0;
    }

    getShapeName(): string {
        return 'RectangleShape';
    }

    draw(context: CanvasRenderingContext2D) {
        if (!this.width || !this.height) {
            return;
        }
        context.beginPath();

        Object.assign(context, this.options);

        context.rect(this.positionPoint.x, this.positionPoint.y, this.width, this.height);

        context.stroke();
        if (this.options.shouldFillShape) {
            context.fill();
        }

        context.closePath();
    }

    drawPreview(context: CanvasRenderingContext2D) {
        this.positionPoint = new CanvasWhiteboardPoint(2, 2);
        this.width = context.canvas.width - 4;
        this.height = context.canvas.height - 4;
        this.draw(context);
    }

    onUpdateReceived(update: CanvasWhiteboardUpdate) {
        this.width = update.x - this.positionPoint.x;
        this.height = update.y - this.positionPoint.y;
    }
}


export class FreeHandShape extends CanvasWhiteboardShape {
    //linePositions: CanvasWhiteboardPoint[];

    constructor(positionPoint?: CanvasWhiteboardPoint, options?: CanvasWhiteboardShapeOptions) {
        super(positionPoint, options);
        this.linePositions = [];
    }

    getShapeName(): string {
        return 'FreeHandShape';
    }

    draw(context: CanvasRenderingContext2D) {
        Object.assign(context, this.options);

        context.beginPath();
        context.moveTo(this.positionPoint.x, this.positionPoint.y);
        // Draw a dot
        context.lineTo(this.positionPoint.x + 1, this.positionPoint.y + 1);

        // Normal fastest free hand drawing
        // this.linePositions.forEach((linePosition) => {
        //     context.lineTo(linePosition.x, linePosition.y);
        // });

        // Quadratic curves drawing
        let i = 0;
        while (i < this.linePositions.length) {
            if (this.linePositions.length - i > 2) {
                let controlPoint1 = this.linePositions[i];
                let controlPoint2 = this.linePositions[i + 1];
                let endPoint = this.linePositions[i + 2];
                context.bezierCurveTo(controlPoint1.x,
                    controlPoint1.y,
                    controlPoint2.x,
                    controlPoint2.y,
                    endPoint.x,
                    endPoint.y);
                i += 2;
            } else {
                let linePosition = this.linePositions[i];
                context.lineTo(linePosition.x, linePosition.y);
                i += 1;
            }
        }

        context.stroke();
    }

    drawPreview(context: CanvasRenderingContext2D) {
        this.positionPoint = new CanvasWhiteboardPoint(2, 2);
        this.linePositions = [
            new CanvasWhiteboardPoint(context.canvas.width - 5, context.canvas.height * 0.3),
            //new CanvasWhiteboardPoint(context.canvas.width * 0.4, context.canvas.height * 0.6),
            new CanvasWhiteboardPoint(context.canvas.width * 0.2, context.canvas.height * 0.4),
            new CanvasWhiteboardPoint(context.canvas.width * 0.6, context.canvas.height * 0.8),
            new CanvasWhiteboardPoint(context.canvas.width, context.canvas.height)
        ];

        this.draw(context);
    }

    onUpdateReceived(update: CanvasWhiteboardUpdate) {
        this.linePositions.push(new CanvasWhiteboardPoint(update.x, update.y));
    }
}

export class SmileyShape extends CanvasWhiteboardShape {
    radius: number;

    constructor(positionPoint?: CanvasWhiteboardPoint, options?: CanvasWhiteboardShapeOptions, radius?: number) {
        super(positionPoint, options);
        this.options.shouldFillShape = false;
        this.options.fillStyle = this.options.fillStyle || "white";

        this.radius = radius || 0;
    }

    getShapeName(): string {
        return 'SmileyShape';
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath();

        Object.assign(context, this.options);

        context.arc(this.positionPoint.x, this.positionPoint.y, this.radius, 0, Math.PI * 2, false);
        context.fill();
        context.stroke();

        context.beginPath();
        let leftEyeX = this.positionPoint.x - this.radius * 0.3;
        let rightEyeX = this.positionPoint.x + this.radius * 0.3;
        const eyesY = this.positionPoint.y - this.radius * 0.2;
        const eyeSize = this.radius * 0.1;

        context.arc(leftEyeX, eyesY, eyeSize, 0, 2 * Math.PI, false);
        context.arc(rightEyeX, eyesY, eyeSize, 0, 2 * Math.PI, false);
        context.fillStyle = this.options.strokeStyle;
        context.fill();

        // draw the mouth
        context.beginPath();
        context.arc(this.positionPoint.x, this.positionPoint.y, this.radius * 0.7, 0, Math.PI, false);
        context.stroke();

        context.closePath();
    }

    drawPreview(context: CanvasRenderingContext2D) {
        this.positionPoint = new CanvasWhiteboardPoint(context.canvas.width / 2, context.canvas.height / 2);
        this.radius = this.calculateRadius(context.canvas.width - 2, context.canvas.height / 2);
        this.draw(context);
    }

    onUpdateReceived(update: CanvasWhiteboardUpdate) {
        this.radius = this.calculateRadius(update.x, update.y);
    }

    calculateRadius(x: number, y: number): number {
        return Math.sqrt(Math.pow(x - this.positionPoint.x, 2) + Math.pow(y - this.positionPoint.y, 2));
    }
}


export class LineShape extends CanvasWhiteboardShape {
    endPosition: CanvasWhiteboardPoint;

    constructor(positionPoint?: CanvasWhiteboardPoint,
                options?: CanvasWhiteboardShapeOptions,
                endPosition?: CanvasWhiteboardPoint) {
        super(positionPoint, options);
        this.endPosition = endPosition || new CanvasWhiteboardPoint(this.positionPoint.x, this.positionPoint.y);
    }

    getShapeName(): string {
        return 'LineShape';
    }

    draw(context: CanvasRenderingContext2D) {
        if (!this.endPosition) {
            return;
        }
        context.beginPath();
        Object.assign(context, this.options);

        context.moveTo(this.positionPoint.x, this.positionPoint.y);
        context.lineTo(this.endPosition.x, this.endPosition.y);

        context.closePath();
        context.stroke();
    }

    drawPreview(context: CanvasRenderingContext2D) {
        this.positionPoint = new CanvasWhiteboardPoint(0, 0);
        this.endPosition = new CanvasWhiteboardPoint(context.canvas.width, context.canvas.height);
        this.draw(context);
    }

    onUpdateReceived(update: CanvasWhiteboardUpdate) {
        this.endPosition = new CanvasWhiteboardPoint(update.x, update.y);
    }
}


export class StarShape extends CanvasWhiteboardShape {
    radius: number;
    spikes: number;

    constructor(positionPoint?: CanvasWhiteboardPoint,
                options?: CanvasWhiteboardShapeOptions,
                radius?: number,
                spikes?: number) {
        super(positionPoint, options);
        this.radius = radius || 0;
        this.spikes = spikes || 5;
    }

    getShapeName(): string {
        return 'StarShape';
    }

    draw(context: CanvasRenderingContext2D) {
        Object.assign(context, this.options);

        let rotation = Math.PI / 2 * 3;
        let spikeX = this.positionPoint.x;
        let spikeY = this.positionPoint.y;
        let step = Math.PI / this.spikes;

        context.beginPath();
        context.moveTo(this.positionPoint.x, this.positionPoint.y - this.radius);

        for (let i = 0; i < this.spikes; i++) {
            spikeX = this.positionPoint.x + Math.cos(rotation) * this.radius;
            spikeY = this.positionPoint.y + Math.sin(rotation) * this.radius;
            context.lineTo(spikeX, spikeY);
            rotation += step;

            spikeX = this.positionPoint.x + Math.cos(rotation) * (this.radius * 0.4);
            spikeY = this.positionPoint.y + Math.sin(rotation) * (this.radius * 0.4);
            context.lineTo(spikeX, spikeY);
            rotation += step;
            context.stroke();
        }

        context.lineTo(this.positionPoint.x, this.positionPoint.y - this.radius);
        context.closePath();

        context.stroke();

        if (this.options.shouldFillShape) {
            context.fill();
        }
    }

    drawPreview(context: CanvasRenderingContext2D) {
        this.positionPoint = new CanvasWhiteboardPoint(context.canvas.width / 2, context.canvas.height / 2);
        this.radius = this.calculateRadius(context.canvas.width - 2, context.canvas.height / 2);
        this.draw(context);
    }

    onUpdateReceived(update: CanvasWhiteboardUpdate) {
        this.radius = this.calculateRadius(update.x, update.y);
    }

    calculateRadius(x: number, y: number): number {
        return Math.sqrt(Math.pow(x - this.positionPoint.x, 2) + Math.pow(y - this.positionPoint.y, 2));
    }
}
//-------------------------------- INTERFACE ---------------------------------/
export interface INewCanvasWhiteboardShape<T extends CanvasWhiteboardShape> {
    new(positionPoint?: CanvasWhiteboardPoint, options?: CanvasWhiteboardShapeOptions, ...args: any[]): T;
}
