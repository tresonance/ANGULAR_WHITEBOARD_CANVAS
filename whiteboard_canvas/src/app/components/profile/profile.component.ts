import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'
import { Router } from '@angular/router';
import { AuthService} from '../../services/auth.service';
import { PersistanceService } from '../../services/persistance.service';
import { ChatService } from '../../services/chat.service';

import { Subject , BehaviorSubject} from 'rxjs';
import { SignalingService } from '../../services/signaling.service'
import { WebRTCService } from '../../services/web-rtc.service'

import { Observable, pipe } from 'rxjs';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import * as jQuery from 'jquery';
import { User, UserMoreInfo } from '../../interfaces/user';
import { User2 } from '../../interfaces/user2';

import "jquery";
import "bootstrap";
import { map, filter } from 'rxjs/operators';

//import 'zone.js';
//import 'zone.js/dist/long-stack-trace-zone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {

  moreInfoObservable:Observable<UserMoreInfo[]> | Observable<any> | any;

  userInfo:UserMoreInfo = null;
  pseudo:string = "";
  userId :firebase.User;
  isLogged:boolean;

  loGinSubject: Subscription;
  userConnectedSubject : Subscription;

  online_users_Subject : Subscription;
  online_users: UserMoreInfo[] = [];

  constructor(private authService: AuthService,
              private persistanceService:PersistanceService,
              private db:AngularFireDatabase,
              private fb: FormBuilder,
              private signalingService:SignalingService,
              private web_rtcService:WebRTCService,
              private chatService:ChatService,
              private router: Router) {

   }


  ngOnInit() {
          /****************************************************************************/
          /*                       EMIT -RECEIVE USER CONNECTED
          /****************************************************************************/

          this.userConnectedSubject = this.signalingService.userConnectedToProfile()
              .subscribe((data) => console.log("[SOCKET LISTEN FROM PROFIL] :" + `${this.userInfo.pseudo}` + " is connected\n"))



          //----------------------------------------------------------------------/
          //                  userInfo & is still logged?
          //-----------------------------------------------------------------------/
          this.loGinSubject = this.authService.isLoggedIn()
              .subscribe(islogged => this.isLogged = islogged);
              console.log("[PROFILE IS LOGIN] : ", this.isLogged);

          this.userInfo = this.persistanceService.get_session(this.authService.storageKey);

          if(this.userInfo){
              //  console.log("current session user: ", this.userInfo);
              this.pseudo = this.userInfo['pseudo'];

              // add to list storage
              //this.persistanceService.add_current_connected_users_to_storage(this.userInfo);

              //  update user status
              const path = `/users/${this.userInfo['uid']}`;
              let data = {status : 'ONLINE'};
              this.db.object(path).update(data);


              //EMIT USER CONNECTED
              this.signalingService.connectUserToProfile(this.userInfo);

    //this.authService.getUserMoreInfo1.subscribe((infos) => this.UserMoreInfo = infos);

          }

        //------------------------------------------------------------------------/
        //                ALL ONLINE USERS :
        //--------------------------------------------------------------------------/

        //FROM FIREBASE
        this.online_users_Subject = this.chatService.fetch_online_users()
          .subscribe( connected_Users => {
                                            this.online_users = connected_Users
                                            //this.online_users = this.online_users.filter(user => user.uid != this.userInfo.uid);
                                            this.chatService.setOnline_users(this.online_users);
                                            console.log("[PROFILE ]: all-online-users ", this.online_users);
          })
    /****************************************************************************/
    /*                       DOCUMENT READY
    /****************************************************************************/
        $(document).ready(function(){

          /******************** OPEN PROFILE POPUP *********************/
          $("#link-profil-popup1").on("click", function(e){
              e.preventDefault();
              $('.profile-popup').toggle();
              $('#triangle-up').toggle();
          })

          $("#link-profil-popup2").on("click", function(e){
              e.preventDefault();
              $('.profile-popup').toggle();
              $('#triangle-up').toggle();
          })

          /******************** OPEN MESSAGE NOTIFICATION *********************/
          $("#nav-icon-container-popup").on("click", function(e){
              e.preventDefault();
              $('.message-notification-popup').toggle();
              $('#triangle-up2').toggle();
          })

          /******************** OPEN NOTIFICATION'S NOTIFICATION *********************/
          $("#nav-icon-notification-container-popup").on("click", function(e){
              e.preventDefault();
              $('.notification-notification-popup').toggle();
              $('#triangle-up3').toggle();
          })
      })

      //END NG-ONINIT
    }

    /**********************************************************************************/
    /*                           EMIT CURRENT USER INFO
    /************************************************************************************/

    ngOnDestroy(){
      this.loGinSubject.unsubscribe();
      this.userConnectedSubject.unsubscribe();
      this.online_users_Subject.unsubscribe();
    }


    logOut(){
      this.authService.logout();

    }


    //////////////////////// END ////////////////////

}
