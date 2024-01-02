import { Injectable } from '@angular/core';
import { Subject , BehaviorSubject} from 'rxjs';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {  Observable ,of} from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';

import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';


import { ChatRoom, PublicChatMessage, PublicFileMessage, ChatUser, MessageType, Theme, ParticipantType, ParticipantStatus,FileMessage,
         PrivateChatMessage, DemoAdapter, DemoAdapterPagedHistory,   PrivateChatGroup, IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,
          UserMetadata,  FirebaseUser,  ChatAdapter, ChatRoomLocalization, ParticipantResponse,  ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../models/chat/chat';

import { StringFormat } from '../models/chat/string-format'

import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { UserService } from './user.service';
import { ChatService } from './chat.service';

import * as firebase from 'firebase/app';

import { map } from 'rxjs/operators';

/******************** INTERFACE ********************/
import { User } from '../interfaces/user';
import { User2 } from '../interfaces/user2';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private userId:any;

  user:Observable<firebase.User>
  chatroms_ref:string;
  email:string;
  newChatRoomRef:firebase.database.Reference;

  constructor(private db:AngularFireDatabase,
              private notify: NotifyService,
              private afAuth: AngularFireAuth ,
              private chatService:ChatService,
              private router: Router) {

              afAuth.authState.subscribe((auth: firebase.User) => {
                  if(auth !== undefined && auth !== null ){

                  this.user = afAuth.authState;
                  this.userId = auth.uid;
                  this.email = auth.email;
                }

          })

   }


   /*********************** OTHER UTILS ************************************************/
   addNewChatRoom(name: string): Promise<firebase.database.Reference> {
   console.debug('Checking if chatroom ' + name + ' already exists...');
   return this.chatService.getChatRoomByName(name)
     .then(ref => {
       if (ref) {
         // Activate the existing chatroom and return its reference
         return this.chatService.activateChatRoom(ref, name);
       } else {
         // Create a new chatroom and return its reference
         console.debug('Creating chatroom ' + name + '...');
         return this.chatService.createChatRoom(name);
       }
     });
   }

   /*********************** OTHER UTILS ************************************************/
   addNewChatBox(name: string): Promise<firebase.database.Reference> {
   console.debug('Checking if chatbox ' + name + ' already exists...');
   return this.chatService.getChatBoxByName(name)
     .then(ref => {
       if (ref) {
         // Activate the existing chatroom and return its reference
         return this.chatService.activateChatRoom(ref, name);
       } else {
         // Create a new chatroom and return its reference
         console.debug('Creating chatroom ' + name + '...');
         return this.chatService.createChatRoom(name);
       }
     });
   }


}
