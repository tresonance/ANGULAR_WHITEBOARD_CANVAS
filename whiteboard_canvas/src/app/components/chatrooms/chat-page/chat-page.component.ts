import { Component, Input, OnInit, OnDestroy, OnChanges ,DoCheck, ViewChildren, ViewChild, HostListener,  SimpleChanges,
          Output, EventEmitter, ElementRef, ViewEncapsulation , SimpleChange, Pipe, PipeTransform} from '@angular/core';

import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

import { PushNotificationsService } from 'ng-push';
import {AuthService} from '../../../services/auth.service';
import {PrivateChatService} from '../../../services/private-chat.service';
import {PersistanceService} from '../../../services/persistance.service';

import { saveAs } from 'file-saver';

import {HttpResponse,  HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';


//import { ChatRoom, PublicChatMessage, FirebaseUser, ChatUser, MessageType,ChatboxWindows,
  //         ChatRoomLocalization, ChatParticipantStatus, Theme  } from '../../../models/chat/chat';

import { ChatRoom, PublicChatMessage, PublicFileMessage, GeneriqueMessage, ChatUser, MessageType, Theme, ParticipantType, ParticipantStatus,FileMessage,FileUpload,
         PrivateChatMessage, DemoAdapter, DemoAdapterPagedHistory,   PrivateChatGroup, IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,
          UserMetadata,  FirebaseUser,  ChatAdapter, ChatRoomLocalization, ParticipantResponse,  ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../../../models/chat/chat';

import { ChatService } from '../../../services/chat.service';
import { NotifyService } from '../../../services/notify.service';
import {UploadFileService} from '../../../services/upload-file.service'

import { AngularFireDatabase, AngularFireList} from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { User,UserMoreInfo } from '../../../interfaces/user';
import { User2 } from '../../../interfaces/user2';

import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { delay } from "rxjs/operators";
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { map, filter } from 'rxjs/operators'
import { catchError, finalize } from 'rxjs/operators';

import { DomSanitizer } from '@angular/platform-browser';
import 'rxjs/add/observable/from';
//import 'rxjs/add/operator/map';

/******************* MANAGE SESSION AND LOCAL STORAGE *************************/
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import { DateFormatPipe } from '../../../models/chat/date-pipe-format';
import { DateTimeFormatPipe } from '../../../models/chat/date-time-pipe-format';
/******************************************************************************
/*LOCAL NBSETTING
/*
/*****************************************************************************/
//import { registerLocaleData } from '@angular/common';
//const localeNlBE: any = require('@angular/common/locales/nl-BE.js');
//registerLocaleData(localeNlBE.default);

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';

registerLocaleData(localeFr, 'fr-FR', localeFrExtra);




/******************************** PRIVATE CHAT ****************/
//import { DomSanitizer } from '@angular/platform-browser';
//import { ChatAdapter } from 'ng-chat';
//import { MyAdapter } from 'my-adapter';

@Pipe({ name: 'dateTimeFormat'})

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
   //pipes: [ dateTimeFormat ]
})

export class ChatPageComponent implements OnInit, OnDestroy {

  private CHATROOM_PREFIX = '#';
  BASE_URL:string = 'http://localhost:4200/#/chatrooms/chat-page';

  /************************************************************************************/
  /*                      NG-CHAT ADAPTER
  /************************************************************************************/
    chatAdapter:DemoAdapter;
    chatUserId:string;
    chatHistoryEnabled:boolean=true;
    chatHistoryPageSize:number=10;
    chatHideFriendsList:boolean=false;

  /********************************************************************************/
  /*                      CHATROOMS - CURRENT CHATROOM
  /*********************************************************************************/
  /*CHATROOM LIST*/
  chatRooms: ChatRoom[];
  /*CURRENT CHATROOM*/
  chatRoom: ChatRoom;
  chatRoomHistories: PublicChatMessage[];
  /*REFERENCES*/
  chatRoomRef: firebase.database.Reference;
  previousChatRoom:ChatRoom=null;
  /********************************************************************************/
  /*                      CHATUSERS - CHATUSER
  /*********************************************************************************/
  /*CURRENT CHATROOM USERS */
  chatRoomChatUsers: ChatUser[];
  chatRoomChatUser: ChatUser;
  /*REFERENCES*/
  uf : FirebaseUser;
  chatRoomChatUserRef: firebase.database.Reference;
  selectedChatRoomUser: ChatUser;

