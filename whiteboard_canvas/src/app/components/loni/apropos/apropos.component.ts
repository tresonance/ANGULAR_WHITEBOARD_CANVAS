import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-apropos',
  templateUrl: './apropos.component.html',
  styleUrls: ['./apropos.component.scss']
})
export class AproposComponent implements OnInit {

  constructor() { }

  ngOnInit() {

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

        //----------------- END DOCUMENT READY ----------------------//
        })

        //END NG-ONINIT
  }

}
