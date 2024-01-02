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
   OnDestroy,  NgZone, ChangeDetectorRef, DoCheck
} from "@angular/core";

import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,CanvasStroke,
          CanvasWhiteboardUpdate, CanvasWhiteboardOptions , CircleShape, CanvasWhiteboardShape,
          RectangleShape, FreeHandShape, SmileyShape, LineShape, StarShape, INewCanvasWhiteboardShape} from '../../../models/whiteboard/whiteboard'

import { ChatRoom, PublicChatMessage, ChatUser, MessageType, Theme, ParticipantType, ParticipantStatus, FirebaseUser,UserMetadata,FileUpload,
                    PrivateChatGroup,PrivateChatLocalization, DemoAdapter, DemoAdapterPagedHistory, IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,
                  ChatAdapter,  PrivateChatMessage, ParticipantResponse, DefaultFileUploadAdapter, ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../../../models/chat/chat';

import {AuthService} from '../../../services/auth.service';
import {PrivateChatService} from '../../../services/private-chat.service';


import { ChatService } from '../../../services/chat.service';
import { UploadFileService } from '../../../services/upload-file.service'
import { NotifyService } from '../../../services/notify.service';
import { PersistanceService } from '../../../services/persistance.service';

import {CanvasWhiteboardService} from '../../../services/canvas-whiteboard.service'
import {CanvasWhiteboardShapeService} from '../../../services/canvas-whiteboard-shape.service'
import {HandwrittingPreprocessingService} from '../../../services/handwritting-preprocessing.service'
import {BackendPythonService} from '../../../services/backend-python.service'
import { SignalingService } from '../../../services/signaling.service'
import { WebRTCService } from '../../../services/web-rtc.service'

import {Observable} from "rxjs/index";
import {fromEvent, Subscription} from "rxjs/index";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {cloneDeep} from "lodash";
import { saveAs } from 'file-saver';
import { take } from 'rxjs/operators';


//CONCERN BACK END
import {Handwritting} from '../../../../../src/app/config_backend/handwritting.model';

import { User, UserMoreInfo } from '../../../interfaces/user';
import { User2 } from '../../../interfaces/user2';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})


export class CanvasComponent implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy  {

  //RECTANGLE
  RectangleDefaultWidth:number=25;
  RectangleDefaultHeight: number = 15;

  //CERCLE
  CercleRadius:number = 15;

  //SHARE CANVAS WITHBOARD
  invited_friends : UserMoreInfo[] = [];
  private baseUrl =  'http://localhost:3000';

  //CONNECTED DATA
  userInfo:UserMoreInfo = null;
  pseudo:string = "";
  userId :firebase.User;
  isLogged:boolean;
  isLoginObservable:Subscription;

  @ViewChild('canvas', {static: false}) private canvas : ElementRef;
    context: CanvasRenderingContext2D;

  @ViewChild('incompleteShapesCanvas', {static: false}) private _incompleteShapesCanvas: ElementRef;
    private _incompleteShapesCanvasContext: CanvasRenderingContext2D;
    private _incompleteShapesMap: Map<string, CanvasWhiteboardShape>;

  //cursor
  @ViewChild('cursors', {static: false}) private cursors : ElementRef;


  @Input() shapeOptions: CanvasWhiteboardOptions;

  // Number of ms to wait before sending out the updates as an array
  @Input() batchUpdateTimeoutDuration:number;
  @Input() drawButtonEnabled:boolean ;

  @Input() clearButtonEnabled : boolean;
  @Input() undoButtonEnabled : boolean;
  @Input() redoButtonEnabled : boolean;
  @Input() saveButtonEnabled :boolean;

  @Input() drawButtonTextEnabled:string;
  @Input() clearButtonTextEnabled : string;
  @Input() undoButtonTextEnabled : string;
  @Input() redoButtonTextEnabled : string;
  @Input() saveButtonTextEnabled : string;

