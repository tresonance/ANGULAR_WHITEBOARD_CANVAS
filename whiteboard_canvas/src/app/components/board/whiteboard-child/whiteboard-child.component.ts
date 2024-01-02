import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    OnInit,
    OnChanges, OnDestroy, AfterViewInit, NgZone, ChangeDetectorRef, ViewEncapsulation
} from '@angular/core';

import {CanvasWhiteboardComponent, CanvasWhiteboardOptions} from 'ng2-canvas-whiteboard';

import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,
          CanvasWhiteboardUpdate, /*CanvasWhiteboardOptions , */CircleShape, CanvasWhiteboardShape,
          RectangleShape, FreeHandShape, SmileyShape, LineShape, StarShape, INewCanvasWhiteboardShape} from '../../../models/whiteboard/whiteboard'

import { CanvasWhiteboardService } from '../../../services/canvas-whiteboard.service'

@Component({
  selector: 'app-whiteboard-child',
  viewProviders: [CanvasWhiteboardComponent],
  templateUrl: './whiteboard-child.component.html',
  styleUrls: ['./whiteboard-child.component.scss'],
  //encapsulation: ViewEncapsulation.None
})
export class WhiteboardChildComponent implements OnInit {

  @Input() drawButtonClass : string;
  @Input() drawButtonText: string;
  @Input() clearButtonClass: string;
  @Input() clearButtonText: string;
  @Input() undoButtonText : string;
  @Input() undoButtonEnabled : string;
  @Input() redoButtonText: string;
  @Input() redoButtonEnabled: boolean;
  @Input() colorPickerEnabled: boolean;
  @Input() saveDataButtonEnabled: boolean;
  @Input() saveDataButtonText: string;
  @Input() lineWidth: number;
  @Input() strokeColor: string;
  @Input() shouldDownloadDrawing: boolean;

  canvasWhiteboardUpdate:CanvasWhiteboardUpdate[] = [];

  _clientDragging:boolean = false;
  private _undoStack: string[] = []; // Stores the value of start and count for each continuous stroke
  private _redoStack: string[] = [];
  private _lastUUID: string;
  private _batchUpdates: CanvasWhiteboardUpdate[] = [];
  selectedShapeConstructor: INewCanvasWhiteboardShape<CanvasWhiteboardShape>;

  @ViewChild('canvasWhiteboard', {static: false}) canvasWhiteboard: CanvasWhiteboardComponent;
  context: CanvasRenderingContext2D;

  @Output() onClear = new EventEmitter<any>();
  @Output() onBatchUpdate = new EventEmitter<CanvasWhiteboardUpdate[]>();
  @Output() onImageLoaded = new EventEmitter<any>();
  @Output() onUndo = new EventEmitter<any>();
  @Output() onRedo = new EventEmitter<any>();
  @Output() onSave = new EventEmitter<string | Blob>();
  @Output() onColorSelected = new EventEmitter<string>();

  constructor(private _canvasService: CanvasWhiteboardService) { }

  ngOnInit() {
  }

  //---------------------------------------------------------------------------
  //     onClear
  //---------------------------------------------------------------------------
      onCanvasClear($event){
          //this._canvasService.clearCanvas($event);
          this.onClear.emit(true);
      }
  //---------------------------------------------------------------------------
  //     onBatchUpdate
  //---------------------------------------------------------------------------
      sendBatchUpdate($event){
            this.onBatchUpdate.emit($event);
      }

  //---------------------------------------------------------------------------
  //     onImageLoaded
  //---------------------------------------------------------------------------
      onImageLoad($event){
        //TODO
      }
  //---------------------------------------------------------------------------
  //     onUndo
  //---------------------------------------------------------------------------
      onCanvasUndo($event){
          this.onUndo.emit("onUndo from child")
      }
  //---------------------------------------------------------------------------
  //     onRedo
  //---------------------------------------------------------------------------
      onCanvasRedo($event){
          this.onRedo.emit("onRedo from child")
      }
  //---------------------------------------------------------------------------
  //     onSave
  //---------------------------------------------------------------------------
      onCanvasSave($event){
          this.onSave.emit("onsave from child")
      }

    //----------------------- END ------------------------------------------------/
}