  userInfo: UserMoreInfo = null;
  isLogged:boolean;
  pseudo:string = null;
  /********************************************************************************/
  /*                      PRIVATE CHAT
  /*********************************************************************************/
  privateChatboxHistories: PrivateChatMessage[];
  ONLY_CONNECTED_USERS:boolean = true;

  /**********************************************************************************/
  /*                      INPUT
  /**********************************************************************************/
  text:string;
  clickedParticipant:ParticipantResponse;
  hasJoinThechat:boolean=false;

  /**********************************************************************************/
  /*                      OTHER DATA TYPE
  /**********************************************************************************/
  currentUser:User2;
  message:PrivateChatMessage;
  /**********************************************************************************/
  /*                      INITIALIZER
  /**********************************************************************************/

  chatRoomLocalization:ChatRoomLocalization;
  theme:Theme=Theme.LIGHT;
  customTheme:Theme;
  browserNotificationsEnabled: boolean = true;
  private browserNotificationsBootstrapped: boolean = false;

  /***********************************************************************************/
  /*               UPLOAD FILE - DOWNLOAD FILE
  /***********************************************************************************/
  currentFileUpload:FileUpload;
  uploadProgress:Observable<number>;

  fileUrl : any;
  fileToUpload: File = null;
  progress: { percentage: number } = {percentage: 0};
  @ViewChildren('nativeFileInput') nativeFileInput: ElementRef;
  /************************************************************************************/
  /*                     dynamical css style
  /***********************************************************************************/
  image_width:number;
  image_height:number;

  /*************************************************************************************/
  /*                Unsubscribe
  /*************************************************************************************/
  isLoginObservable:Subscription

  constructor(public sanitizer: DomSanitizer, private chatService: ChatService, private authService:AuthService,
              private uploadService: UploadFileService,private notififyService:NotifyService, private pushNotificationsService: PushNotificationsService ,
              private afStorage:AngularFireStorage, private db:AngularFireDatabase, private localStorage:LocalStorageService,
              private sessionStorageService: SessionStorageService, private privateChatService:PrivateChatService,
              private persistanceService:PersistanceService , private afAuth: AngularFireAuth,
              private httpClient:HttpClient, private router:Router) {
    //super();
    //this.currentUser = JSON.parse(localStorage.getItem('token'));

      //this.user = authService.user;
    this.chatAdapter = new DemoAdapter();


  }

  GetStyle(c) {
     if (typeof c === undefined ) { return null; }
     return  this.sanitizer.bypassSecurityTrustStyle(c);
   }

  ngOnInit() {
    let rooms = this.chatRooms;
    this.isLoginObservable = this.authService.isLoggedIn()
        .subscribe(islogged => this.isLogged = islogged)
    this.userInfo = this.persistanceService.get_session(this.authService.storageKey);

    if(this.isLogged){
        //console.log("forum current session user: ", this.userInfo);
        this.pseudo = this.userInfo['pseudo'];

        this.chatRoomChatUser = new ChatUser(this.userInfo.uid, "", this.userInfo.email,
                                      this.pseudo, this.userInfo.avatar,
                                       ParticipantType.USER, ParticipantStatus.ONLINE);
        this.chatAdapter.user = this.chatRoomChatUser;
    }

    $(document).ready(function(){

          //remove first info div
          $('#id-ok-first-info').on('click', function(e){
              //console.log("you clicked info")
              $('.start-select-forum').hide();
          })

          //fixed navbar while scrolling
          var stickyNavTop = $('.header-container').offset().top;
            var stickyNav = function(){
              var scrollTop = $(ChatboxWindow).scrollTop();
              if (scrollTop > stickyNavTop) {
                $('.header-container').addClass('sticky');
              } else {
                $('.header-container').removeClass('sticky');
              }
            };
            stickyNav();
            $(ChatboxWindow).scroll(function() {
              stickyNav();
            });

      //end document ready
    })


    this.chatService.getChatRooms(true).valueChanges()
      .pipe(take(1))
      .subscribe(chatRooms => {
        // Since the AngularFireList does not actually returns of the typed objects, we need to cast them ourselves
        // See https://github.com/angular/angularfire2/issues/1299
        this.chatRooms = chatRooms.map(chatRoom => ChatRoom.fromData(chatRoom));
        //console.log(this.chatRooms);
      })

      //this.chatAdapter = new DemoAdapter();
      this.initializeDefaultText();
  }



