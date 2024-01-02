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
    ViewContainerRef
} from "@angular/core";

//import { ColorPickerService, Cmyk } from 'ngx-color-picker';

import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,
          CanvasWhiteboardUpdate, CanvasWhiteboardOptions , CircleShape, CanvasWhiteboardShape,
          RectangleShape, FreeHandShape, SmileyShape, LineShape, StarShape, INewCanvasWhiteboardShape} from '../../../models/whiteboard/whiteboard'

import {CanvasWhiteboardService} from '../../../services/canvas-whiteboard.service'
import {CanvasWhiteboardShapeService} from '../../../services/canvas-whiteboard-shape.service'


@Component({
  selector: 'app-fill-color-picker',
  host: {
        '(document:mousedown)': 'closeOnExternalClick($event)',
        '(document:touchstart)': 'closeOnExternalClick($event)',
    },
  templateUrl: './fill-color-picker.component.html',
  styleUrls: ['./fill-color-picker.component.scss']
})

export class FillColorPickerComponent implements OnInit, AfterViewInit {

  //@Output() selectedFillColor = new EventEmitter<any>();

  //@Input() previewText: string;
  //@Input() readonly selectedColor: string = 'rgba(0,0,0,1)';
  @ViewChild('canvaswhiteboardcolorpicker', {static: false}) canvas: ElementRef;

  private _context: CanvasRenderingContext2D;

  //@Output() onToggleColorPicker = new EventEmitter<boolean>();
  @Output() onColorSelected = new EventEmitter<string>();
  @Output() clickOutsideFillColorPicker = new EventEmitter<boolean>();
  //@Output() onSecondaryColorSelected = new EventEmitter<string>();


  constructor(private _elementRef: ElementRef) {}

  /**
     * Initialize the canvas drawing context. If we have an aspect ratio set up, the canvas will resize
     * according to the aspect ratio.
     */
     ngAfterViewInit(){
       this._context = this.canvas.nativeElement.getContext("2d");
       this.createColorPalette();
     }

    ngOnInit() {
        //this._context = this.canvas.nativeElement.getContext("2d");
        //this.createColorPalette();
    }

    createColorPalette() {
        let gradient = this._context.createLinearGradient(0, 0, this._context.canvas.width, 0);
        gradient.addColorStop(0, "rgb(255, 0, 0)");
        gradient.addColorStop(0.15, "rgb(255, 0, 255)");
        gradient.addColorStop(0.33, "rgb(0, 0, 255)");
        gradient.addColorStop(0.49, "rgb(0, 255, 255)");
        gradient.addColorStop(0.67, "rgb(0, 255, 0)");
        gradient.addColorStop(0.84, "rgb(255, 255, 0)");
        gradient.addColorStop(1, "rgb(255, 0, 0)");
        this._context.fillStyle = gradient;
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);

        gradient = this._context.createLinearGradient(0, 0, 0, this._context.canvas.height);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
        this._context.fillStyle = gradient;
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    }

    closeOnExternalClick(event) {
        if (!this._elementRef.nativeElement.contains(event.target)) {
            this.clickOutsideFillColorPicker.emit(true);
        }
    }

    /*toggleColorPicker(event: Event) {
        if (event) {
            event.preventDefault();
        }

        this.onToggleColorPicker.emit(!this.showColorPicker);
    }*/

    determineColorFromCanvas(event: any) {
        let canvasRect = this._context.canvas.getBoundingClientRect();
        let imageData = this._context.getImageData(event.clientX - canvasRect.left, event.clientY - canvasRect.top, 1, 1);

        return `rgba(${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}, ${imageData.data[3]})`;
    }

    selectColor(color: string) {
        this.onColorSelected.emit(color);
        this.clickOutsideFillColorPicker.emit(false); //we don't click outside
        //this.toggleColorPicker(null);
    }

}
