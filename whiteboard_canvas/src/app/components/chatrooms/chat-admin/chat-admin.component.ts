import { Component, OnInit } from '@angular/core';

import {AuthService} from '../../../services/auth.service';
import { ChatRoom, PublicChatMessage, PublicFileMessage, ChatUser, MessageType, Theme, ParticipantType, ParticipantStatus,FileMessage,
         PrivateChatMessage, DemoAdapter, DemoAdapterPagedHistory,   PrivateChatGroup, IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,
          UserMetadata,  FirebaseUser,  ChatAdapter, ChatRoomLocalization, ParticipantResponse,  ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../../../models/chat/chat';

import { ChatService } from '../../../services/chat.service';

import * as firebase from 'firebase/app';



@Component({
  selector: 'app-chat-admin',
  templateUrl: './chat-admin.component.html',
  styleUrls: ['./chat-admin.component.scss']
})
export class ChatAdminComponent implements OnInit {

  chatRooms: ChatRoom[];
  chatRoom: ChatRoom;
  chatRoomRef: firebase.database.Reference;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    // Only get active chatrooms
    this.chatService.getChatRooms().valueChanges()
      .subscribe(chatRooms => {
        // Since the AngularFireList does not actually returns of the typed objects, we need to cast them ourselves
        // See https://github.com/angular/angularfire2/issues/1299
        this.chatRooms = chatRooms.map(chatRoom => ChatRoom.fromData(chatRoom));
      });
  }

  joinChatRoom(chatRoom: ChatRoom): void {
    console.log('Joining chatroom ' + chatRoom.name);
    this.chatService.getChatRoomByUuid(chatRoom.uuid)
      .then(chatRoomRef => {
        this.handleChatRoomStatus(chatRoomRef);
        this.chatRoomRef = chatRoomRef;
        this.chatRoom = chatRoom;
      });
  }

  isChatRoomJoined(chatRoom: ChatRoom): boolean {
    return this.chatRoom && this.chatRoom.uuid === chatRoom.uuid;
  }

  // By default we'll mark the chatroom as not active when we are disconnecting
  // But we also listen to changes on the 'active' field of the chatroom
  // If someone else disconnects and marks the chatroom as not active, we are activating it only when we are still connected to it
  private handleChatRoomStatus(chatRoomRef: firebase.database.Reference): void {
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
  }

}