  @Input() downloadedFileName: string;
  @Input() lineWidth: number;
  @Input() scaleFactor : number;
  @Input() shouldDownloadDrawing: boolean;
  @Input() currentShape: INewCanvasWhiteboardShape<CanvasWhiteboardShape>;


  _clientDragging:boolean = false;
  _isImageLoaded:boolean = true;
  private _lastUUID: string;
  private _shapesMap: Map<string, CanvasWhiteboardShape>;
  private _undoStack: string[] = []; // Stores the value of start and count for each continuous stroke
  private _redoStack: string[] = [];
  private _updateHistory: CanvasWhiteboardUpdate[] = [];

  registeredShapes : Observable<Array<INewCanvasWhiteboardShape<CanvasWhiteboardShape>>>;
  _imageElement : any;
  private _updatesNotDrawn: any = [];
  //private element: Element;
  //private zone: NgZone;
  private _resizeSubscription: Subscription;
  isViewSet:boolean = false;
  //-------------------------------------------------------------------/
  //                  ARTIFICIAL INTELLIGENCY
  //-------------------------------------------------------------------/
  private _strokeArray : CanvasStroke[] = [];
  private _strokeRedoArray : CanvasStroke[] = [];
  private handwrittingsListSubs:Subscription;
  serverGetResponse: any = [];
  //--------------------------------------------------------------------/
  private _imageUrl: string;
  @Input() set imageUrl(imageUrl: string) {
        this._imageUrl = imageUrl;
        this._imageElement = null;
        this._redrawHistory();
    }
  //-----------------------------------------------------------------------/
  //                canvas exchange data : With other student or teacher
  //------------------------------------------------------------------------/
  @Input() canvasShareWith:UserMoreInfo[]= [];
   socket_clients = {};
   private socket: any;
   socket_baseUrl: "http://localhost:3000";
   private current_cursor_x:number = -1; //negative pour eviter qu'il commence a dessiner
   private current_cursor_y:number = 1;

  get imageUrl() {
        return this._imageUrl;
  }

  constructor(private ngZone: NgZone,
              private _changeDetector: ChangeDetectorRef,
              private elementRef: ElementRef,
              private _canvasWhiteboardService: CanvasWhiteboardService,
              private _canvasWhiteboardShapeService: CanvasWhiteboardShapeService,
              private _preprocessService:HandwrittingPreprocessingService,
              private _backendService:BackendPythonService,
              private authService: AuthService,
              private signalingService:SignalingService,
              private web_rtcService: WebRTCService,
              private persistanceService:PersistanceService) {

                    this.registeredShapes = this._canvasWhiteboardShapeService.registeredShapes$;
                    this._shapesMap = new Map<string, CanvasWhiteboardShape>();
                    this._incompleteShapesMap = new Map<string, CanvasWhiteboardShape>();
              }

  ngOnChanges(changes:SimpleChanges){

    for(let property in changes){
          if(property === 'clearButtonEnabled' && this.isViewSet){
                this.clearCanvasLocal();
          }
          if(property === 'undoButtonEnabled' && this.isViewSet){
              this.undo();
          }
          if(property === 'redoButtonEnabled' && this.isViewSet){
              this.redo();
          }
          if(property === 'saveButtonEnabled' && this.isViewSet){
              this.save();
          }
          if(property === 'canvasShareWith' /*&& changes[property].currentValue.length != changes[property].previousValue.length*/){

              console.log("From canavs ngOnchanges, You want to exchange with: ", changes[property].currentValue);
              this.canvasShareWith = changes[property].currentValue;
          }
    }


  }

  ngDoCheck(){

  }

