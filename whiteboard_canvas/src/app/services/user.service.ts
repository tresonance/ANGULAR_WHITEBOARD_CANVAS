import { Injectable } from '@angular/core';
import { Subject , BehaviorSubject} from 'rxjs';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {  Observable , of} from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';

import { ChatRoom, PublicChatMessage, PublicFileMessage, ChatUser, MessageType, Theme, ParticipantType,
        ParticipantStatus,FileMessage, PrivateChatMessage, DemoAdapter, DemoAdapterPagedHistory,   PrivateChatGroup,
        IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,UserMetadata,  FirebaseUser,  ChatAdapter, ChatRoomLocalization,
        ParticipantResponse,  ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../models/chat/chat';


import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';

import * as firebase from 'firebase';

import { map } from 'rxjs/operators';

/******************** INTERFACE ********************/
import { User } from '../interfaces/user';
import { User2 } from '../interfaces/user2';


interface LogData {
    uid:string;
    email: string;
}

@Injectable({
  providedIn:'root'
})
export class UserService {
  private user: Observable<firebase.User>;
  private currentUser = ( new BehaviorSubject<User2>(null)).asObservable;

  currentUsers:Array<User2>
  private userId:any;

  private loggedStatus = JSON.stringify(localStorage.getItem('emailForSignIn')) ||  null;

  constructor(private db:AngularFireDatabase, private authService: AuthService, private notify: NotifyService, private afAuth: AngularFireAuth ,private router: Router) {
        /*this.afAuth.authState.subscribe(auth => {
            if(auth !== undefined && auth !== null ){
              //this.userId = user.uid;
              this.user = auth;
            }
        })*/

        //this.getUser();
        //this.getUsers()
        //this.userId = this.authservice.getCurrentUserId();
        this.user = authService.user;

   }

   /*getUser(): void{
        if(this.user !== undefined && this.user !== null){
            const userId = this.user.uid;
            const path = `users/${userId}`;

            this.db.object(path).valueChanges()
            .subscribe(user  => {
                if(user !== undefined && user !== null){
                  this.currentUser = (<User2>user);
                    console.log("Current User: ",  this.currentUser);
                 } else console.log("sorry")
            })
        } else {
            this.currentUser = null;
        }

   }*/


   getUsers(){
      const path = '/users';
      return this.db.list(path);
   }

  /*getCurrentUser(): any {
      this.afAuth.authState.switchMap(u => {
         if(u != null && u != undefined ){
              return this.db.object(`users/${u.uid}`).valueChanges()

          } else {
            return null
          }
        })
  }*/

  /****************************************************************************
  * Use local storage to access the more-info1 protected route after the user
  * clicked the email confirmation link
  * ...... again this hemp us to protect root
  *****************************************************************************/
  isLoggedIn(){
      return localStorage.getItem('emailForSignIn') ||  this.loggedStatus;
  }


  /****************************************************************************
  * usefull in chat online members, it tells us if user is login
  * the previous method or this one are almost the same
  *****************************************************************************/
  setUserStatus(){
      if(this.user !== undefined && !this.user ){
          const userId = this.authService.currentUserID;
          const path = `users/${userId}`;
          const data = {
          status : 'online'
        }
    }

  }

  /*getCurrentUserWithPromise() {
    return new Promise<any>((resolve, reject) => {
      const currentUser = firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          resolve(user);
        } else {
          reject('No user logged in');
        }
      });
    });
  }*/

  /*updateCurrentUser(value) {
    return new Promise<any>((resolve, reject) => {
      const user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: value.name,
        photoURL: user.photoURL
      }).then(res => {
        resolve(res);
      }, err => reject(err));
    });
  }*/
}
