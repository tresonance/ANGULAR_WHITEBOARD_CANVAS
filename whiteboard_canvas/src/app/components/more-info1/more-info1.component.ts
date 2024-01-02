import { Component, OnInit, OnDestroy  } from '@angular/core';
import * as $ from 'jquery';

import { Observable } from 'rxjs';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService} from '../../services/auth.service';
import { PersistanceService } from '../../services/persistance.service';

import { User, UserMoreInfo } from '../../interfaces/user';
import * as firebase from 'firebase';

import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-more-info1',
  templateUrl: './more-info1.component.html',
  styleUrls: ['./more-info1.component.scss']
})

export class MoreInfo1Component implements OnInit, OnDestroy  {

  registerForm: FormGroup;
  errorMessage: string = "";
  submitted:boolean = false
  showsuccessFullyMessage : boolean = false;
  href:string;
  user:Observable<firebase.User>;
  emailObservable:Observable<String> | Observable<any> | any ;
  email:String = "";

  private subscription: Subscription ;

  date = [
    {num:1}, {num:2}, {num:3}, {num:4}, {num:5}, {num:6}, {num:7}, {num:8}, {num:9}, {num:10},
    {num:11}, {num:12}, {num:13}, {num:14}, {num:15}, {num:16}, {num:17}, {num:18}, {num:19}, {num:20},
    {num:21}, {num:22}, {num:23}, {num:24}, {num:25}, {num:26}, {num:27}, {num:28}, {num:29}, {num:30},{num:31}
  ];

  months = [
    {num:1, mois:"Janvier"}, {num:2, mois:"Fevrier"}, {num:3, mois:"Mars"}, {num:4, mois:"Avril"},
    {num:5, mois:"Mai"}, {num:6, mois:"Juin"}, {num:7, mois:"Juillet"}, {num:8, mois:"Août"},
    {num:9, mois:"Septembre"}, {num:10, mois:"Octobre"},{num:11, mois:"Novembre"}, {num:12, mois:"Decembre"}
  ]

  pseudo:string = '';
  day:number= 0;
  month:string = '';
  year:number = 0;


  constructor(private authService: AuthService,
                      private route: ActivatedRoute,
                      private fb: FormBuilder,private router: Router,
                      private persistanceservice:PersistanceService) {
        this.user = this.authService.user;
        this.emailObservable =  this.authService.getEmailObservable()
          .subscribe((email:String) => {
            this.email = email;
          })
  //this.registerForm.valueChanges.subscribe(data=>this.todoOnDataChange(data));
 }


  ngOnInit() {
      this.createForm();
      this.registerForm.controls["email"].disable();

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

          /********************** stop propagation  *****************/
          $('#var_btn_inscription').on('click', function(event){
              event.stopPropagation();
          })
        /////////////////// END DOCUMENT READY ////////////////////
      })



      this.href = this.router.url;
      this.errorMessage = "";

      $(".select-option1 .nav-link ").on("click", function(){
        $(".select-option1 ").find(".active").removeClass("active");
        $(this).addClass("active");
       });

       $(".select-option2 .nav-link ").on("click", function(){
        $(".select-option2").find(".active").removeClass("active");
        $(this).addClass("active");
       });

  }

  ngOnDestroy() {
      if(this.subscription){
          this.subscription.unsubscribe();
      }
      if(this.emailObservable){
          this.emailObservable.unsubscribe();
      }
  }

  createForm(){
    this.registerForm = this.fb.group({
      $key: new FormControl(null),

      pseudo: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9 ]+$/),
        Validators.minLength(2),
        Validators.maxLength(20)
      ]),

      email: new FormControl('', [
        Validators.required,
        Validators.email,
        //Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
          ]),

      day: new FormControl('', [
            Validators.required
      ]),

      month: new FormControl('', [
            Validators.required
      ]),

      year: new FormControl('', [
           Validators.required
      ]),

      classe: new FormControl('', [
           Validators.required
      ])
    });
  }



 onSubmit(): void {

   if(this.registerForm.valid && !this.registerForm.get('$key').value){

    var pseudo = this.registerForm.value.pseudo.toLowerCase( );
    var day = +this.registerForm.value.day;
    var index = +this.registerForm.value.month;

    var month = this.months[index - 1].mois;
    var year = (+this.registerForm.value.year) + 1990;
    var birth = day+" "+month+" "+year;
    var classe = this.registerForm.value.classe;

    var userData = {
     pseudo:pseudo,
     //email:this.registerForm.value.email,
     email:this.email,
     birth:birth,
     classe:classe,
     status:'OFFLINE',
     avatar:""
   }


      // if(this.href == '/more-info1'){
           this.authService.moreInfo1(userData);
           //console.log("Insertion more1 succeed in firebase")
       /*} else if(this.href == '/more-info1/register/update') {
           this.authService.moreInfo1Update(pseudo,  birth);
           console.log("update more1 succeed in firebase")
       }*/
           this.showsuccessFullyMessage = true;
           setTimeout(() => {this.showsuccessFullyMessage = false}, 3000);
           this.registerForm.reset();
           //this.router.navigate(['/more-info2'])
           //this.router.navigate(['/profile'])
   } else {
     console.log("form is not valid");
   }

 }




}
