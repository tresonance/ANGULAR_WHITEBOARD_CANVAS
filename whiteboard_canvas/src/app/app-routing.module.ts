import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuardService } from './services/guard.service'

import { LoginComponent } from './components/login/login.component';
/******************************************************************************/
/*                              LANDING PAGE                                  */
/******************************************************************************/
import {AccueilComponent } from './components/loni/accueil/accueil.component';
import {AproposComponent} from './components/loni/apropos/apropos.component'
import {ContactComponent} from './components/loni/contact/contact.component'
import {InfosServicesComponent} from './components/loni/infos-services/infos-services.component'
import {CommentairesComponent} from './components/loni/commentaires/commentaires.component'
import {TermsConditionComponent} from './components/loni/terms-condition/terms-condition.component'

import { RegisterComponent } from './components/register/register.component';
import { MoreInfoComponent } from './components/more-info/more-info.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FourOhFourComponent } from './components/four-oh-four/four-oh-four.component';
import { MoreInfo1Component } from './components/more-info1/more-info1.component';


import { ChatPageComponent } from './components/chatrooms/chat-page/chat-page.component';
import {ReglesDuChatComponent} from './components/chatrooms/regles-du-chat/regles-du-chat.component';
import { AdminComponent } from './components/admin/admin.component';

//---------------- CANVAS WITH OWN TOOLBAR ----------/
import {BoardComponent} from './components/whiteboard/board/board.component'
import { CameraComponent } from './components/whiteboard/camera/camera.component'

//import { MathComponent } from './components/chatrooms/rooms/math/math.component'
//import { ChatroomComponent } from './chatroom/chatroom/chatroom.component'
import { MeunuComponent } from './components/meunu//meunu.component'


const routes: Routes = [
  {
    path: 'loni',
    component: AccueilComponent
  },
  {
    path: 'camera',
    component: CameraComponent
  },
  {
    path: 'infos-services',
    component: InfosServicesComponent
  },
  {
    path: 'infos-services/:search',
    component: InfosServicesComponent,
  },
  {
    path: 'a_propos',
    component: AproposComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'commentaires',
    component: CommentairesComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'terms-condition',
    component: TermsConditionComponent
  },
  {
    path: 'more-info2',
    canActivate: [GuardService],
    component: MoreInfoComponent
  },
  {
    path: 'more-info1',
    canActivate: [GuardService],
    component: MoreInfo1Component,
  },
  {
    path: 'profile',
    canActivate: [GuardService],
    component: ProfileComponent
  },
  {
    path: 'more-info1/register/update',
    canActivate: [GuardService],
    component: MoreInfo1Component
  },
  /*{
    path: 'chatrooms/chat',
    canActivate: [GuardService],
    component: ChatComponent
  },
  {
    path: 'chatrooms/chat-box',
    canActivate: [GuardService],
    component:  ChatBoxComponent
  },
  {
    path: 'chatrooms/chat-room',
    canActivate: [GuardService],
    component:  ChatRoomComponent
  },*/
  {
    path: 'chatrooms/chat-page',
    canActivate: [GuardService],
    component:  ChatPageComponent
  },
  {
    path: 'chatrooms/chat-page/regle-du-chat',
    canActivate: [GuardService],
    component:  ReglesDuChatComponent
  },
  {
    path: 'more-info2/register/update',
    canActivate: [GuardService],
    component: MoreInfoComponent
  },
  {
    path: 'menu',
    canActivate: [GuardService],
    component: MeunuComponent
  },
  //------- MY OWN CANVAS WITH TOOLBAR -----------/
  {
    path: 'whiteboard',
    canActivate: [GuardService],
    component: BoardComponent
  },
  //------------ END ----------------------------/
  {
    path: 'admin',
    //canActivate: [GuardService],
    component: AdminComponent
  },
  {
    path: 'not-found',
    component: FourOhFourComponent
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
      path: '**',
      redirectTo: 'not-found'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      useHash:true,
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