  ngOnInit() {
      //this.context = this.canvas.nativeElement.getContext("2d");
      //this._incompleteShapesCanvasContext = this._incompleteShapesCanvas.nativeElement.getContext("2d");
      this.drawButtonEnabled = false;
      this.clearButtonEnabled = false;
      this.undoButtonEnabled = false;
      this.redoButtonEnabled = false;
      this.saveButtonEnabled = false;

      this.isLoginObservable =  this.authService.isLoggedIn()
          .subscribe(islogged => this.isLogged = islogged);
      console.log("isLogged: ", this.isLogged);
      this.userInfo = this.persistanceService.get_session(this.authService.storageKey);

      if(this.userInfo){
        //  console.log("current session user: ", this.userInfo);
          this.pseudo = this.userInfo['pseudo'];

        // add to list storage

      //from python
      /*this.handwrittingsListSubs = this._backendService
          .getHandwrittings()
          .pipe(take(1))
          .subscribe(res => {
              this.serverGetResponse = res;
                console.log("python ici: ", res);
            },
            console.error
          ); */
      }

  }

  ngAfterViewInit(){
      this.context = this.canvas.nativeElement.getContext("2d");
      this._incompleteShapesCanvasContext = this._incompleteShapesCanvas.nativeElement.getContext("2d");
      this.isViewSet = true;

      //WEB SOCKET LISTEN COORDINATES
          this.signalingService.getMessage('mouse', (data) =>{
              this._draw(data);
          })
  }


  canvasUserEvents(event){
    if(!this.drawButtonEnabled || !this._isImageLoaded)
        return;

        // Ignore mouse move Events if we're not dragging
    if (!this._clientDragging
            && (event.type === 'mousemove'
                  || event.type === 'touchmove'
                  || event.type === 'mouseout'
                  || event.type === 'touchcancel'
                  || event.type === 'mouseup'
                  || event.type === 'touchend'
                  || event.type === 'mouseout')) {
                return;
            }

    if (event.target == this._incompleteShapesCanvas.nativeElement || event.target == this.canvas.nativeElement) {
                    event.preventDefault();
    }

    let update: CanvasWhiteboardUpdate;
    let updateType: number;
    let eventPosition: CanvasWhiteboardPoint = this._getCanvasEventPosition(event);
        update = new CanvasWhiteboardUpdate(eventPosition.x, eventPosition.y);

    switch (event.type) {
        case 'mousedown':
          case 'touchstart':
                this._clientDragging = true;
                this._lastUUID = this._generateUUID();
                updateType = CanvasWhiteboardUpdateType.START;
                this._redoStack = [];
                if(!update.selectedShape){
                    update.selectedShape = (new this.currentShape).getShapeName()
                }
                if(!update.selectedShapeOptions){
                    update.selectedShapeOptions = Object.assign(new CanvasWhiteboardShapeOptions(), this.shapeOptions, {lineWidth: this.lineWidth});
                }
                break;
          case 'mousemove':
          case 'touchmove':
                if (!this._clientDragging) {
                    return;
                }
                updateType = CanvasWhiteboardUpdateType.DRAG;
                break;
          case 'touchcancel':
          case 'mouseup':
          case 'touchend':
          case 'mouseout':
                this._clientDragging = false;
                updateType = CanvasWhiteboardUpdateType.STOP;
                this._undoStack.push(this._lastUUID);
                break;
       }

       update.type = updateType;
       update.UUID = this._lastUUID;

       //EMIT SOCKET HERE
       this.signalingService.sendMessage('mouse', update, () => {
         console.log("corrdinates emited from canvas: " ,JSON.stringify(update));
       })
       //this.socket.emit('mouse', update)

        this._draw(update);

        //this._prepareToSendUpdate(update);
    }

    /**
         * Get the coordinates (x,y) from a given event
         * If it is a touch event, get the touch positions
         * If we released the touch, the position will be placed in the changedTouches object
         * If it is not a touch event, use the original mouse event received
         * @param eventData
         */
        private _getCanvasEventPosition(eventData: any): CanvasWhiteboardPoint {
            let canvasBoundingRect = this.context.canvas.getBoundingClientRect();

            let hasTouches = (eventData.touches && eventData.touches.length) ? eventData.touches[0] : null;
            if (!hasTouches)
                hasTouches = (eventData.changedTouches && eventData.changedTouches.length) ? eventData.changedTouches[0] : null;

            let event = hasTouches ? hasTouches : eventData;

            const scaleWidth = canvasBoundingRect.width / this.context.canvas.width;
            const scaleHeight = canvasBoundingRect.height / this.context.canvas.height;

            let xPosition = (event.clientX - canvasBoundingRect.left);
            let yPosition = (event.clientY - canvasBoundingRect.top);

            xPosition /= this.scaleFactor ? this.scaleFactor : scaleWidth;
            yPosition /= this.scaleFactor ? this.scaleFactor : scaleHeight;

            return new CanvasWhiteboardPoint(xPosition / this.context.canvas.width, yPosition / this.context.canvas.height);
        }


