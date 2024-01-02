import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService} from '../../services/auth.service';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';

import { User } from '../../interfaces/user';
import { User2 } from '../../interfaces/user2';

import * as $ from 'jquery';


@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss']
})



export class MoreInfoComponent implements OnInit {

  moreInfo2: FormGroup;
  errorMessage: string;
  showsuccessFullyMessage : boolean = false;

  ecolesDB = [];
  user:Observable<firebase.User>

  selectedEcole: string = null;
  niveau = [  ["6 ème", "5 ème", "4 ème", "3 ème"], ["2nd", "1 ère", "Tle"], null ]
  clickedNiveau:number=0;
  @Input() selectedArray = null;

  ville:string='';
  ecole:string='';
  niveau_:string='';
  classe:string='';
  choix1:string='';
  choix2:string='';

  ecoles = [
    { name: "Choisir ...", value: 0 },
    { name: "Honore de Balzac", value: 1 },
    { name: "Victor Hugo", value: 2 },
    { name: "Henry 4", value: 3 },
    { name: "Citadelle", value: 4 }
  ]

  lesChoix = [
    {name:"Choisir..."},{name:"Mathematiques" },{name:"Francais"},
    {name: "Physique"},{name:"Chimie" },{name:"Anglais" },
    {name: "SVT/option" },{name: "Economie/Finance" },{name: "Droit"},
  ]



  niveaux = [
    {  niveau:"Collège"},
    { niveau:"Lycée"},
    { niveau:"Supérieur"}
  ]

  href:string;

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) {
        this.user = this.authService.user;

        //console.log("more-info2: ")
       //this.authService.isRegesterInfo2State();
   }

  ngOnInit() {
      this.createForm();
      //this.authService.isRegesterInfo2State();
      this.href = this.router.url;
      console.log("URL: ", this.href);

}

createForm(){
  this.moreInfo2 = this.fb.group({
        $key: new FormControl(null),
        Ville: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9 ]+$/)
        ]),
        Ecole: new FormControl('', [
              Validators.required
        ]),

        Choix1: new FormControl('', [
             Validators.required
        ]),
        Choix2: new FormControl('', [
             Validators.required
        ])
  });
}
  onDisplayClasses(event:any){
      event.preventDefault();
      console.log(event.target.innerHTML)
      if(event.target.innerHTML === 'Collège')
          this.clickedNiveau = 0
      else if (event.target.innerHTML === 'Lycée')
          this.clickedNiveau = 1
      else if (event.target.innerHTML === 'Supérieur')
        this.clickedNiveau = 2
      this.selectedArray = this.niveau[this.clickedNiveau];
      this.niveau_  = (<HTMLTextAreaElement>event.target).innerHTML;
  }

  onGetClasses($event:any){
    event.preventDefault();
     this.classe = (<HTMLTextAreaElement>event.target).innerHTML;
     console.log("classe: ", this.classe)
  }

  onSubmit() {
    this.ville = this.moreInfo2.value.Ville;
    this.ecole = this.moreInfo2.value.Ecole;
    this.choix1 = this.moreInfo2.value.Choix1;
    this.choix2 = this.moreInfo2.value.Choix2;

    if(this.href == '/more-info2'){
        this.authService.moreInfo2(this.ville, this.ecole, this.niveau_, this.classe, this.choix1, this.choix2);
        console.log("Insertion more2 succeed in firebase")
    } else if (this.href == '/more-info2/register/update'){
        this.authService.moreInfo2Update(this.ville, this.ecole, this.niveau_, this.classe, this.choix1, this.choix2);
        console.log("Update more2 succeed in firebase")
    }
    this.showsuccessFullyMessage = true;
    setTimeout(() => {this.showsuccessFullyMessage = false}, 3000)
   }

}
