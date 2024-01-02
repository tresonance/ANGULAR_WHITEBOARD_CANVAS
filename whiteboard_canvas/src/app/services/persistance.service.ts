import { Injectable } from '@angular/core';
import { Subject , BehaviorSubject} from 'rxjs';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {  Observable ,of} from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';

import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { UserService } from './user.service';
import { CookieService } from "angular2-cookie/core";

import * as firebase from 'firebase/app';

import { map } from 'rxjs/operators';
import { first } from 'rxjs/operators';
/******************** INTERFACE ********************/
import { User, UserMoreInfo } from '../interfaces/user';
import { User2 } from '../interfaces/user2';


@Injectable({
  providedIn: 'root'
})
export class PersistanceService {

  constructor() { }

  /********************************************************************************/
  /*                               LOCAL STORAGE
  /********************************************************************************/
  set_local(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      //this.add_current_connected_users_to_storage(data);

      //console.log("LOCAL STORAGE : Key["+key+"] :", JSON.stringify(data));
    } catch (err) {
      console.error('Error saving to localStorage', err);
    }

  }

  get_local(key: string) {
    try {
          let result = JSON.parse(localStorage.getItem(key));
          //console.log("I GET THIS FROM LOCAL STORAGE: ", JSON.stringify(result));
          return result;
    } catch (err) {
      console.error('Error getting data from localStorage', err);
      return null;
    }
  }

  get_all_local(){
      for (let i = 0; i < localStorage.length; i++){
          let key = localStorage.key(i);
          let value = localStorage.getItem(key);
          console.log(key, value);
      }
  }

  clearUserSettings_local(key: string) {
    localStorage.removeItem(key);
  }

  cleanAll_local() {
    localStorage.clear()
  }

  /********************************************************************************/
  /*                               SESSION STORAGE
  /********************************************************************************/

  set_session(key: string, data: any): void {
    try {
      if(!this.get_session(key))
              sessionStorage.setItem(key, JSON.stringify(data))

    } catch (err) {
      console.error('Error saving to sessionStorage', err);
    }

  }


  get_session(key: string): UserMoreInfo | null  {
    try {
          let result = JSON.parse(sessionStorage.getItem(key));
          //console.log("I GET THIS FROM LOCAL STORAGE: ", JSON.stringify(result));
          return result;
    } catch (err) {
      console.error('Error getting data from sessionStorage', err);
      return null;
    }
  }


  clearUserSettings_session(key: string) {
      if(this.get_session(key))
          sessionStorage.removeItem(key);

  }

  cleanAll_session() {
    sessionStorage.clear();
  }




}