  /******************************************************************************************************************+/
  /*   INITIALIZER PLACEHOLDER - THEME - BROWSER NOTIFICATION
  /*******************************************************************************************************************/
    private initializeDefaultText():void {
      if(!this.chatRoomLocalization){
          this.chatRoomLocalization = {
              title: ' membre',
              selectChatRoomMessage:'Select a forum and start chatting',
              messagePlaceHolder:"Start chatting...",
              isHistoryLoading:false,
              browserNotification: "Bonjour ... Ibrahima",
              searchPlaceholder:'Search',
              flashMessage:'has joined the conversation'
            }
        }
    }



  /******************************************************************************************************************/
  /*  DISCONNECT FROM PREVIOUS CHAT
  /******************************************************************************************************************/
  ngOnChanges(changes: SimpleChanges): void {
   // Only handle changes for chatRoom (for now only chatRoom is monitored)
    let chatRoomChange: SimpleChange = changes.chatRoom;

    if (chatRoomChange) {
      console.log("Simple change: ", chatRoomChange)
      // Make sure it's a ChatRoom object (to be able to use the displayName property)
      this.chatRoom = this.chatRoom instanceof ChatRoom ? this.chatRoom : ChatRoom.fromData(this.chatRoom);
      // Only reload when currentValue != previousValue (on firstChange previousValue is undefined so skip that also)
      if (!chatRoomChange.firstChange && chatRoomChange.currentValue && chatRoomChange.currentValue !== chatRoomChange.previousValue) {
        this.previousChatRoom = ChatRoom.fromData(chatRoomChange.previousValue);
        //this.loadChatComponent(this.chatRoom, previousChatRoom);
      }
    }
      //this.chatAdapter.user = this.chatRoomChatUser;

  }

    /*************************************************************************
    /*  get chatRoomChatUserRef
    /*************************************************************************/
    private loadChatComponent(chatRoom: ChatRoom, previousChatRoom: ChatRoom = null): void {
    // Disconnect from previously connected chatroom/chatbox
    this.chatService.disconnectUser(this.chatRoomChatUserRef, this.chatRoomChatUser, previousChatRoom)
      .then(() => {
        // Connect to chatroom/chatbox
        this.chatService.connectUser(this.chatRoomChatUser, chatRoom)
          .then(ref => {
            this.chatRoomChatUserRef = ref;
            // Load data
            this.loadChatRoomChatHistories(chatRoom);
            if(this.ONLY_CONNECTED_USERS)
                  this.loadConnectedChatRoomChatUsers(chatRoom);
            else
                  this.loadAllChatRoomChatUsersInsideChats(chatRoom);
            /*if (chatRoom) {
              console.log('Chat loaded for chatroom ' + chatRoom.displayName);
            } else {
              console.log('Chat loaded for chatbox');
            }*/
          });
      });
   }

   /***************************************************************************
   /* LOAD  CHATS HISTORY AND CHAT USERS
   /***************************************************************************/

   private loadChatRoomChatHistories(chatRoom:ChatRoom): void{
      this.chatService.getChats(chatRoom).valueChanges()
          .pipe(take(1))
          .subscribe(chats => {
               // Make sure it's a list of Chat objects and sort them to have the latest first
               if(typeof chats !== undefined && chats !== null){
                    //reverse pour ke les messages recents soient en haut
                    this.chatRoomHistories = chats.map(chat => GeneriqueMessage.fromData(chat)).reverse();
              }
        })

   }


   private loadAllChatRoomChatUsersInsideChats (chatRoom:ChatRoom):void{
      this.chatService.getAllChatUsers(chatRoom).valueChanges()
      .pipe(
          take(1),
          map((users: ChatUser[]) => {
               this.chatRoomChatUsers = users.map((user:ChatUser) => {
                 return new ChatUser(this.chatRoomChatUser.uuid, this.chatRoomChatUser.groupUuid,  user.email, user.name, user.avatar , user.type, user.status);
               })
           })
      ).subscribe(() => {

        this.chatAdapter.friendsList = this.chatRoomChatUsers;
          this.chatAdapter.friendsList = this.chatAdapter.friendsList.filter((item , index, self) => self.indexOf(item) === index);
        //this.chatAdapter.friendsList = this.chatRoomChatUsers;
        //this.chatRoomChatUsers = [];
      })

        /*  .subscribe(chats => {   console.log("users from extrate to", chats);
             if(typeof chats === undefined || !chats){
                console.log("chatUsers list is  undefined")
                return;
              }
            this.chatRoomChatUsers = chats.map(chat => ChatUser.fromData(chat.user)).sort((chat1, chat2) => chat1.user.email < chat2.user.email ? -1 : chat1.user.email> chat2.user.email? 1 : 0);

              this.chatAdapter.friendsList = this.chatRoomChatUsers;

           })*/

       }

