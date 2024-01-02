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
   ViewContainerRef
} from "@angular/core";

import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,
          CanvasWhiteboardUpdate, CanvasWhiteboardOptions , CircleShape, CanvasWhiteboardShape,
          RectangleShape, FreeHandShape, SmileyShape, LineShape, StarShape, INewCanvasWhiteboardShape} from '../../../models/whiteboard/whiteboard'

import {Observable} from "rxjs/index";
import {CanvasWhiteboardService} from '../../../services/canvas-whiteboard.service'
import {CanvasWhiteboardShapeService} from '../../../services/canvas-whiteboard-shape.service'

import { ColorPickerService, Cmyk } from 'ngx-color-picker';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }


}
