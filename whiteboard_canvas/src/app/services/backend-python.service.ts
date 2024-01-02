import { Injectable } from '@angular/core';
import { Subject , Observable, BehaviorSubject, of,  throwError} from 'rxjs';
import {catchError} from 'rxjs/operators/catchError';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database'
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
//import { ChatAdapter } from 'ng-chat';

import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';
import { v4 as uuid } from 'uuid';

//import { v4 as uid } from 'uid';

//Back end
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
//import {Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/catch';
import {API_URL} from '../config_backend/env';
import {Handwritting, IHandwritting} from '../config_backend/handwritting.model';


import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { AuthService} from './auth.service';
import { UserService} from './user.service';
//import { BackendPythonService} from './backend-python.service';


//import {CanvasWhiteboardPoint, CanvasWhiteboardShapeOptions,CanvasStroke,
  //        CanvasWhiteboardUpdate, CanvasWhiteboardShape, CanvasWhiteboardUpdateType} from '../models/whiteboard/whiteboard'
  import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,CanvasStroke,
           CanvasWhiteboardUpdate, CanvasWhiteboardOptions , CircleShape, CanvasWhiteboardShape,
           RectangleShape, FreeHandShape, SmileyShape, LineShape, StarShape, INewCanvasWhiteboardShape} from '../models/whiteboard/whiteboard'

@Injectable({
  providedIn: 'root'
})
export class BackendPythonService {

  post_url:string = '/v1';
  post_url2:string= 'http://127.0.0.1:4200/api/v1'

  constructor(private http: HttpClient) { }

  private static _handleError(err: HttpErrorResponse | any) {
    return throwError(err.message || 'Error: Unable to complete request.');
  }

  // GET list of public, future events
 getHandwrittings(): Observable<Handwritting[]> {
   return this.http
     .get<Handwritting[]>('/api/handwrittings/receive/data')
     .catch((err) => BackendPythonService._handleError(err));
 }


 // GET list of public, future events
getHandwrittingsGraphic(): Observable<Handwritting[]> {
  return this.http
    .get<Handwritting[]>('/api/handwrittings/receive/graphic')
    .catch((err) => BackendPythonService._handleError(err));
}

 postHandwrittings(handwritting: any) {

   return this.http.post('/api/handwrittings/send', JSON.stringify(handwritting), {
      headers: new HttpHeaders({
           'Content-Type':  'application/json',
         })
    }).map(data => data)
      .catch(BackendPythonService._handleError)

 }

 //-------------------- END ----------------------------------/
}
