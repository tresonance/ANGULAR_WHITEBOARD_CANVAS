import { Injectable } from '@angular/core';
import { Subject , Observable, BehaviorSubject, of} from 'rxjs';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database'
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
//import { ChatAdapter } from 'ng-chat';

import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';
import { v4 as uuid } from 'uuid';

//import { v4 as uid } from 'uid';



import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { AuthService} from './auth.service';
import { UserService} from './user.service';


//import {CanvasWhiteboardPoint, CanvasWhiteboardShapeOptions,CanvasStroke,
  //        CanvasWhiteboardUpdate, CanvasWhiteboardShape, CanvasWhiteboardUpdateType} from '../models/whiteboard/whiteboard'
  import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,CanvasStroke,
           CanvasWhiteboardUpdate, CanvasWhiteboardOptions , CircleShape, CanvasWhiteboardShape,
           RectangleShape, FreeHandShape, SmileyShape, LineShape, StarShape, INewCanvasWhiteboardShape} from '../models/whiteboard/whiteboard'

  export interface INewCanvasWhiteboardShape<T extends CanvasWhiteboardShape> {
              new(positionPoint?: CanvasWhiteboardPoint, options?: CanvasWhiteboardShapeOptions, ...args: any[]): T;
  }

import { StringFormat } from '../models/chat/string-format'

import * as firebase from 'firebase/app';

import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class HandwrittingSegmentationService {

  constructor() { }
}
