import { Injectable } from '@angular/core';
import { Subject , BehaviorSubject} from 'rxjs';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database'
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

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
import { User, UserMoreInfo } from '../interfaces/user';
import { User2 } from '../interfaces/user2';


@Injectable({
  providedIn: 'root'
})

export class ChatService {

    currentUser:User2;
    private userId: any;
    currentUsers:Observable<any[]>
    isAuthenticated:boolean;
    user: Observable<firebase.User>
    chatRoom:ChatRoom;
    chatRoomName:string;
    name:string;
    email:string;
    chatUser:ChatUser;
    chatMessages:AngularFireObject<any[]>;
     private subject = new Subject<any>();

     //Users list
        public USERS = '/users';

     // Chatbox refs
       public CHATBOX_REF = '/chatbox';
       public CHATBOX_CHATS_REF = this.CHATBOX_REF + '/chats';  /*                         */
       public CHATBOX_USERS_REF = this.CHATBOX_REF + '/{0}';
       public CHATBOX_USERS_USER_REF = this.CHATBOX_USERS_REF + '/{0}';
       // Chatrooms refs
       public CHATROOMS_REF = '/chatrooms';
       public CHATROOMS_LIST_REF = this.CHATROOMS_REF + '/list';  /* /chatrooms/list  */
       public CHATROOMS_LIST_CHATROOM_REF = this.CHATROOMS_LIST_REF + '/{0}'; /* /chatrooms/list/uuid*/ // Always use this to get reference to chatroom
       public CHATROOMS_CHATROOM_REF = this.CHATROOMS_REF + '/{0}';
       public CHATROOMS_CHATROOM_CHATS_REF = this.CHATROOMS_CHATROOM_REF + '/chats';
       public CHATROOMS_CHATROOM_USERS_REF = this.CHATROOMS_CHATROOM_REF + '/users';
       public CHATROOMS_CHATROOM_USERS_USER_REF = this.CHATROOMS_CHATROOM_USERS_REF + '/{1}';
       // Files refs
       public FILES_REF = '/files';
       public FILES_FILE_REF = this.FILES_REF + '/{0}';

       /************** BEHAVIOR SUBJECT - ONLY THIS SERVICE CAN MODIFY PATH ******************/
       //chatRooms ref
       chatRoomRef = new BehaviorSubject<string>('hello');
       chatRoomListRef = new BehaviorSubject<string>('hi');
       chatRoomListChatRoomRef = new BehaviorSubject<string>('hello');
       chatRoomsChatRoomRef =  new BehaviorSubject<string>('hello');
       chatRoomsChatRoomChatsRef = new BehaviorSubject<string>('hi');
       chatRoomsChatRoomUsersRef = new BehaviorSubject<string>('hi');
       chatRoomsChatRoomUsersUserRef = new BehaviorSubject<string>('hi');

       online_users_Subject = new BehaviorSubject<UserMoreInfo[]>(this.get_online_users());
       online_users:UserMoreInfo[] = []

    constructor(private db:AngularFireDatabase, private userService: UserService,
                private authService: AuthService,private notify: NotifyService,
                 private storage: AngularFireStorage,
                private afAuth: AngularFireAuth ,private router: Router) {

                      this.user = this.authService ? this.authService.user : null;


                }



      /*********************** OTHER UTILS ************************************************/
      startChatRoom(name: string): Promise<firebase.database.Reference> {
      console.debug('Checking if chatroom ' + name + ' already exists...');
      return this.getChatRoomByName(name)
        .then(ref => {
          if (ref) {
            // Activate the existing chatroom and return its reference
            return this.activateChatRoom(ref, name);
          } else {
            // Create a new chatroom and return its reference
            console.debug('Creating chatroom ' + name + '...');
            return this.createChatRoom(name);
          }
        });
    }

    getChatRoomByName(name: string): Promise<firebase.database.Reference> {
      return this.db.database.ref(this.CHATROOMS_LIST_REF).orderByChild('name').equalTo(name)
        .once('value')
        .then(snapshot => {
          if (snapshot.exists()) {
            // Chatroom found, return chatroom reference
            console.debug('Chatroom ' + name + ' found');
            let uuid = Object.keys(snapshot.val())[0]; // uuid is the key under which the chatroom has been stored!
            return this.db.database.ref(StringFormat.format(this.CHATROOMS_LIST_CHATROOM_REF, uuid));
          } else {
            // Chatroom doesn't exist
            console.debug('Chatroom ' + name + ' not found');
            return null;
          }
        });
    }