    resizeBufferCanvas() {
          // Lookup the size the browser is displaying the canvas.
          var displayWidth  = this._incompleteShapesCanvasContext.canvas.clientWidth;
          var displayHeight = this._incompleteShapesCanvasContext.canvas.clientHeight;

          // Check if the canvas is not the same size.
          if (this._incompleteShapesCanvasContext.canvas.width  != displayWidth ||
                this._incompleteShapesCanvasContext.canvas.height != displayHeight) {
          // Make the canvas the same size
              this._incompleteShapesCanvasContext.canvas.width  = displayWidth;
              this._incompleteShapesCanvasContext.canvas.height = displayHeight;
          }
    }

    resizeCanvas() {
          // Lookup the size the browser is displaying the canvas.
          var displayWidth  = this.context.canvas.clientWidth;
          var displayHeight = this.context.canvas.clientHeight;

          // Check if the canvas is not the same size.
          if (this.context.canvas.width  != displayWidth ||
                this.context.canvas.height != displayHeight) {
          // Make the canvas the same size
              this.context.canvas.width  = displayWidth;
              this.context.canvas.height = displayHeight;
          }
    }

    private _draw(update: CanvasWhiteboardUpdate):void {

          if (!this.canvas || !update || !this._incompleteShapesCanvas) {
            console.log("Canvases or update not found");
            return; }

          this.resizeCanvas();
          this.resizeBufferCanvas();

          this._updateHistory.push(update);
          //map the canvas coordinates to our canvas size since they are scaled.
        update = Object.assign(new CanvasWhiteboardUpdate(),
            update,
            {
                x: update.x * this.context.canvas.width,
                y: update.y * this.context.canvas.height
            });

          if(update.type === CanvasWhiteboardUpdateType.START){
                let updateShapeConstructor = this._canvasWhiteboardShapeService.getShapeConstructorFromShapeName(update.selectedShape);
                let shape = new updateShapeConstructor(
                    new CanvasWhiteboardPoint(update.x, update.y),
                    Object.assign(new CanvasWhiteboardShapeOptions(), update.selectedShapeOptions)
                )
                this._incompleteShapesMap.set(update.UUID, shape);

                this._drawIncompleteShapes();
              } else if (update.type === CanvasWhiteboardUpdateType.DRAG) {
                            let shape = this._incompleteShapesMap.get(update.UUID);
                            /*********************************************/
                            /*            SOCKET SEND TO NODE SERVER
                            /*********************************************/
                            this.current_cursor_x = update.x;
                            this.current_cursor_y = update.y;

                            // Each Socket.IO connection has a unique session id


                            //this.socket.emit('mouse', {x:update.x, y:update.y});
                            /*------------------END SOCKET ---------------*/
                            shape && shape.onUpdateReceived(update);


                            this._drawIncompleteShapes();
              } else if (CanvasWhiteboardUpdateType.STOP) {
                            let shape = this._incompleteShapesMap.get(update.UUID);
                            shape && shape.onStopReceived(update);
                            this._shapesMap.set(update.UUID, shape);

                            //BEUG SUR LA LIGNE QUI SUIT: QUAND ON DESSINE SEULEMENT UN POINT
                            if(this._incompleteShapesMap.get(update.UUID))
                                this._strokeArray.push(new CanvasStroke((this._incompleteShapesMap.get(update.UUID)).linePositions));
                            //console.log(this._incompleteShapesMap.get(update.UUID));//TOUS LES POINTS D'UN MEME STROKE SONT ICI

                            this._incompleteShapesMap.delete(update.UUID);
                            this._swapCompletedShapeToActualCanvas(shape);

                          this._strokeArray = this._preprocessService.preporocessing(this._strokeArray, this.context, this.shapeOptions);

                          /******************** SAVE DATA TO JSON *************/
                          //const blob = new Blob([JSON.stringify(this._strokeArray)], {type : 'application/json'});
                          //saveAs(blob, 'abc.json');

                          /********************* SEND DATA TO PYTHON FLASK *****************/
                           //this._backendService.postHandwrittings(this._strokeArray)
                           //pipe(take(1))
                           //.subscribe((response)=>{
                             //console.log(this._strokeArray)
                            //  console.log("reponse Post du server: ", response);
                            //  this.display_latex_on_canvas(response);
                        //  });

                          /******************** PYTHON FLASK SERVER RESPONSE(HANDWRITTING) ****************************/
                          //this.handwrittingsListSubs = this._backendService
                          //    .getHandwrittings()
                          //    .pipe(take(1))
                            //  .subscribe(res => {
                              //    this.serverGetResponse = res;
                              //      console.log("reponse Get du server python: ", res);
                              //  },
                            //    console.error
                            //  );

              //END
              }

      }

