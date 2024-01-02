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


import {CanvasWhiteboardPoint, CanvasWhiteboardShapeOptions,
          CanvasWhiteboardUpdate, CanvasWhiteboardShape, CanvasWhiteboardUpdateType} from '../models/whiteboard/whiteboard'

  export interface INewCanvasWhiteboardShape<T extends CanvasWhiteboardShape> {
              new(positionPoint?: CanvasWhiteboardPoint, options?: CanvasWhiteboardShapeOptions, ...args: any[]): T;
  }

import { StringFormat } from '../models/chat/string-format'

import * as firebase from 'firebase/app';

import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CanvasWhiteboardService {

  private _canvasDrawSubject: Subject<CanvasWhiteboardUpdate[]> = new Subject();
  canvasDrawSubject$: Observable<CanvasWhiteboardUpdate[]> = this._canvasDrawSubject.asObservable();

  private _canvasClearSubject: Subject<any> = new Subject();
  canvasClearSubject$: Observable<any> = this._canvasClearSubject.asObservable();

  private _canvasUndoSubject: Subject<any> = new Subject();
  canvasUndoSubject$: Observable<any> = this._canvasUndoSubject.asObservable();

  private _canvasRedoSubject: Subject<any> = new Subject();
  canvasRedoSubject$: Observable<any> = this._canvasRedoSubject.asObservable();

  public drawCanvas(updates: CanvasWhiteboardUpdate[]): void {
      this._canvasDrawSubject.next(updates);
  }

  public clearCanvas(): void {
      this._canvasClearSubject.next(true);
  }

  public undoCanvas(updateUUD: string): void {
      this._canvasUndoSubject.next(updateUUD);
  }

  public redoCanvas(updateUUD: string): void {
      this._canvasRedoSubject.next(updateUUD);
  }

}
