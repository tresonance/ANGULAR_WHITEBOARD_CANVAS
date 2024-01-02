import { Component, OnInit, OnDestroy  } from '@angular/core';
import * as $ from 'jquery';

import { Observable } from 'rxjs';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService} from '../../services/auth.service';
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

  private subscription: Subscription ;
  anniversaire: FormGroup;
  showsuccessFullyMessage : boolean = false;
  private userId:any;
  private token:any;

  user:Observable<firebase.User>;

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

  //userMoreInfo:UserMoreInfo;
  errorMessage: string;
  href:string;


  //https://ng-bootstrap.github.io/#/components/datepicker/examples -> Datepicker in a popup
  constructor(private authService: AuthService,
                      private route: ActivatedRoute,
                      private fb: FormBuilder,private router: Router) {
        this.user = this.authService.user;
        //this.userMoreInfo = this.authService.getUserMoreInfo1();
  //this.anniversaire.valueChanges.subscribe(data=>this.todoOnDataChange(data));
 }


  ngOnInit() {

      this.createForm();

      //this.authService.isRegesterInfo1State();
      this.href = this.router.url;


      /**************** EMAIL TOKEN *************/
      this.subscription = this.route.params.subscribe(params => {
      this.userId = params['userId']; console.log("apres click voici id: ", this.userId)
      //this.token = params['token'];
    });

    $(document).ready(function(){

      $(".select-option1 .nav-link ").on("click", function(){
        $(".select-option1 ").find(".active").removeClass("active");
        $(this).addClass("active");
       });

       $(".select-option2 .nav-link ").on("click", function(){
        $(".select-option2").find(".active").removeClass("active");
        $(this).addClass("active");
       });
    });


  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  createForm(){
    this.anniversaire = this.fb.group({
      $key: new FormControl(null),
      Pseudo: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9 ]+$/),
        Validators.minLength(2),
        Validators.maxLength(20)
      ]),
      Day: new FormControl('', [
            Validators.required
      ]),
      Month: new FormControl('', [
            Validators.required
      ]),
      Year: new FormControl('', [
           Validators.required
      ])
    });
  }


  onSubmit(): void {
    var pseudo = this.anniversaire.value.pseudo.toLowerCase( );
    var day = +this.anniversaire.value.day;
    var index = +this.anniversaire.value.month
    var month = this.months[index - 1].mois;
    var year = (+this.anniversaire.value.Year) + 1990;
    var birth = day+" "+month+" "+year;
    var classe = +this.anniversaire.value.classe;

    var userData = {
      pseudo:pseudo,
      email:+this.anniversaire.value.email,
      birth:birth,
      classe:classe
    }


    if(this.anniversaire.valid && this.anniversaire.get('$key').value == null)
    {
       // if(this.href == '/more-info1'){
            this.authService.moreInfo1(userData);
            console.log("Insertion more1 succeed in firebase")
        /*} else if(this.href == '/more-info1/register/update') {
            this.authService.moreInfo1Update(pseudo,  birth);
            console.log("update more1 succeed in firebase")
        }*/
            this.showsuccessFullyMessage = true;
            setTimeout(() => {this.showsuccessFullyMessage = false}, 3000);
            this.anniversaire.reset();
            //this.router.navigate(['/more-info2'])
            //this.router.navigate(['/profile'])
    }

  }

}
