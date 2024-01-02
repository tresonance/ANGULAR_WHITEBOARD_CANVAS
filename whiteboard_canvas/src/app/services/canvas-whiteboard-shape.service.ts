import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs/index";


import {CanvasWhiteboardPoint, CanvasWhiteboardShapeOptions, CircleShape, RectangleShape,FreeHandShape,
          CanvasWhiteboardUpdate, CanvasWhiteboardShape, CanvasWhiteboardUpdateType,
          SmileyShape, LineShape, StarShape} from '../models/whiteboard/whiteboard'

  export interface INewCanvasWhiteboardShape<T extends CanvasWhiteboardShape> {
              new(positionPoint?: CanvasWhiteboardPoint, options?: CanvasWhiteboardShapeOptions, ...args: any[]): T;
  }

@Injectable()
export class CanvasWhiteboardShapeService {
    private _registeredShapesSubject: BehaviorSubject<Array<INewCanvasWhiteboardShape<CanvasWhiteboardShape>>>;
    public registeredShapes$: Observable<Array<INewCanvasWhiteboardShape<CanvasWhiteboardShape>>>;

    constructor() {
        this._registeredShapesSubject = new BehaviorSubject([
            FreeHandShape,
            LineShape,
            RectangleShape,
            CircleShape,
            StarShape,
            SmileyShape
        ]);
        this.registeredShapes$ = this._registeredShapesSubject.asObservable();
    }

    getShapeConstructorFromShapeName(shapeName: string): INewCanvasWhiteboardShape<CanvasWhiteboardShape> {
        return this.getCurrentRegisteredShapes().find((shape) =>
            (new shape).getShapeName() === shapeName);
    }

    getCurrentRegisteredShapes(): Array<INewCanvasWhiteboardShape<CanvasWhiteboardShape>> {
        return this._registeredShapesSubject.getValue();
    }

    isRegisteredShape(shape: INewCanvasWhiteboardShape<CanvasWhiteboardShape>) {
        return this.getCurrentRegisteredShapes().indexOf(shape) !== -1;
    }

    registerShape(shape: INewCanvasWhiteboardShape<CanvasWhiteboardShape>) {
        if (this.isRegisteredShape(shape)) {
            console.warn(`You tried to register a shape:${shape}, but is has already been registered.`);
            return;
        }

        let registeredShapes = this.getCurrentRegisteredShapes();
        registeredShapes.push(shape);
        this._registeredShapesSubject.next(registeredShapes);
    }

    registerShapes(shapes: Array<INewCanvasWhiteboardShape<CanvasWhiteboardShape>>) {
        this._registeredShapesSubject.next(
            this.getCurrentRegisteredShapes()
                .concat(
                    shapes.filter((shape) => {
                        if (this.isRegisteredShape(shape)) {
                            console.warn(`You tried to register a shape:${shape}, but is has already been registered.`);
                            return false;
                        }

                        return true;
                    })
                )
        );
    }

    unregisterShape(shape: INewCanvasWhiteboardShape<CanvasWhiteboardShape>) {
        this._registeredShapesSubject.next(
            this.getCurrentRegisteredShapes().filter((registeredShape) => registeredShape !== shape)
        );
    }

    unregisterShapes(shapes: Array<INewCanvasWhiteboardShape<CanvasWhiteboardShape>>) {
        this._registeredShapesSubject.next(
            this.getCurrentRegisteredShapes().filter((shape) => shapes.indexOf(shape) === -1)
        );
    }
}