       private loadConnectedChatRoomChatUsers(chatRoom:ChatRoom):void{
          this.chatService.getConnectedChatUsers(chatRoom).valueChanges()
              .pipe(take(1))
              .subscribe(chatUsers => {
                 if(typeof chatUsers === undefined || !chatUsers){
                    console.log("chatUsers list is  undefined")
                    return;
                  }
                this.chatRoomChatUsers = chatUsers.map(chatUser => ChatUser.fromData(chatUser)).sort((user1, user2) => user1.name< user2.name ? -1 : user1.name > user2.name? 1 : 0);
                // Filter which users are typing (exluding current user)c
                  this.chatAdapter.friendsList = this.chatRoomChatUsers;

               })

           }


    /***********************************************************************************
    /* TEMPLATE NGCLASS UTILS
    /***********************************************************************************/
    isChatRoomJoined(chatRoom: ChatRoom): boolean {
        return this.chatRoom && this.chatRoom.name === chatRoom.name;
    }

  /***********************************************************************************
  /* WHEN SELECT A CHAT ROOM: WE DISCONNECT FROM PREVIOUS ROOM, LOAD USERS AND HISTORY
  /***********************************************************************************/
  selectChatRoom(chatRoom:ChatRoom){
      this.chatRoom = chatRoom;
      //this.loadChatComponent(chatRoom);
      this.loadChatComponent(this.chatRoom, this.previousChatRoom);
      //this.chatAdapter.getFriends(this.chatRoomChatUsers);
        this.hasJoinThechat = true;
      setTimeout(() => {
            this.hasJoinThechat = false;
      }, 2000);
      //console.log("clicked chat: ", this.chatRoom);
  }

    getFormattedDate():string{
      let date = new Date();

      let year = date.getFullYear();
      let month = date.getMonth();
      let date_ = date.getDate();

      let hour = date.getHours();
      let min = date.getMinutes();

      let monthsName = ["Jan", "Fev", "Mars", "Avr", "May", "Jun", "July", "Agust", "Sept", "Nov", "Dec"];
      let month_ = monthsName[month - 1];

      let time = `${hour}` + "H"+ `${min}` + "  /   " +`${date_}` + " "+ `${month_}` + " "+ `${year}`;

      return time;
    }

    submitChatText(event:any){

      let time = this.getFormattedDate();

      if(this.chatRoomChatUser && this.text){
            let chatMessage = new PublicChatMessage(this.chatRoomChatUser, time, this.text, MessageType.TEXT);

            //console.log("reffff: ", this.chatRoomChatUserRef);
            //(user: ChatUser, timestamp: Date, messageType: MessageType, message: string, downloadUrl: string = null) {
            this.chatService.submitChat(chatMessage,  this.chatRoomChatUserRef,  this.chatRoom);
            console.log("chat inserted in chatroom: ", this.chatRoom.name);
        }
          this.text = '';
    }


    isTyping(): void {
    if (this.text) {
      this.chatService.setChatUserIsTyping(this.chatRoomChatUserRef, true);
    } else {
      this.chatService.setChatUserIsTyping(this.chatRoomChatUserRef, false);
    }
  }

/*******************************************************************************************/
/*                      OUTPUT FROM  CHILD COMPONENT
/*******************************************************************************************/
  privateChatBoxReceiveMessage($event) {
    this.message = $event;
    //this.privateChatService.submitPrivateChat(this.message, this.chatRoomChatUser.uuid);
    console.log("you sent this message from child component", this.message);
  }

  /*loadPrivateChatHistory($event){
      this.clickedParticipant = $event;
      this.privateChatService.getPrivateChats(this.chatRoomChatUser.uuid, this.clickedParticipant.participant.uuid).valueChanges()
        .pipe(take(1))
        .subscribe(histories => {
          this.chatAdapter.histories = histories.map(hist => PrivateChatMessage.fromData(hist));
          //console.log("after click, i receive: ", this.chatAdapter.histories);
        })
  }*/

