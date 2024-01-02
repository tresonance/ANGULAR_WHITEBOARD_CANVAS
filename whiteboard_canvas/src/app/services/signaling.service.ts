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



@Injectable({
  providedIn: 'root'
})
export class SignalingService {

  //-------------------------------------------------------------------------
  //                    SIBLING DATA EXCHANGE
  //--------------------------------------------------------------------------

      isCamPopUp_Open_Subject = new BehaviorSubject<boolean>(this.get_cam_popUp_state())
      private isCamPopUp_Open:boolean = false;

      cam_selected_users_Subject = new BehaviorSubject<UserMoreInfo[]>(this.get_cam_selected_users());
      cam_selected_users:UserMoreInfo[] = []

  //-------------------------------------------------------------------------
  constructor(private socket: Socket) { }

    //--------------------------------------------------------------------------
    //                            CANVAS SNCHRONIZE
    //--------------------------------------------------------------------------
    //SEND DATA
    sendMessage(eventName:string, data: any, callback: Function) {
      this.socket.emit(eventName, data, callback)
    }
    //RECEIVE DATA
    getMessage(eventName: string, callback:Function) {
      return this.socket.on(`${eventName}`, callback);//.map(data => data);
    }


    //--------------------------------------------------------------------------
    //                            CONNECT TO PROFILE
    //--------------------------------------------------------------------------
    //One a User connect
    connectUserToProfile(user: any) {
      this.socket.emit('connectUser-profile', user);
    }
    //server broadcast for ser connect
    userConnectedToProfile() {
      return this.socket.fromEvent<any>('userConnected-profile');
    }

    //--------------------------------------------------------------------------
    //             OIN REMOTE_USER FOR VIDEO - BOARDS COMPONENTS
    //--------------------------------------------------------------------------
    //web rtc user connect with
    requestForJoin(local_user: UserMoreInfo, remote_users: UserMoreInfo[]) {
      this.socket.emit('requestForJoin', { 'local_user': local_user, 'remote_users': remote_users });
    }
    joinRequested() {
    return this.socket.fromEvent<any>('joinRequested');
   }


    //--------------------------------------------------------------------------
    //                           PEER VIDEO  - BOARDS COMPONENT
    //--------------------------------------------------------------------------
    sendRtcMessage(data:any) {
      this.socket.emit('sendRtcMessage', JSON.stringify(data));
    }
    rtcMessageReceived() {
      return this.socket.fromEvent<any>('rtcMessageReceived');
    }

    //--------------------------------------------------------------------------
    //                            CONNECT TO CAMERA
    //--------------------------------------------------------------------------
    //One a User connect
    connectUserToCamera(user: any) {
      this.socket.emit('connectUser-camera', user);
    }
    //server broadcast for ser connect
    userConnectedToCamera() {
      return this.socket.fromEvent<any>('userConnected-camera');
    }


    //--------------------------------------------------------------------------
    //                            DIS-CONNECT TO CAMERA
    //--------------------------------------------------------------------------
    //DISCONNECT
    disconnectUser(user: UserMoreInfo) {
      this.socket.emit('disconnectUser', user);
    }
    //Broadcast for user disconnect
    userDisconnected() {
      return this.socket.fromEvent<any>('userDisconnected');
    }


    close() {
      this.socket.disconnect();
    }

    //------------------------------------------------------------------------------------------------//
    //                            SIBLING SHARE DATA
    //-------------------------------------------------------------------------------------------------//

    //CAM POPUP
    bahave_Sub_set_cam_popUp(data:boolean){
      this.isCamPopUp_Open_Subject.next(data);

    }
    get_cam_popUp_state(): boolean{
      //console.log("service: get sibling: ", this.siblingShareData);
      return this.isCamPopUp_Open;
    }

    bahave_sub_get_cam_popUP_Observable() : Observable<boolean> {
      return this.isCamPopUp_Open_Subject.asObservable();
    }

    //CAM SELECTED USERS
    bahave_Sub_set_cam_users(data:UserMoreInfo[]){
      this.cam_selected_users_Subject.next(data);
    }

    get_cam_selected_users():UserMoreInfo[]{
      return this.cam_selected_users;
    }

    bahave_sub_get_cam_selected_users_Observable():Observable<UserMoreInfo[]>
    {
       return this.cam_selected_users_Subject.asObservable();
    }

}
