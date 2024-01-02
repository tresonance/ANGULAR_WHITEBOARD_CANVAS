import { Component, OnInit, Input } from '@angular/core';

import {AuthService} from '../../../services/auth.service';
import { ChatRoom, PublicChatMessage, ChatUser } from '../../../models/chat/chat';
import { ChatService } from '../../../services/chat.service';
import { ChatComponent } from '../chat2/chat.component';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {

    private CHATROOM_PREFIX = '#';

    chatRooms: ChatRoom[];
    hasJoinThechat:boolean=false;
    @Input() chatRoom: ChatRoom;
    chatRoomRef: firebase.database.Reference;

    chatRoomName: string = null; // the chatroom name to start

    constructor(private chatService: ChatService) { }

    ngOnInit() {
      // Only get active chatrooms
      this.chatService.getChatRooms(true).valueChanges()
        .subscribe(chatRooms  => {
          // Since the AngularFireList does not actually returns of the typed objects, we need to cast them ourselves
          // See https://github.com/angular/angularfire2/issues/1299
          this.chatRooms = chatRooms.map(chatRoom => ChatRoom.fromData(chatRoom));
        });


    }

    startChatRoom(): void {
      console.log('Starting chatroom ' + this.getFullChatRoomName());
      this.chatService.startChatRoom(this.getFullChatRoomName())
        .then(chatRoomRef => {
          this.handleChatRoomStatus(chatRoomRef);
          this.chatRoomRef = chatRoomRef;
          this.chatRoomRef.once('value')
            .then(snapshot => {
              this.chatRoom = ChatRoom.fromData(snapshot.val());
              this.chatRoomName = null;
            });
        });
    }

    selectChatRoom(chatRoom: ChatRoom): void {
      console.log('Joining chatroom ' + chatRoom.name);
      this.chatService.getChatRoomByUuid(chatRoom.uuid)
        .then(chatRoomRef => {
          this.handleChatRoomStatus(chatRoomRef);
          this.chatRoomRef = chatRoomRef;
          this.chatRoom = chatRoom;
          this.chatRoomName = chatRoom.name;
        });
    }

    isChatRoomJoined(chatRoom: ChatRoom): boolean {
      return this.chatRoom && this.chatRoom.uuid === chatRoom.uuid;
    }

    private getFullChatRoomName(): string {
      if (this.chatRoomName) {
        return this.CHATROOM_PREFIX + this.chatRoomName;
      }
      return null;
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


    joinChatRoom(chatRoom:ChatRoom){
        this.chatRoom = chatRoom;
        //this.loadChatComponent(chatRoom);
        //this.loadChatComponent(this.chatRoom, this.previousChatRoom);
          this.hasJoinThechat = true;
        setTimeout(() => {
              this.hasJoinThechat = false;
        }, 2000);
        //console.log("clicked chat: ", this.chatRoom);
    }

  }
