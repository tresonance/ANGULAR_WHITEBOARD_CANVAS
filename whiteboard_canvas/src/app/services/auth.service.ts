import { Injectable } from '@angular/core';
import { Subject , BehaviorSubject} from 'rxjs';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database';

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {  Observable ,of} from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { map, switchMap, startWith, tap, filter, first} from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';

import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { UserService } from './user.service';
import {PersistanceService } from './persistance.service';
import { CookieService } from "angular2-cookie/core";
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';

import { StringFormat } from '../models/chat/string-format'
/*-----------------------------------------------------------------------------------------------------*/

import {  NgZone } from '@angular/core';

/*-----------------------------------------------------------------------------------------------------*/
import * as firebase from 'firebase/app';
/******************** INTERFACE ********************/
import { User, UserMoreInfo } from '../interfaces/user';
import { User2 } from '../interfaces/user2';

@Injectable({
  providedIn : 'root',
})


export class AuthService {


  email:string = null;
  //private user: Observable<firebase.User> = null;
  //moreInfo1Datas:Observable<UserMoreInfo[]> | Observable<any> | any;
  moreInfoDatas:UserMoreInfo[];
  //currentInfo2:User2;
  private userId:any;
  private authState:any;
  user:Observable<firebase.User>
  //user:Observable<firebase.User>
  currentUser:User2;
  //isAuthenticated : boolean = false;
  isLoginSubject = new BehaviorSubject<boolean>(this.hasToken());
  //private loginStatus = JSON.parse(localStorage.getItem('loggedIn') || 'false')

  url:string;
  emailRedirect:boolean = false;

  public USERS = '/users';
  public USER_REF = this.USERS + '/{0}';

  constructor(private db:AngularFireDatabase,
              private notify: NotifyService,
              private localStorage:LocalStorageService,
              private sessionStorage: SessionStorageService,
              private afDatabase: AngularFireDatabase,

              private cookieService:CookieService,
              private persistanceService: PersistanceService,


              public afAuth: AngularFireAuth, // Inject Firebase auth service
              public router: Router, // Inject Route Service
              public ngZone: NgZone // NgZone service to remove outside scope warning
            ) {}
  /****************************************************************************************************/
  /*                              USER INFO
  /****************************************************************************************************/

    getAuthState(): Observable<firebase.User> {
      return this.afAuth.authState;
    }

    public get storageKey(): string
    {
      //return `ng-chat-users-${this.userId}`; // Appending the user id so the state is unique per user in a computer.
      return 'token';
      //return this.userId ;

    };

    private hasToken() : boolean {
        return !!this.persistanceService.get_session(this.storageKey);
    }

    isLoggedIn() : Observable<boolean> {
      return this.isLoginSubject.asObservable();
    }

    getUser(): Promise<any> {
        return this.afAuth.authState.pipe(first()).toPromise();
    }

    get currentUserID(){
        return (this.userId !== undefined && this.userId !== null) ? this.userId :  null;
    }

    getUserMoreInfo1(userId:any): Observable<any>{
        let path = `/users/${userId}`;
        return this.db.object(path).valueChanges();
    }

    getCurrentUser(callback): void  {
      let userId = this.currentUserID;

        let path = `/users/${userId}`
        this.db.object(path).valueChanges()
        .subscribe(user => {
              callback(user);
        })

    }

    getEmailObservable() {
        return of(this.email);
    }

    setUserStatus(status:string): void{
          let userId = this.currentUserID ? this.currentUserID : this.persistanceService.get_session(this.storageKey);

        if(null === userId){
          console.log("no user connection found in authservice");
          return ;
        }
        const path = `users/${userId}`;
        const data = {
          status: status
        }
         this.db.object(path).update(data)
         .then(() => console.log("user status set to : "+status))
         .catch(err => console.log(err))
    }