  privateChatBoxClosed($event){
    console.log("you close this chat box from child component: ", $event);
  }



        /************************************************************************/
        /*   CHAT MESSAGE TYPE
        /*************************************************************************/
        isMessageChat(chat: PublicChatMessage): boolean {
            return chat.messageType === MessageType.TEXT;
        }

        isImageChat(chat: PublicChatMessage): boolean {
          return chat.messageType === MessageType.IMAGE;
        }

        isFileChat(chat: PublicChatMessage): boolean {
          return chat.messageType === MessageType.FILE;
        }

        isVideoChat(chat: PublicChatMessage): boolean {
          return chat.messageType === MessageType.VIDEO;
        }

        fileType($event:any):MessageType {

              if(!$event || !$event.target.files){
                  console.log("no files selected: this is a message");
                  return MessageType.TEXT;

              }

              const file = $event.target.files[0];

              console.log("file[ype] : ", file['type']);

              let type = file['type'].split('/')[0];

              return ( type === 'image') ? MessageType.IMAGE : ( type === 'video') ? MessageType.VIDEO : MessageType.FILE;
        }

        /************************************************************************/
        /* UPLOAD FILE
        /************************************************************************/
        uploadFile2($event:any) {
          let files:FileList = $event.target.files;

    this.fileToUpload = files.item(0);
    var reader = new FileReader();
    this.readAsText(this.fileToUpload, function (response) {
      let layout = JSON.parse(response);
      console.log(layout);
    });
  }

  readAsText(file, callback) {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsText(file);
  }


  uploadFile($event:any){

      //const file:File = this.nativeFileInputs.nativeElement.files[0];


      const randomId = this.userInfo['uid'];

      let ref = this.afStorage.ref(randomId);
      let time = this.getFormattedDate();


      //INFO SUR FILES
      let file_name = $event.target.files[0].name;
      let  file_type = $event.target.files[0].type; //this will give as example 'image/png'
      let size = Math.round($event.target.files[0].size / 1000);
      let modifiedDate = $event.target.files[0].lastModifiedDate;

      let file = $event.target.files[0];

      this.currentFileUpload = new FileUpload(file);

      //file width and height for css style
      let fr = new FileReader();
      fr.onload = () => { // when file has loaded
          var img = new Image();
          img.onload = () => { console.log("imagsize: ", img.width)
            this.image_width = img.width > 500 ? 500 : img.width;
            this.image_height = img.height > 400 ? 400 : img.height;
          };
        }

        file_type = this.fileType($event);
        this.uploadService.pushPublicFileMessageToStorage(this.currentFileUpload, this.chatRoomChatUser, time, file_type, size, this.progress, (err, fileMessage) => {
            if(!err){
              this.chatService.submitChat(fileMessage,  this.chatRoomChatUserRef,  this.chatRoom);
              //this.nativeFileInput.nativeElement.value = '';
              $event.target.value = '';
            }

            if(err){

              $event.target.value = '';
              //this.nativeFileInput.nativeElement.value = '';
                console.log(err);
              // TODO: Invoke a file upload adapter error here
          }
})
}




      public getSantizeUrl(url : string) {
            //return this.sanitizer.bypassSecurityTrustResourceUrl(url);
            return this.sanitizer.bypassSecurityTrustResourceUrl(url)

        }



        logOut($event:any){
            $event.preventDefault();
            this.authService.logout();
        }

        /***********************************************************************/
        /*                    download  file                                */
        /**********************************************************************/



        downloadUrlImage(url: string, fileName: string) {
          let a: any = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.style = 'display: none';
          a.click();
          a.remove();
        };


      downloadFile(chatMsg:PublicFileMessage){

        const httpOptions = {
          responseType: 'blob' as 'json',
          headers: new HttpHeaders({

            'responseType': 'blob'
          })
      };
          this.httpClient.get(chatMsg.downloadUrl, httpOptions)
            .pipe(take(1))
            .subscribe(val => {
            console.log(val);
            let url = URL.createObjectURL(val);
            this.downloadUrlImage(url, chatMsg.file_name);
            URL.revokeObjectURL(url);
          });
      }


      ngOnDestroy(){
        this.isLoginObservable.unsubscribe();
      }

}
