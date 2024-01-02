import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import * as $ from 'jquery';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

import { Router } from '@angular/router';
import { Subject } from 'rxjs';
/******************** INTERFACE ********************/
import { User } from '../../interfaces/user';
import { User2 } from '../../interfaces/user2';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'

interface LogData {
    uid:string;
    email: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent implements OnInit, AfterViewInit {
      loginForm: FormGroup;
      errorMessage: any = {}
      submitted:boolean = false;
      showsuccessFullyMessage:boolean = false;
      href:string;
      currentUser:User2;

      moreInfo1StateData:User;
      moreInfo2StateData:User2;

      constructor(private authService: AuthService,
                  private db:AngularFireDatabase,
                  private userService:UserService,
                   private fb: FormBuilder,
                   private router:Router){

      }

      ngAfterViewInit(){
        this.createForm();
      }

      ngOnInit() {

        $(document).ready(function(){
          $(function(){
              $('.login-container').css({ height: $(window).innerHeight() - 80 });
              $(window).resize(function(){
                  $('.login-container').css({ height: $(window).innerHeight() - 60 });
              });
          });

              /***************** $(DOCUMENT) READY ENDS HERE *****************/
        })

        /*********************************************************************/
        //this.createForm();

        this.href = this.router.url;

            this.authService.getCurrentUser((currentUser) => {
            this.currentUser = currentUser;
        })
        /*--------------------- end NG on init ---------------------------*/
      }



      createForm(): void{
        this.loginForm =  this.fb.group({

          email: new FormControl('', [
            Validators.required,
            Validators.email
            //Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
              ]),
          password: new FormControl('', [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20)
          ]),
        });
      }


  onSubmit(buttonType): void {
            this.submitted = true;
      if(buttonType==="Connection") {
        console.log("connection function ", this.loginForm.value);
    /*          let info1:User, info1Copy:User;
              let info2:User2, info2Copy:User2;

              this.authService.getUserMoreInfo().this.subscribe(data => this.moreInfo1StateData = data);
              console.log("map: ", this.moreInfo1StateData);
              return;
              info1Copy = info1;

              let register1 : boolean;
              let register2: boolean;

              let nullData1 = (<User>{pseudo:'', birth:''});
              let nullData2 = (<User2>{ville:'', ecole:'', niveau:'', classe:''});

              /**************** CHECK  MORE-INFO1 DATAS ARE PROVIDED  *******************/
      /*        register1 = !!(info1 != undefined && info1)
              const {pseudo, birth} = register1 === true ? info1Copy : nullData1;
              //console.log("pseudo: "+pseudo+" birth: "+birth)
              register1 = register1 && (!!(pseudo && birth))
*/

              /**************** CHECK  MORE-INFO2 DATAS ARE PROVIDED  *******************/
  /*            info2 = this.authService.currentInfo2;
              info2Copy = info2;
              register2 = !!(info2 != undefined && info2)
              const {ville, ecole, niveau, classe,  choix } = register2 === true ? info2 : nullData2;
              //console.log("ville: "+ville+" ecole: "+ecole+" niveau: "+niveau+" classe: "+classe)
              register2 = register2 && (!!(info2 && typeof info2.classe !== undefined && typeof info2.ville !== undefined && typeof info2.ecole !== undefined && info2.niveau != undefined))
*/
              /********************* IF ALL INFO ARE PROVIDED ***************************************/




                          /*let moreInfo1 = (<User1>user);
                          if(moreInfo1.email == undefined || moreInfo1.email === null
                            || moreInfo1.bith === undefined || moreInfo1.birth === null){
                              console.log("You must provided moreInfo1 data")
                              this.router.navigate(['more-info1/register/update']);
                              return;
                          }

                          let moreinfo1 = (<User2>user);
                          if(moreInfo2.ville === undefined || moreInfo2.ecole === undefined || moreInfo2.niveau === undefined
                            || moreInfo2.classe === undefined || moreInfo2.choix === undefined || moreInfo2.ville === null
                            || moreInfo2.ecole === null || moreInfo2.niveau === null || moreInfo2.classe === null
                            || moreInfo2.choix === null){

                              console.log("You must provided moreInfo2 data")
                              this.router.navigate(['more-info2/register/update']);
                              return;
                          }*/



                  //this.authService.login(this.formGroup.value.Email, this.formGroup.value.Password)

                  this.authService.signIn(this.loginForm.value['email'], this.loginForm.value['password'])


            /*  this.showsuccessFullyMessage = true;
              setTimeout(() => {
                this.showsuccessFullyMessage = false
                this.formGroup.reset();
              }, 3000) */
              //this.formGroup.reset();


        } else if (buttonType==="Inscription"){
              this.router.navigate(['register']);
            }
              this.submitted = false;
      }

}
