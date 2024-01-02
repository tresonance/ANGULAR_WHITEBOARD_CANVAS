import { NgModule } from '@angular/core';
import { PushNotificationsModule } from 'ng-push';
import { shareReplay } from 'rxjs/operators';

/**********************************************************************/
/*PIPE FORMAT
/**********************************************************************/
import { DateFormatPipe } from './models/chat/date-pipe-format';
import { DateTimeFormatPipe } from './models/chat/date-time-pipe-format';
import { StringFormat } from './models/chat/string-format';
import {EmojifyPipe} from './pipes/emojify.pipe';
import {LinkfyPipe }  from './pipes/linkfy.pipe';

/************************** CLASS MODELS ******************************/
//import { ChatMessage } from './modes/chat-message-model';

/***********************************************************************/
/* PRIVATE CHAT
/***********************************************************************/
import { NgChatModule } from 'ng-chat';

/******************** CANVAS TOOLBAR COLOR PICKER *********************/
import { ColorPickerModule } from 'ngx-color-picker';
import { NgColorModule } from 'ng-color';
/***********************************************************************/
/*
/***********************************************************************/
import {WebcamModule} from 'ngx-webcam';
/******************** ROUTES MODULE ***********************************/
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
/******************** MANAGE SESSION AND WEB STORAGE ********************/
import {BrowserModule} from '@angular/platform-browser';
import {NgxWebstorageModule} from 'ngx-webstorage';
import {CanvasWhiteboardModule} from 'ng2-canvas-whiteboard';

//import { DrawableDirective } from './drawable.directive';

/************************ VIEW COMPONENTS *****************************/
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MoreInfoComponent} from './components/more-info/more-info.component';
import { MoreInfo1Component } from './components/more-info1/more-info1.component'
import { ProfileComponent } from './components/profile/profile.component';
import { MeunuComponent} from './components/meunu/meunu.component';
import { FourOhFourComponent } from './components/four-oh-four/four-oh-four.component';
import {MathModule} from './components/math_utils/math.module';
//import { ChatComponent } from './chatroom/chat/chat.component';

/************************ REACTIVE FORM MODULE **************************/
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/*********************** CONFIG FILE MODULE *****************************/
import { environment } from '../environments/environment';

/*************************************************************************/
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };


/*************************   SERVICES  **********************************/
import { AuthService} from './services/auth.service';
import { GuardService } from './services/guard.service';
import { NotifyService } from './services/notify.service';
import { UserService } from './services/user.service';
import { ChatService } from './services/chat.service';
import { SignalingService } from './services/signaling.service'
import { WebRTCService } from './services/web-rtc.service';

import { AdminService } from './services/admin.service';
import {PrivateChatService}  from './services/private-chat.service';
import {UploadFileService }  from './services/upload-file.service';
import {HandwrittingPreprocessingService} from './services/handwritting-preprocessing.service'
import {HandwrittingSegmentationService} from './services/handwritting-segmentation.service'
import {BackendPythonService} from './services/backend-python.service'
import {MathJackService} from './services/math-jack.service'

//import { CookieService } from './services/cookie.service';
import { CookieService } from "angular2-cookie/services/cookies.service";
import { PersistanceService } from './services/persistance.service';
import { CanvasWhiteboardService } from './services/canvas-whiteboard.service';
import {CanvasWhiteboardShapeService} from './services/canvas-whiteboard-shape.service'

/************************** FIREBASE MODULE ******************************/
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database';
import { AngularFireStorageModule } from 'angularfire2/storage';
/************************* MULTI WINDOW ***********************************/
import {MultiWindowModule} from 'ngx-multi-window';

/************************* HTTP CLIENT ************************************/
import { HttpClientModule } from '@angular/common/http';



/************************* ANIMATION MATERIAL  *****************************/
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  //MaterialModule,

  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule
} from '@angular/material';


const MAT_MODULES  = [
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  //MaterialModule,

  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule
];


/******************* CHAT UTILS COMPONENTS *************************************/

import { NavbarComponent } from './components/navbar/navbar.component';
import { TitleComponent } from './components/chatrooms/title/title.component';

