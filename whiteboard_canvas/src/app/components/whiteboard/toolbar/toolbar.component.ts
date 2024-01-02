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

import { FormBuilder, FormGroup, FormArray, FormControl, ValidatorFn } from '@angular/forms';

import {fromEvent, Subscription} from "rxjs/index";

import { map } from 'rxjs/operators';
import 'rxjs/add/operator/catch' ;
import { filter } from 'rxjs/operator/filter';
import { take } from 'rxjs/operators';

import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,
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

import { Router } from '@angular/router';

import { User, UserMoreInfo } from '../../../interfaces/user';
import { User2 } from '../../../interfaces/user2';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})

export class ToolbarComponent implements OnInit, OnChanges {
  //friends template
  form: FormGroup;
  //friends_list :UserMoreInfo[] = [];

  //RECTANGLE
  RectangleDefaultWidth:number=25;
  RectangleDefaultHeight: number = 15;

  //CERCLE
  CercleRadius:number = 15;


  drawButtonEnabled: boolean = true;
  drawButtonText:string = "Draw";

  clearButtonEnabled: boolean = true;
  clearButtonText:string = 'Clear';

  undoButtonEnabled: boolean = true;
  undoButtonText:string = 'Undo';

  redoButtonEnabled: boolean = true;
  redoButtonText: string = 'Redo';

  saveDataButtonEnabled: boolean = true;
  saveDataButtonText: string = 'Save';

  fillButtonEnabled: boolean = true;
  fillButtonText: string = 'Fill';
  //@Input() fillColor:string;
  fillBottomBorderColor:any;

  strokeButtonEnabled: boolean = true;
  strokeButtonText: string = 'Stroke';

  profilButtonEnabled: boolean = true;
  profilButtonText: string = 'profil';

  //camDataButtonEnabled: boolean = true;
  //cameraButtonText: string = 'camera';

  inviteFriendsButtonEnabled: boolean = true;
  inviteFriendsButtonText: string = 'friends';
  //@Input() strokeColor:string;
  strokeBottomBorderColor:any;

  @Input() updateCurrentShape: INewCanvasWhiteboardShape<CanvasWhiteboardShape>;
           copyCurrentShape: INewCanvasWhiteboardShape<CanvasWhiteboardShape>;
  @Input() shapeOptions : CanvasWhiteboardShapeOptions;
            shapeConstructor: INewCanvasWhiteboardShape<CanvasWhiteboardShape>;
  //shapeOptions: CanvasWhiteboardShapeOptions = new CanvasWhiteboardShapeOptions();

  @Output() openSelection = new EventEmitter<any>(); //selection shape
  @Output() mustOpenFillColor = new EventEmitter<boolean>();
  @Output() mustOpenStrokeColor = new EventEmitter<boolean>();
  @Output() draw = new EventEmitter<boolean>();
  @Output() clear = new EventEmitter<boolean>();
  @Output() undo = new EventEmitter<boolean>();
  @Output() redo = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<boolean>();



  //@Output() friends = new EventEmitter<UserMoreInfo[] | null >();
  //@Output() is_camera_on = new EventEmitter<boolean>();
  @Output() gotoProfil = new EventEmitter<boolean>();

  //@Output() openWebcam = new EventEmitter<boolean>();

  //---------------------------------- SIBLIGNG SHARE DATA : toolbar & camear

  isVisible:boolean = false;
  openStrokeColor:boolean = false;
  openFillColor:boolean = false;
  isDrawing:boolean = false;
  isClearing:boolean = false;
  isUndo:boolean = false;

  isRedo:boolean = false;
  isSave:boolean = false;
  camera_status:boolean = false;
  webcamOn:boolean = false;

  //Users
  connected_Users:UserMoreInfo[] = [];
  userInfo:UserMoreInfo = null;
  //invited_canvas_users:UserMoreInfo[] = [];
  //----------------------------------
  //    CANVAS PREVIEW
  //----------------------------------
  //@Input() readonly shapeConstructor: INewCanvasWhiteboardShape<CanvasWhiteboardShape>;
  //@Input() readonly previewShape: FreeHandShape;
  //@Input() readonly shapeOptions: CanvasWhiteboardShapeOptions;

