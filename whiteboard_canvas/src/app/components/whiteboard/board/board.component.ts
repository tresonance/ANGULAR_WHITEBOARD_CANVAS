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
   NgZone, ChangeDetectorRef
} from "@angular/core";

import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,
          CanvasWhiteboardUpdate, CanvasWhiteboardOptions , CircleShape, CanvasWhiteboardShape,
          RectangleShape, FreeHandShape, SmileyShape, LineShape, StarShape, INewCanvasWhiteboardShape} from '../../../models/whiteboard/whiteboard'

import { ChatRoom, PublicChatMessage, ChatUser, MessageType, Theme, ParticipantType, ParticipantStatus, FirebaseUser,UserMetadata,FileUpload,
                    PrivateChatGroup,PrivateChatLocalization, DemoAdapter, DemoAdapterPagedHistory, IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,
                  ChatAdapter,  PrivateChatMessage, ParticipantResponse, DefaultFileUploadAdapter, ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../../../models/chat/chat';

import { map } from 'rxjs/operators';
import 'rxjs/add/operator/catch' ;
import { filter } from 'rxjs/operator/filter';

import {Observable} from "rxjs/index";
import {Subject} from 'rxjs/Subject';
import {WebcamImage} from 'ngx-webcam';

import { PersistanceService } from '../../../services/persistance.service';
import { ChatService } from '../../../services/chat.service';
import { AuthService} from '../../../services/auth.service';
import {CanvasWhiteboardService} from '../../../services/canvas-whiteboard.service'
import {CanvasWhiteboardShapeService} from '../../../services/canvas-whiteboard-shape.service'
import { SignalingService } from '../../../services/signaling.service'
import { WebRTCService } from '../../../services/web-rtc.service'
import { Router } from '@angular/router';

import * as socketio from 'socket.io-client';

import {fromEvent, Subscription} from "rxjs/index";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import { take } from 'rxjs/operators';

import { User, UserMoreInfo } from '../../../interfaces/user';
import { User2 } from '../../../interfaces/user2';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, AfterViewInit {

  userInfo:UserMoreInfo = null;
  //nativeElement
  //@ViewChild('canvasWhiteboardShapePreview') canvas: ElementRef;
  //@ViewChildren('selection') selection : QueryList<ElementRef>;

  //contextArray : CanvasRenderingContext2D[] = [];
  //shapeOptions: CanvasWhiteboardShapeOptions = new CanvasWhiteboardShapeOptions();
  //@ViewChild('allcanvas') canvas : ElementRef;
  boolDraw:boolean = false;;
  boolClear:boolean = false;;
  boolUndo:boolean = false;;
  boolRedo:boolean = false;
  boolSave:boolean = false;
  boolProfil:boolean = false;
  bool_camera_capture: boolean;
  bool_camera_switch: boolean;



  inviteFriends: ParticipantResponse = null;


  undoButtonTextEnabled :boolean= true;
  redoButtonTextEnabled : boolean = true;
  saveButtonTextEnabled: boolean = true;
  clearButtonTextEnabled:boolean = true;
  drawButtonTextEnabled:boolean = true;

  redrawTimeFrequency:number = 100;
  showShapeSelector:boolean = false;
  showFillColorPicker:boolean = false;
  showStrokeColorPicker:boolean = false;
  fillChosenColor:string;
  strokeChosenColor:string;
  currentShape: INewCanvasWhiteboardShape<CanvasWhiteboardShape> = FreeHandShape;
  newOption:CanvasWhiteboardShapeOptions;
  downloadedFileName: string;
  lineJoin: string = "round";
  lineCap: string = "round";
  lineWidth: number = 2;
  scaleFactor:number = 0;
  shouldDownloadDrawing: boolean = true;

  registeredShapes : Observable<Array<INewCanvasWhiteboardShape<CanvasWhiteboardShape>>>;

  //registeredShapes : CanvasWhiteboardShape[] = [];
  baseUrl:string = 'http://localhost:4200/#/whiteboard';


  constructor(private _canvasWhiteboardShapeService: CanvasWhiteboardShapeService,
              private renderer: Renderer,
              private _changeDetector: ChangeDetectorRef,
              private ngZone: NgZone,
              private router: Router,
              private signalingService:SignalingService,
              private web_rtcService:WebRTCService,
              private persistanceService:PersistanceService,
              private authService: AuthService,
              private chatService:ChatService) {
        //this.registeredShapes = this._canvasWhiteboardShapeService.registeredShapes$;
   }

  ngOnInit() {
    this.fillChosenColor = 'rgba(255, 255, 255,1)';
    this.strokeChosenColor = 'rgba(0,0,0,1)';
    this.newOption = new CanvasWhiteboardShapeOptions(false, this.fillChosenColor, this.strokeChosenColor);
    if(this.registeredShapes){
      //this.currentShape = this.registeredShapes[0];
    }

    /**************************************************************************/
    /*                         CURRENT USER;
    /***************************************************************************/
    this.userInfo = this.persistanceService.get_session(this.authService.storageKey);
    if(!this.userInfo){
        this.authService.logout();
    }

    //console.log("[CAMERA] : ",this.userInfo);
    /***************************************************************************/
    /*                          SOCKET IO
    /****************************************************************************/
    //this.signalingService.connectUser(this.userInfo);



    //END NG ONINIT
  }

  ngAfterViewInit() {

  }


  //---------------------------------
  //       RECEIVE SHAPES POPUP VALUES
  //---------------------------------
  onSlectShape($event){
      //console.log("board shape a reçu: ", $event);
      this.currentShape = $event;
      this.showShapeSelector = false;
  }

  onClickedOutsideShapesContainer($event){
        //console.log("board shapes clicked outside a reçu: ",$event);
        if(this.showShapeSelector && $event){
            this.showShapeSelector = !$event;
       }
  }

  //---------------------------------
  //      ON RECEIVE TOOLBAR EVENT
  //----------------------------------
  bool_openShapePopUp($event){
    //console.log("board preview a reçu: ", $event);

    this.showShapeSelector = $event;

  }

  booL_onOpenFillColor($event){
      //console.log("board fill a reçu: ", $event);
      this.showFillColorPicker = $event;
  }

  bool_onOpenStrokeColor($event){
      //console.log("board stroke color a reçu: ", $event);
      this.showStrokeColorPicker = $event;
  }

  bool_onStartDrawing($event){
  //  console.log("board draw a reçu: ", $event);
      this.boolDraw = $event;
  }

  bool_onStartClearing($event){
    //console.log("board clear a reçu: ", $event);
      this.boolClear = $event;
  }

  bool_onUndo($event){
    //console.log("board undo a reçu: ", $event);
    this.boolUndo = $event;
  }

  bool_onRedo($event){
    //console.log("board redo a reçu: ", $event);
    this.boolRedo = $event;
  }

  bool_onSave($event){
    //console.log("board save a reçu: ", $event);
    this.boolSave = $event;
  }

  bool_onProfil($event){
    //console.log("board save a reçu: ", $event);
    this.boolProfil = $event;
    if(this.boolProfil){
      this.router.navigate(['/profile'])
    }
  }

  /*bool_openWebcam($event){
    this.showWebcam = $event;
    console.log("BOARD: opening webcam \n", this.showWebcam);
  } */


  //----------------------------------------------------------
  //  ONCE COLORS POPUP ONPENED CHOOSE COLOR
  //----------------------------------------------------------

  selectedFillColor($event){
      //console.log("board fill color value: ", $event);
      this.fillChosenColor = $event === 'transparent' ? 'rgba(255, 255, 255, 1)' : $event;
      this.showFillColorPicker = false; //after selected , we close ChatboxChatboxWindow
      //this.newShape = delete this.newShape;
      this.newOption = Object.assign(new CanvasWhiteboardShapeOptions(),
            {
                shouldFillShape: !!this.fillChosenColor,
                fillStyle: this.fillChosenColor,
                strokeStyle: this.strokeChosenColor,
                lineWidth: 2,
                lineJoin: this.lineJoin,
                lineCap: this.lineCap
            });
       this._changeDetector.detectChanges();
  }

  onClickedOutsideFillColorPicker($event){
      if(this.showFillColorPicker && $event){
        this.showFillColorPicker = !$event;
      }
  }

  selectedStrokeColor($event){
    //console.log("board stroke color value: ", $event);
    this.strokeChosenColor = $event === 'transparent' ? 'rgba(255, 255, 255, 1)' : $event;
    this.showStrokeColorPicker = false;//after selected , we close ChatboxChatboxWindow
    //this.newShape = delete this.newShape;
    this.newOption = Object.assign(new CanvasWhiteboardShapeOptions(),
          {
              shouldFillShape: !!this.fillChosenColor,
              fillStyle: this.fillChosenColor,
              strokeStyle: this.strokeChosenColor,
              lineWidth: 2,
              lineJoin: this.lineJoin,
              lineCap: this.lineCap
          });
     this._changeDetector.detectChanges();
  }

  onClickedOutsideStrokeColorPicker($event){
      if(this.showStrokeColorPicker && $event){
        this.showStrokeColorPicker = !$event;
      }
  }


  /********************* CANVAS SHARE WITHEBOARD ****************************/
  loadConnectedUsers():void{
    //this.chatService.getOnlineUsers()
      //.then(datas => datas.forEach(data => this.connected_Users.push(data)));
      //.pipe(take(1))
      //.subscribe(datas => datas.forEach(data => this.connected_Users.push(data)));
  }

  /****************************************************************************/
  /*                    CAMERA
  /****************************************************************************/
  /*bool_get_camera_status($event){
      this.showWebcam = !this.showWebcam;
      console.log("camera status from board: ", this.showWebcam);
  }*/



}