      private _drawIncompleteShapes() {

          this._resetIncompleteShapeCanvas();
          //var get_values = this._incompleteShapesMap.values();

          this._incompleteShapesMap.forEach(shape => {
              if (shape.isVisible) {
                 shape.draw(this._incompleteShapesCanvasContext);
             } else console.log("shape is not visible")
          });
      }

      private _resetIncompleteShapeCanvas() {
        this._incompleteShapesCanvasContext.clearRect(0, 0, this._incompleteShapesCanvasContext.canvas.width, this._incompleteShapesCanvasContext.canvas.height);
        this._incompleteShapesCanvasContext.fillStyle = "transparent";
        this._incompleteShapesCanvasContext.fillRect(0, 0, this._incompleteShapesCanvasContext.canvas.width, this._incompleteShapesCanvasContext.canvas.height);
      }

      private _swapCompletedShapeToActualCanvas(shape: CanvasWhiteboardShape) {
        this._drawIncompleteShapes();
      if (shape && shape.isVisible) {
           shape.draw(this.context);
       }
    }

    private _generateUUID(): string {
      return this._random4() + this._random4() + "-" + this._random4() + "-" + this._random4() + "-" +
          this._random4() + "-" + this._random4() + this._random4() + this._random4();
  }

  private _random4(): string {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
  }

  //----------------------------------------------------------------------------------------/
  //                           CLEAR CANVAS
  //----------------------------------------------------------------------------------------/
     clearCanvasLocal(): void {
        console.log("i must clear");
        this._removeCanvasData();
        this._undoStack = [];

     }

     private _removeCanvasData(callbackFn?: any): void {
         this._shapesMap = new Map<string, CanvasWhiteboardShape>();
         this._clientDragging = false;
         this._updateHistory = [];
         this._undoStack = [];
         this._strokeArray = [];
         this._redrawBackground(callbackFn);
       }


    private _loadImage(callbackFn?: any): void {
        this.drawButtonEnabled = false;

        //If we already have the image there is no need to acquire it
        if (this._imageElement) {
            this.drawButtonEnabled = true;
            callbackFn && callbackFn();
            return;
        }

        this._imageElement = new Image();
        this._imageElement.addEventListener("load", () => {
            //this.drawButtonEnabled = true;
            callbackFn && callbackFn();
            this._isImageLoaded = true;
        });
        this._imageElement.src = this.imageUrl;
    }

    private _drawImage(context: any, image: any, x: number, y: number, width: number, height: number, offsetX: number, offsetY: number): void {
        if (arguments.length === 2) {
            x = y = 0;
            width = context.canvas.width;
            height = context.canvas.height;
        }

        offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
        offsetY = typeof offsetY === 'number' ? offsetY : 0.5;

        if (offsetX < 0) offsetX = 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetX > 1) offsetX = 1;
        if (offsetY > 1) offsetY = 1;

