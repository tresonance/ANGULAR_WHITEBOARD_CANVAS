import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database'
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

import {  Observable , of,  from ,Subject , BehaviorSubject} from  'rxjs';
import 'rxjs/add/operator/map';
import { Socket } from 'ng-socket-io';

import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import * as Rx from "rxjs/Rx";

import { v4 as uuid } from 'uuid';

import { HttpClient } from '@angular/common/http';

//import { v4 as uid } from 'uid';



import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { AuthService} from './auth.service';
import { UserService} from './user.service';
import { SignalingService } from './signaling.service'


import { ChatRoom, PublicChatMessage, PublicFileMessage, ChatUser, MessageType, Theme, ParticipantType,
        ParticipantStatus,FileMessage, PrivateChatMessage, DemoAdapter, DemoAdapterPagedHistory,   PrivateChatGroup,
        IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,UserMetadata,  FirebaseUser,  ChatAdapter, ChatRoomLocalization,
        ParticipantResponse,  ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../models/chat/chat';



import { StringFormat } from '../models/chat/string-format'

import * as firebase from 'firebase/app';

import { map } from 'rxjs/operators';
/******************** INTERFACE ********************/
import { User, UserMoreInfo } from '../interfaces/user';
import { User2 } from '../interfaces/user2';

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

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {

  private localStream : MediaStream;
  private remoteStream : MediaStream;

  private connected: boolean;
  private mediaConstraints:  MediaStreamConstraints = { audio: true, video: true }

  private peerConnections = {}


  constructor(private signalingService:SignalingService) {}

  startLocalStream(audio: boolean, video: boolean): Promise<MediaStream> {
    // obtains and displays video and audio streams from the local mic and webcam

    let constraints: MediaStreamConstraints = {};
    constraints.audio = audio;
    constraints.video = video;

    let promise = navigator.mediaDevices.getUserMedia(constraints);

    promise.then((stream) => {
      console.log('Started streaming from getUserMedia.');
      this.localStream = stream;
    }, (error) => {
      console.log('Streaming error: ' + error);
    });

    return promise;
  }




    //---------------------------------------------------------------------------------
    //                          STOP LOCAL STREAM
    //---------------------------------------------------------------------------------
    stopMediaStream(stream): Promise<null> {
   return new Promise<null>((resolve, reject) => {
     if (stream) {
       stream.getTracks().forEach(track => {
         console.log('Stopped streaming ' + track.kind + ' track from getUserMedia.');
         track.stop()

       });
     }
   });
 }

 stopLocalStream(): Promise<null> {
    return this.stopMediaStream(this.localStream);
    return   Promise.resolve(null)
 }

 stopRemoteStream(id:string): Promise<null> {
    return Promise.resolve(null)
  }

 //--------------------------------------------------------------------------------------/
 //                         UTILS
 //---------------------------------------------------------------------------------------/
 closeConnectionAndStreams(local_user_id:string, remote_user_id:string) {
    // turn off connection

  }

  rtcMessageReceived() {

  }
  //END
}