  //-----------------------------------------------------------
  //              SUBSCRIPTION FOR BEHAVIOR SUBJECT DATA
  //------------------------------------------------------------
  all_online_users_subject : Subscription
  all_online_users : UserMoreInfo[] = [];

  @ViewChild('canvasWhiteboardShapePreview', {static: false}) canvas: ElementRef;


  constructor(private _canvasWhiteboardShapeService: CanvasWhiteboardShapeService,
              private formBuilder: FormBuilder,
              private renderer: Renderer,
              private _changeDetector: ChangeDetectorRef,
              private ngZone: NgZone,
              private router: Router,
              private persistanceService:PersistanceService,
              private signalingService:SignalingService,
              private web_rtcService:WebRTCService,
              private chatService:ChatService,
              private authService: AuthService) {

              }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.updateCurrentShape) {
            this.drawShapePreview();
        }

        if(changes.shapeOptions && changes.shapeOptions.currentValue){
            this.fillBottomBorderColor = {'border-bottom': `5px solid ${changes.shapeOptions.currentValue.fillStyle}`};
            this.strokeBottomBorderColor = {'border-top': `5px solid ${changes.shapeOptions.currentValue.strokeStyle}`};
            this.updatePreviewShape(this.copyCurrentShape);
            this.redrawShapePreview(changes.shapeOptions.currentValue);
            //this.shapeOptions.shouldFillShape = true;
            //this.shapeOptions.fillStyle = changes.fillColor.currentValue;
            //this.updatePreviewShape(this.updateCurrentShape);
        }

        if(changes.updateCurrentShape){
            this.copyCurrentShape = changes.updateCurrentShape.currentValue
            this.updatePreviewShape(changes.updateCurrentShape.currentValue);
        }


    }

    get invited_canvas_users() {
      return this.connected_Users.filter(item => item.checked);
    }

    ngOnInit() {
        this.fillBottomBorderColor = {'border-bottom': `5px solid rgba(255, 255, 255, 1)`};
        this.strokeBottomBorderColor = {'border-top': `5px solid rgba(0, 0, 0, 1)`};
        this.isClearing = false;
        this.isDrawing = false;
        this.isUndo = false;
        this.isRedo = false;
        this.isSave = false;

        /**************************************************************************/
        /*                         CURRENT USER;
        /***************************************************************************/
        this.userInfo = this.persistanceService.get_session(this.authService.storageKey);
        if(!this.userInfo){
            this.authService.logout();
        }



          //FROM PERSISTANCESESSION SERVICE
          this.all_online_users_subject = this.chatService.behave_sub_get_all_online_users_Observable().subscribe(data => {
            if(data !== undefined){
                console.log("[TOOLBAR]: online users \n", data)
                this.connected_Users = data;
              }
          })

    }

    ngAfterViewInit() {
        this.drawShapePreview()
    }

    drawShapePreview() {
        if (!this.canvas) { return; }

        let context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext("2d");
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        //let concreteShape = new this.shapeConstructor(
        let concreteShape = new this.updateCurrentShape(
            new CanvasWhiteboardPoint(0, 0),
            Object.assign(new CanvasWhiteboardShapeOptions(), this.shapeOptions.fillStyle)
        );

        concreteShape.drawPreview(context);
    }

    redrawShapePreview(newOption) {
        if (!this.canvas) { return; }

        let context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext("2d");
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        //let concreteShape = new this.shapeConstructor(
        let concreteShape = new this.updateCurrentShape(
            new CanvasWhiteboardPoint(0, 0),
            newOption
        );

        concreteShape.drawPreview(context);
    }


  //----------------------------------
  //    EMIT EVENTS
  //----------------------------------
  emit_bool_openShapeSelectionPopUp(){
      this.isVisible = !this.isVisible;
      this.openSelection.emit(!this.isVisible);
  }

  emit_bool_openStrokeColorPicker(){
      this.openStrokeColor = !this.openStrokeColor;
      this.mustOpenStrokeColor.emit(this.openStrokeColor)
  }

  emit_bool_openFillColorPicker(){
      this.openFillColor = !this.openFillColor;
      this.mustOpenFillColor.emit(this.openFillColor);
  }

  emit_bool_onDraw($event){
      this.isDrawing = !this.isDrawing;
      //this.drawButtonEnabled = !this.drawButtonEnabled;
      this.draw.emit(this.isDrawing);
  }

  emit_bool_onClear($event){
      this.isClearing = !this.isClearing;
      this.clear.emit(this.isClearing);
  }

  emit_bool_onUndo($event){
      this.isUndo = !this.isUndo;
      this.undo.emit(this.isUndo);
  }

  emit_bool_onRedo($event){
      this.isRedo = !this.isRedo;
      this.redo.emit(this.isRedo);
  }

  emit_bool_onSave($event){
      this.isSave = !this.isSave;
      this.save.emit(this.isSave);
  }

  /*****************************************************************************/
  /*                 FRIENDS
  /*****************************************************************************/
  onAddFriends($event){
      this.webcamOn = !this.webcamOn;
      this.signalingService.bahave_Sub_set_cam_popUp(this.webcamOn);
      //console.log("click open webcam: event lead to sibling share: ", this.openWebcam);
      //this.openWebcam.emit(this.webcamOn)
  }

 emit_bool_onAddFriends(clicked_online_user:UserMoreInfo){
    return new Promise<UserMoreInfo[]>((resolve, reject) => {
        let index = this.connected_Users.indexOf(clicked_online_user);
        this.connected_Users[index].checked = !this.connected_Users[index].checked
        //console.log("----(((()))): ", this.connected_Users);
        let cam_users = this.connected_Users.filter(item => item.checked);
        resolve(cam_users);
    })
    .then((cam_users) => {
      //remove myself in the list

      this.signalingService.bahave_Sub_set_cam_users(cam_users);
      //console.log("[TOOLBAR ]: cam_selected_users: ", cam_users);
    })
  }

  /*****************************************************************************/
  /*                  CAMERA
  /*****************************************************************************/
  /*emit_camera_status($event){
    this.camera_status = !this.camera_status;
    this.is_camera_on.emit(this.camera_status);
  } */

  /*****************************************************************************/
  /*                 GO BACK TO PROFIL
  /*****************************************************************************/
  emit_bool_onGotoProfil($event:any){
      this.gotoProfil.emit(true);
      //this.router.navigate(['/profile']);
  }

  //---------------------------------------
  //   DRAW UPDATING PREVIEW SHAPE
  //---------------------------------------
  updatePreviewShape(newShape:INewCanvasWhiteboardShape<CanvasWhiteboardShape>):void {
      if (!this.canvas || !newShape) { return; }

      let RectangleDefaultWidth = this.RectangleDefaultWidth;
      let RectangleDefaultHeight = this.RectangleDefaultHeight;
      let CercleRadius = this.CercleRadius;
      let options = this.shapeOptions;

      let context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext("2d");
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      if(newShape.name == "FreeHandShape"){

           (new FreeHandShape(new CanvasWhiteboardPoint(0, 0),
           Object.assign(new CanvasWhiteboardShapeOptions(), options))).drawPreview(context)
         }

         if(newShape.name == "RectangleShape"){

           (new  RectangleShape(new CanvasWhiteboardPoint(0, 0),
             Object.assign(new CanvasWhiteboardShapeOptions(), options),
               RectangleDefaultWidth, RectangleDefaultHeight)).drawPreview(context)
           }

           if(newShape.name == "CircleShape"){
             (new  CircleShape(new CanvasWhiteboardPoint(0, 0),
                 Object.assign(new CanvasWhiteboardShapeOptions(), options), CercleRadius)).drawPreview(context)
           }

           if(newShape.name == "LineShape"){
             (new  LineShape(new CanvasWhiteboardPoint(0, 0),
                 Object.assign(new CanvasWhiteboardShapeOptions(), options))).drawPreview(context)
           }

           if(newShape.name == "StarShape"){
             (new  StarShape(new CanvasWhiteboardPoint(0, 0),
                 Object.assign(new CanvasWhiteboardShapeOptions(), options))).drawPreview(context)
           }

           if(newShape.name == "SmileyShape"){
             (new  SmileyShape(new CanvasWhiteboardPoint(0, 0),
                 Object.assign(new CanvasWhiteboardShapeOptions(), options))).drawPreview(context)
           }
  }


  ngOnDestroy(){
        if(this.all_online_users_subject)
            this.all_online_users_subject.unsubscribe();
  }
  //************************** END *************************/

}
