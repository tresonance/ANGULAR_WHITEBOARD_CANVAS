import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  errorMessage: string = "";
  submitted:boolean = false;
  showsuccessFullyMessage : boolean = false;
    href:string;

  constructor(private authService: AuthService, private fb: FormBuilder ,private router: Router) { }


  ngOnInit() {
      this.createForm();
      this.showsuccessFullyMessage = false;

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
      console.log("URL: ", this.href);

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

      confirmation: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20)
      ]),
    });
  }

   onSubmit(buttonType): void {
     this.submitted = true;
    if(buttonType==="Inscription") {
        console.log("register form: \n", this.registerForm.value);
        if(this.registerForm.valid && (this.registerForm.value['password'] !== this.registerForm.value['confirmation'])){

              this.errorMessage = 'passwords are differents';
            setTimeout(function(){
                this.errorMessage = "";
            }, 1000);
            //this.errorMessage = "";
            //this.errorMessage = "";
        }
        else if(this.registerForm.valid && this.registerForm.get('$key').value == null){
              //this.authService.register(this.registerForm.value, this.showsuccessFullyMessage);
              this.authService.signUp(this.registerForm.value['email'], this.registerForm.value['password']);
              this.registerForm.reset();

              //setTimeout(() => {this.router.navigate(['/loni']);}, 3000)

        } else {
          console.log("form not valid");
          this.errorMessage = "All fields are required."
        }

    } else   if(buttonType==="google"){
            this.authService.signInWithGoogleProvider();
    } else   if(buttonType==="facebook"){
            this.authService.signInWithFacebookProvider();
    } else   if(buttonType==="twitter"){
            this.authService.signInWithTwitterProvider();
    } else   if(buttonType==="Connection"){
      this.router.navigate(['/login']);
    }
    this.submitted = false;

 }



//onReset() {
//this.formGroup.reset();
//}

////////////

cleanErrorMessage(){
    this.errorMessage = "";
}


}
