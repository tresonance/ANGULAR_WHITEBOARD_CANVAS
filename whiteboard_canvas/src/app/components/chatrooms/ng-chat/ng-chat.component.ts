import { Component, Input, OnInit, OnDestroy, OnChanges ,DoCheck, ViewChildren, ViewChild, HostListener,  SimpleChanges,
          Output, EventEmitter, ElementRef, ViewEncapsulation , Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
//import { ChatAdapter } from 'ng-chat';
//import { ChatAdapter } from 'ng-chat';


import { ChatRoom, PublicChatMessage, ChatUser, MessageType, Theme, ParticipantType, ParticipantStatus, FirebaseUser,UserMetadata,FileUpload,
          PrivateChatGroup,PrivateChatLocalization, DemoAdapter, DemoAdapterPagedHistory, IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,
        ChatAdapter,  PrivateChatMessage, ParticipantResponse, DefaultFileUploadAdapter, ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../../../models/chat/chat';

import { HttpClient } from '@angular/common/http';

import {DateFormatPipe } from '../../../models/chat/date-pipe-format'
import { DateTimeFormatPipe}  from '../../../models/chat/date-time-pipe-format'
//import {Localization, StatusDescription} from '../../../interfaces/private-chat';

import {AuthService} from '../../../services/auth.service';
import {PrivateChatService} from '../../../services/private-chat.service';


import { ChatService } from '../../../services/chat.service';
import { UploadFileService } from '../../../services/upload-file.service'
import { NotifyService } from '../../../services/notify.service';
import { PersistanceService } from '../../../services/persistance.service';


import { AngularFireDatabase, AngularFireList} from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { User, UserMoreInfo } from '../../../interfaces/user';
import { User2 } from '../../../interfaces/user2';
import { StringFormat } from '../../../models/chat/string-format'

import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import 'rxjs/add/observable/from';
//import 'rxjs/add/operator/map';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/catch' ;
import { filter } from 'rxjs/operator/filter';

//import { map } from 'rxjs/operator/map';
//Object.assign(Actions.prototype, {  map, filter, catch, from });

@Component({
  selector: 'app-ng-chat',
  templateUrl: './ng-chat.component.html',
  //styleUrls: ['./ng-chat.component.scss'],
  styleUrls: [
       './assets/icons.css',
       './assets/loading-spinner.css',
       './assets/ng-chat.component.default.css',
       './assets/themes/ng-chat.theme.default.scss',
       './assets/themes/ng-chat.theme.dark.scss'
   ],
   //encapsulation: ViewEncapsulation.None
})

export class NgChatComponent implements OnInit, OnDestroy {

  // Chatbox refs
    public CHATBOX_REF = '/chatbox';
    public CHATBOX_CHATS_REF = this.CHATBOX_REF + '/chats';  /*                         */
    public CHATBOX_USERS_REF = this.CHATBOX_REF + '/users';
    public CHATBOX_USERS_USER_REF = this.CHATBOX_USERS_REF + '/{0}';
    /********************************************************************************/
    /*                      CHATROOM and CHATUSER
    /*********************************************************************************/
    @Input()
      chatRoom: ChatRoom;
    @Input()
      chatUsers: ChatUser[];
    @Input()
        ContainerCustomStyle: string;

      selectedchatUser: ChatUser;
      chatUser: ChatUser;
      chatUserRef : firebase.database.Reference;

    /************************************************************************************/
    /*                      NG-CHAT ADAPTER - GROUPADAPTER
    /************************************************************************************/
    @Input()
      adapter:DemoAdapter;
    @Input()
       groupAdapter: IChatGroupAdapter;
    @Input()
      userId:string;
    @Input()
      historyEnabled:boolean;
    @Input()
      historyPageSize:number;
    @Input()
      hideFriendsList:boolean;
    /************************************************************************************/
    /*                    OUTPUT EVENT EMITTER
    /************************************************************************************/
    @Output()
    public onParticipantClicked: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

    @Output()
    public onParticipantChatOpened: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

    @Output()
    public onParticipantChatClosed: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

    @Output()
    public onMessagesSeen: EventEmitter<PrivateChatMessage[]> = new EventEmitter<PrivateChatMessage[]>();

    //@Output()
    //public messageEvent = new EventEmitter<PrivateChatMessage>();
    //@Output()
    //public historyEvent = new EventEmitter<ParticipantResponse>();
    /************************************************************************************/
    /*                      INITIALIZER
    /************************************************************************************/
    /*THEME*/
    theme:Theme = Theme.LIGHT;
    customTheme:Theme;
    /*LOCALIZATION*/
    localization:PrivateChatLocalization;
    /*BROWSER NOTIFICATION*/
    browserNotificationsEnabled:boolean=true;
    browserNotificationsBootstrapped:boolean=false;
    uf : FirebaseUser;
    /*POOL*/
    pollFriendsList: boolean = true;
    pollingInterval: number = 5000;
    private unsubscribe$ = new Subject<void>();
    /************************************************************************************/
    /*                    FRIENDS LIST
    /*************************************************************************************/
    isCollapsed: boolean = false;

    currentActiveOption: IChatOption | null;
    //protected participants: IChatParticipant[];
    protected selectedUsersFromFriendsList: ParticipantResponse[] = [];
    searchEnabled: boolean = true;
    searchInput: string = '';
    protected participantsResponse: ParticipantResponse[];
    //protected participants: IChatParticipant[];

    //filteredParticipants: ParticipantResponse[];
    private participantsInteractedWith: ParticipantResponse[] = [];

    /************************************************************************************/
    /*                    PRIVATE CHAT BOX
    /*************************************************************************************/
    maximizeWindowOnNewMessage: boolean = true;
    hideFriendsListOnUnsupportedViewport: boolean = true;
    persistWindowsState: boolean = true;
    hasPagedHistory: boolean = false;
    emojisEnabled: boolean = true;
    linkfyEnabled: boolean = true;
    showMessageDate: boolean = true;
    messageDatePipeFormat: string = "short";
    /************************************************************************************/
    /* FILE UPLOAD ADAPTER
    /************************************************************************************/
    // File upload state
    public fileUploadersInUse: string[] = []; // Id bucket of uploaders in use

    //public fileUploadAdapter: IFileUploadAdapter;
    //public fileUploadUrl: string = '/uploads';

    selectedFiles: FileList;
    currentFileUpload: FileUpload;
    progress: { percentage: number } = { percentage: 0 };

    //This might need a better content strategy
    public audioSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.wav';
    private audioFile: HTMLAudioElement;
    public audioEnabled: boolean = true;
    //This might need a better content strategy
    public browserNotificationIconSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.png';



    @HostListener('window:resize', ['$event'])
        onResize(event: any){
           this.viewPortTotalArea = event.target.innerWidth;

           //this.NormalizeWindows();
          // console.log(this.viewPortTotalArea);
        }

        // Defines the size of each opened window to calculate how many windows can be opened on the viewport at the same time.
     public windowSizeFactor: number = 320;

     // Total width size of the friends list section
     public friendsListWidth: number = 262;

     // Available area to render the plugin
     private viewPortTotalArea: number;

     // Set to true if there is no space to display at least one chat window and 'hideFriendsListOnUnsupportedViewport' is true
     public unsupportedViewport: boolean = false;


     windows: ChatboxWindow[] = [];

     isBootstrapped: boolean = false;

     /**************************************************************************************/
     /*                         VIEW CHILD
     /***************************************************************************************/

     @ViewChildren('chatMessages') chatMessageClusters: any;

     @ViewChildren('chatWindowInput') chatWindowInputs: any;

     @ViewChildren('nativeFileInput') nativeFileInputs: ElementRef[];

     /**************************************************************************************/
     /*                 USER SESSION & DATA INFO
     /**************************************************************************************/
     userInfo:UserMoreInfo = null;
     pseudo:string = "";
     isLogged:boolean;
    /**************************************************************************************/
    /*                           CONSTRUCTOR
    /***************************************************************************************/


  constructor(public sanitizer: DomSanitizer, private chatService: ChatService,
              private persistanceService:PersistanceService,
              private authService:AuthService, private privatechatService:PrivateChatService,
              private db:AngularFireDatabase, private afAuth: AngularFireAuth,
              private uploadService: UploadFileService, private _httpClient: HttpClient) {
                //this.fileUploadUrl = this.uploadService.getFileFirebaseBasePath();
              }

      /***************************************************************************************/
      /* NG-ONINIT  NG-ONCHANGE
      /***************************************************************************************/
      ngOnInit(){
        this.userInfo = this.persistanceService.get_session(this.authService.storageKey);
        if(!this.userInfo){
            this.authService.logout();
        }
        if(this.userInfo){
          //  console.log("current session user: ", this.userInfo);
            this.pseudo = this.userInfo['pseudo'];
            this.chatUser = new ChatUser(
                                          this.userInfo.uid,
                                          null,
                                          this.userInfo.email,
                                          this.userInfo.pseudo,
                                          this.userInfo.avatar ? this.userInfo.avatar : null);
          // add to list storage
            //this.persistanceService.add_current_connected_users_to_storage(this.userInfo);

          //  update user status
            const path = `/users/${this.userInfo['uid']}`;
            let data = {status : 'ONLINE'};
            this.db.object(path).update(data);
        }
          this.bootstrapChat();

      }

      ngOnDestroy(){
        
      }


     ngOnChanges(changes: SimpleChanges): void {

        for(let property in changes){
              if(property === 'adapter'){
                  /*console.log('Previous:',  changes[property].previousValue);
                    console.log('Current:',  changes[property].currentValue);
                  console.log('firstChange:', changes[property].firstChange);*/
                  this.adapter = changes[property].currentValue;
                    //console.log("recu dans ng-Changes: ", this.adapter);;
              }
              if(property === 'userId'){
                  this.userId = changes[property].currentValue;
                    //console.log("recu dans ng-Changes: ", this.adapter);;
              }
        }
      }

      ngDoCheck(){
          //console.log("recu dans ng-Deck: ", this.adapter);;
      }

      /*******************************************************************************************************************/
      /*   LOCAL STORAGE - GET METOD - RESTORE STATE
      /*******************************************************************************************************************/
      private get localStorageKey(): string
      {

        return `ng-chat-users-${this.userInfo.uid}`; // Appending the user id so the state is unique per user in a computer.
        //return this.authService.storageKey;
      };

      get filteredParticipants(): ParticipantResponse[]
      {
          if (this.searchInput.length > 0){
            // Searches in the friend list by the inputted search string
            return this.participantsResponse.filter(x => x.participant.name.toUpperCase().includes(this.searchInput.toUpperCase()));
          }

          return this.participantsResponse;
      }

      restoreWindowsState(): void {
        try
          {
              if (this.persistWindowsState)
              {
                  let stringfiedParticipantIds = this.persistanceService.get_local(this.localStorageKey);

                  if (stringfiedParticipantIds && stringfiedParticipantIds.length > 0)
                  {
                      let participantIds = <string[]>stringfiedParticipantIds;

                      let participantsToRestore = this.participantsResponse.filter(u => participantIds.indexOf(u.participant.uuid) >= 0);

                      participantsToRestore.forEach((participant) => {
                          this.openChatWindow(participant);
                      });
                  }
              }
          }
          catch (ex)
          {
              console.error(`An error occurred while restoring ng-chat windows state. Details: ${ex}`);
          }
      }

      // Saves current windows state into local storage if persistence is enabled
      private updateWindowsState(windows: ChatboxWindow[]): void
      {
          if (this.persistWindowsState)
          {
                let openWindowParticipantIDs:string[] = windows.map((w:ChatboxWindow) => {
                    return w.participant.uuid;
                    })

                  this.persistanceService.set_local(this.localStorageKey, openWindowParticipantIDs );
          }
      }

      /******************************************************************************************************************/
      /*  DEFAULT WINDOWS OPTIONS
      /******************************************************************************************************************/
      public defaultWindowOptions(currentWindow: ChatboxWindow): IChatOption[]
      {
            if (currentWindow.participant.participantType == ParticipantType.USER)
            {
                    return [{
                        isActive: false,
                        action: (chattingWindow: ChatboxWindow) => {
                              let user = new ParticipantResponse();

                              user.participant = chattingWindow.participant;
                              user.metadata = new UserMetadata();

                              this.selectedUsersFromFriendsList.push(user);
                         },
                        validateContext: (participant: IChatParticipant) => {
                              return participant.participantType == ParticipantType.USER;
                         },
                         displayLabel: 'Add People' // TODO: Localize this
                   }];
            }
            return [];
      }

      /******************************************************************************************************************+/
      /*   INITIALIZER PLACEHOLDER - THEME - BROWSER NOTIFICATION
      /*******************************************************************************************************************/
      onMessageReceived (participantResponse: ParticipantResponse, message: PrivateChatMessage){
          if(participantResponse && message){
             let chatWindow = this.openChatWindow(participantResponse);

                if(chatWindow[1] === false){
                    chatWindow[0].messages.push(message);
                    this.scrollChatWindow(chatWindow[0], ScrollDirection.BOTTOM);
                    if(window[0].hasFocus){
                          this.markMessagesAsRead([message]/*, participantResponse.participant.uuid*/);
                    }
                }
          }
    }

    /******************************************************************************************************************+/
    /*   INITIALIZER PLACEHOLDER - THEME - BROWSER NOTIFICATION
    /*******************************************************************************************************************/
      private initializeDefaultText():void {
        if(!this.localization){
            this.localization = {
                title: 'Friends',
                messagePlaceholder:"Start chatting...",
                searchPlaceholder:'Search',
                browserNotificationTitle: "Bonjour ... Ibrahima",
                loadMessageHistoryPlaceholder: "Load older messages"
              }
          }
      }

      private initializeTheme():void {
          if(this.customTheme){
              this.theme = this.customTheme;
          } else if (this.theme != Theme.LIGHT && this.theme != Theme.DARK){
              throw new Error("Theme is unknow")
          }
      }

      private async initializeBrowserNotifications() {
        if (this.browserNotificationsEnabled && ("Notification" in window))
          {
              if (await Notification.requestPermission())
              {
                  this.browserNotificationsBootstrapped = true;
              }
          }

      }


      // Initializes the chat plugin and the messaging adapter
    private bootstrapChat(): void
    {
        let initializationException = null;

        if (this.adapter != null && this.isLogged)
        {


            try
            {
                this.viewPortTotalArea = window.innerWidth;
                this.adapter.user = this.chatUser;

                this.initializeTheme();
                this.initializeDefaultText();
                this.initializeBrowserNotifications();

                // Binding event listeners
                this.adapter.messageReceivedHandler = (participant, msg) => this.onMessageReceived(participant, msg);
                this.adapter.friendsListChangedHandler = (participantsResponse) => this.onFriendsListChanged(participantsResponse);

                // Loading current users list
                if (this.pollFriendsList){
                    // Setting a long poll interval to update the friends list
                    this.fetchFriendsList(true);
                    setInterval(() => this.fetchFriendsList(false), this.pollingInterval);
                }
                else
                {
                    // Since polling was disabled, a friends list update mechanism will have to be implemented in the ChatAdapter.
                     this.fetchFriendsList(true);
                }

                this.bufferAudioFile();

                this.hasPagedHistory = this.adapter instanceof PagedHistoryChatAdapter;

              /*  if (this.fileUploadUrl && this.fileUploadUrl !== "")
                {
                    this.fileUploadAdapter = new DefaultFileUploadAdapter(this.fileUploadUrl, this._httpClient);
                } */
                this.isBootstrapped = true;
                  //console.log("this.boot: ", this.participants);
            }
            catch(ex)
            {
                initializationException = ex;
            }
        }

        if (!this.isBootstrapped){
              console.error("ng-chat component couldn't be bootstrapped.");

              if (this.adapter == null){
                  console.error("ng-chat can't be bootstrapped without a ChatAdapter. Please make sure you've provided a ChatAdapter implementation as a parameter of the ng-chat component.");
              }
              if (this.chatUser.uuid == null){
                  console.error("ng-chat can't be initialized without an user id. Please make sure you've provided an userId as a parameter of the ng-chat component.");
              }
              if (initializationException)
              {
                  console.error(`An exception has occurred while initializing ng-chat. Details: ${initializationException.message}`);
                  console.error(initializationException);
              }
          }
      }

      /************************************************************************/
      /*                    FRIENDS WINDOW
      /*************************************************************************/

      // Sends a request to load the friends list
      private fetchFriendsList(isBootstrapping: boolean): void
      {
      this.adapter.listFriends()
      .pipe(
          take(1),
          map((participantsResponse: ParticipantResponse[]) => {

              this.participantsResponse = participantsResponse.map((user: ParticipantResponse) => {


                let participantResponse = new ParticipantResponse();
                participantResponse.participant = {
                  participantType: user.participant.participantType,
                  uuid: user.participant.uuid,
                  participantStatus: user.participant.participantStatus,
                  avatar: user.participant.avatar,
                  name: user.participant.name,
                  email: user.participant.email
                };
                participantResponse.metadata = user.metadata;
                return participantResponse;

            });
        })
      ).subscribe(() => {
          if (isBootstrapping)
          {
              //console.log("Restore State from fetchList .... OK");
              this.restoreWindowsState();
          }
      });
  }

    /*******************************************************************************************************************/
    /*                                              CHAT WINDOW
    /********************************************************************************************************************/

    fetchMessageHistory(window:ChatboxWindow){
      if(this.adapter instanceof DemoAdapterPagedHistory){

       window.isLoadingHistory = true;

       this.adapter.getMessageHistoryByPage(window.participant.uuid, this.historyPageSize, ++window.historyPage)
       .pipe(
           map((histories: PrivateChatMessage[]) => {
                //histories.forEach((message) => this.assertMessageType(message));

              //window.messages = histories.concat(window.messages);
              window.messages = histories.map((history:PrivateChatMessage) => history);
               window.isLoadingHistory = false;

               const direction: ScrollDirection = (window.historyPage == 1) ? ScrollDirection.BOTTOM : ScrollDirection.TOP;
               window.hasMoreMessages = histories.length == this.historyPageSize;

               setTimeout(() => this.onFetchMessageHistoryLoaded(window.messages, window, direction, true));
           })
       ).subscribe();
      }
      else {
            let id = (typeof window.group === 'undefined' || !window.group) ? window.participant.uuid : window.group.groupUuid;
              this.adapter.getMessageHistory(id)
              .pipe(
                  map((histories: PrivateChatMessage[]) => {

                        //window.messages = histories.concat(window.messages);
                        window.messages = histories.map((history:PrivateChatMessage) => history);
                        window.isLoadingHistory = false;
                        setTimeout(() =>  { this.historyEnabled = true; this.onFetchMessageHistoryLoaded(window.messages, window, ScrollDirection.BOTTOM)});
                        })
                  ).subscribe();
    }

}

    /***************************************************************************/
    /*                      PROPERTIES METHOD
    /***************************************************************************/
    // Asserts if a user avatar is visible in a chat cluster
    isAvatarVisible(window: ChatboxWindow, message: PrivateChatMessage, index: number): boolean
    {
        if (message.fromId != this.chatUser.uuid){
            if (index == 0){
                return true; // First message, good to show the thumbnail
            }
            else{
                // Check if the previous message belongs to the same user, if it belongs there is no need to show the avatar again to form the message cluster
                if (window.messages[index - 1].fromId != message.fromId){
                    return true;
                }
            }
        }

        return false;
    }

    getChatWindowAvatar(participant: IChatParticipant, message: PrivateChatMessage, group:PrivateChatGroup): string | null{

        let defaultAvatar: "https://pbs.twimg.com/profile_images/3456602315/aad436e6fab77ef4098c7a5b86cac8e3.jpeg";

        if (participant.participantType == ParticipantType.USER)
        {
              return typeof participant.avatar === undefined || !participant.avatar ? defaultAvatar : participant.avatar;
        }
        else if ((participant.participantType == ParticipantType.GROUP) && group)
        {
            let userIndex = group.chattingTo.findIndex(x => x.participant.uuid == message.groupId);

            return group.chattingTo[userIndex >= 0 ? userIndex : 0].participant.avatar;
        }

        return null;

    }

    private formatUnreadMessagesTotal(totalUnreadMessages: number): string
    {
        if (totalUnreadMessages > 0){

            if (totalUnreadMessages > 99)
                return  "99+";
            else
                return String(totalUnreadMessages);
        }

        // Empty fallback.
        return "";
    }

    unreadMessagesTotalByParticipant(user:ParticipantResponse):string{

      let openedWindow = this.windows.find(x => x.participant.uuid == user.participant.uuid);

        if (openedWindow){
            return this.unreadMessagesTotal(openedWindow);
        }
        else
        {
            let totalUnreadMessages = this.participantsResponse
                .filter(x => x.participant.uuid == user.participant.uuid && !this.participantsInteractedWith.find(u => u.participant.uuid == user.participant.uuid) && x.metadata && x.metadata.totalUnreadMessages > 0)
                .map((participantResponse) => {
                    return participantResponse.metadata.totalUnreadMessages
                })[0];

            return this.formatUnreadMessagesTotal(totalUnreadMessages);
        }
    }

    unreadMessagesTotal(window: ChatboxWindow): string
    {
       let totalUnreadMessages = 0;

       if (window){
           totalUnreadMessages = window.messages.filter(x => x.fromId != this.chatUser.uuid && !x.dateSeen).length;
       }

        return this.formatUnreadMessagesTotal(totalUnreadMessages);
     }

    // [Localized] Returns the status descriptive title
    getStatusTitle(status: ParticipantStatus) : any
    {
        if(status == 'ONLINE')
            return 'online';
        else if(status =='BUSY')
            return 'busy';
        else if(status == 'AWAY')
            return 'away';
        else (status == 'OFFLINE')
            return 'offline';
        //return this.localization.statusDescription[currentStatus];
    }

    // Gets closest open window if any. Most recent opened has priority (Right)
  private getClosestWindow(window: ChatboxWindow): ChatboxWindow | undefined
  {
      let index = this.windows.indexOf(window);

      if (index > 0)
      {
          return this.windows[index - 1];
      }
      else if (index == 0 && this.windows.length > 1)
      {
          return this.windows[index + 1];
      }
  }


    toggleWindowFocus(window: ChatboxWindow): void
    {
      window.hasFocus = !window.hasFocus;
     if(window.hasFocus) {
         const unreadMessages = window.messages
             .filter(message => (!message.dateSeen
               && ((message.toId == this.adapter.user.uuid )|| (window.participant.participantType === ParticipantType.GROUP))));

         if (unreadMessages && unreadMessages.length > 0)
         {
             this.markMessagesAsRead(unreadMessages);
             this.onMessagesSeen.emit(unreadMessages);
         }
     }
   }

    // Focus on the input element of the supplied window
   private focusOnWindow(window: ChatboxWindow, callback: Function = () => {}) : void {

        let index = this.windows.indexOf(window);

        if(index >= 0){
            setTimeout(() => {
                if(this.chatWindowInputs){
                    let  messageInputToFocus = this.chatWindowInputs.toArray()[index];
                     messageInputToFocus.nativeElement.focus();
              }
              callback();
            })
        }
   }


    /*****************************************************************************************************************/
    /*                                                    EVENT
    /*****************************************************************************************************************/
    openChatWindow(user:ParticipantResponse, focusOnNewWindow: boolean = false, invokedByUserClick: boolean = false): [ChatboxWindow, boolean]{


          let openedWindow :ChatboxWindow =  this.windows.find(x => x.participant.uuid === user.participant.uuid) ;

          if(openedWindow){
              return ([openedWindow, false]);
          } else {
              //if(invokedByUserClick){
                  //this.adapter.clickedUser = user.participant;
            //  }

              let collapseWindow = invokedByUserClick ? false : !this.maximizeWindowOnNewMessage;
              let newWindow:ChatboxWindow =  new ChatboxWindow(user.participant, true, collapseWindow) ;
              //let newWindow:Window =  new Window(user.participant, true, collapseWindow);

              if(this.historyEnabled){
                  //this.historyEvent.emit(user);
                  this.fetchMessageHistory(newWindow);

              }

              this.windows.unshift(newWindow);

              if(this.windows.length * this.windowSizeFactor >= (this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth: 0 ))){
                  this.windows.pop();
              }

              this.updateWindowsState(this.windows);

            if (focusOnNewWindow && !collapseWindow)
            {
                this.focusOnWindow(openedWindow, ()=> {
                  console.log("focus callback says: element is FOCUSED")
                });
            }
            this.participantsInteractedWith.push(user);
              return([newWindow, true]);

          }
    }

    openGroupChatWindow(group:PrivateChatGroup, focusOnNewWindow: boolean = false, invokedByUserClick: boolean = false): [ChatboxWindow, boolean]{


          let openedWindow :ChatboxWindow =  this.windows.find(x => x.participant.uuid === group.groupUuid) ;

          if(openedWindow){
              return ([openedWindow, false]);
          } else {
              //if(invokedByUserClick){
                  //this.adapter.clickedUser = user.participant;
            //  }

              let collapseWindow = invokedByUserClick ? false : !this.maximizeWindowOnNewMessage;
              let chatUser = group.currentUser as IChatParticipant;
              let newWindow:ChatboxWindow =  new ChatboxWindow(chatUser, true, collapseWindow, group) ;
              //let newWindow:Window =  new Window(user.participant, true, collapseWindow);

              if(this.historyEnabled){
                  //this.historyEvent.emit(user);
                  this.fetchMessageHistory(newWindow);

              }

              this.windows.unshift(newWindow);

              if(this.windows.length * this.windowSizeFactor >= (this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth: 0 ))){
                  this.windows.pop();
              }

              this.updateWindowsState(this.windows);

            if (focusOnNewWindow && !collapseWindow)
            {
                this.focusOnWindow(openedWindow, ()=> {
                  console.log("focus callback says: element is FOCUSED")
                });
            }
            this.participantsInteractedWith.push(group.chattingTo[0]);
              return([newWindow, true]);

          }
    }


    // Toggle friends list visibility
   onChatTitleClicked(event: any): void
   {
       this.isCollapsed = !this.isCollapsed;
   }


    onCloseChatWindow(window: ChatboxWindow): void
    {
      let index = this.windows.indexOf(window);

      this.windows.splice(index, 1);

      this.updateWindowsState(this.windows);

      this.onParticipantChatClosed.emit(window.participant);
    }

    onChatWindowClicked(window: ChatboxWindow): void
    {
        window.isCollapsed = !window.isCollapsed;
        this.scrollChatWindow(window, ScrollDirection.BOTTOM);
    }



    /*  Monitors pressed keys on a chat window
      - Dispatches a message when the ENTER key is pressed
      - Tabs between windows on TAB or SHIFT + TAB
      - Closes the current focused window on ESC
  */
    onChatInputTyped(event: any, window: ChatboxWindow): void
    {
        switch (event.keyCode)
        {
            case 13: //Enter
                if (window.newMessage && window.newMessage.trim() != "")
                {
                    let message:PrivateChatMessage;
                    if(typeof window.group === undefined || !window.group)
                        message = new PrivateChatMessage(this.chatUser.uuid, null, window.participant.uuid, '', new Date(), window.newMessage, MessageType.TEXT, '');
                    else
                        message = new PrivateChatMessage(this.chatUser.uuid, window.group.groupUuid, '', '', new Date(), window.newMessage, MessageType.TEXT, '');

                    window.messages.push(message);

                    this.adapter.sendMessage(message);

                    this.onMessagesSeen.emit(window.messages);

                    window.newMessage = ""; // Resets the new message input;



                   this.scrollChatWindow(window, ScrollDirection.BOTTOM);
                }
                break;
            case 9: //TAB
                event.preventDefault();
                let currentWindowIndex = this.windows.indexOf(window);

                let messageInputToFocus = this.chatWindowInputs.toArray()[currentWindowIndex + (event.shiftKey ? 1 : -1)]; // Goes back on shift + tab

                if (!messageInputToFocus)
                {
                    // Edge windows, go to start or end
                    messageInputToFocus = this.chatWindowInputs.toArray()[currentWindowIndex > 0 ? 0 : this.chatWindowInputs.length - 1];
                }

                messageInputToFocus.nativeElement.focus();

                break;
            case 27: //ESCAPE
                event.stopPropagation();
                let closestWindow = this.getClosestWindow(window);
                if (closestWindow)
                {
                    this.focusOnWindow(closestWindow, () => { this.onCloseChatWindow(window); });
                }
                else
                {
                    this.onCloseChatWindow(window);
                }
        }
    }

    // Updates the friends list via the event handler
   private onFriendsListChanged(participantsResponse: ParticipantResponse[]): void
   {
        if(participantsResponse){
            this.participantsResponse = participantsResponse;
        }
        this.participantsInteractedWith = [];
   }

    private onFetchMessageHistoryLoaded(messages: PrivateChatMessage[], window: ChatboxWindow, direction: ScrollDirection, forceMarkMessagesAsSeen: boolean = false): void
    {
        this.scrollChatWindow(window, direction);
        if (window.hasFocus || forceMarkMessagesAsSeen)
        {
            let unseenMessages = window.messages.filter(m => !m.dateSeen);
            unseenMessages.forEach(m => {
                  m.dateSeen =   new DateTimeFormatPipe('fr-FR').transform(new Date());
            })

            this.markMessagesAsRead(messages/*, window.participant.uuid*/);
        }
    }

    onFriendsListCheckboxChange(selectedUser: ParticipantResponse, isChecked: boolean): void
    {
       if(isChecked) {
           this.selectedUsersFromFriendsList.push(selectedUser);
           console.log("ischecked")
       }
       else
       {console.log("is not checked")
           this.selectedUsersFromFriendsList.splice(this.selectedUsersFromFriendsList.indexOf(selectedUser), 1);
       }
    }

   isUserSelectedFromFriendsList(user: ParticipantResponse) : boolean
   {
       return (this.selectedUsersFromFriendsList.filter(item => item.participant.uuid == user.participant.uuid)).length > 0
   }

   onFriendsListActionCancelClicked(): void
    {

        if (this.currentActiveOption)
        {
            this.currentActiveOption.isActive = false;
            this.currentActiveOption = null;
            this.selectedUsersFromFriendsList = [];
        }

    }

    onFriendsListActionConfirmClicked() : void
    {
        let newGroup = new PrivateChatGroup(this.selectedUsersFromFriendsList, this.adapter.user);
        let user = this.selectedUsersFromFriendsList.find(x => x.participant.uuid == this.adapter.user.uuid);

        this.openGroupChatWindow(newGroup);
        //this.openChatWindow(user);

        if (this.groupAdapter)
        {
            this.groupAdapter.groupCreated(newGroup);
        }

        // Canceling current state
        this.onFriendsListActionCancelClicked();
    }

    /**********************************************************************************************/
    /*                                  FILE UPLOAD
    /**********************************************************************************************/
    // Triggers native file upload for file selection from the user
      triggerNativeFileUpload(window: ChatboxWindow): void
      {
        if (window)
        {
          const fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);
          const uploadElementRef = this.nativeFileInputs.filter(x => x.nativeElement.id === fileUploadInstanceId)[0];

          if (uploadElementRef){
            uploadElementRef.nativeElement.click();
          }
      }
    }

      // Generates a unique file uploader id for each participant
    getUniqueFileUploadInstanceId(window: ChatboxWindow): string
    {
        if (window && window.participant)
        {
            return `ng-chat-file-upload-${window.participant.uuid}`;
        }

        return 'ng-chat-file-upload';
    }


    private clearInUseFileUploader(fileUploadInstanceId: string): void
    {
        const uploaderInstanceIdIndex = this.fileUploadersInUse.indexOf(fileUploadInstanceId);

        if (uploaderInstanceIdIndex > -1) {
            this.fileUploadersInUse.splice(uploaderInstanceIdIndex, 1);
        }
    }

    isUploadingFile(window: ChatboxWindow): boolean
    {
        const fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);

        return this.fileUploadersInUse.indexOf(fileUploadInstanceId) > -1;
    }

    // Handles file selection and uploads the selected file using the file upload adapter
    onFileChosen(window: ChatboxWindow): void {
        const fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);
        const uploadElementRef = this.nativeFileInputs.filter(x => x.nativeElement.id === fileUploadInstanceId)[0];

        if (uploadElementRef)
        {
            const file: File = uploadElementRef.nativeElement.files[0];

            this.fileUploadersInUse.push(fileUploadInstanceId);

                this.currentFileUpload = new FileUpload(file);

                this.uploadService.pushFileToStorage(this.currentFileUpload, this.adapter.user.uuid, window.participant.uuid
                                                    ,this.progress, (err, fileMessage) => {
                  //.subscribe(fileMessage => { console.log("recu", fileMessage);
                    if(!err){
                        this.clearInUseFileUploader(fileUploadInstanceId);
                        window.messages.push(fileMessage);

                        this.adapter.sendMessage(fileMessage);
                        this.scrollChatWindow(window, ScrollDirection.BOTTOM);
                    // Resets the file upload element
                      uploadElementRef.nativeElement.value = '';
                      this.progress = {percentage: 0};
                    }
                    if(err){
                      this.clearInUseFileUploader(fileUploadInstanceId);
                      // Resets the file upload element
                      uploadElementRef.nativeElement.value = '';
                      // TODO: Invoke a file upload adapter error here
                  }
        })
    }
}


    // Buffers audio file (For component's bootstrapping)
 private bufferAudioFile(): void {
     if (this.audioSource && this.audioSource.length > 0)
     {
         this.audioFile = new Audio();
         this.audioFile.src = this.audioSource;
         this.audioFile.load();
     }
 }

 // Emits a message notification audio if enabled after every message received
 private emitMessageSound(window: ChatboxWindow): void
 {
     if (this.audioEnabled && !window.hasFocus && this.audioFile) {
         this.audioFile.play();
     }
 }

 // Emits a browser notification
 private emitBrowserNotification(window: ChatboxWindow, message: PrivateChatMessage): void
 {
     if (this.browserNotificationsBootstrapped && !window.hasFocus && message) {
         let notification = new Notification(`${this.localization.browserNotificationTitle} ${window.participant.name}`, {
             'body': message.message,
             'icon': this.browserNotificationIconSource
         });

         setTimeout(() => {
             notification.close();
         }, message.message.length <= 50 ? 5000 : 7000); // More time to read longer messages
     }
 }
      /********************************************************************************************/
      /*                                UTILITIES FUNCTIONS
      /********************************************************************************************/

      markMessagesAsRead(messages:PrivateChatMessage[]){

          let adapt = this.adapter;
          let currentDate = new Date();

           let dateSeen =  new DateTimeFormatPipe('fr-FR').transform(currentDate);


          /*if(messages){
              messages.forEach((msg) => {
                  msg.dateSeen = new DateTimeFormatPipe('fr-FR').transform(currentDate);
              })*/

              //UPDATE IN FIREBASE DATABASE
              //this.db.list(StringFormat.format(this.CHATBOX_USERS_USER_REF, fromId), ref => ref.orderByChild('toId').equalTo(toId))
              messages.forEach((message:PrivateChatMessage) => {
              message.dateSeen = dateSeen;


              if(typeof message.groupId === undefined || !message.groupId){
              firebase.database().ref().child(this.CHATBOX_USERS_REF).child(message.fromId).child(message.toId).child(message.uuid)
                  .update({'dateSeen': dateSeen});
              } else {
                firebase.database().ref().child(this.CHATBOX_USERS_REF).child(message.fromId).child(message.groupId).child(message.uuid)
                    .update({'dateSeen': dateSeen});
              }

              //  console.log("mark message as seen ....OK")
              //firebase.database().ref().child(this.CHATBOX_USERS_REF)
          })
    }
////////////////////////////////////////////////////////////
/*var newMessageKey = this.firebaseDB.ref().child(this.CHATBOX_USERS_REF).child(fromId).child(toId).push().key;
var updates = {};
message.uuid = newMessageKey;
updates[this.CHATBOX_USERS_REF +'/'+message.fromId+'/'+message.toId+'/'+ newMessageKey] = message;
this.firebaseDB.ref().update(updates);*/

////////////////////////////////////////////////////////////////

      // Scrolls a chat window message flow to the bottom
      scrollChatWindow(window: ChatboxWindow, direction: ScrollDirection): void {

           if(!window.isCollapsed){
               let index = this.windows.indexOf(window);
               if(index >= 0){
                     setTimeout(() => {
                         if(this.chatMessageClusters){
                             let  targetWindow = this.chatMessageClusters.toArray()[index];
                               if(targetWindow){
                                    let element = this.chatMessageClusters.toArray()[index].nativeElement;

                                    element.position = (direction == ScrollDirection.TOP ) ? 0 : element.scrollHeight;
                                    element.scrollTop = element.position;
                               }
                           }
                     })
             }
         }
     }




      /*************************************** END *************************************************/

}