  /********************************************************************************************************/
  /*                                            SIGN UP
  /********************************************************************************************************/
  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.auth.currentUser.sendEmailVerification()
    .then(() => {
      //this.router.navigate(['login']);
    })
  }

  // Sign up with email/password
  signUp(email, password) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.SendVerificationMail(); // Sending email verification notification, when new user registers
        window.alert('Please validate your email address. Kindly check your inbox.');
      }).catch((error) => {
        window.alert(error.message)
      })
  }


  /********************************************************************************************************/
  /*                                            SIGN IN WITH EMAIL/PASSWORD
  /********************************************************************************************************/

  // Sign in with email/password
  signIn(email, password) {

    this.email = email;
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((auth) => {

        if (auth.user.emailVerified !== true) {
          this.SendVerificationMail();
          window.alert('Please validate your email address. Kindly check your inbox.');

        } else {

            this.ngZone.run(() => {

                this.userId = auth.user.uid;
                // LOCAL STORAGE FOR PERSISTANCE SESSION
                      //if (window.localStorage) {


                      this.isLoginSubject.next(true);
                      //console.log("session storage key  {" + `${this.storageKey}` +" :"+ `${this.persistanceService.get_session(this.storageKey)}`+ " is set");
                    //} else console.log("storage type unvailable");

                let path = `/users/${this.userId}`
                return this.db.object(path).valueChanges()
                    .subscribe((infos:UserMoreInfo) => {

                        if(infos){

                          let userData = {
                           pseudo:infos['pseudo'],
                           uid:this.userId,
                           email:infos['email'],
                           birth:infos['birth'],
                           classe:infos['classe'],
                           avatar:infos['avatar']
                         }

                          this.persistanceService.set_session(this.storageKey, userData);

                            //let userId = this.userId ? this.userId : this.persistanceService.get_session(this.storageKey);
                            //this.db.database.ref(StringFormat.format(this.USER_REF, userId)).update({ 'status': 'ONLINE' });

                            this.router.navigate(['profile']);
                        }else{
                          //console.log("Please, complete your registration");
                          this.router.navigate(['more-info1']);
                        }
                    })



          });
        }
      }).catch((error) => {
        window.alert(error.message);
        this.router.navigate(['register']);
      })
  }

  /********************************************************************************************************/
  /*                                            SIGN IN WITH GOOGLE
  /********************************************************************************************************/
  signInWithGoogleProvider(){

      let db = this.db;
     const provider = new firebase.auth.GoogleAuthProvider();
     this.afAuth.auth.signInWithPopup(provider)
       .then((resp) => {
               if(resp !== undefined && resp !== null){
                 this.userId = resp.user.uid;
                  this.email = resp.user.email;
                  // LOCAL STORAGE FOR PERSISTANCE SESSION
                  //if(this.persistanceService.get_session(this.storageKey)){

                        this.isLoginSubject.next(true);
                  //}

                 let path = '/users/'+this.userId;

                 return db.object(path).valueChanges()
                  .subscribe((infos:UserMoreInfo[]) => {

                     if(infos && infos.length){

                       var userData = {
                        pseudo:infos[2],
                        uid:this.userId,
                        email:infos[2],
                        birth:infos[0],
                        classe:infos[1]
                      }
                          this.persistanceService.set_session(this.storageKey, userData);
                         this.router.navigate(['profile']);
                     }else{
                       console.log("Please, complete your registration");
                       this.router.navigate(['more-info1']);
                     }
                 })

               }
      }).catch((error) => {
                 console.log("Cannnot authenticate your email", error)
                 window.alert(error.message)
                 this.router.navigate(['login']);
     })
  }

  /********************************************************************************************************/
  /*                                            SIGN IN WITH FACEBOOK
  /********************************************************************************************************/

   signInWithFacebookProvider(){

      let db = this.db;
      const provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.auth.signInWithPopup(provider)
          .then((resp) => {  console.log("faceboo: ", resp);
                if(resp !== undefined && resp !== null){
                     this.userId = resp.user.uid;
                    this.email = resp.user.email;

                    // LOCAL STORAGE FOR PERSISTANCE SESSION
                    //if(this.persistanceService.get_session(this.storageKey)){

                          this.isLoginSubject.next(true);
                  //  }

                    let path = '/users/'+this.userId;
                    return db.object(path).valueChanges()
                      .subscribe((infos:UserMoreInfo[]) => {

                        if(infos && infos.length){

                          var userData = {
                           pseudo:infos[2],
                           uid:this.userId,
                           email:infos[2],
                           birth:infos[0],
                           classe:infos[1]
                         }
                            this.persistanceService.set_session(this.storageKey, userData);
                            this.router.navigate(['profile']);
                        }else{
                          console.log("Please, complete your registration");
                          this.router.navigate(['more-info1']);
                        }
                    })

                  }
         }).catch((error) => {
                  ///console.log(error);
                  window.alert(error.message)
                  this.router.navigate(['login']);
      })
   }

   /********************************************************************************************************/
   /*                                            SIGN IN WITH TWEETER
   /********************************************************************************************************/

    signInWithTwitterProvider(){
        let db = this.db;
        const provider = new firebase.auth.TwitterAuthProvider();

       this.afAuth.auth.signInWithPopup(provider)
       .then((resp) => {
                 if(resp !== undefined && resp !== null){
                     this.userId = resp.user.uid;
                     this.email = resp.user.email;
                     // LOCAL STORAGE FOR PERSISTANCE SESSION
                     //if(this.persistanceService.get_session(this.storageKey)){

                           this.isLoginSubject.next(true);
                     //}


                     let path = '/users/'+this.userId;
                     return db.object(path).valueChanges()
                     .subscribe((infos:UserMoreInfo[]) => {

                         if(infos && infos.length){

                           var userData = {
                            pseudo:infos[2],
                            uid:this.userId,
                            email:infos[2],
                            birth:infos[0],
                            classe:infos[1]
                          }
                              this.persistanceService.set_session(this.storageKey, userData);
                             this.router.navigate(['profile']);
                         }else{
                           console.log("Please, complete your registration");
                           this.router.navigate(['more-info1']);
                         }
                     })

                   }
          }).catch((error) => {
                   console.log("Cannnot authenticate your email")
                   window.alert(error.message)
                   this.router.navigate(['login']);
       })
    }

    /********************************************************************************************************/
    /*                                            MORE INFO 1
    /********************************************************************************************************/

      moreInfo1(userData:any) {


        const path = `/users/${this.currentUserID}`;
        //firebase.database().ref('users/' + this.currentUserID).set(userData);
        if(this.currentUserID){
             this.db.object(path).set(userData)
                 .then((res) => {

                    let storage = !!this.persistanceService.get_session(this.storageKey)

                  /*  if(!storage){

                      var user_data = {
                       pseudo:userData['pseudo'],
                       uid:this.userId,
                       email:userData['email'],
                       birth:userData['birth'],
                       classe:userData['classe'],
                       avatar:"",
                       status:"OFFLINE"
                     }


                   }  */
                     console.log("datas save to firebase");

                     this.router.navigate(['profile']);
                 })
                 .catch(error => {
                   console.log("[error: ---->]\n",error);
                    window.alert(error.message);
                 })
       } else {
           console.log("You need to login .")
           this.router.navigate(['loni']);
       }
     }

     /********************************************************************************************************/
     /*                                            LOG OUT
     /********************************************************************************************************/
     logout() {
           let userId = this.currentUserID;

       if(null === userId){
         userId = this.persistanceService.get_session(this.storageKey)['uid'];
       }

       let path = `users/${userId}`;

       // REMOVE LOCAL STORAGE
       if(this.persistanceService.get_session(this.storageKey)){
               //clear session
              this.persistanceService.clearUserSettings_session(`${this.storageKey}`);
        }

        //this.db.object(path).update({ 'status': 'OFFLINE' });

        this.db.database.ref(StringFormat.format(this.USER_REF, userId))
          .update({ 'status': 'OFFLINE' });

        this.isLoginSubject.next(false);

       this.afAuth.auth.signOut()
         .then(() => {
            console.log("you are disconnected ...");
            this.router.navigate(['/loni']);
         })
         .catch(err => {
               console.log(err)
         })
     }



     /***********************************************************************************
     *  Register step3 , state school level and subjects
     * this page is called just afetr more-info1
     *  @param
     *  @return
     ***********************************************************************************/
     moreInfo2(ville, ecole, niveau, classe, choix1, choix2) {

        let userId = this.currentUserID;

       if(null === userId){
         console.log("no user connection found in authservice");
         return ;
       }
            const path = `/users/${userId}`;

            firebase.database().ref("users/"+userId).update({
                  ville:ville,
                  ecole:ecole,
                  niveau:niveau,
                  classe:classe,
                  choix: {
                        choix1:choix1,
                        choix2:choix2
                      }
            })
            console.log("More Info2 Insertion: succeed in firebase");
            this.db.object('/users/'+this.currentUserID).update({status: 'online'})
            .then(() => {
              console.log("Votre statut a ete actualise: Online");
               this.router.navigate(['profile']);

            })
            .catch(err => console.log(err));

    }

    /***********************************************************************************
    *  this  is called if user more-info1  are not stated
    * In this case when user logs , he is redirecting here
    *  @param
    *  @return
    ***********************************************************************************/

    moreInfo1Update(pseudo, birth) {

          const path = `/users/${this.currentUserID}`;
          const data = {
                email:this.email,
                pseudo:pseudo,
                birth:birth
          }
          this.db.object(path).set(data)
              .then((res) => {
                this.router.navigate(['more-info2']);
              })
              .catch(error => console.log(error))

 }

 /***********************************************************************************
 *  this  is called if user more-info2  are not stated
 * In this case when user logs , he is redirecting here
 *  @param
 *  @return
 ***********************************************************************************/

 moreInfo2Update(ville, ecole, niveau, classe, choix1, choix2) {
    let userId = this.currentUserID;

   if(null === userId){
     console.log("no user connection found in authservice");
     return ;
   }


        firebase.database().ref("users/"+userId).update({
              ville:ville,
              ecole:ecole,
              niveau:niveau,
              classe:classe,
              choix: {
                    choix1:choix1,
                    choix2:choix2
                  }
        })
        console.log("More Info2 Insertion: succeed in firebase");
        this.db.object('/users/'+this.currentUserID).update({status: 'online'})
        .then(() => {
          console.log("Votre statut a ete actualise: Online");
           this.router.navigate(['profile']);

        })
        .catch(err => console.log(err));
 }



}
