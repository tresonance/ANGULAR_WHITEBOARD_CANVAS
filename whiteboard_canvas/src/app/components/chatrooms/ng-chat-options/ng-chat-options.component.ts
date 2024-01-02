import { Component, Input, OnInit,OnChanges ,DoCheck, ViewChildren, ViewChild, HostListener,  SimpleChanges,
          Output, EventEmitter, ElementRef, ViewEncapsulation , Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
//import { ChatAdapter } from 'ng-chat';
//import { ChatAdapter } from 'ng-chat';


import { ChatRoom, PublicChatMessage, GeneriqueMessage, ChatUser, MessageType, Theme, ParticipantType, ParticipantStatus, FirebaseUser,UserMetadata,
          PrivateChatGroup,PrivateChatLocalization, DemoAdapter, DemoAdapterPagedHistory, IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,
          ChatAdapter,  PrivateChatMessage, ParticipantResponse, ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../../../models/chat/chat';

import {DateFormatPipe } from '../../../models/chat/date-pipe-format'
import { DateTimeFormatPipe}  from '../../../models/chat/date-time-pipe-format'
//import {Localization, StatusDescription} from '../../../interfaces/private-chat';

import {AuthService} from '../../../services/auth.service';
import {PrivateChatService} from '../../../services/private-chat.service';


import { ChatService } from '../../../services/chat.service';
import { NotifyService } from '../../../services/notify.service';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { User } from '../../../interfaces/user';
import { User2 } from '../../../interfaces/user2';
import { StringFormat } from '../../../models/chat/string-format'

import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';

import 'rxjs/add/observable/from';
//import 'rxjs/add/operator/map';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/catch' ;
import { filter } from 'rxjs/operator/filter';

//import { map } from 'rxjs/operator/map';
//Object.assign(Actions.prototype, {  map, filter, catch, from });


@Component({
  selector: 'app-ng-chat-options',
  templateUrl: './ng-chat-options.component.html',
  styleUrls: ['./ng-chat-options.component.scss']
})

export class NgChatOptionsComponent implements OnInit {

  constructor() { }

  @Input()
  public options: IChatOption[];

  @Input()
  public activeOptionTracker: IChatOption;

  @Output()
  public activeOptionTrackerChange: EventEmitter<IChatOption> = new EventEmitter<IChatOption>();

  @Input()
  public chattingTo: ChatboxWindow;

  ngOnInit() {
  }

  onOptionClicked(option: IChatOption): void
  {
      if (option.action)
      {
          option.isActive = true;
          option.action(this.chattingTo);
          this.activeOptionTrackerChange.emit(option);
      }
  }

}
