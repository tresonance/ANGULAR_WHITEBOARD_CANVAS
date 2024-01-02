import { Component, Input, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ChatService }  from '../../services/chat.service';
import { AdminService }  from '../../services/admin.service';

import { Router } from '@angular/router';
import { Subject } from 'rxjs';
/******************** INTERFACE ********************/
import { User } from '../../interfaces/user';
import { User2 } from '../../interfaces/user2';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminComponent implements OnInit {

  chatRoomsListChatRoomRef:firebase.database.Reference;
  chatRoomsListRef:firebase.database.Reference;

  chatRoomName:string
  chatBoxName:string;

  constructor(private authService: AuthService,
              private db:AngularFireDatabase,
              private userService:UserService,
               private fb: FormBuilder,
               private chatService:ChatService,
               private adminService:AdminService,
               private router:Router){



  }

  ngOnInit() {
        //this.chatService.currentChatRoomListChatRoomRef().subscribe(name => this.chatRoomListChatRoomRef = name);
        //this.chatService.currentChatRoomListRef().subscribe(name => this.chatRoomListRef = name);
  }


  /************************************************************************/
  /*        CREATION DES CHATROOMS                                                              */
  /************************************************************************/
  createNewChatRoom(){
      this.adminService.addNewChatRoom(this.chatRoomName);
      this.chatRoomName = '';
  }

  createNewChatBox(){
      this.adminService.addNewChatBox(this.chatBoxName);
      this.chatRoomName = '';
  }
}
