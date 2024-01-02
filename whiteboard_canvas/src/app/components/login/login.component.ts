import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PersistanceService } from '../../services/persistance.service';
import { User, UserMoreInfo } from '../../interfaces/user';

import { User2 } from '../../interfaces/user2';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit, OnDestroy {

  registerForm: FormGroup;
  errorMessage: string = "";
  submitted:boolean = false;
  showsuccessFullyMessage : boolean = false;
    href:string;

  userId : firebase.User;
  userInfo: UserMoreInfo;
  isLogged:boolean;
  //loGinObservable: Subscription;

  constructor(private authService: AuthService,
              private fb: FormBuilder ,
              private router: Router,
              private persistanceService:PersistanceService) {
    if(this.userId){
      this.errorMessage = "You're already logged in!";
    }
  }


  ngOnInit() {
      this.createForm();
      this.showsuccessFullyMessage = false;
      //this.loGinObservable = this.authService.isLoggedIn()
      //  .subscribe(islogged => this.isLogged = islogged);
      //this.persistanceService.clearUserSettings("");

      $(document).ready(function(){
        //fixed navbar while scrolling
        var stickyNavTop = $('.header-container').offset().top;
          var stickyNav = function(){
            var scrollTop = $(window).scrollTop();
            if (scrollTop > stickyNavTop) {
              $('.header-container').addClass('sticky');
            } else {
              $('.header-container').removeClass('sticky');
            }
          };
          stickyNav();
          $(window).scroll(function() {
            stickyNav();
          });

          /******** voir le mot de passe ***/
          $('#password-eye').on('click', function(e){ console.log("you ciiii")
              e.preventDefault();
              if($('#password').attr("type") == 'text'){
                  $('#password').attr("type", "password");
              } else {
                  $('#password').attr("type", "text");
              }
          })

          $('#confirmation-eye').on('click', function(e){
              e.preventDefault();
              if($('#confirmation').attr("type") == 'text'){
                  $('#confirmation').attr("type", "password");
              } else {
                  $('#confirmation').attr("type", "text");
              }
          })

          /********************** stop propagation  *****************/
          $('#var_btn_inscription').on('click', function(event){
              event.stopPropagation();
          })
        /////////////////// END DOCUMENT READY ////////////////////
      })



      this.href = this.router.url;
      this.errorMessage = "";
      //console.log("URL: ", this.href);

      $( "#var_btn_connection" ).hover(
          function() {
            $( this ).addClass( "hover_class" );
        }, function() {
            $( this ).removeClass( "hover_class" );
        }
    );

    $( "#var_btn_facebook" ).hover(
        function() {
          $( this ).addClass( "hover_class" );
      }, function() {
          $( this ).removeClass( "hover_class" );
      }
    );

    $( "#var_btn_google" ).hover(
        function() {
          $( this ).addClass( "hover_class" );
      }, function() {
          $( this ).removeClass( "hover_class" );
      }
    );


  }

  createForm(): void{
    this.registerForm =  this.fb.group({
      $key: new FormControl(null),

      email: new FormControl('', [
        Validators.required,
        Validators.email,
        //Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
          ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20)
      ]),
    });
  }

  onSubmit($event, buttonType): void {

            this.submitted = true;
      if(buttonType==="Connection") {
        this.authService.signIn(this.registerForm.value['email'], this.registerForm.value['password']);
            this.registerForm.reset();


        } else if (buttonType==="Inscription"){
              this.router.navigate(['register']);
            }
              this.submitted = false;
              $event.preventDefault();
      }


      ngOnDestroy(){
        //this.loGinObservable.unsubscribe();
      }

}