        let imageWidth = image.width;
        let imageHeight = image.height;
        let radius = Math.min(width / imageWidth, height / imageHeight);
        let newWidth = imageWidth * radius;
        let newHeight = imageHeight * radius;
        let finalDrawX: any;
        let finalDrawY: any;
        let finalDrawWidth: any;
        let finalDrawHeight: any;
        let aspectRatio = 1;

        // decide which gap to fill
        if (newWidth < width) aspectRatio = width / newWidth;
        if (Math.abs(aspectRatio - 1) < 1e-14 && newHeight < height) aspectRatio = height / newHeight;
        newWidth *= aspectRatio;
        newHeight *= aspectRatio;

        // calculate source rectangle
        finalDrawWidth = imageWidth / (newWidth / width);
        finalDrawHeight = imageHeight / (newHeight / height);

        finalDrawX = (imageWidth - finalDrawWidth) * offsetX;
        finalDrawY = (imageHeight - finalDrawHeight) * offsetY;

        // make sure the source rectangle is valid
        if (finalDrawX < 0) finalDrawX = 0;
        if (finalDrawY < 0) finalDrawY = 0;
        if (finalDrawWidth > imageWidth) finalDrawWidth = imageWidth;
        if (finalDrawHeight > imageHeight) finalDrawHeight = imageHeight;