    getChatBoxByName(name: string): Promise<firebase.database.Reference> {
      return this.db.database.ref(this.CHATBOX_CHATS_REF).orderByChild('name').equalTo(name)
        .once('value')
        .then(snapshot => {
          if (snapshot.exists()) {
            // Chatroom found, return chatroom reference
            console.debug('Chatbox ' + name + ' found');
            let uuid = Object.keys(snapshot.val())[0]; // uuid is the key under which the chatroom has been stored!
            return this.db.database.ref(StringFormat.format(this.CHATROOMS_LIST_CHATROOM_REF, uuid));
          } else {
            // Chatroom doesn't exist
            console.debug('Chatroom ' + name + ' not found');
            return null;
          }
        });
    }

    getChatRoomByUuid(uuid: string): Promise<firebase.database.Reference> {
      return Promise.resolve(this.db.database.ref(StringFormat.format(this.CHATROOMS_LIST_CHATROOM_REF, uuid)));
    }

    createChatRoom(chatRoomName: string = null): Promise<firebase.database.Reference> {
      // Create chatroom
      let chatRoomRef = this.db.database.ref(this.CHATROOMS_LIST_REF).push();
      let uuid = chatRoomRef.key;
      let chatRoom = new ChatRoom(uuid, chatRoomName);
      return chatRoomRef.set(chatRoom)
        .then(() => {
          console.debug('Chatroom ' + chatRoomName + ' created');
          // Push welcome message
            //this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, uuid))
              //.push(new PublicChatMessage(null, new Date(), MessageType.MESSAGE, 'Chatroom ' + chatRoom.name));
          // Return chatroom reference
          return chatRoomRef;
        });
    }

    activateChatRoom(chatRoomRef: firebase.database.Reference, name: string): Promise<firebase.database.Reference> {
      // Ativate chatroom
      return chatRoomRef
        .update({ active: true })
        .then(() => {
          console.debug('Activating chatroom ' + name + '...');
          return chatRoomRef;
        });
    }

    getChatRooms(active?: boolean): AngularFireList<ChatRoom> {
      // We keep a list of chatroom uuids to prevent the loading of all chatrooms
      if (active === undefined) {
        // Fetch all
        return this.db.list(this.CHATROOMS_LIST_REF);
      } else {
        // Fetch based on active flag
        return this.db.list(this.CHATROOMS_LIST_REF, ref => ref.orderByChild('active').equalTo(active));
      }
    }

