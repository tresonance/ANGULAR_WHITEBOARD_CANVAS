import {
    Component,
    ElementRef,
    Input,
    ViewChild,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    OnInit,
  EventEmitter,
   Output,
   QueryList,
   ViewChildren,
   OnDestroy,
   Renderer,
   ChangeDetectorRef,
   ChangeDetectionStrategy
} from "@angular/core";

import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,
          CanvasWhiteboardUpdate, CanvasWhiteboardOptions , CircleShape, CanvasWhiteboardShape,
          RectangleShape, FreeHandShape, SmileyShape, LineShape, StarShape, INewCanvasWhiteboardShape} from '../../../models/whiteboard/whiteboard'

import {Observable} from "rxjs/index";
import {CanvasWhiteboardService} from '../../../services/canvas-whiteboard.service'
import {CanvasWhiteboardShapeService} from '../../../services/canvas-whiteboard-shape.service'



@Component({
  selector: 'app-canvas-selection-shape',
  host: {
        '(document:mousedown)': 'closeOnExternalClick($event)',
        '(document:touchstart)': 'closeOnExternalClick($event)',
    },
  templateUrl: './canvas-selection-shape.component.html',
  styleUrls: ['./canvas-selection-shape.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CanvasSelectionShapeComponent implements OnInit, OnChanges {

  @ViewChildren('canvasArray') canvasArray : QueryList<ElementRef>;
  //@ViewChild('shapesContainer') shapesContainer: ElementRef;
  //private contextShapesContainer: CanvasRenderingContext2D;

  contextArray : CanvasRenderingContext2D[] = [];
  @Input() shapeOptions: CanvasWhiteboardShapeOptions;
  //@ViewChild('allcanvas') canvas : ElementRef;
  showShapeSelector: boolean= true;
  registeredShapes : Observable<Array<INewCanvasWhiteboardShape<CanvasWhiteboardShape>>>;

  //RECTANGLE
  RectangleDefaultWidth:number=25;
  RectangleDefaultHeight: number = 15;

  //CERCLE
  CercleRadius:number = 15;

  @Output() selectedShape:EventEmitter<any> = new EventEmitter<INewCanvasWhiteboardShape<CanvasWhiteboardShape>>();
  @Output() clickOutside:EventEmitter<any> = new EventEmitter<boolean>()
  //@Input()mustOpenPupUp:boolean;

  //@Input() fillColor_:string;
  //@Input() strokeColor_:string;

  //openPopUp:boolean = false;

  constructor(private _canvasWhiteboardShapeService: CanvasWhiteboardShapeService,
    private renderer: Renderer, private _elementRef: ElementRef, private _changeDetector: ChangeDetectorRef) {
        this.registeredShapes = this._canvasWhiteboardShapeService.registeredShapes$;
   }


   ngOnChanges(changes: SimpleChanges) {
     console.log()
       if(changes.shapeOptions && changes.shapeOptions.currentValue){
           this.draw_All_popUp_Shapes()
       }
   }

  ngOnInit() {

  }

  ngAfterViewInit() {
      this.draw_All_popUp_Shapes();
      //this._changeDetector.detectChanges();
  }

  draw_All_popUp_Shapes(){

   if (!this.canvasArray) { console.log("canvas Array is null"); return; }

   let RectangleDefaultWidth = this.RectangleDefaultWidth;
   let RectangleDefaultHeight = this.RectangleDefaultHeight;
   let CercleRadius = this.CercleRadius;

    //this.initSelectionCanvaContextArray();

    let options = this.shapeOptions;
    let contextArray = [];

    this.canvasArray.forEach((canvas:ElementRef) => {
          contextArray.push(canvas.nativeElement.getContext("2d"));
    })


    this.registeredShapes.subscribe(function(shapes){   //}){

        shapes.forEach(function(shape, i) {  //})

       if(shape.name == "FreeHandShape"){

            (new FreeHandShape(new CanvasWhiteboardPoint(0, 0),
            Object.assign(new CanvasWhiteboardShapeOptions(), options))).drawPreview(contextArray[i])
          }

          if(shape.name == "RectangleShape"){

            (new  RectangleShape(new CanvasWhiteboardPoint(0, 0),
              Object.assign(new CanvasWhiteboardShapeOptions(), options),
                RectangleDefaultWidth, RectangleDefaultHeight)).drawPreview(contextArray[i])
            }

            if(shape.name == "CircleShape"){
              (new  CircleShape(new CanvasWhiteboardPoint(0, 0),
                  Object.assign(new CanvasWhiteboardShapeOptions(), options), CercleRadius)).drawPreview(contextArray[i])
            }

            if(shape.name == "LineShape"){
              (new  LineShape(new CanvasWhiteboardPoint(0, 0),
                  Object.assign(new CanvasWhiteboardShapeOptions(), options))).drawPreview(contextArray[i])
            }

            if(shape.name == "StarShape"){
              (new  StarShape(new CanvasWhiteboardPoint(0, 0),
                  Object.assign(new CanvasWhiteboardShapeOptions(), options))).drawPreview(contextArray[i])
            }

            if(shape.name == "SmileyShape"){
              (new  SmileyShape(new CanvasWhiteboardPoint(0, 0),
                  Object.assign(new CanvasWhiteboardShapeOptions(), options))).drawPreview(contextArray[i])
            }
      })})

  }


  //---------------------------------------------
  //  CAPTURE EVENTS
  //----------------------------------------------
  selectShape(shape){
      if(shape){
          this.selectedShape.emit(shape);
          this.clickOutside.emit(false);//we don't click outside
      }
  }

  closeOnExternalClick(event) {

        if (!this._elementRef.nativeElement.contains(event.target)) {
            this.clickOutside.emit(true);
        }
  }


}