//import { ChatBoxComponent } from './components/chatrooms/chat-box/chat-box.component';
//import { ChatRoomComponent } from './components/chatrooms/chat-room/chat-room.component';
//import { ChatComponent } from './components/chatrooms/chat/chat.component';



import { NgxFileDropModule } from 'ngx-file-drop';


import { EmojiPickerModule } from 'ng-emoji-picker';
import { ChatPageComponent } from './components/chatrooms/chat-page/chat-page.component';
import { AdminComponent } from './components/admin/admin.component';
import { NgChatComponent } from './components/chatrooms/ng-chat/ng-chat.component';
import { NgChatOptionsComponent } from './components/chatrooms/ng-chat-options/ng-chat-options.component';
//import { AccueilComponent } from './components/loni/accueil/accueil.component';

import { ToolbarComponent } from './components/whiteboard/toolbar/toolbar.component';
import { CanvasComponent } from './components/whiteboard/canvas/canvas.component';
import { BoardComponent } from './components/whiteboard/board/board.component';
import { CanvasSelectionShapeComponent } from './components/whiteboard/canvas-selection-shape/canvas-selection-shape.component';
import { StrokeColorPickerComponent } from './components/whiteboard/stroke-color-picker/stroke-color-picker.component';
import { FillColorPickerComponent } from './components/whiteboard/fill-color-picker/fill-color-picker.component';
import { AccueilComponent } from './components/loni/accueil/accueil.component';
import { AproposComponent } from './components/loni/apropos/apropos.component';
import { ContactComponent } from './components/loni/contact/contact.component';
import { InfosServicesComponent } from './components/loni/infos-services/infos-services.component';
import { CommentairesComponent } from './components/loni/commentaires/commentaires.component';
import { TermsConditionComponent } from './components/loni/terms-condition/terms-condition.component';
import { ReglesDuChatComponent } from './components/chatrooms/regles-du-chat/regles-du-chat.component';
import { CameraComponent } from './components/whiteboard/camera/camera.component';




  /**
  *  THE CHAT COMPONENT (VIEWS)
  */



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    MoreInfoComponent,
    ProfileComponent,
    MeunuComponent,
    FourOhFourComponent,
    MoreInfo1Component,
    NavbarComponent,
    TitleComponent,
    //ChatComponent,

    //ChatBoxComponent,
    //ChatRoomComponent,
    ChatPageComponent,
    AdminComponent,
    DateFormatPipe,
    DateTimeFormatPipe,
    NgChatComponent,
    LinkfyPipe,
    EmojifyPipe,
    NgChatOptionsComponent,
    //AccueilComponent,
    //DrawableDirective,
    ToolbarComponent,
    CanvasComponent,
    BoardComponent,
    CanvasSelectionShapeComponent,
    StrokeColorPickerComponent,
    FillColorPickerComponent,
    AccueilComponent,
    AproposComponent,
    ContactComponent,
    InfosServicesComponent,
    CommentairesComponent,
    TermsConditionComponent,
    ReglesDuChatComponent,
    CameraComponent,

  ],

  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    PushNotificationsModule,
    ColorPickerModule,
    NgColorModule, // Inlude in @NgModule
    MAT_MODULES,

    AngularFireStorageModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,

    NgBootstrapFormValidationModule.forRoot(),
    MathModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule, //for database
    AngularFireStorageModule,
    AngularFireStorageModule,
    NgxFileDropModule,
    FormsModule,
    EmojiPickerModule,

    ReactiveFormsModule,

    BrowserModule,
    NgxWebstorageModule.forRoot(),
    HttpClientModule ,
    MultiWindowModule.forRoot({ heartbeat: 542 }),
    NgChatModule,
    CanvasWhiteboardModule,
    WebcamModule,
    SocketIoModule.forRoot(config) ,
  ],

  exports: MAT_MODULES,
  providers: [ AuthService, AngularFireDatabase,GuardService, NotifyService,  StringFormat, CanvasWhiteboardService,
                UserService, ChatService, AdminService, CookieService, PrivateChatService, PersistanceService,HandwrittingSegmentationService,
                UploadFileService, CanvasWhiteboardShapeService, HandwrittingPreprocessingService, BackendPythonService, MathJackService,
                 SignalingService, WebRTCService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
