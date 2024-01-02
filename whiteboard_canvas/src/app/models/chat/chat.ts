import {DateFormatPipe } from './date-pipe-format'
import { DateTimeFormatPipe}  from './date-time-pipe-format'

import { delay } from "rxjs/operators";
import { Observer } from 'rxjs/Rx';
import 'rxjs/add/observable/fromPromise';

import {PrivateChatService} from '../../services/private-chat.service';

import { HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';

import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch' ;
import { StringFormat } from './string-format'

registerLocaleData(localeFr, 'fr-FR', localeFrExtra);

/*******************************************************************************/
/*                                    ENUM
/*******************************************************************************/
export enum MessageType {
  TEXT = "TEXT",
  FILE = "FILE",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO"
}

export enum Theme {
  LIGHT= 'LIGHT-THEME',
  DARK =  'DARK-THEME',
  CUSTOM ='CUSTOM-THEME'
}

export enum ParticipantStatus
{
  ONLINE = 'ONLINE',
  BUSY = 'BUSY',
  AWAY = 'AWAY',
  OFFLINE = 'OFFLINE'
}

export enum ParticipantType
{
    USER = "USER",
    GROUP = "GROUP"
}

export enum ScrollDirection {
    TOP,
    BOTTOM
}

/******************************************************************************/
/*                        Localization
/*******************************************************************************/
export interface StatusDescription
{
    online: string;
    busy: string;
    away: string;
    offline: string;
    [key: string]: string;
}

export interface ChatRoomLocalization {
  title:string;
  selectChatRoomMessage:string;
  messagePlaceHolder:string;
  isHistoryLoading:boolean;
  browserNotification: string;
  searchPlaceholder:string;
  flashMessage:string;
}

export interface PrivateChatLocalization
{
    title: string;
    messagePlaceholder: string;
    searchPlaceholder: string;
    //statusDescription: StatusDescription;
    browserNotificationTitle: string;
    loadMessageHistoryPlaceholder: string;
}

export interface IChatOption
{
    isActive: boolean;
    displayLabel: string
    action: (chattingTo: ChatboxWindow) => void;
    validateContext: (participant: IChatParticipant) => boolean;
}

/*******************************************************************************/
/*                                    ChatRoom
/*******************************************************************************/

export class ChatRoom {
  uuid: string;
  name: string;
  active: boolean;

  // In case the name is empty, we consider it a private chatroom
  constructor(uuid: string, name: string = null, active: boolean = true) {
    this.uuid = uuid;
    this.name = name;
    this.active = active;
  }

  // Helper method to construct the ChatRoom object from a json object (with same object interface)
    static fromData(chatRoomData: ChatRoom) {
      return new ChatRoom(chatRoomData.uuid, chatRoomData.name, chatRoomData.active);
    }
}

/*******************************************************************************/
/*                              Messages Public
/*******************************************************************************/
export interface IMessage{
    user : ChatUser;
    dateSent : string;
    messageType: MessageType;
    message: string;
}

export class PublicChatMessage implements IMessage{
  user: ChatUser;
  dateSent : string;
  messageType: MessageType;
  message: string;
  upladFile:PublicFileMessage;

  constructor(user: ChatUser, dateSent: any , message: string, messageType: MessageType = MessageType.TEXT) {
    this.user = user;
    this.dateSent = typeof dateSent === 'string' ? dateSent : new DateTimeFormatPipe('fr-FR').transform(dateSent);
    this.messageType = messageType;
    this.message = message;
  }

  // Helper method to construct the Chat object from a json object (with same object interface)
    static fromData(msg: PublicChatMessage) {
    // The chatUser is empty for welcome messages!
      let chatUser = msg.user ? ChatUser.fromData(msg.user) : null;
    return new PublicChatMessage(chatUser, msg.dateSent, msg.message, msg.messageType);
  }

}

export class PublicFileMessage extends PublicChatMessage implements IMessage {
  user: ChatUser;
  dateSent : string;
  messageType: MessageType;
  downloadUrl:string;
  fileSizeInBytes:number;
  file_name:string;

  constructor(user: ChatUser, dateSent: any, messageType: MessageType = MessageType.FILE,
  downloadUrl:string, fileSizeInBytes:number, file_name:string) {

    super(user, dateSent, "", messageType);
    this.downloadUrl = downloadUrl;
    this.fileSizeInBytes  = fileSizeInBytes;
    this.file_name = file_name;
  }

  // Helper method to construct the Chat object from a json object (with same object interface)
    static fromData(msg: PublicFileMessage) {
    // The chatUser is empty for welcome messages!
      let chatUser = msg.user ? ChatUser.fromData(msg.user) : null;
    return new PublicFileMessage(chatUser, msg.dateSent, msg.messageType, msg.downloadUrl, msg.fileSizeInBytes, msg.file_name);
  }

}

/*******************************************************************************/
/*                              Private Messages
/*******************************************************************************/

export class PrivateChatMessage {
  fromId :string;
  groupId: string;
  toId: string;
  uuid:string;

  dateSent : string;
  dateSeen: string;
  messageType: MessageType;
  message: any;
  downloadUrl:string;
  fileSizeInBytes:number;

  constructor(fromId:string, groupId:string ,toId: string, uuid:string,  dateSent: any , message: string, messageType: MessageType = MessageType.TEXT, dateSeen: string = '', downloadUrl:string=null, fileSizeInBytes:number=0) {
    //let pipeVar = new dateTimeFormat()
    this.fromId = fromId;
    this.groupId =  groupId;
    this.toId = toId;
    this.uuid = uuid;
    this.dateSent = typeof dateSent === 'string' ? dateSent : new DateTimeFormatPipe('fr-FR').transform(dateSent);
    this.dateSeen = typeof dateSeen === undefined || dateSeen === null || typeof dateSeen === 'string'  ? dateSeen  : new DateTimeFormatPipe('fr-FR').transform(dateSeen);
    //this.timestamp = this.pipe.transform(timestamp, 'short');

    this.messageType = messageType;
    this.message = message;
    this.downloadUrl = downloadUrl;
    this.fileSizeInBytes = fileSizeInBytes;

  }

    static messageSeen(dateNow:Date):string {
      return new DateTimeFormatPipe('fr-FR').transform(dateNow);
  }

  // Helper method to construct the Chat object from a json object (with same object interface)
    static fromData(msg: PrivateChatMessage) {
        return new PrivateChatMessage(msg.fromId, msg.groupId, msg.toId, msg.uuid, msg.dateSent,
          msg.message, msg.messageType, msg.dateSeen, msg.downloadUrl, msg.fileSizeInBytes);
    }

}

/******************************************************************************/
/*                            GENERIQUES MESSAGES FOR CHAT HISTORIES
/******************************************************************************/


export class GeneriqueMessage  extends PublicFileMessage implements IMessage {



  constructor(user: ChatUser, dateSent: any , message_text: string, messageType:MessageType, downloadUrl:string=null, fileSizeInBytes:number=null, file_name:string=null) {

    super(user, dateSent, messageType, downloadUrl, fileSizeInBytes, file_name);

  }

  // Helper method to construct the Chat object from a json object (with same object interface)
    static fromData(msg: any):any {

    // The chatUser is empty for welcome messages!
      let chatUser = msg.user ? ChatUser.fromData(msg.user) : null;
      if(msg.messageType === MessageType.TEXT){

        return new PublicChatMessage(chatUser, msg.dateSent, msg.message, msg.messageType);
      } else {
        return new PublicFileMessage(chatUser, msg.dateSent, msg.messageType, msg.downloadUrl, msg.fileSizeInBytes, msg.file_name);
      }
  }

}

/******************************************************************************/
/*                            ChatUser
/******************************************************************************/

export interface IChatParticipant {
    participantType: ParticipantType;
    uuid: string;
    participantStatus: ParticipantStatus;
    avatar: string|null;
    name: string;
    email: string;
}

export class ParticipantResponse{
    participant:IChatParticipant;
    //group:PrivateChatGroup;
    metadata: UserMetadata;
}

export class UserMetadata
{
    public totalUnreadMessages: number = 0;

}

export class FirebaseUser {
  uuid:string;
  groupUuid:string;
  email: string;
  name:string;

      constructor (uuid:string, groupUuid:string, email:string, displayName:string=null){
      this.uuid = uuid;
      this.groupUuid = groupUuid;
      this.email = email;
      this.name = displayName;
    }

 }

export class ChatUser extends FirebaseUser {

  avatar: string;
  status: ParticipantStatus;
  type: ParticipantType;
  metadata: UserMetadata;

      constructor(uuid:string, groupUuid:string, email:string,  name:string, avatar:string=null, type:ParticipantType=ParticipantType.USER ,
      status:ParticipantStatus=ParticipantStatus.ONLINE, metadata:UserMetadata= new UserMetadata()) {
    // call the base class constructor
    super(uuid, groupUuid, email, name);
    this.avatar = avatar;
    this.status = status;
    this.type = type;
    this.metadata = metadata;
   }

  // Helper method to construct the ChatUser object from a json object (with same object interface)
    static fromData(chatUserData: ChatUser): ChatUser {
    return new ChatUser(chatUserData.uuid,chatUserData.groupUuid ,chatUserData.email, chatUserData.name, chatUserData.avatar,  chatUserData.type, chatUserData.status, chatUserData.metadata);
  }
}

  /*export class ChatUser extends ChatUser
  {
      public participant: IChatParticipant;
      public metadata: ParticipantMetadata;
  }*/

  /*******************************************************************************/
  /*                            GROUP
  /*******************************************************************************/

  export class PrivateChatGroup
  {
      constructor(participantsResponse :ParticipantResponse[], currentUser:ChatUser , avatar:string=null, email:string=null)
      {

          this.chattingTo = participantsResponse;

          this.currentUser = {participantType: ParticipantType.GROUP,
                              uuid: currentUser.uuid,
                              participantStatus:ParticipantStatus.ONLINE,
                              avatar: currentUser.avatar,
                              name:currentUser.name,
                              email:currentUser.email} as IChatParticipant;
          this.participantStatus = ParticipantStatus.ONLINE;
          this.participantType = ParticipantType.GROUP;

          this.groupUuid = '';
          this.name = '';

          this.avatar = avatar;

          //let sortedParticipants;
          let name = [];

          //sortedParticipants = participantsResponse.sort((obj1, obj2) => obj2.participant.name > obj1.participant.name);
          if(participantsResponse.length == 1){
              this.groupUuid = `${currentUser.uuid}`.concat(`${currentUser.uuid}`);
              this.name = [currentUser.name, currentUser.name].join(', ');

            }  else {
              participantsResponse.forEach(user => {

                name.push(user.participant.name)
                this.groupUuid = `${this.groupUuid}`.concat(`${user.participant.uuid}`);
                }) ;

                this.name = name.sort((first, second) => second > first ? -1 : 1).join(", ");
          }

          //participantsResponse.forEach(user => {

          //  this.uuid = this.uuid.concat(user.participant.uuid)});

        //  this.email =  participants.map(user => user.email).sort((first, second) => second > first ? -1 : 1).join(", ");


          // TODO: Add some customization for this in future releases
          //this.name = participants.map((p) => p.name).sort((first, second) => second > first ? -1 : 1).join(", ");
      }

      //public id: string = Guid.newGuid();


      public chattingTo: ParticipantResponse[];
      public currentUser: IChatParticipant;
      //public readOnly participantType: ParticipantType = ParticipantType.GROUP ;
      public groupUuid: string = '';
      public participantType: ParticipantType;
      public participantStatus: ParticipantStatus;
      public avatar: string;
      public name: string;

  }

/******************************************************************************/
/*                            ChatboxWindow
/*******************************************************************************/

export class ChatboxWindow
{
    constructor(participant: IChatParticipant , isLoadingHistory: boolean, isCollapsed: boolean,  group:PrivateChatGroup = null)
    {

        this.participant = participant ;
        this.messages =  [];
        this.isLoadingHistory = isLoadingHistory;
        this.hasFocus = false; // This will be triggered when the 'newMessage' input gets the current focus
        this.isCollapsed = isCollapsed;
        this.hasMoreMessages = false;
        this.historyPage = 0;
        this.group = group;
    }

    public participant: IChatParticipant;
    public messages: PrivateChatMessage[] = [];
    public newMessage?: string = "";
    public group:PrivateChatGroup;

    // UI Behavior properties
    public isCollapsed?: boolean = false;
    public isLoadingHistory: boolean = false;
    public hasFocus: boolean = false;
    public hasMoreMessages: boolean = true;
    public historyPage: number = 0;
}

/*************************************************************************************************/
/*                                  ABSTRACT CHAT ADAPTER
/*************************************************************************************************/


export abstract class ChatAdapter
{

    // ### Abstract adapter methods ###
    public abstract listFriends(): Observable<ParticipantResponse[]> ;

    public abstract getMessageHistory(destinataryId: any): Observable<PrivateChatMessage[]>;

    public  abstract sendMessage(message: PrivateChatMessage):void;


    // ### Adapter/Chat income/ingress events ###

    public onFriendsListChanged(participantsResponse: ParticipantResponse[]): void
    {
        this.friendsListChangedHandler(participantsResponse);
    }

    public onMessageReceived(participantResponse: ParticipantResponse, message: PrivateChatMessage): void
    {
        this.messageReceivedHandler(participantResponse, message);
    }

    // Event handlers
    friendsListChangedHandler: (participantsResponse: ParticipantResponse[]) => void  = (participantsResponse: ParticipantResponse[]) => {};
    messageReceivedHandler: (participantResponse: ParticipantResponse, message: PrivateChatMessage) => void = (participantResponse: ParticipantResponse, message: PrivateChatMessage) => {};
}


export interface IChatGroupAdapter
{
    groupCreated(group: PrivateChatGroup): void;
}




export abstract class PagedHistoryChatAdapter extends ChatAdapter
{
    //public abstract PagedHistoryChatAdapter(chatRoomChatUser: ChatUser);
    abstract getMessageHistoryByPage(destinataryId: string, size: number, page: number) : Observable<PrivateChatMessage[]>;
}



/******************************************************************************/
/*                            PRIVATE FILE  Message
/******************************************************************************/

export class FileUpload {

    key?: string;
    name?: string;
    url?: string;
    file: File;

    constructor(file:File){
        this.file = file;
    }
}

export class FileMessage extends PrivateChatMessage
{

  constructor(fromId:string, groupId:string=null, toId:string=null, uuid:string=null, dateSent: any , message: string,
    messageType: MessageType = MessageType.FILE, dateSeen:string="", downloadUrl, fileSizeInBytes) {
      super(fromId, groupId, toId, uuid,  dateSent , message,  MessageType.FILE, dateSeen, downloadUrl, fileSizeInBytes);

        //this.downloadUrl  = downloadUrl;
        //this.fileSizeInBytes = fileSizeInBytes;
    }

    //public downloadUrl: string;
    public mimeType: string;
    //public fileSizeInBytes: number = 0;
}




export interface IFileUploadAdapter
{
    uploadFile(file: File, participantId: any):Observable<PrivateChatMessage>;
}

export class DefaultFileUploadAdapter implements IFileUploadAdapter
{

    /*constructor(fromId:string, groupId:string, toId:string, uuid:string, dateSent:string, message:string, messageType:MessageType = MessageType.FILE, dateSeen:string){
        super(fromId, groupId,toId, uuid, dateSent, message, messageType, dateSeen);
    }*/
    constructor(private _serverEndpointUrl: string, private _http: HttpClient) {
    }

    uploadFile(file: File, participantId: any): Observable<PrivateChatMessage> {
        const formData: FormData = new FormData();

        //formData.append('ng-chat-sender-userid', currentUserId);
        formData.append('ng-chat-participant-id', participantId);
        formData.append('file', file, file.name);

        return this._http.post<PrivateChatMessage>(this._serverEndpointUrl, formData);

        // TODO: Leaving this if we want to track upload progress in detail in the future. Might need a different Subject generic type wrapper
        // const fileRequest = new HttpRequest('POST', this._serverEndpointUrl, formData, {
        //     reportProgress: true
        // });

        // const uploadProgress = new Subject<number>();
        // const uploadStatus = uploadProgress.asObservable();

        //const responsePromise = new Subject<Message>();

        // this._http
        //     .request(fileRequest)
        //     .subscribe(event => {
        //         // if (event.type == HttpEventType.UploadProgress)
        //         // {
        //         //     const percentDone = Math.round(100 * event.loaded / event.total);

        //         //     uploadProgress.next(percentDone);
        //         // }
        //         // else if (event instanceof HttpResponse)
        //         // {

        //         //     uploadProgress.complete();
        //         // }
        //     });
    }
}


/*****************************************************************************************************************/
/*   DEMO ChatAdapter
/******************************************************************************************************************/
export class DemoAdapter extends ChatAdapter   /*implements IChatGroupAdapter */
{
      // Chatbox refs
        public CHATBOX_REF = '/chatbox';
        public CHATBOX_CHATS_REF = this.CHATBOX_REF + '/chats';
        public CHATBOX_USERS_REF = this.CHATBOX_REF + '/users';
        public CHATBOX_USERS_USER_REF = this.CHATBOX_USERS_REF + '/{0}';

        public user:ChatUser = null;
        public friendsList:ChatUser[] = [];
        public clickedUser:ChatUser = null;
        public histories : PrivateChatMessage[] = [];

        //private firebaseApp: firebase.app.App;
        private firebaseDB: firebase.database.Database;



        constructor(){
          super();
            this.firebaseDB = firebase.database();
        }


        //ABSTRACT METHOD  DEFINITION;

         public listFriends():Observable<ParticipantResponse[]>{
              return of(this.friendsList.map(user => {
                    let participantResponse = new ParticipantResponse()
                    participantResponse.participant = {

                      participantType: user.type,
                      uuid: user.uuid,
                      participantStatus: user.status,
                      avatar:user.avatar ,
                      name: user.name ,
                      email:user.email

                    };
                    participantResponse.metadata = new UserMetadata()

                    return participantResponse;
              }))
         }


    getMessageHistory(destinataryId: string ): Observable<PrivateChatMessage[]> {
        //let historyRef = this.firebaseDB.ref( StringFormat.format( this.CHATBOX_USERS_USER_REF, this.user.uuid, destinataryId) );
        //this.histories.push(new PrivateChatMessage(msg.user, msg.toId, msg.dateSent, msg.message, msg.messageType, msg.dateSeen));
        var stream = new Observable<PrivateChatMessage[]>(
            ( observer: Observer<PrivateChatMessage[]> ) : Function => {

                //var ref = this.firebaseDB.ref( StringFormat.format( this.CHATBOX_USERS_USER_REF, this.user.uuid, destinataryId) );
                //var ref = this.firebaseDB.ref('/chatbox/users/' + `${this.user.uuid}` + '/' +  `${destinataryId}`);
                  //var ref = this.firebaseDB.ref().child(this.CHATBOX_USERS_REF).child(this.user.uuid).child(destinataryId);
                  var key = this.user.uuid < destinataryId ? this.user.uuid+'_'+destinataryId : destinataryId+'_'+this.user.uuid;
                  var ref = this.firebaseDB.ref().child(this.CHATBOX_USERS_REF).child(key);

                var eventHandler = ref.on(
                    "value",
                    ( snapshot: firebase.database.DataSnapshot ) : void => {

                        var messages: PrivateChatMessage[] = [];

                        // If there are no messages, just emit an empty collection.
                        if ( ! snapshot.exists() ) { observer.next( messages ); return; }
                      snapshot.forEach(
                            ( messageSnapshot: firebase.database.DataSnapshot ) : boolean => {

                                let msg = messageSnapshot.val();
                                messages.push(new PrivateChatMessage(msg.fromId, msg.groupId, msg.toId, msg.uuid, msg.dateSent, msg.message, msg.messageType, msg.dateSeen, msg.downloadUrl, msg.fileSizeInBytes));

                                return( false );

                      })
                        observer.next( messages );
                    });
                function teardown() : void {
                    ref.off( "value", eventHandler );
                    ref = eventHandler = null;
                }
                return( teardown );
            });
            return( stream );
}


  sendMessage(message: PrivateChatMessage): void {
        //this.db.list(StringFormat.format(this.CHATBOX_USERS_USER_REF, JSON.stringify(this.user.uuid))).push(message)
        //  var msgRef = this.firebaseDB.ref('/chatbox/users/' + `${this.user.uuid}` + '/' +  `${destinataryId}`).push()
        let fromId = message.fromId;
        let toId = ('' == message.groupId || null == message.groupId) ? message.toId : message.groupId;

        //let toId = message.user.uuid;
        //this.firebaseDB.ref().child(this.CHATBOX_USERS_REF).child(fromId).child(toId).push(message);

        //var newMessageKey = this.firebaseDB.ref('/'+this.CHATBOX_USERS_REF +'/'+fromId+'/'+toId).push().key;
        var key = this.user.uuid < message.toId ? this.user.uuid+'_'+message.toId : message.toId+'_'+this.user.uuid;
        var newMessageKey = this.firebaseDB.ref('/'+this.CHATBOX_USERS_REF +'/'+key).push().key

        var updates = {};
        message.uuid = newMessageKey;
        updates['/'+this.CHATBOX_USERS_REF +'/'+key+'/'+ newMessageKey] = message;
        this.firebaseDB.ref().update(updates)
            .then(() => console.log("Private Message save to database chatbox"))
            .catch(err => console.error("Cannot save private message to database chatBox", err));

          //PrivateChatService.submitPrivateChat(message,  chatRoomChatUserRef,  null);
    }


        groupCreated(group: PrivateChatGroup): void {
          /*DemoAdapter.mockedParticipants.push(group);

          DemoAdapter.mockedParticipants = DemoAdapter.mockedParticipants.sort((first, second) =>
          second.displayName > first.displayName ? -1 : 1
        );

        // Trigger update of friends list
        this.listFriends().subscribe(response => {
        this.onFriendsListChanged(response);
      });*/
    }



}


/************************************* DEMO ChatAdapter WITH HISTORY ***********************************************************/
export class DemoAdapterPagedHistory extends PagedHistoryChatAdapter /*implements IChatGroupAdapter */
{
      public db:AngularFireDatabase;
      // Chatbox refs
      public CHATBOX_REF = '/chatbox';
      public CHATBOX_CHATS_REF = this.CHATBOX_REF + '/chats';
      public CHATBOX_USERS_REF = this.CHATBOX_REF + '/users';
      public CHATBOX_USERS_USER_REF = this.CHATBOX_USERS_REF + '/{0}';

      public user:ChatUser = null;
      public friendsList:ChatUser[] = [];
      public clickedUser:ChatUser = null;
      public histories : PrivateChatMessage[] = [];

      //  public abstract getFriends(chatRoomChatUsers:ChatUser[]):void;
      //public  abstract getSelectedUser(clickedUser : ChatUser):void;

      //private firebaseApp: firebase.app.App;
      private firebaseDB: firebase.database.Database;



      constructor(){
        super();
          this.firebaseDB = firebase.database();
      }

      public listFriends():Observable<ParticipantResponse[]>{
        return of(this.friendsList.map(user => {
              let participantResponse = new ParticipantResponse()
              participantResponse.participant = {

                participantType: user.type,
                uuid: user.uuid,
                participantStatus: user.status,
                avatar:user.avatar ,
                name: user.name ,
                email:user.email
              };
              participantResponse.metadata = user.metadata;
              return participantResponse;
            }))
      }



      getMessageHistory(destinataryId: string ): Observable<PrivateChatMessage[]> {
        //let historyRef = this.firebaseDB.ref( StringFormat.format( this.CHATBOX_USERS_USER_REF, this.user.uuid, destinataryId) );
        //this.histories.push(new PrivateChatMessage(msg.user, msg.toId, msg.dateSent, msg.message, msg.messageType, msg.dateSeen));
        var stream = new Observable<PrivateChatMessage[]>(
            ( observer: Observer<PrivateChatMessage[]> ) : Function => {

                //var ref = this.firebaseDB.ref( StringFormat.format( this.CHATBOX_USERS_USER_REF, this.user.uuid, destinataryId) );
                //var ref = this.firebaseDB.ref('/chatbox/users/' + `${this.user.uuid}` + '/' +  `${destinataryId}`);
                  //var ref = this.firebaseDB.ref().child(this.CHATBOX_USERS_REF).child(this.user.uuid).child(destinataryId);
                  var key = this.user.uuid < destinataryId ? this.user.uuid+'_'+destinataryId : destinataryId+'_'+this.user.uuid;
                  var ref = this.firebaseDB.ref().child(this.CHATBOX_USERS_REF).child(key);

                var eventHandler = ref.on(
                    "value",
                    ( snapshot: firebase.database.DataSnapshot ) : void => {

                        var messages: PrivateChatMessage[] = [];

                        // If there are no messages, just emit an empty collection.
                        if ( ! snapshot.exists() ) { observer.next( messages ); return; }
                      snapshot.forEach(
                            ( messageSnapshot: firebase.database.DataSnapshot ) : boolean => {

                                let msg = messageSnapshot.val();
                                messages.push(new PrivateChatMessage(msg.fromId, msg.groupId, msg.toId, msg.uuid, msg.dateSent, msg.message, msg.messageType, msg.dateSeen, msg.downloadUrl, msg.fileSizeInBytes));

                                return( false );

                      })
                        observer.next( messages );
                    });
                function teardown() : void {
                    ref.off( "value", eventHandler );
                    ref = eventHandler = null;
                }
                return( teardown );
            });
            return( stream );
  }


  sendMessage(message: PrivateChatMessage): void {
    //this.db.list(StringFormat.format(this.CHATBOX_USERS_USER_REF, JSON.stringify(this.user.uuid))).push(message)
    //  var msgRef = this.firebaseDB.ref('/chatbox/users/' + `${this.user.uuid}` + '/' +  `${destinataryId}`).push()
    let fromId = message.fromId;
    let toId = ('' == message.groupId || null == message.groupId) ? message.toId : message.groupId;

    //let toId = message.user.uuid;
    //this.firebaseDB.ref().child(this.CHATBOX_USERS_REF).child(fromId).child(toId).push(message);

    //var newMessageKey = this.firebaseDB.ref('/'+this.CHATBOX_USERS_REF +'/'+fromId+'/'+toId).push().key;
    var key = this.user.uuid < message.toId ? this.user.uuid+'_'+message.toId : message.toId+'_'+this.user.uuid;
    var newMessageKey = this.firebaseDB.ref('/'+this.CHATBOX_USERS_REF +'/'+key).push().key

    var updates = {};
    message.uuid = newMessageKey;
    updates['/'+this.CHATBOX_USERS_REF +'/'+key+'/'+ newMessageKey] = message;
    this.firebaseDB.ref().update(updates)
        .then(() => console.log("Private Message save to database chatbox"))
        .catch(err => console.error("Cannot save private message to database chatBox", err));

      //PrivateChatService.submitPrivateChat(message,  chatRoomChatUserRef,  null);

    }


    /*
    groupCreated(group: Group): void {
      DemoAdapter.mockedParticipants.push(group);

      DemoAdapter.mockedParticipants = DemoAdapter.mockedParticipants.sort((first, second) =>
      second.displayName > first.displayName ? -1 : 1
    );

    // Trigger update of friends list
    this.listFriends().subscribe(response => {
    this.onFriendsListChanged(response);
  });
    }
*/



    getMessageHistoryByPage(destinataryId: any, size: number, page: number) : Observable<PrivateChatMessage[]> {
       let startPosition: number = (page - 1) * size;
       let endPosition: number = page * size;
        let mockedHistory: PrivateChatMessage[] =  this.histories.slice(startPosition, endPosition);

        return of(mockedHistory.reverse()).pipe(delay(5000));
    }


    PagedHistoryChatAdapter(chatRoomChatUser: ChatUser){

    }

    /*groupCreated(group: Group): void {
       DemoAdapter.mockedParticipants.push(group);

       DemoAdapter.mockedParticipants = DemoAdapter.mockedParticipants.sort((first, second) =>
           second.displayName > first.displayName ? -1 : 1
       );

       // Trigger update of friends list
       this.listFriends().subscribe(response => {
           this.onFriendsListChanged(response);
       });
   }   */
}

/*******************************************************************************************/
/*                            DEFAULT STYLES
/*******************************************************************************************/
export const DEFAULT_STYLES = `
.canvas_whiteboard_button {
    display: inline-block;
    outline: 0px;
    padding-top: 7px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
}
.canvas_whiteboard_buttons {
    z-index: 3;
}
@media (max-width: 400px) {
     .canvas_whiteboard_buttons {
            position: absolute;
            z-inde
            top: 0;
            width: 100%;
            text-align: center;
      }
}

@media (min-width: 401px) {
    .canvas_whiteboard_buttons {
        position: absolute;
        right: 0%;
        color: #fff;
    }
}
.canvas_whiteboard_buttons {
    padding: 5px;
}
.canvas_whiteboard_buttons > button {
    margin: 5px;
}
.canvas_whiteboard_button-draw_animated {
    -webkit-animation: pulsate 1s ease-out;
    -webkit-animation-iteration-count: infinite;
}
@-webkit-keyframes pulsate {
    0% {
        -webkit-transform: scale(0.1, 0.1);
        opacity: 0.0;
    }
    50% {
        opacity: 1.0;
    }
    100% {
        -webkit-transform: scale(1.2, 1.2);
        opacity: 0.0;
    }
}
.canvas_wrapper_div {
    width: 100%;
    height: 100%;
    border: 0.5px solid #e2e2e2;
}
.canvas_whiteboard_button-clear {
    padding-top: 5px;
}
.canvas_whiteboard {
    position: absolute;
    z-index: 1;
}
.incomplete_shapes_canvas_whiteboard {
    position: absolute;
    z-index: 2;
}
`;
