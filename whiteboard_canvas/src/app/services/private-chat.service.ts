import { Injectable } from '@angular/core';
import { Subject , BehaviorSubject} from 'rxjs';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database'
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
//import { ChatAdapter } from 'ng-chat';

import {  Observable , of} from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';
import { v4 as uuid } from 'uuid';

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
import { User } from '../interfaces/user';
import { User2 } from '../interfaces/user2';



@Injectable({
  providedIn: 'root'
})
export class PrivateChatService {

  constructor(private db:AngularFireDatabase, private userService: UserService,
              private authService: AuthService,private notify: NotifyService,
               private storage: AngularFireStorage,
              private afAuth: AngularFireAuth ,private router: Router) {


              }

  // Chatbox refs
    public CHATBOX_REF = '/chatbox';
    public CHATBOX_CHATS_REF = this.CHATBOX_REF + '/chats';
    public CHATBOX_USERS_REF = this.CHATBOX_REF + '/users' + '/{0}'
    public CHATBOX_USERS_USER_REF = this.CHATBOX_USERS_REF + '/{1}';
    // Chatrooms refs
    public CHATROOMS_REF = '/chatrooms';
    public CHATROOMS_LIST_REF = this.CHATROOMS_REF + '/list';
    public CHATROOMS_LIST_CHATROOM_REF = this.CHATROOMS_LIST_REF + '/{0}'; // Always use this to get reference to chatroom
    public CHATROOMS_CHATROOM_REF = this.CHATROOMS_REF + '/{0}';
    public CHATROOMS_CHATROOM_CHATS_REF = this.CHATROOMS_CHATROOM_REF + '/chats';
    public CHATROOMS_CHATROOM_USERS_REF = this.CHATROOMS_CHATROOM_REF + '/users';
    public CHATROOMS_CHATROOM_USERS_USER_REF = this.CHATROOMS_CHATROOM_USERS_REF + '/{1}';
    // Files refs
    public FILES_REF = '/files';
    public FILES_FILE_REF = this.FILES_REF + '/{0}';


    submitPrivateChat2(chat: PrivateChatMessage, chatUserRef: firebase.database.Reference): void {
        console.debug('Submitting chat to chatbox...')
        //this.db.list(this.CHATBOX_CHATS_REF).push(chat);
        this.db.list(StringFormat.format(this.CHATBOX_USERS_USER_REF, JSON.stringify(chatUserRef))).push(chat);
        //this.setChatUserIsTyping(chatUserRef, false);


    }

    submitPrivateChat(chat: PrivateChatMessage, senderId: string): void {

        console.debug('Submitting chat to chatbox...')
        //this.db.list(StringFormat.format(this.CHATBOX_USERS_USER_REF , JSON.stringify(senderId))).set(chat);
        //var ref = firebase.database().ref(StringFormat.format(this.CHATBOX_USERS_USER_REF, this.adapter.user.uuid));
        firebase.database().ref().child(this.CHATBOX_USERS_REF).child(senderId).child(chat.toId).push(chat);

        console.debug('Submitting chat to  chatbox Succeed ');

    }

    getPrivateChats(fromId:string, toId:string): AngularFireList<PrivateChatMessage> {

        console.debug('Getting chats from chatbox...');
        //return this.db.list(this.CHATBOX_CHATS_REF);
          //return this.db.list(StringFormat.format(this.CHATBOX_USERS_USER_REF, fromId))
          return this.db.list(StringFormat.format(this.CHATBOX_USERS_USER_REF, fromId, toId));
    }




}
