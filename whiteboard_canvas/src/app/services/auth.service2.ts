import { Injectable } from '@angular/core';
import { Subject , BehaviorSubject} from 'rxjs';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {  Observable ,of} from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';

import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { UserService } from './user.service';
import {PersistanceService } from './persistance.service';
import { CookieService } from "angular2-cookie/core";
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';

import * as firebase from 'firebase/app';

import { map } from 'rxjs/operators';
import { first } from 'rxjs/operators';
/******************** INTERFACE ********************/
import { User } from '../interfaces/user';
import { User2 } from '../interfaces/user2';

@Injectable({
  providedIn : 'root',
})


export class AuthService {


  email:string = null;
  //private user: Observable<firebase.User> = null;
  //currentInfo1:User;
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
  //status:string=false;
  /*userState = this.afAuth.authState.pipe(
                  map(authState => {
                    if(authState === undefined || !authState)
                        return null;
                    return authState.email;
                  })
              )*/

  constructor(private db:AngularFireDatabase,
              private notify: NotifyService, private localStorage:LocalStorageService, sessionStorage: SessionStorageService,
              private afAuth: AngularFireAuth ,private cookieService:CookieService,
              private persistanceService: PersistanceService, private router: Router) {}

  /**************************************************************************
  *GET LOGGEDIN STATUS
  *SET LOGGEDIN STATUS
  ***************************************************************************/
  getAuthState(): Observable<firebase.User> {
      return this.afAuth.authState;
    }
  /**************************************************************************
  *GET LOGGEDIN STATUS
  *SET LOGGEDIN STATUS
  ***************************************************************************/

    public get localStorageKey(): string
    {
      //return `ng-chat-users-${this.userId}`; // Appending the user id so the state is unique per user in a computer.
        return "token";
    };

    private hasToken() : boolean {
        return this.persistanceService.get_local(this.localStorageKey);
      //return !!this.cookieService.get('token')
    }

    isLoggedIn() : Observable<boolean> {
      return this.isLoginSubject.asObservable();
    }
    /**************************************************************************
    * user Observable getter
    *
    ***************************************************************************/
    getUser(): Promise<any> {
        return this.afAuth.authState.pipe(first()).toPromise();
    }

    get currentUserID(){
        return (this.userId !== undefined && this.userId !== null) ? this.userId : null;
    }

    getUserObservable(): Observable<any>{
      let userId = this.currentUserID;

      if(null === userId){
        console.log("no user connection found in authservice");
        return null;
      }

        let path = `/users/${userId}`
        return this.db.object(path).valueChanges();

    }

    /*getUserMoreInfo() {

      let userId = this.getCurrentUserId();
      if(null === userId){
        console.log("no user connection found in authservice");
        return ;
      }

        let path = `/users/${userId}`
        return this.db.object(path).map(res => {
            return res.json();
        })

        /*.subscribe(user => {
            if(user !== undefined  && user !== null){
                this.currentInfo1 = (<User1>user);
                console.log("More1-Info State: ", this.currentInfo1);
              }
             else
                this.currentInfo1 = null;
        })

    }*/

    /* getUserMoreInfo2(): void{

        let userId = this.getCurrentUserId();
        if(null === userId){
          console.log("no user connection found in authservice");
          return ;
        }

        let path = `/users/${userId}`
        return this.db.object(path).valueChanges()
        .subscribe(user => {
            if(user !== undefined  && user !== null){
            this.currentInfo2 = (<User2>user);
            console.log("More2-Info State: ", this.currentInfo2);
          } else
             this.currentInfo2 = null;
        })

    } */


    getCurrentUser(callback): void  {
      let userId = this.currentUserID;

        let path = `/users/${userId}`
        this.db.object(path).valueChanges()
        .subscribe(user => {
              callback(user);
        })

    }

  /***************************************************************************
  * utils function: to get user status, this will help us to know if user is
  *                 still logging (routes protection , hat, ...)
  ****************************************************************************/

