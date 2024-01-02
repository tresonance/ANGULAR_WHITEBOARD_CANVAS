import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { ChatAdapter } from 'ng-chat';
import { HttpClient } from '@angular/common/http';
//import { MyChatAdapter } from './models/private-chat/chat';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  //encapsulation : ViewEncapsulation.Native
})



export class AppComponent {

  isChatPage:boolean=false;
  //public adapter: ChatAdapter = new MyChatAdapter();

  constructor(private authService:AuthService, private router: Router){
    // Initialize Firebase

    //firebase.initializeApp(config);
      this.isChatPage = (this.router.url === '/chatroom');
  }

  ngOnInit() {

  }

   }
