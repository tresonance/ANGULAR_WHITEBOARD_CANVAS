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
                    PrivateChatGroup,PrivateChatLocalization, DemoAdapter, DemoAdapterPagedHistory, IChatOption, IChatParticipant,ChatboxWindow,  IChatGroupAdapter,

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
import * as firebase from 'firebase/app';

import { AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database'
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

import { AngularFireAuth } from 'angularfire2/auth';

import {Observable} from "rxjs/index";
import {fromEvent, Subscription} from "rxjs/index";
import { Subject , BehaviorSubject} from 'rxjs';
import { switchMap, startWith, tap} from 'rxjs/operators';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';

import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {cloneDeep} from "lodash";
import { saveAs } from 'file-saver';
import { take } from 'rxjs/operators';

import { delay } from "rxjs/operators";
import { map, filter } from 'rxjs/operators'

//CONCERN BACK END
import {Handwritting} from '../../../../../src/app/config_backend/handwritting.model';

import { User, UserMoreInfo } from '../../../interfaces/user';
import { User2 } from '../../../interfaces/user2';

const CONFIG:any = {
                    "v":{
                          "iceServers":{
                                          "username":"KgxBn_C_yCldYOknd6lEyWzZY7Ri4UlzAO72I53VUAo9kd0Ri4plqvYCyf7SOc-3AAAAAF4EP_90cmVzb25hbmNl",
                                          "urls":
                                                  [
                                                    "stun:eu-turn3.xirsys.com",
                                                    "turn:eu-turn3.xirsys.com:80?transport=udp",
                                                    "turn:eu-turn3.xirsys.com:3478?transport=udp",
                                                    "turn:eu-turn3.xirsys.com:80?transport=tcp",
                                                    "turn:eu-turn3.xirsys.com:3478?transport=tcp",
                                                    "turns:eu-turn3.xirsys.com:443?transport=tcp",
                                                    "turns:eu-turn3.xirsys.com:5349?transport=tcp"
                                                  ],
                                          "credential":"92a76c62-279d-11ea-bc1f-72c9c257b255"
                                        }
                        },
                        "s":"ok"
              }

const OPTIONS = {
                optional: [
                        {DtlsSrtpKeyAgreement: true},
                        {RtpDataChannels: true}
                ]
            }

interface Window {
    mozRTCPeerConnection?: any;
    webkitRTCPeerConnection?: any;
    mozRTCIceCandidate?: any;
    RTCIceCandidate?: any;
    mozRTCSessionDescription?: any;
    RTCSessionDescription?: any;
}

/*interface Navigator {
    getUserMedia?: any;
    mozGetUserMedia?: any;
    webkitGetUserMedia?: any;
}*/

declare var window: Window;
declare let RTCPeerConnection: any;

var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
navigator.getUserMedia = ( navigator as any).getUserMedia || (navigator as any).mozGetUserMedia || (navigator as any).webkitGetUserMedia;

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})

export class CameraComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('cam_video', {static: false}) private video : ElementRef;
  streamData:any;

  userInfo:UserMoreInfo = null;
  pseudo:string = "";
  userId :firebase.User;
  isLogged:boolean;
  isLoGinObservable : Subscription;

  channel:AngularFireList<any>;
  database: firebase.database.Reference;
  user: firebase.User;
  senderId: string;

