import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $(document).ready(function(){
      $(".sfsi_widget").each(function( index ) {
        if(jQuery(this).attr("data-position") == "widget")
        {
          var wdgt_hght = $(this).children(".norm_row.sfsi_wDiv").height();
          var title_hght = $(this).parent(".widget.sfsi").children(".widget-title").height();
          var totl_hght =  title_hght  +  wdgt_hght ;
          $(this).parent(".widget.sfsi").css("min-height", totl_hght+"px");
        }
      });

    /////////////////END DOCUMENT READY /////////////////////////////////////
    })

    ////////////////////////// ZND NG-ONINIT  //////////////////////////////////
  }

}