    getChats(chatRoom: ChatRoom = null): AngularFireList<PublicChatMessage> {
      if (chatRoom) {
        console.debug('Getting chats from chatroom ' + chatRoom.name + '...');
        return this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, chatRoom.uuid));
      } else {
        console.debug('Getting chats from chatbox...')
        return this.db.list(this.CHATBOX_CHATS_REF);
      }
    }

    submitChat(chat: any, chatUserRef: firebase.database.Reference, chatRoom: ChatRoom = null): void {
      if (chatRoom) {
        console.debug('Submitting chat to chatroom ' + chatRoom.uuid + '...');
        this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, chatRoom.uuid)).push(chat);
        this.setChatUserIsTyping(chatUserRef, false);
      } else console.debug('Submitting chat  failed ');
    }

    connectUser(chatUser: ChatUser, chatRoom: ChatRoom = null): Promise<firebase.database.Reference> {
      if (chatRoom) {
        let chatRoomUserRef = this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_USER_REF, chatRoom.uuid, chatUser.uuid));
        // Remove user on disconnect (to handle real disconnects like killing browser, ...)
        chatRoomUserRef.onDisconnect().remove();
        // Connect user to chatroom if not already done
        return chatRoomUserRef
          .once('value', snapshot => {
            if (!snapshot.exists()) {
              console.debug('Connecting user ' + chatUser.name + ' to chatroom ' + chatRoom.name + '...');
              chatRoomUserRef.set(chatUser);
            }
          })
          .then(snapshot => Promise.resolve(chatRoomUserRef));
      } else {
        let chatBoxUserRef = this.db.database.ref(StringFormat.format(this.CHATBOX_USERS_USER_REF, chatUser.uuid));
        // Remove user on disconnect
        chatBoxUserRef.onDisconnect().remove();
        let chatBoxUserRef_ = chatBoxUserRef;
        // Connect user to chatbox if not already done
        return chatBoxUserRef
          .once('value', snapshot => {
            if (!snapshot.exists()) {
              console.debug('Connecting user ' + chatUser.name + ' to chatbox...');
              //chatBoxUserRef_.set(chatUser);
            }
          })
          .then(() => Promise.resolve(chatBoxUserRef));
      }
    }

    disconnectUser(chatUserRef: firebase.database.Reference, chatUser: ChatUser, chatRoom: ChatRoom = null): Promise<any> {
      if (chatUserRef) {
        if (chatRoom) {
          console.debug('Disconnecting user ' + chatUser.name + ' from chatroom ' + chatRoom.name + '...');
          // Remove user from chatroom and handle chatroom status
          return chatUserRef.remove(() => this.handleChatRoomStatus(chatRoom));
        } else {
          console.debug('Disconnecting user ' + chatUser.name + ' from chatbox...');
          // Remove user from chatbox
          return chatUserRef.remove();
        }
      }
      // No need to disconnect since we weren't connected before
      return Promise.resolve(null);
    }

    private handleChatRoomStatus(chatRoom: ChatRoom) {
      console.debug('Handling status of chatroom ' + chatRoom.name + '...');
      this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_REF, chatRoom.uuid))
        .once('value', snapshot => {
          if (!snapshot.exists()) {
            // Deactivate chatroom if no more users are connected
            console.debug('Deactivating chatroom ' + chatRoom.name + '...')
            this.db.database.ref(StringFormat.format(this.CHATROOMS_LIST_CHATROOM_REF, chatRoom.uuid))
              .update({ 'active': false });
          }
        });
    }

    setChatUserIsTyping(chatUserRef: firebase.database.Reference, isTyping: boolean = false) {
      chatUserRef.update({ isTyping: isTyping });
    }

    getConnectedChatUsers(chatRoom: ChatRoom = null): AngularFireList<ChatUser> {
      if (chatRoom) {
            console.debug('Getting chat users in chatroom ' + chatRoom.name + '...');
            return  this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_REF, chatRoom.uuid));
      } else {
        console.debug('Getting chat users in chatbox...')
            return this.db.list(this.CHATBOX_USERS_REF);
       }
    }



    getAllChatUsers(chatRoom:ChatRoom=null):AngularFireList<ChatUser>{
        if(chatRoom){
            console.debug('Getting chats users from chatroom ' + chatRoom.name + '...');
            return this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_REF, chatRoom.uuid));
        } else {
          console.debug('Getting chat users in chatbox...')
          return this.db.list(this.CHATBOX_USERS_REF);
        }
    }

    uploadFile(file: File, userId:string): AngularFireUploadTask {
      let filePath = StringFormat.format(this.FILES_FILE_REF, userId);
      return this.storage.upload(filePath, file);
    }


  // By default we'll mark the chatroom as not active when we are disconnecting
  // But we also listen to changes on the 'active' field of the chatroom
  // If someone else disconnects and marks the chatroom as not active, we are activating it only when we are still connected to it
  /*private handleChatRoomStatus(chatRoomRef: firebase.database.Reference): void {
    // Deactivate chatroom if we are no longer connected
    chatRoomRef.onDisconnect().update({ 'active': false });
    chatRoomRef.on('value', snapshot => {
      let chatRoom = ChatRoom.fromData(snapshot.val());
      // Only keep it active when we are currently in the chatroom
      if (this.chatRoom && this.chatRoom.uuid === chatRoom.uuid && !chatRoom.active) {
        console.debug('Keeping chatroom ' + chatRoom.name + ' active...');
        snapshot.ref.update({ 'active': true });
      }
    });
  }*/

      getChatUserFromFirebase(user:firebase.User): ChatUser{
            let name = user.displayName ? user.displayName : '';
          //return new ChatUser(user.uuid, user.name, user.avatar, user.email,  user.type, user.status);
            let fbUser = new FirebaseUser(user.uid, user.email, name);
            return  new ChatUser(fbUser.uuid, null,  fbUser.email,
                                                fbUser.name, null,
                                                 ParticipantType.USER, ParticipantStatus.ONLINE);
      }

      //ONLINE USERS

      fetch_online_users():  Observable<UserMoreInfo[]>{
        let usersRef = this.db.database.ref('/users')
        let conntected_Users:UserMoreInfo[] = [];

        usersRef.orderByChild("status").equalTo("ONLINE").once("value").then(function(snapshots){


                snapshots.forEach(function (childSnap) {
                  //console.log("In Service, I Fetch online: ", childSnap.val());

                    conntected_Users.push({
                      uid:  childSnap.key,
                      birth: childSnap.val().birth,
                      classe: childSnap.val().class,
                      email:childSnap.val().email,
                      pseudo:childSnap.val().pseudo ,
                      avatar:childSnap.val().avatar ,
                      status: childSnap.val().status,
                    })
                })

                //return Promise.resolve(conntected_Users);
                //return of(conntected_Users);
          })
          return of(conntected_Users)
     }

     setOnline_users(online_users){
          this.online_users_Subject.next(online_users)
     }

     get_online_users(){
       return this.online_users;
     }

     behave_sub_get_all_online_users_Observable(){
       return this.online_users_Subject.asObservable();
     }

  }
