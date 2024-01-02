import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService} from '../../services/auth.service';
import { Observable } from 'rxjs';

import * as jQuery from 'jquery';
import { User } from '../../interfaces/user';
import { User2 } from '../../interfaces/user2';

import "jquery";
import "bootstrap";

//import 'zone.js';
//import 'zone.js/dist/long-stack-trace-zone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {

  user:Observable<firebase.User>
  currentUser:User2;
  isLoggedIn : Observable<boolean>;

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) {
        this.user = authService.user;
         //this.isLoggedIn = !!authService.isLoggedIn();
   }


  ngOnInit() {

        $(document).ready(function(){

          $(".nav-profile-container-link").on("click", function(e){
              e.preventDefault();
              console.log("you frezzzz");
            $(".popup, .profile-popup").addClass("active");
          });

          $(".close, .popup").on("click", function(){
$(".popup, .popup-content").removeClass("active");
});

        })
        ///////////// end doc ready ////////////////////
        this.currentUser = JSON.parse(localStorage.getItem('token'));
        jQuery(document).ready(() => {
          //"use strict";

		        var phone_width = 464;
		        var tablet_width = 751;
		        var desktop_width = 975;

            var headerHeight = jQuery("header").height();
		        var submenuHeight = 0;

            var stack_topleft = {"dir1": "down", "dir2": "right", "push": "bottom"};
            var stack_topright = {"dir1": "down", "dir2": "left", "push": "bottom"};
            var stack_bottomleft = {"dir1": "up", "dir2": "right", "push": "bottom"};
            var stack_bottomright = {"dir1": "up", "dir2": "left", "push": "bottom"};

            initialize();
            jQuery(window).on('load', function() {
                /* Back Top.
                Used: For future development */
                (<any>jQuery('[data-action^="backtop"]')).click(function(e){
                    e.preventDefault();
                    jQuery('body,html').animate({scrollTop:0},800);
                });


                /* Tags Input.
                Used: < data-rel = "tags-input" > */
                /*** AUCUNE REFERENCE DANS PROFIL HTML ***/
                //(<any>jQuery('[data-rel^="tags-input"]')).tagsInput({width:'auto'});

                /* Tags Input.
                Used: < data-rel = "switch" > */
                /*** AUCUNE REFERENCE DANS PROFIL HTML ***/
                //(<any>jQuery('[data-rel^="switch"]')).bootstrapSwitch();

                /* Tool Tips.
                Used: < data-toggle = "tooltip" > */
                (<any>jQuery('[data-toggle^="tooltip"]')).tooltip();


                /* Pop Over.
                Used: < data-toggle = "popover" > */
                (<any>jQuery('[data-toggle^="popover"]')).popover();


                /* Pretty Photo.
                Used: - For Grouping:  <a data-rel="prettyPhoto[portfolio-group]">
                - For Single Image: <a data-rel="prettyPhoto">
                */
                jQuery('a[data-rel^="prettyPhoto"]').each(function() {
                  jQuery(this).attr('rel', jQuery(this).data('rel'));
                });
  /*****/            //  (<any>jQuery("a[rel^='prettyPhoto']")).prettyPhoto({theme:'light_square'});

                /* Custom Scrollbar.
                Used: <div data-rel="scroll" data-scrollHeight="400" >
                */
  /*****/            /* (<any>jQuery('html.no-touch [data-rel^="scroll"]')).mCustomScrollbar({
                    set_height: function(){jQuery(this).css('max-height',jQuery(this).data('scrollheight')); return jQuery(this).data('scrollheight'); },
                    mouseWheel:"auto",
                    autoDraggerLength:true,
                    autoHideScrollbar:true,
                    advanced:{
                      updateOnBrowserResize:true,
                      updateOnContentResize:true
                    }, // removed extra commas
                }); */

                jQuery('html.touch [data-rel^="scroll"]').css({
                  'height' : function(){return(jQuery(this).data('scrollheight')) },
                  'max-height': function(){return(jQuery(this).data('scrollheight')) },
                  'overflow-y' :'scroll ',
                });

                /* --------------------------- END jQuery(window).load -------------------*/
             });

             /* Mega Menu Hover Checking.
		           Used: When Resizing Screen
		         */
		         jQuery( window ).resize(function() {
			            checkMegaMenu();
		         });

             if (jQuery("body").hasClass('responsive')){

	/*****/		            /*(<any>jQuery(window)).breakpoints({
				                breakpoints: [480, 751, 975]
			            });
			            jQuery(window).bind('exitBreakpoint751', function () {
				                jQuery(window).bind('enterBreakpoint480', function () {
						                    checkWindowTablet();
				                });
			           });

			           jQuery(window).bind('exitBreakpoint480', function () {
				               jQuery(window).bind('enterBreakpoint751', function () {
					                    checkWindowTablet();
				                });
			           });

			           jQuery(window).bind('exitBreakpoint751', function () {
				               jQuery(window).bind('enterBreakpoint975', function () {
					                    checkWindowDesktop();
				               });
			          });

			          jQuery(window).bind('exitBreakpoint975', function () {
				              jQuery(window).bind('enterBreakpoint751', function () {
					                   checkWindowTablet();
                      });
			          });*/
		      }

          jQuery('.navbar-tabs-menu [data-action^="expand-navbar-tabs-menu"]').click(function() {
			         jQuery(this).next().animate({width:'toggle', opacity:'toggle'},300,"swing");
			            jQuery(this).find(".badge").toggle('slow');
		      });


		     /*
			      Content Resizing
			      Used: When Click on container
		     */
		      jQuery('.vd_container').click(function() {
			         if (jQuery(window).width() <= desktop_width){
				             if (!jQuery('body').hasClass('nav-right-hide')){
					                  toggleNavbar('right');
					                  resizeAffixPanel();
				              } else if (!jQuery('body').hasClass('nav-left-hide')){
					                   toggleNavbar('left');
					                   resizeAffixPanel();
				             }

			       }
		       });


		         /* Menu Size Button
		           Used: When Resizing Screen
		          */

		      jQuery('[data-action^="nav-left-medium"]').click(function() {
			         navbarResize('left','medium');
			         resizeAffixPanel();
		      });
		      jQuery('[data-action^="nav-left-small"]').click(function() {
			         navbarResize('left','small');
			         resizeAffixPanel();
		      });

		      jQuery('[data-action^="nav-right-medium"]').click(function() {
			         navbarResize('right','medium');
			         resizeAffixPanel();
		      });
		      jQuery('[data-action^="nav-right-small"]').click(function() {
			         navbarResize('right','small');
			         resizeAffixPanel();
		      });
		      jQuery('[data-action^="toggle-navbar-left"]').click(function() {
			         toggleNavbar('left');
			         resizeAffixPanel();
		       });
		      jQuery('[data-action^="toggle-navbar-right"]').click(function() {
			          toggleNavbar('right');
			          resizeAffixPanel();
		       });


           //  Content Resizing Button
		       jQuery('[data-action^="remove-navbar"]').click(function() {
             //			jQuery(this).siblings().removeClass('active');
			       // if remove-navbar state
			          if (jQuery('body').hasClass('remove-navbar')){
				              jQuery('body').removeClass('remove-navbar');
				                  if (!jQuery('body').hasClass('nav-left-start-hide')){
					                       jQuery('body').removeClass('nav-left-hide');
				                  };
				                  if (!jQuery('body').hasClass('nav-right-start-hide')){
					                       jQuery('body').removeClass('nav-right-hide');
				                  };

                //				jQuery('[data-action^="remove-navbar"]').removeClass('active');
			          // if nav normal state
			          } else {
				              jQuery('body').removeClass('fullscreen');
				              jQuery('body').removeClass('remove-header');
				              jQuery('body').addClass('remove-navbar');
				              jQuery('body').addClass('nav-left-hide');
				              jQuery('body').addClass('nav-right-hide');
//				jQuery('[data-action^="remove-navbar"]').addClass('active');
			         }
		     });

         jQuery('[data-action^="remove-header"]').click(function() {
//			jQuery(this).siblings().removeClass('active');
			// if remove-navbar state
			     if (jQuery('body').hasClass('remove-header')){
				         jQuery('body').removeClass('remove-header');
//				jQuery('[data-action^="remove-header"]').removeClass('active');
			// if nav normal state
			     } else {
				         jQuery('body').removeClass('fullscreen');
				         jQuery('body').removeClass('remove-navbar');
				         if (!jQuery('body').hasClass('nav-left-start-hide')){
					              jQuery('body').removeClass('nav-left-hide');
				         };
				         if (!jQuery('body').hasClass('nav-right-start-hide')){
					              jQuery('body').removeClass('nav-right-hide');
				         };
				        jQuery('body').addClass('remove-header');
//				jQuery('[data-action^="remove-header"]').addClass('active');
			     }
		   });

       jQuery('[data-action^="fullscreen"]').click(function() {
//			jQuery(this).siblings().removeClass('active');
			// if remove-navbar state
			       if (jQuery('body').hasClass('fullscreen')){
				           jQuery('body').removeClass('fullscreen');
				           if (!jQuery('body').hasClass('nav-left-start-hide')){
					                jQuery('body').removeClass('nav-left-hide');
				           };
				          if (!jQuery('body').hasClass('nav-right-start-hide')){
					          jQuery('body').removeClass('nav-right-hide');
				          };
//				jQuery('[data-action^="fullscreen"]').removeClass('active');
			// if nav normal state
			       } else {
				           jQuery('body').removeClass('remove-header');
				           jQuery('body').removeClass('remove-navbar');
				           jQuery('body').addClass('fullscreen');
				           jQuery('body').addClass('nav-left-hide');
				           jQuery('body').addClass('nav-right-hide');
//				jQuery('[data-action^="fullscreen"]').addClass('active');
			     }
		});

		jQuery('[data-action^="boxedtofull"]').click(function() {
			if (jQuery('body').hasClass('boxed-layout')){
				jQuery('body').removeClass('boxed-layout');
				jQuery('body').addClass('full-layout');
				jQuery('[data-action^="boxedtofull"]').addClass('active');
			}
			else if (jQuery('body').hasClass('full-layout')){
				jQuery('body').removeClass('full-layout');
				jQuery('body').addClass('boxed-layout');
				jQuery('[data-action^="boxedtofull"]').removeClass('active');
			}
		});



		/* Sub Menu of Top Menu Button.
		   Used: Input at login, register, forget password */
		jQuery('[data-action^="submenu"]').click(function() {
			// if submenu state
			if (jQuery('body').hasClass('submenu')){
				jQuery('body').removeClass('submenu');
			} else {
				jQuery('body').addClass('submenu');
				//setCenterMenu();
			}
		});




		/* Open Menu Trigger
		   Used: < data-action="click-trigger" >
		         < data-action="click-target " >
		*/
		jQuery('[data-action^="click-trigger"]').click(function(e) { console.log("click-trigger");
			e.preventDefault();
			if (jQuery(this).parent().hasClass("hover-trigger") && jQuery(this).siblings().hasClass("hover-target")){
				return(0);
			}
			// check if not children of click-target then slideup
			if ( jQuery(this).parent().parent().parent().data("action") != "click-target " && jQuery(this).parent().parent().parent().parent().parent().data("action") != "click-target "    )  {

        jQuery('[data-action^="click-target"]').slideUp('slow',  function(){ calculateContentHeight();

					});
			} else{ console.log("bonjour bob")
			// check if children of click-target then slideup all the parent kids
				jQuery(this).parent().siblings().children('[data-action^="click-trigger"]').removeClass('open');
				jQuery(this).parent().siblings().children('[data-action^="click-target"]').slideUp('slow',  function(){calculateContentHeight();

					});

			}
			// if this is close
      /****************************************** pourquoi repli rapide des pop ups *******************************/
			/*if (! jQuery(this).hasClass('open')){


				if (jQuery(this).parent().parent().parent().data("action") != "click-target "){

					jQuery('[data-action^="click-trigger"]').removeClass('open');
				};
				jQuery(this).addClass('open');
				jQuery(this).parent().children('[data-action^="click-target"]').slideDown('slow',  function(){
          if (jQuery('.navbar-menu').outerHeight() < jQuery('.navbar-menu .vd_menu').outerHeight() + jQuery('.navbar-spacing ').outerHeight()){calculateContentHeight()};

				});


			// if this is open
			} else {
				jQuery(this).removeClass('open');
				// check if children of click-target then slideup
				if (jQuery(this).parent().parent().parent().data("action") == "click-target "){
					jQuery(this).parent().children('[data-action^="click-target"]').slideUp('slow',  function(){

					});
				}
			} */
      /***************************************************************************************************************/
			jQuery('body').removeClass('expand-all');

		});

		// Click outside click-target
		jQuery(document).click(function( event) { console.log("ici encore");
			 if (( jQuery( event.target).closest('[data-action^="click-trigger"]').get(0) == null ) && ( jQuery(event.target).closest('[data-action^="click-target"]').get(0) == null ) && ( jQuery(event.target).closest('[data-action^="expand-all"]').get(0) == null)) {
				 jQuery('[data-action^="click-target"]').hide();
				 jQuery('[data-action^="click-trigger"]').removeClass('open');
	 			 jQuery('body').removeClass('expand-all');
				 calculateContentHeight();
			   }
		  });



		/* Expand Tree Menu Button
		   Used: < data-action="expand-all " >   */
		jQuery('[data-action^="expand-all"]').click(function() { console.log("ok6 ok6")
			jQuery('[data-action^="click-target"]').slideUp('slow',  function(){
					calculateContentHeight();

			});
			jQuery('[data-action^="click-trigger"]').removeClass('open');
			if (jQuery('body').hasClass('expand-all')){
				jQuery('body').removeClass('expand-all');
			// if nav normal state
			} else {
				jQuery(this).closest('.navbar-menu').find('.vd_menu .child-menu').slideDown('slow',  function(){
					calculateContentHeight();

				}).find('[data-action^="click-trigger"]').addClass('open');
				jQuery('body').addClass('expand-all');
			}
		});



		/* Custom Input Wrapper.
		   Used: Input at login, register, forget password */
    	jQuery('.vd_input-wrapper input').blur(function(){
    			jQuery(this).parent(".vd_input-wrapper").removeClass("focus");
    	})
             .focus(function() {
    	        jQuery(this).parent(".vd_input-wrapper").addClass("focus");
    	});


		/* Widget Minimize Button
		   Used: < data-action="minimize" > in panel widget   */
		jQuery('[data-action^="minimize"]').click(function() {
			if (jQuery(this).hasClass('active')){
				jQuery(this).removeClass('active');
				jQuery(this).closest(".widget").children('.panel-body, .panel-body-list').slideDown('slow');
			} else{
				jQuery(this).addClass('active');
				jQuery(this).closest(".widget").children('.panel-body, .panel-body-list').slideUp('slow');
			}
		});

		/* Widget Close Button
		   Used: < data-action="close" > in panel widget   */
		jQuery('[data-action^="close"]').click(function() {
			jQuery(this).closest(".widget").hide();
		});


		/* Widget Refresh Button
		   Used: < data-action="refresh" > in panel widget   */
		jQuery('[data-action^="refresh"]').click(function() {
			(<any>jQuery(this)).closest(".widget").block({
				message: '<h2><i class="fa fa-spinner fa-spin vd_green"></i></h2>',
				css: {
					border: 'none',
					padding: '15px',
					background: 'none',
				},
				overlayCSS: { backgroundColor: '#FFF' },
				timeout: 2000
			});
		});




		/* Chat Close Button
		   Used: < data-action="chat-close" > in panel   */
		jQuery('[data-action^="chat-close"]').click(function() {
			jQuery('.vd_chat-menu').remove();
		});




		/* Notification Button
		   Used: < data-action="notification" >   */
		jQuery('[data-action^="notification"]').click(function(e){
				e.preventDefault();
				var position=jQuery(this).data('position');
				var type=jQuery(this).data('type');
				var icon=jQuery(this).data('icon');
				var title=jQuery(this).data('title');
				var message=jQuery(this).data('message');


				notification(position,type,icon,title,message);

		});

		jQuery('[data-toggle^="tabajax"]').click(function(e) {
			e.preventDefault();
			var jQuerythis = jQuery(this),
				loadurl = jQuerythis.attr('href'),
				targ = jQuerythis.attr('data-target');

			jQuery.get(loadurl, function(data) {
				jQuery(targ).html(data);
			});

			(<any>jQuery(this)).tab('show');
			return false;
		});


    /* Open Menu Trigger
		   Used: < data-action="click-trigger" >
		         < data-action="click-target " >
		*/
		jQuery('[data-action^="click-trigger"]').click(function(e) {
			e.preventDefault();
			if (jQuery(this).parent().hasClass("hover-trigger") && jQuery(this).siblings().hasClass("hover-target")){
				return(0);
			}
			// check if not children of click-target then slideup
			if ( jQuery(this).parent().parent().parent().data("action") != "click-target " && jQuery(this).parent().parent().parent().parent().parent().data("action") != "click-target "    )  {
				jQuery('[data-action^="click-target"]').slideUp('slow',  function(){ calculateContentHeight();
					});
			} else{
			// check if children of click-target then slideup all the parent kids
				jQuery(this).parent().siblings().children('[data-action^="click-trigger"]').removeClass('open');
				jQuery(this).parent().siblings().children('[data-action^="click-target"]').slideUp('slow',  function(){calculateContentHeight();

					});

			}
			// if this is close
			if (! jQuery(this).hasClass('open')){


				if (jQuery(this).parent().parent().parent().data("action") != "click-target "){
					jQuery('[data-action^="click-trigger"]').removeClass('open');
				};
				jQuery(this).addClass('open');
				jQuery(this).parent().children('[data-action^="click-target"]').slideDown('slow',  function(){    if (jQuery('.navbar-menu').outerHeight() < jQuery('.navbar-menu .vd_menu').outerHeight() + jQuery('.navbar-spacing ').outerHeight()){calculateContentHeight()};

				});


			// if this is open
			} else {
				jQuery(this).removeClass('open');
				// check if children of click-target then slideup
				if (jQuery(this).parent().parent().parent().data("action") == "click-target "){
					jQuery(this).parent().children('[data-action^="click-target"]').slideUp('slow',  function(){

					});
				}
			}
			jQuery('body').removeClass('expand-all');

		});

		// Click outside click-target
		jQuery(document).click(function(event) {
			 if (( jQuery(event.target).closest('[data-action^="click-trigger"]').get(0) == null ) && ( jQuery(event.target).closest('[data-action^="click-target"]').get(0) == null ) && ( jQuery(event.target).closest('[data-action^="expand-all"]').get(0) == null)) {

         jQuery('[data-action^="click-target"]').hide();
				 jQuery('[data-action^="click-trigger"]').removeClass('open');
	 			 jQuery('body').removeClass('expand-all');
				 calculateContentHeight();
			}
		});



		/* Expand Tree Menu Button
		   Used: < data-action="expand-all " >   */
		jQuery('[data-action^="expand-all"]').click(function() {
			jQuery('[data-action^="click-target"]').slideUp('slow',  function(){
					calculateContentHeight();

			});
			jQuery('[data-action^="click-trigger"]').removeClass('open');
			if (jQuery('body').hasClass('expand-all')){
				jQuery('body').removeClass('expand-all');
			// if nav normal state
			} else {
				jQuery(this).closest('.navbar-menu').find('.vd_menu .child-menu').slideDown('slow',  function(){
					calculateContentHeight();

				}).find('[data-action^="click-trigger"]').addClass('open');
				jQuery('body').addClass('expand-all');
			}
		});



		/* Custom Input Wrapper.
		   Used: Input at login, register, forget password */
    	jQuery('.vd_input-wrapper input').blur(function(){
    			jQuery(this).parent(".vd_input-wrapper").removeClass("focus");
    	})
             .focus(function() {
    	        jQuery(this).parent(".vd_input-wrapper").addClass("focus");
    	});


		/* Widget Minimize Button
		   Used: < data-action="minimize" > in panel widget   */
		jQuery('[data-action^="minimize"]').click(function() {
			if (jQuery(this).hasClass('active')){
				jQuery(this).removeClass('active');
				jQuery(this).closest(".widget").children('.panel-body, .panel-body-list').slideDown('slow');
			} else{
				jQuery(this).addClass('active');
				jQuery(this).closest(".widget").children('.panel-body, .panel-body-list').slideUp('slow');
			}
		});

		/* Widget Close Button
		   Used: < data-action="close" > in panel widget   */
		jQuery('[data-action^="close"]').click(function() {
			jQuery(this).closest(".widget").hide();
		});


		/* Widget Refresh Button
		   Used: < data-action="refresh" > in panel widget   */
		jQuery('[data-action^="refresh"]').click(function() {
			(<any>jQuery(this)).closest(".widget").block({
				message: '<h2><i class="fa fa-spinner fa-spin vd_green"></i></h2>',
				css: {
					border: 'none',
					padding: '15px',
					background: 'none',
				},
				overlayCSS: { backgroundColor: '#FFF' },
				timeout: 2000
			});
		});




		/* Chat Close Button
		   Used: < data-action="chat-close" > in panel   */
		jQuery('[data-action^="chat-close"]').click(function() {
			jQuery('.vd_chat-menu').remove();
		});




		/* Notification Button
		   Used: < data-action="notification" >   */
		jQuery('[data-action^="notification"]').click(function(e){
				e.preventDefault();
				var position=jQuery(this).data('position');
				var type=jQuery(this).data('type');
				var icon=jQuery(this).data('icon');
				var title=jQuery(this).data('title');
				var message=jQuery(this).data('message');


				notification(position,type,icon,title,message);

		});

		jQuery('[data-toggle^="tabajax"]').click(function(e) {
			e.preventDefault();
			var jQuerythis = jQuery(this),
				loadurl = jQuerythis.attr('href'),
				targ = jQuerythis.attr('data-target');

			jQuery.get(loadurl, function(data) {
				jQuery(targ).html(data);
			});

			(<any>jQuery(this)).tab('show');
			return false;
		});

    jQuery(window).on("scroll", function(){
				checkStickyMenu();
				checkBackTop();
		});
		jQuery(window).on("resize", function(){
				checkStickyMenu();
				checkBackTop();
		});





    //////////////////////////////////////////////////////////////////////////////////////////
    //                                  JQUERY FUNCTIONS                                    //
    //////////////////////////////////////////////////////////////////////////////////////////

    function initialize(){
			// Nav-toggle Active
			if (jQuery('body').hasClass('nav-medium')) {
				jQuery('[data-action^="nav-medium"]').addClass('active');
			}
			if (jQuery('body').hasClass('nav-small')) {
				jQuery('[data-action^="nav-small"]').addClass('active');
			}

			// Active Menu
			var active_page = jQuery('body').last().attr("data-active");
			jQuery('.navbar-menu .vd_menu > ul > li#'+active_page).addClass('active');
			jQuery('.navbar-menu .vd_menu > ul > li#'+active_page+' > a').append('<span class="menu-active"><i class="icon-caret-left"></i></span>');


			calculateContentHeight();

			if (jQuery(window).width() <= desktop_width ) {
					checkWindowTablet();
			}else{
					checkWindowDesktop();
			};

			checkStickyMenu();
			checkBackTop();
			checkMegaMenu();
		}
    // Calculate height function
  function calculateContentHeight(){
    var height=jQuery('.vd_navbar-left .navbar-tabs-menu').height() + jQuery('.vd_navbar-left .navbar-menu').height() + jQuery('.vd_navbar-left .navbar-spacing').height()  + 8;
    var height_right=jQuery('.vd_navbar-right .navbar-tabs-menu').height() + jQuery('.vd_navbar-right .navbar-menu').height() + jQuery('.vd_navbar-right .navbar-spacing').height()  + 8;
    jQuery('.vd_content-wrapper, .vd_content-wrapper > .vd_container').css('min-height', (height > height_right ) ? height : height_right );

    //console.log("height: ", height, "height_right: ", height_right);
   };

   function checkWindowTablet(){
				if (jQuery('body').hasClass('no-responsive')){
					return(false);
				}
				if (!jQuery('body').hasClass('nav-left-hide')) {
					jQuery('body').addClass('nav-left-hide');
				}
				if (!jQuery('body').hasClass('nav-right-hide')) {
					jQuery('body').addClass('nav-right-hide');
				}
				jQuery('body').removeClass('remove-navbar');
				jQuery('body').removeClass('remove-header');
				jQuery('body').removeClass('fullscreen');
				resizeAffixPanel();
		}
		function checkWindowDesktop(){
				if (jQuery('body').hasClass('no-responsive')){
					return(false);
				}
				if (jQuery('body').hasClass('nav-left-hide') ) {
					if (!jQuery('body').hasClass('nav-left-start-hide')){
						jQuery('body').removeClass('nav-left-hide');
					} else{
						jQuery('body').addClass('nav-left-hide');
					}
				}
				if (jQuery('body').hasClass('nav-right-hide')) {
					if (!jQuery('body').hasClass('nav-right-start-hide')){
						jQuery('body').removeClass('nav-right-hide');
					} else{
						jQuery('body').addClass('nav-right-hide');
					}
				}
				jQuery('body').removeClass('remove-navbar');
				jQuery('body').removeClass('remove-header');
				jQuery('body').removeClass('fullscreen');
				resizeAffixPanel();
		}

    function resizeAffixPanel(){
		    jQuery('.sidebar-affix .panel').css('width',(jQuery('.vd_content-section').innerWidth()-114)/3+'px');
		    if (jQuery(window).width()<=tablet_width)	{
				  jQuery('.sidebar-affix .panel').removeAttr('style');
		    }
	    }

      function checkStickyMenu(){
  			if ( !jQuery("body").hasClass("nav-top-fixed") || jQuery("body").hasClass("boxed-layout")) return(false);

  			if(jQuery(window).scrollTop() > headerHeight-submenuHeight   &&  jQuery(window).width() >= desktop_width){
  				// #Back-Top visible

  				if(jQuery("body").hasClass("sticky-menu-active"))
  					return false;
  				jQuery("body").addClass("sticky-menu-active");
  				if(!jQuery("body").hasClass("fullscreen") && !jQuery("body").hasClass("remove-header")){
  					jQuery("body").css('padding-top',headerHeight);
  				}
  				jQuery('header').css({
  							top: -headerHeight,
  							opacity:'.5',
  							transition: 'none',
  						}).stop(true, true).animate({
  							top: 0,
  							opacity: '1'
  					}, 1000, function(){
  						jQuery('header').removeAttr('style');
  						// Animation complete.
  				});
  			} else if( jQuery(window).scrollTop() <= 0||  jQuery(window).width() < desktop_width){
  				if (jQuery("body").hasClass("sticky-menu-active")){
  					jQuery("body").css('padding-top',0);
  					jQuery("body").removeClass("sticky-menu-active");
  					jQuery("body").removeAttr('style');
  				}
  			}
  		}

  		function checkBackTop(){
  			if(jQuery(window).scrollTop() > headerHeight-submenuHeight){
  				jQuery('#back-top').addClass('visible');
  			}  else if( jQuery(window).scrollTop() <= 0 ){
  				jQuery('#back-top').removeClass('visible');
  			}
  		}

      function checkMegaMenu(){
			if (jQuery(window).width() <= tablet_width ) {
				jQuery('.vd_mega-menu .hover-target').removeClass('hover-target').addClass('hover-target-temp');
			} else {
				jQuery('.vd_mega-menu .hover-target-temp').removeClass('hover-target-temp').addClass('hover-target');
			}

		}

    function navbarResize(direction, size){
			var opposite= (size=="small")? "medium":"small"
			// if nav size state
			if (jQuery('body').hasClass('nav-'+direction+'-'+size)){
				jQuery('body').removeClass('nav-'+direction+'-'+size);
				if (size=='small' && jQuery('body').hasClass('enlarge-'+direction+'-to-medium')){
					jQuery('body').addClass('nav-'+direction+'-medium');
				}
			// if nav normal
			} else {
				jQuery('body').removeClass('nav-'+direction+'-'+opposite);
				jQuery('body').addClass('nav-'+direction+'-'+size);
			}
			jQuery('.vd_navbar-'+direction+' .navbar-tabs-menu .menu-container').removeAttr('style');
			jQuery('.vd_navbar-'+direction+' .navbar-tabs-menu [data-action^="expand-navbar-tabs-menu"] .badge').removeAttr('style');

		}

    function toggleNavbar(direction){
			var opposite= (direction=="left")? "right":"left";
			jQuery('body').removeClass('remove-navbar');
			jQuery('body').removeClass('fullscreen');

			// if nav-direction is hiding
			if (jQuery('body').hasClass('nav-'+direction+'-hide')) {
				jQuery('body').removeClass('nav-'+direction+'-hide');
//				navToggle(direction, "show");
				// if there is nav-opposite AND (nav-direction start with hiding OR smaller screen)
				if (!jQuery('body').hasClass('no-nav-'+opposite) && !jQuery('body').hasClass('nav-'+opposite+'-hide') && (jQuery('body').hasClass('nav-'+direction+'-start-hide') || jQuery(window).width() < desktop_width) ){
//					navToggle(opposite, "hide");
					jQuery('body').addClass('nav-'+opposite+'-hide');
				}
			}	else
			// if nav-opposite is hiding
			if (jQuery('body').hasClass('nav-'+opposite+'-hide') && jQuery(window).width()>= desktop_width ){
				jQuery('body').removeClass('nav-'+opposite+'-hide');
				jQuery('body').addClass('nav-'+direction+'-hide');
			}  else {
				jQuery('body').addClass('nav-'+direction+'-hide');
			}
		}

    function notification(position, notif_type,icon_class,notif_title,notif_text){
	var output_title, output_stack;
	if (notif_title==""){output_title="";} else {
		output_title='<h5><strong>'+notif_title+'</strong></h5>';
	};

	switch (position) {
		case 'topright' : output_stack = stack_topright; break;
		case 'topleft' : output_stack = stack_topleft; break;
		case 'bottomright' : output_stack = stack_bottomright; break;
		case 'bottomleft' : output_stack = stack_bottomleft; break;
	}


	(<any>jQuery).pnotify({
//				title: 'My Title',
		title_escape: true,
		text: '<div class="content-list content-image"><div class="list-wrapper mgtp-10 mgbt-xs-10"><div><div class="menu-icon"><i class="'+icon_class+'"></i></div> <div class="menu-text">'+output_title+'<p class="lh-sm">'+notif_text+'</p> </div></div></div></div>',
		cornerclass: '',
		type: notif_type,
		icon: 'false',
		width: '320px',
		closer_hover: false,
		sticker: true,
		opacity: 1,
		animation: {
			effect_in: 'shake',
			effect_out: 'fade'
		},
		addclass: 'stack-'+position,
		stack: output_stack

	});
}

		jQuery('.navbar-tabs-menu [data-action^="expand-navbar-tabs-menu"]').click(function() {
			jQuery(this).next().animate({width:'toggle', opacity:'toggle'},300,"swing");
			jQuery(this).find(".badge").toggle('slow');
		});




        /****************** END DOCUMENT READY ***********************/
        })
        /****************** END NG-ONINIT ****************************/
  }



}