  setUserStatus(status:string): void{
        let userId = this.currentUserID;

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


/***********************************************************************************
*  Register a new user . Get his email and
*  password et send him an email verification link
*  @param
*  @return
***********************************************************************************/

    /*[********************************* EMAIL SENT  ****************************]*/
      async sendEmailVerificationLink(email:string, showsuccessFullyMessage:boolean){
console.log("currenuserId: ", this.currentUserID);
            var actionCodeSettings = {
                  //url: 'http://localhost:4200/more-info1/?userId='+this.currentUserID,
                  url: 'http://localhost:4200/more-info1',
                  //url: 'http://localhost:4200/profile/?userId='+this.currentUserID,
                   handleCodeInApp: true
            };
            try{
                  this.afAuth.auth.sendSignInLinkToEmail(
                    email,
                    actionCodeSettings
                  );
                  console.log("email verification has been sent")
                  showsuccessFullyMessage = true;
                  setTimeout(() => {showsuccessFullyMessage = false}, 3000)

                  // Save the email locally so you don't need to ask the user for it again
                  // if they open the link on the same device.
                  window.localStorage.setItem('emailForSignIn', email);
            /********      localStorage.setItem(this.localStorageKey, JSON.stringify(email));  **************/
                  //this.registerForm.reset();
              }catch(err){
                // Some error occurred, you can inspect the code: error.code
                    console.log("Envoi email impossible: ", err);
              };
      }

      /*[********************************* EMAIL CONFIRM  *************************]*/
      async isEmailConfirmByUser(){
          let db = this.db;
          let userId = this.currentUserID;

            try {

                  if(this.afAuth.auth.isSignInWithEmailLink(window.location.href)){
                      let email = window.localStorage.getItem('emailForSignIn');

                      if (!email){
                        email = window.prompt('Please provide your email for confirmation');
                      }
                      //paersing the email  link provided
                      const result = this.afAuth.auth.signInWithEmailLink(email, window.location.href)
                      if(result){
                      window.localStorage.removeItem('emailForSignIn');
                      this.emailRedirect = true;
                       db.object(`/users/${userId}`).update({status: 'online'});
                      this.router.navigate(['more-info1']);
                    } else console.log("An error occured: Cannot signInWithEmailLink")
                }

          } catch(err) {
                  console.log("Impossible de confirmer email: ", err)
          }
    }

      /*[********************************* REGISTER FUNCTION *****************]*/
  register(formData, showsuccessFullyMessage) {
        this.afAuth.auth.createUserWithEmailAndPassword(formData.email, formData.password)
            .then((user) => {
                  this.authState = user;
                   this.sendEmailVerificationLink(formData.email, showsuccessFullyMessage);
                 })
                 .then(() => {
                   this.isEmailConfirmByUser()}

                 )
                 .catch(err => {
                   console.log('Unabe to send email verification: ',err.message);
                   this.router.navigate(['loni']);
                 })
    }


    updateProfile(name: string): Promise<any> {
            return this.afAuth.auth.currentUser.updateProfile({
              displayName: name,
              photoURL: null
        });
    }

 /***********************************************************************************
 *  Register step2 , state pseudo and birthday
 * this page is called just afetr register
 *  @param
 *  @return
 ***********************************************************************************/
   moreInfo1(pseudo, birth) {

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

/***********************************************************************************
*  this is a login function
*
*  @param
*  @return
***********************************************************************************/
   login(email: string, password: string) {

     let db = this.db;

     return this.afAuth.auth.signInWithEmailAndPassword(email, password)
        .then(auth => {
                  this.userId = auth.user.uid;
                  let path = '/users/'+this.userId;

                  //this.userId = userId;
                  //this.user = auth.user;

                  return db.object(path).valueChanges()
                  .subscribe(user => {
                      if(user === undefined || user === null){
                        console.log("You must provided moreInfo1 data")
                        this.router.navigate(['more-info1/register/update']);
                        return ;
                      }
                let moreInfo1 = (<User>user);
                console.log("more1 from login: ", moreInfo1)

                if(moreInfo1.birth === undefined || moreInfo1.birth === null
                  || moreInfo1.pseudo === undefined || moreInfo1.pseudo === null ){
                    console.log("You must provided moreInfo1 data")
                    this.router.navigate(['more-info1/register/update']);
                    return;
                }
                let moreInfo2 = (<User2>user);
                  console.log("more2 from login: ", moreInfo2)
                if(moreInfo2.ville === undefined || moreInfo2.ecole === undefined || moreInfo2.niveau === undefined
                  || moreInfo2.classe === undefined || moreInfo2.choix === undefined || moreInfo2.ville === null
                  || moreInfo2.ecole === null || moreInfo2.niveau === null || moreInfo2.classe === null
                  || moreInfo2.choix === null){

                    console.log("You must provided moreInfo2 data")
                    this.router.navigate(['more-info2/register/update']);
                    return;
                }

                // LOCAL STORAGE
                if(!localStorage.getItem(this.localStorageKey))
                      this.persistanceService.set_local(this.localStorageKey, moreInfo2);
                      //this.persistanceService.set(`${this.localStorageKey}`, moreInfo2);
                this.isLoginSubject.next(true);

                //SESSION STORAGE
                //this.sessionStorage.set( `${this.localStorageKey}`, JSON.stringify(moreInfo2) )

                this.router.navigate(['profile']);

              })


                /**************************************************************/
                //db.object(`/users/${auth.user.uid}`).update({status: 'online'});


     })
     .catch(err => {
          console.log("Something went wrong: It seems you don't register" ,err.message);
          this.router.navigate(['login']);
     });
 }

 /***********************************************************************************
 *  login with social media
 *
 *  @param
 *  @return
 ***********************************************************************************/
 signInWithGoogleProvider(showsuccessFullyMessage){

     let db = this.db;
    const provider = new firebase.auth.GoogleAuthProvider();


    this.afAuth.auth.signInWithPopup(provider)
      .then((resp) => {
              if(resp !== undefined && resp !== null){
                  //this.authState = resp.user;
                  /******************************************************************/

                  let userId = resp.user.uid;
                                  let path = '/users/'+userId;
                                    return db.object(path).valueChanges()
                                    .subscribe(user => {
                                        if(user === undefined || user === null){
                                          console.log("You must provided moreInfo1 data")
                                          this.router.navigate(['more-info1/register/update']);
                                          return ;
                                        }
                                  let moreInfo1 = (<User>user);
                                  //console.log("more1: ", moreInfo1)

                                  if(moreInfo1.birth === undefined || moreInfo1.birth === null
                                    || moreInfo1.pseudo === undefined || moreInfo1.pseudo === null ){
                                      console.log("You must provided moreInfo1 data")
                                      this.router.navigate(['more-info1/register/update']);
                                      return;
                                  }
                                  let moreInfo2 = (<User2>user); console.log("more2 test: ", moreInfo2);
                                    //console.log("more2: ", moreInfo2)
                                  if(moreInfo2.ville === undefined || moreInfo2.ecole === undefined || moreInfo2.niveau === undefined
                                    || moreInfo2.classe === undefined || moreInfo2.choix === undefined || moreInfo2.ville === null
                                    || moreInfo2.ecole === null || moreInfo2.niveau === null || moreInfo2.classe === null
                                    || moreInfo2.choix === null){

                                      console.log("You must provided moreInfo2 data")
                                      this.router.navigate(['more-info2/register/update']);
                                      return;
                                  }

                                  //SET LOGIN SESSION IN LOCAL STORAGE
                                //  if(!localStorage.getItem(`ng-chat-users-${userId}`))
                                  //    localStorage.setItem(`ng-chat-users-${userId}`, JSON.stringify(moreInfo2));

                                      // LOCAL STORAGE
                                      if(!localStorage.getItem(this.localStorageKey))
                                            this.persistanceService.set_local(this.localStorageKey, moreInfo2);
                                      this.isLoginSubject.next(true);

                                      //SESSION STORAGE
                                      //this.sessionStorage.set( `${this.localStorageKey}`, JSON.stringify(moreInfo2) )
                  /*******************************************************************/
                this.router.navigate(['profile']);
                console.log("Nice, You're authentify");
              })
    }
  })
    .catch((err) => {
                console.log("Cannnot authenticate your email", err)
                this.router.navigate(['login']);
    })
 }

 signInWithFacebookProvider(showsuccessFullyMessage){

    let db = this.db;
    const provider = new firebase.auth.FacebookAuthProvider();

    this.afAuth.auth.signInWithPopup(provider)
    .then((resp) => {
              if(resp !== undefined && resp !== null){
                  let userId = resp.user.uid;
                  /******************************************************************/
                                  let path = '/users/'+userId;
                                    return db.object(path).valueChanges()
                                    .subscribe(user => {
                                        if(user === undefined || user === null){
                                          console.log("You must provided moreInfo1 data")
                                          this.router.navigate(['more-info1/register/update']);
                                          return ;
                                        }
                                  let moreInfo1 = (<User>user);
                                  console.log("more1: ", moreInfo1)

                                  if(moreInfo1.birth === undefined || moreInfo1.birth === null
                                    || moreInfo1.pseudo === undefined || moreInfo1.pseudo === null ){
                                      console.log("You must provided moreInfo1 data")
                                      this.router.navigate(['more-info1/register/update']);
                                      return;
                                  }
                                  let moreInfo2 = (<User2>user);
                                    console.log("more2: ", moreInfo2)
                                  if(moreInfo2.ville === undefined || moreInfo2.ecole === undefined || moreInfo2.niveau === undefined
                                    || moreInfo2.classe === undefined || moreInfo2.choix === undefined || moreInfo2.ville === null
                                    || moreInfo2.ecole === null || moreInfo2.niveau === null || moreInfo2.classe === null
                                    || moreInfo2.choix === null){

                                      console.log("You must provided moreInfo2 data")
                                      this.router.navigate(['more-info2/register/update']);
                                      return;
                                  }

                                  //SET LOGIN SESSION IN LOCAL STORAGE
                                //  if(!localStorage.getItem(`ng-chat-users-${userId}`))
                                  //    localStorage.setItem(`ng-chat-users-${userId}`, JSON.stringify(moreInfo2));

                                      // LOCAL STORAGE
                                      if(!localStorage.getItem(`${this.localStorageKey}`))
                                            this.persistanceService.set_local(`${this.localStorageKey}`, moreInfo2);
                                      //this.isLoginSubject.next(true);

                                      //SESSION STORAGE
                                    //  this.sessionStorage.set( `${this.localStorageKey}`, JSON.stringify(moreInfo2) )

                  /*******************************************************************/
                this.router.navigate(['profile']);
                console.log("Nice, You're authentify");
              })
    }
  })
    .catch((err) => {
                console.log("Cannnot authenticate your email")
                this.router.navigate(['login']);
    })
 }


 signInWithTwitterProvider(showsuccessFullyMessage){
     const provider = new firebase.auth.TwitterAuthProvider();

    this.afAuth.auth.signInWithPopup(provider)
    .then(() => {
                this.router.navigate(['more-info1']);
                console.log("Nice, You're authentify");
    })
    .catch((err) => {
                console.log("Cannnot authenticate your email")
                this.router.navigate(['login']);
    })
 }
 /***********************************************************************************
 *  this page islog out function
 * After logs out , user is redirecting to login page
 *  @param
 *  @return
 ***********************************************************************************/

  logout() {
        let userId = this.currentUserID;

    if(null === userId){
      console.log("no user connection found in authservice");
      return ;
    }

    const path = `users/${userId}`;
    let data = {status : 'offline'};

      this.afAuth.auth.signOut()
      .then(() => {
          console.log("User sign out successfully");
          //REMOVE SESSION FROM LOCAL STORAGE
          localStorage.removeItem('token');
          this.isLoginSubject.next(false);

          //SET LOGIN SESSION IN LOCAL STORAGE
        //  if(!localStorage.getItem(`ng-chat-users-${userId}`))
          //      localStorage.removeItem(`ng-chat-users-${userId}`);

              // REMOVE LOCAL STORAGE
              if(localStorage.getItem(`ng-chat-users-${userId}`))
                     localStorage.removeItem(`${this.localStorageKey}`);
              this.isLoginSubject.next(false);

              //SESSION STORAGE
              //this.sessionStorage.set( `${this.localStorageKey}`, JSON.stringify(moreInfo2) )

          //this.cookieService.remove('token');

          this.db.object(path).update(data)
          this.router.navigate(['login']);
      })
      .catch(err => {
            console.log(err)
      })
  }


}
