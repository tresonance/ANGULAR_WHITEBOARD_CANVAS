import {
    Component,
    ElementRef,
    Input,
    ViewChild,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    OnInit,
  EventEmitter,
   Output,
   OnDestroy,  NgZone, ChangeDetectorRef, DoCheck
} from "@angular/core";

import { Router } from '@angular/router';
import * as $ from 'jquery';
import {CanvasWhiteboardService} from '../../services/canvas-whiteboard.service'
import {MathJackService} from '../../services/math-jack.service'

import {MathContent} from '../math_utils/math-content';

declare const ChemDoodle: any;

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})

export class AccueilComponent implements OnInit, AfterViewInit {

      //Maath
      mathLatex1: MathContent = {
          latex:'$$\\sum_{i=0}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$$'
      };
      mathLatex2: MathContent = {
          latex:'$$e^{\\pi i} + 1 = 0$$'
      };
      mathLatex3: MathContent = {
          latex: '\\begin{equation} x = a_0 + \\frac{1}{\\displaystyle a_1 + \\frac{1}{\\displaystyle a_2 + \\frac{1}{\\displaystyle a_3 + a_4}}} \\end{equation}'
      };

      mathLatex4: MathContent = {
          latex: '$$\\lim_{x \\to +\\infty} \\frac{3x^2 +7x^3}{x^2 +5x^4} = 3$$'
      }
      mathLatex5: MathContent = {
          latex:'$$\\int_0^R \\frac{2x\\,dx}{1+x^2} = \\log(1+R^2)$$'
      }

      //Physique
      mathLatex6: MathContent = {
          latex:'$$\\frac{d}{dt}\\overrightarrow{OM} = \\frac{dx}{dt}\\vec i + \\frac{dy}{dt}\\vec j + \\frac{dz}{dt}\\vec k$$'
      };
      //Chimie
      mathLatex7:MathContent = {
          latex: '$$\\ce{ H3O+ + OH- <=>> 2H2O }$$'
      };
      mathLatex8: MathContent = {
          latex:'$$\\ce{CH3\\bond{1}}{\\stackrel{\\;\\;\\;\\large\\ce{CH3}}{\\stackrel{|}{\\underset{\\underset{\\huge\\ce{Cl}}{|}}{\\ce{C}}}}}\\ce{-CH3}$$'
      };

      mathLatex10: MathContent = {
          latex: '<script type="text/tikz">\\begin{tikzpicture}\\draw (0,0) circle (1in);\\end{tikzpicture}</script>'
      }




 mathMl: MathContent = {
   mathml: `<math xmlns="http://www.w3.org/1998/Math/MathML">
 <mrow>
   <mover>
     <munder>
       <mo>∫</mo>
       <mn>0</mn>
     </munder>
     <mi>∞</mi>
   </mover>
   <mtext> versus </mtext>
   <munderover>
     <mo>∫</mo>
     <mn>0</mn>
     <mi>∞</mi>
   </munderover>
 </mrow>
</math>`
 };


  constructor(private router: Router) { }


  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnInit() {

    $(document).ready(() => {



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


        $('.js-scrollTo').on('click', function() { // Au clic sur un élément
			var page = $(this).attr('href'); // Page cible
      console.log("page:", page);
			var speed = 750; // Durée de l'animation (en ms)
      var top = $(page).offset().top;

			$('html, body').animate( { scrollTop: top  }, speed ); // Go
      //$('html, body').animate( { scrollTop: -$(document).height()  }, speed ); // Go
			return false;
		});
        //SUB MENU
          //__________________ END DOC READY ______________________________//
          });
    }


    ngAfterViewInit(){

      //END VIEW INIT
    }




}