//  @ViewChild("me", {static:false}) me: any;
//  @ViewChild("remote", {static:false}) remote: any;

  /****************************************************************************/
  /*                WEB-RTC
  /****************************************************************************/
  NODE_URL:string = 'localhost:3000';

  cam_share_Users:UserMoreInfo[] = [];

  connected_Users:UserMoreInfo[] = [];

  //peer_connection :RTCPeerConnection[] = [];
  @ViewChild("localeVideo", {static: false}) private me : ElementRef;
  @ViewChild("remoteVideo0" ,  {static: false}) private remoteVideo0 : ElementRef;

  //---------------------------------------------------------------------------
  hasStreaming_local : boolean = false;
  hasStreaming_remotes : boolean[] = [];

  //video window popup: boolean
  start_local_video_Subject:Subscription;
  start_local_video:boolean = false;

  //cam selected users socket emit.socket
  cam_selected_users_Subject:Subscription;
  cam_selected_users:UserMoreInfo[] = [];

  socket_joinRequested_subject : Subscription;
  socket_joinRequested: UserMoreInfo;

  all_online_users_subject: Subscription
  all_online_users: UserMoreInfo[] = [];

  socket_rtcMessage_subject:Subscription;
  socket_rtcMessage: any

  socket_connected_to_cam_Requested_Subject:Subscription;
  socket_connected_to_cam_Requested:UserMoreInfo;

  peer_connection:RTCPeerConnection = undefined;
  /*****************************************************************************/

  constructor(private authService: AuthService,
              private persistanceService:PersistanceService,
              private db:AngularFireDatabase,
              private router: Router,
              private chatService:ChatService,
              private signalingService:SignalingService,
              private web_rtcService:WebRTCService) {

   }

    ngOnInit() {
      //---------------------------------------------------------------------------------------------------------------/
      //                                CURRENT-USER  INFOS
      //---------------------------------------------------------------------------------------------------------------/
      this.userInfo = this.persistanceService.get_session(this.authService.storageKey);
      if(!this.userInfo){
          this.authService.logout();
      }
      this.seupWebRTC();
        //this.peer_connection = this.web_rtcService.get_PeerConnection(this.userInfo.uid);

      //---------------------------------------------------------------------------------------------------------------/
      //                               SUBSCRIBE TO SOCKET EVENT
      //---------------------------------------------------------------------------------------------------------------/
      this.socket_connected_to_cam_Requested_Subject = this.signalingService.userConnectedToCamera().subscribe(data => {
          if(data !== undefined){

                  console.log("[CAMERA{socket-userConnected}]: ", data.pseudo);

          }
     }); //END  CONNECTED WEBCAM

      this.socket_joinRequested_subject = this.signalingService.joinRequested().subscribe(data => {
          if(data !== undefined){

                  console.log("[ CAMERA{socket-join} ]: ", data);
                  this.socket_joinRequested = data;

                  // send any ice candidates to the other peer

                  console.log("[ CAMERA{get-Peer-connection}]: ", this.peer_connection);



                  //--------------------------this.web_rtcService.makeOffer(data.local_user, data.remote_user);
          }
    }); //END  JOIN REQUESTED


    this.socket_rtcMessage_subject = this.signalingService.rtcMessageReceived().subscribe(data => {
            if(data !== undefined){

            }

    })

    //---------------------------------------------------------------------------------------------------------------/
    //               BEHAVIOR SUBJECT DATA SHARING  - SOCKET EMITTER
    //---------------------------------------------------------------------------------------------------------------/

      //CAMERA POPOUP
      this.start_local_video_Subject = this.signalingService.bahave_sub_get_cam_popUP_Observable().subscribe( data => {
            this.start_local_video = data ;

            if(this.start_local_video && this.all_online_users && this.all_online_users.length){

                this.showMe();

                this.signalingService.connectUserToCamera(this.userInfo);



            } else {
                    if(this.hasStreaming_local)
                        this.stop();
            }

          })

      //ALL ONLINE USERS
      this.all_online_users_subject = this.chatService.behave_sub_get_all_online_users_Observable().subscribe(data => {
          if(data !== undefined){
                this.all_online_users = data;
                console.log("[CAMERA{online users}] \n", data)
         }
      })


     //CAMERA SELECTED USERS & JOIN
     this.cam_selected_users_Subject = this.signalingService.bahave_sub_get_cam_selected_users_Observable().subscribe( data => {
          if(data !== undefined){
                this.cam_selected_users = data;
                console.log("[CAMERA {cam_selected_users}]: ", this.cam_selected_users);

                if(this.cam_selected_users && this.cam_selected_users.length){
                      this.signalingService.requestForJoin(this.userInfo, this.cam_selected_users);


                      this.cam_selected_users.forEach((remote_user, index) => {
                        //-------------------------------------------------------------


                          this.showRemote();




                        //--------------------------------------------------------------
                              //this.web_rtcService.makeOffer(this.userInfo.uid, remote_user.uid)
                     }, this)

                } //END IF CAM SELECTED USER
         else {  //CAMERA SELECTED USERS IS EMPTY

         }
      } //END IF UNDEFINED
  })
}


  /****************************************************************************************************/


    ngOnChanges(changes:SimpleChanges){

      for(let property in changes){
            if(property === 'cam_share_Users') {

            }
    }
  }

    //--------------------------------------------------------------------------------------/




   showMe() {
      this.hasStreaming_local = true;
      this.web_rtcService.startLocalStream(false, true).then((stream) => {

       let videoElement: HTMLVideoElement;
       videoElement = document.querySelector('#localeVideo') as HTMLVideoElement;
       videoElement.srcObject = stream;
       this.signalingService.connectUserToCamera({pseudo: this.userInfo.pseudo});

          const tracks = stream.getTracks();
          tracks.forEach((track) => this.peer_connection.addTrack(track, stream));
      });
  }

  showRemote() {
   this.peer_connection.createOffer()
   .then(offer => this.peer_connection.setLocalDescription(offer) )
   .then(() => this.sendMessage(this.userInfo.uid, JSON.stringify({'sdp': this.peer_connection.localDescription})) )
   .catch((err) => console.log("error showRemote: ", err));
  }


   stop() {
   this.web_rtcService.stopLocalStream().then(() => {
      let videoElement: HTMLVideoElement;
      videoElement = document.querySelector('#localeVideo') as HTMLVideoElement;
      videoElement.srcObject = null;
      this.signalingService.disconnectUser(this.userInfo);
        this.hasStreaming_local = false;
    });
  };

  seupWebRTC(){
    let channelName = '/webrtc';

    this.channel = this.db.list(channelName);
    this.database = firebase.database().ref(channelName);

    this.database.on("child_added", this.readMessage.bind(this));
    this.peer_connection = new RTCPeerConnection(CONFIG, OPTIONS);

        this.peer_connection.onicecandidate = (event) => {
                      event.candidate ?
                          this.sendMessage(this.userInfo.uid, JSON.stringify({ice:event.candidate}))
                      : console.log("ICE SENT");
                        console.log("ice candidate sent");
                    }

        this.peer_connection.ontrack = (event) => {
           let videoElement = document.querySelector('#remoteVideo0') as HTMLVideoElement;
           videoElement.srcObject = event.streams[0];
        }

        //this.showMe();
        //this.showRemote();
  }


  sendMessage(senderId, data){
      var msg = this.channel.push({

        sender: senderId,
        message: data
        });

        msg.remove();
  }

  readMessage(data) {
   if (!data) return;

      var msg = JSON.parse(data.val().message);
      var sender = data.val().sender;
      if (sender != this.userInfo.uid) {
          if(msg.ice !== undefined){
              this.peer_connection.addIceCandidate(new RTCIceCandidate(msg.ice));
          } else if (msg.sdp.type == "offer"){
            this.peer_connection.setRemoteDescription(new RTCSessionDescription(msg.sdp))
            .then(() => this.peer_connection.createAnswer())
            .then(answer => this.peer_connection.setLocalDescription(answer))
            .then(() => this.sendMessage(this.userInfo.uid, JSON.stringify({'sdp': this.peer_connection.localDescription})));
          } else if (msg.sdp.type == "answer"){
            this.peer_connection.setRemoteDescription(new RTCSessionDescription(msg.sdp));}
      }
  }

   ngAfterViewInit(){

   }


    //----------------------------------------------------------------------------------------/
  ngOnDestroy(){

      this.start_local_video_Subject.unsubscribe();
      this.cam_selected_users_Subject.unsubscribe();
      this.socket_joinRequested_subject.unsubscribe();
      this.all_online_users_subject.unsubscribe();
      this.socket_rtcMessage_subject.unsubscribe();
      this.socket_connected_to_cam_Requested_Subject.unsubscribe();
  }


}
