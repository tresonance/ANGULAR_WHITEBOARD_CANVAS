import {   Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnInit,
EventEmitter,
 Output,
 OnDestroy,  NgZone, ChangeDetectorRef, DoCheck } from '@angular/core';
 
import { Routes, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-infos-services',
  templateUrl: './infos-services.component.html',
  styleUrls: ['./infos-services.component.scss']
})


export class InfosServicesComponent implements OnInit {
search:string = '';
cours_domicile:boolean = false;
cours_intensifs:boolean = false;
cours_en_ligne:boolean = false;
cours_live:boolean = false;
autre_cours_en_ligne:boolean = false;
cours_et_suivi:boolean = false;


  constructor( private route: ActivatedRoute, private router:Router ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
          return false;
        };

        this.router.events
        .pipe(take(1))
        .subscribe((evt) => {

          if (evt instanceof NavigationEnd) {

              this.router.navigated = false;
           }
        })
  }

  ngOnInit() {
  this.search = this.route.snapshot.paramMap.get('search');

      if(this.search == '?cours-domicile'){
        this.cours_domicile = true;

      } else if (this.search == '?cours-intensifs'){
        this.cours_intensifs = true;

      } else if (this.search == '?cours-live'){
        this.cours_live = true;

      } else if (this.search == '?cours-ligne'){
        this.autre_cours_en_ligne = true;
      } else if (this.search == '?cours-suivi'){
        this.cours_et_suivi = true;
      } else if (this.search == '?commentaires'){
        this.router.navigate(['commentaires'])
      }



      $(document).ready(function(){


        var acc = document.getElementsByClassName("accordion");
        var i;

        for (i = 0; i < acc.length; i++) {
          acc[i].addEventListener("click", function() {
            /* Toggle between adding and removing the "active" class,
            to highlight the button that controls the panel */
            this.classList.toggle("active");

            /* Toggle between hiding and showing the active panel */
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
              panel.style.display = "none";
            } else {
              panel.style.display = "block";
            }
       });
     }

     $('.accordion').on('click', function(){
        if($(this).find(">:first-child").hasClass("glyphicon-plus-sign"))
            $(this).find(".glyphicon-plus-sign").addClass("glyphicon-minus-sign").removeClass("glyphicon-plus-sign");
        else if ($(this).find(">:first-child").hasClass('glyphicon-minus-sign'))
            $(this).find(".glyphicon-minus-sign").addClass("glyphicon-plus-sign").removeClass("glyphicon-minus-sign");
     })

        //-------------- END DOCUMENT READY -----------------------//
      })




      //-------------- END NG-ONINIT--------------------------------//
  }


  initialize_ancre(ele:any){
    this.cours_domicile = false;
    this.cours_intensifs = false;
    this.cours_en_ligne = false;
    this.cours_live = false;
    this.autre_cours_en_ligne = false;
    this.cours_et_suivi = false;
  }

}