        // fill the image in destination rectangle
        context.drawImage(image, finalDrawX, finalDrawY, finalDrawWidth, finalDrawHeight, x, y, width, height);
    }


    /**
     * Draw any missing updates that were received before the image was loaded
     */
    private _drawMissingUpdates(): void {
        if (this._updatesNotDrawn.length > 0) {
            let updatesToDraw = this._updatesNotDrawn;
            this._updatesNotDrawn = [];

            updatesToDraw.forEach((update: CanvasWhiteboardUpdate) => {
                this._draw(update);
            });
        }
    }

    private _drawStartingColor() {
        let previousFillStyle = this.context.fillStyle;
        this.context.save();

        this.context.fillStyle =previousFillStyle;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.fillStyle = previousFillStyle;

        this.context.restore();
    }


  //----------------------------------------------------------------------------------------/
  //                           UNDO CANVAS
  //----------------------------------------------------------------------------------------/
      undo(){
        //console.log("i must undo");
        this.startUndo((updateUUID) => {
           this._redoStack.push(updateUUID);
           //console.log("_strokeArray.length before: ", this._strokeArray.length );
           if(this._strokeArray) //AI
                this._strokeRedoArray.push(this._strokeArray.pop());
            //console.log("_strokeArray.length after: ", this._strokeArray.length );
           //this.onUndo.emit(updateUUID);
       });
     }

     startUndo(callbackFn?: Function): void {
        if (!this._undoStack.length) return;

        let updateUUID = this._undoStack.pop();
        this._undoCanvas(updateUUID);
        callbackFn && callbackFn(updateUUID);
    }

    private _undoCanvas(updateUUID: string): void {
        if (this._shapesMap.has(updateUUID)) {
            let shape = this._shapesMap.get(updateUUID);
            shape.isVisible = false;
            this.drawAllShapes();
        }
    }

    drawAllShapes() {
        this._redrawBackground(() => {
            this._shapesMap.forEach((shape: CanvasWhiteboardShape) => {
                if (shape.isVisible) {
                    shape.draw(this.context);
                }
            });
        });
    }

    private _redrawBackground(callbackFn?: any): void {
        if (this.context) {
            if (this.imageUrl) {
                this._loadImage(() => {
                    this.context.save();
                    this._drawImage(this.context, this._imageElement, 0, 0, this.context.canvas.width, this.context.canvas.height, 0.5, 0.5);
                    this.context.restore();
                    this._drawMissingUpdates();
                    callbackFn && callbackFn();
                });
            } else {
                this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
              //  this._drawStartingColor(); //BEUG CAR IL CHANGE DE BACKGROUND
                callbackFn && callbackFn();
            }
        }
    }


  //----------------------------------------------------------------------------------------/
  //                           REDO CANVAS
  //----------------------------------------------------------------------------------------/
        redo(){
            //console.log("i must redo");
            this.startRedo((updateUUID) => {
           this._undoStack.push(updateUUID);
              //console.log("_strokeArray.length before: ", this._strokeArray.length );
           if(this._strokeRedoArray){
             this._strokeArray.push(this._strokeRedoArray.pop());
           }
             //console.log("_strokeArray.length after: ", this._strokeArray.length );
          // this.onRedo.emit(updateUUID);

         });
      }

      startRedo(callbackFn?: any): void {
        if (!this._redoStack.length) return;

        let updateUUID = this._redoStack.pop();
        this._redoCanvas(updateUUID);
        callbackFn && callbackFn(updateUUID);
    }

    private _redoCanvas(updateUUID: string): void {
        if (this._shapesMap.has(updateUUID)) {
            let shape = this._shapesMap.get(updateUUID);
            shape.isVisible = true;

            this.drawAllShapes();
        }
    }

  //----------------------------------------------------------------------------------------/
  //                           SAVE CANVAS
  //----------------------------------------------------------------------------------------/
  /**
   * Local method to invoke saving of the canvas data when clicked on the canvas Save button
   * This method will emit the generated data with the specified Event Emitter
   *
   * @param returnedDataType
   */
          save(returnedDataType: string = "image/png"): void {
              //console.log("i must save");
              this.generateCanvasData((generatedData: string | Blob) => {
                  //this.onSave.emit(generatedData);

                  if (this.shouldDownloadDrawing) {
                    this.downloadCanvasImage(returnedDataType, generatedData);
                  }
            });
        }

        /**
     * This method generates a canvas url string or a canvas blob with the presented data type
     * A callback function is then invoked since the blob creation must be done via a callback
     *
     * @param callback
     * @param returnedDataType
     * @param returnedDataQuality
     */
    generateCanvasData(callback: any, returnedDataType: string = "image/png", returnedDataQuality: number = 1): void {
        if (window.navigator.msSaveOrOpenBlob === undefined) {
            callback && callback(this.generateCanvasDataUrl(returnedDataType, returnedDataQuality))
        } else {
            this.generateCanvasBlob(callback, returnedDataType, returnedDataQuality);
        }
    }

    /**
     * The HTMLCanvasElement.toDataURL() method returns a data URI containing a representation of the image in the format specified by the type parameter (defaults to PNG).
     * The returned image is in a resolution of 96 dpi.
     * If the height or width of the canvas is 0, the string "data:," is returned.
     * If the requested type is not image/png, but the returned value starts with data:image/png, then the requested type is not supported.
     * Chrome also supports the image/webp type.
     *
     * @param returnedDataType A DOMString indicating the image format. The default format type is image/png.
     * @param returnedDataQuality A Number between 0 and 1 indicating image quality if the requested type is image/jpeg or image/webp.
     If this argument is anything else, the default value for image quality is used. The default value is 0.92. Other arguments are ignored.
     */
    generateCanvasDataUrl(returnedDataType: string = "image/png", returnedDataQuality: number = 1): string {
        return this.context.canvas.toDataURL(returnedDataType, returnedDataQuality);
    }

    /**
     * Generate a Blob object representing the content drawn on the canvas.
     * This file may be cached on the disk or stored in memory at the discretion of the user agent.
     * If type is not specified, the image type is image/png. The created image is in a resolution of 96dpi.
     * The third argument is used with image/jpeg images to specify the quality of the output.
     *
     * @param callbackFn The function that should be executed when the blob is created. Should accept a parameter Blob (for the result).
     * @param returnedDataType A DOMString indicating the image format. The default type is image/png.
     * @param returnedDataQuality A Number between 0 and 1 indicating image quality if the requested type is image/jpeg or image/webp.
     If this argument is anything else, the default value for image quality is used. Other arguments are ignored.
     */
    generateCanvasBlob(callbackFn: any, returnedDataType: string = "image/png", returnedDataQuality: number = 1): void {
        let toBlobMethod: Function;

        if (typeof this.context.canvas.toBlob !== "undefined") {
            toBlobMethod = this.context.canvas.toBlob.bind(this.context.canvas);
        } //else if (typeof this.context.canvas.msToBlob !== "undefined") {
         else if (typeof this.context.canvas. toBlob !== "undefined") {  ////TRY TO SET FOR INTERNET EXPLORER
            toBlobMethod = (callback) => {
                //callback && callback(this.context.canvas.msToBlob());  //TRY TO SET FOR INTERNET EXPLORER
                callback && callback(this.context.canvas.toBlob(null,null,null));
            };
        }

        toBlobMethod && toBlobMethod((blob: Blob) => {
            callbackFn && callbackFn(blob, returnedDataType);
        }, returnedDataType, returnedDataQuality);
    }


    /**
     * Generate a canvas image representation and download it locally
     * The name of the image is canvas_drawing_ + the current local Date and Time the image was created
     * Methods for standalone creation of the images in this method are left here for backwards compatibility
     *
     * @param returnedDataType A DOMString indicating the image format. The default type is image/png.
     * @param downloadData? The created string or Blob (IE).
     * @param customFileName? The name of the file that should be downloaded
     */
    downloadCanvasImage(returnedDataType: string = "image/png", downloadData?: string | Blob, customFileName?: string): void {
        if (window.navigator.msSaveOrOpenBlob === undefined) {
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', downloadData ? <string>downloadData : this.generateCanvasDataUrl(returnedDataType));

            let fileName = customFileName ? customFileName
                : (this.downloadedFileName ? this.downloadedFileName : "canvas_drawing_" + new Date().valueOf());

            downloadLink.setAttribute('download', fileName + this._generateDataTypeString(returnedDataType));
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } else {
            // IE-specific code
            if (downloadData) {
                this._saveCanvasBlob(<Blob>downloadData, returnedDataType);
            } else {
                this.generateCanvasBlob(this._saveCanvasBlob.bind(this), returnedDataType);
            }
        }
    }

    /**
     * Save the canvas blob (IE) locally
     * @param blob
     * @param returnedDataType
     */
    private _saveCanvasBlob(blob: Blob, returnedDataType: string = "image/png"): void {
        window.navigator.msSaveOrOpenBlob(blob, "canvas_drawing_" + new Date().valueOf() + this._generateDataTypeString(returnedDataType));
    }


    private _generateDataTypeString(returnedDataType: string): string {
            if (returnedDataType) {
                return "." + returnedDataType.split('/')[1];
            }

            return "";
        }

    //--------------------------------------------------------------------------------------/
    //                                  UTILS
  //----------------------------------------------------------------------------------------/
  /**
 * Redraw the saved history after resetting the canvas state
 */
private _redrawHistory(): void {
    let updatesToDraw = [].concat(this._updateHistory);

    this._removeCanvasData(() => {
        updatesToDraw.forEach((update: CanvasWhiteboardUpdate) => {
            this._draw(update);
        });
    });
}

private display_latex_on_canvas(latex_obj: any){
  //const canvas = <HTMLCanvasElement> document.getElementById('test');
  //context = this.canvas.getContext('2d');
  //ctx = this._incompleteShapesCanvas.getContext('2d');

  this._incompleteShapesCanvasContext.font = 'italic 18px Arial';
  this._incompleteShapesCanvasContext.textAlign = 'center';
  this._incompleteShapesCanvasContext. textBaseline = 'middle';
  this._incompleteShapesCanvasContext.fillStyle = 'red';
  this._incompleteShapesCanvasContext.fillText(latex_obj['latex'], 150, 50);
}

/********************************************************************>************/
/*                         CAMERA WebRTC
/**********************************************************************************/




ngOnDestroy() {
  this.isLoginObservable.unsubscribe();
}

  //***************** END *****************/
}
