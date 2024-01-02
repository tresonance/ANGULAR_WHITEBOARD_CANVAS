import { Injectable } from '@angular/core';
import { Subject , BehaviorSubject} from 'rxjs';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database'

import {HttpResponse, HttpClient, HttpHeaders, HttpRequest, HttpParams} from '@angular/common/http';

const optionRequete = {
  headers: new HttpHeaders({
    'Access-Control-Allow-Origin':'*',
  })
};

import {  Observable ,of} from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';
import * as firebase from 'firebase/app';

import { ChatRoom, PublicChatMessage, PublicFileMessage, ChatUser, MessageType, Theme, ParticipantType,FileUpload,
        ParticipantStatus,FileMessage, PrivateChatMessage, DemoAdapter, DemoAdapterPagedHistory,   PrivateChatGroup,
        IChatOption, IChatParticipant, ChatboxWindow,  IChatGroupAdapter,UserMetadata,  FirebaseUser,  ChatAdapter, ChatRoomLocalization,
        ParticipantResponse,  ScrollDirection, PagedHistoryChatAdapter, IFileUploadAdapter } from '../models/chat/chat';


import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { UserService } from './user.service';
import { PersistanceService } from './persistance.service';
import { PrivateChatService } from './private-chat.service';
import { CookieService } from "angular2-cookie/core";

//import { FileUpload } from '../models/chat/chat'

@Injectable({
  providedIn: 'root'
})

export class UploadFileService {

    //BASE_URL:string = 'http://localhost:4200/#/chatrooms/chat-page',
    BASE_URL:string = 'http://localhost:4200/#/chatrooms/chat-page/api/image'
    authKey:string = 'AIzaSyCmowOH8iFVkwCH9q2D9fnfBoOyCkA0Ra0';
  //Users list
     public USERS = '/users';

  // Chatbox refs
    public CHATBOX_REF = '/chatbox';
    public CHATBOX_CHATS_REF = this.CHATBOX_REF + '/chats';  /*                         */
    public CHATBOX_USERS_REF = this.CHATBOX_REF + '/{0}';
    public CHATBOX_USERS_USER_REF = this.CHATBOX_USERS_REF + '/{0}';
    // Chatrooms refs
    public CHATROOMS_REF = '/chatrooms';
    public CHATROOMS_LIST_REF = this.CHATROOMS_REF + '/list';  /* /chatrooms/list  */
    public CHATROOMS_LIST_CHATROOM_REF = this.CHATROOMS_LIST_REF + '/{0}'; /* /chatrooms/list/uuid*/ // Always use this to get reference to chatroom
    public CHATROOMS_CHATROOM_REF = this.CHATROOMS_REF + '/{0}';
    public CHATROOMS_CHATROOM_CHATS_REF = this.CHATROOMS_CHATROOM_REF + '/chats'; //<!--- Message ici --->
    public CHATROOMS_CHATROOM_USERS_REF = this.CHATROOMS_CHATROOM_REF + '/users';
    public CHATROOMS_CHATROOM_USERS_USER_REF = this.CHATROOMS_CHATROOM_USERS_REF + '/{1}';
    // Files refs
    public FILES_REF = '/files';
    public FILES_FILE_REF = this.FILES_REF + '/{0}';


          private basePath:string = '/uploads';
          public fileSizeInBytes:number = 0;

          constructor(private db: AngularFireDatabase, private httpClient:HttpClient) { }

          getFileFirebaseBasePath():string{
            return this.basePath;
          }

          /**************************************************************************************/
          /*                          UPLOAD FILES
          /**************************************************************************************/

          pushFileToStorage(fileUpload: FileUpload, fromId:string,
                            toId:string
                            , progress: { percentage: number }, callback) {

              const storageRef = firebase.storage().ref();
              const uploadTask = storageRef.child(`${this.basePath}/${fileUpload.file.name}`).put(fileUpload.file);

              uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                (snapshot) => {
                  // in progress
                  const snap = snapshot as firebase.storage.UploadTaskSnapshot;
                  //progress.percentage = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                  this.fileSizeInBytes = snap.totalBytes;
                },
                (error) => {
                  // fail
                  console.log("failed to load file", error);
                  callback(error);
                  return;
                },
                () => {
                  // success
                  uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                  //console.log('File available at', downloadURL);
                  fileUpload.url = downloadURL;
                  fileUpload.name = fileUpload.file.name;
                  this.saveFileData(fileUpload);

                  let groupUuid = '';
                  let uuid = '';
                  let dateSeen = '';
                  let fileSize = this.fileSizeInBytes;

                  let fileMessage = new FileMessage(fromId, groupUuid, toId, uuid,  new Date(), fileUpload.name, MessageType.FILE, dateSeen, downloadURL, fileSize);
                  //fileMessage.downloadUrl = fileUpload.url;
                  //fileMessage.fileSizeInBytes = this.fileSizeInBytes;

                  callback(null, fileMessage);
                });
            });
        }

        pushPublicFileMessageToStorage(fileUpload: FileUpload, chatRoomChatUser:ChatUser, time:string , file_type:MessageType, size:number, progress: { percentage: number }, callback) {

            const storageRef = firebase.storage().ref();
            const uploadTask = storageRef.child(`${this.basePath}/${fileUpload.file.name}`).put(fileUpload.file);

            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
              (snapshot) => {
                // in progress
                const snap = snapshot as firebase.storage.UploadTaskSnapshot;
                progress.percentage = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                this.fileSizeInBytes = snap.totalBytes;
              },
              (error) => {
                // fail
                console.log("failed to load file", error);
                callback(error);
                return;
              },
              () => {
                // success
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                //console.log('File available at', downloadURL);

                fileUpload.url = downloadURL;
                fileUpload.name = fileUpload.file.name;
                //HERE WE SAVE FILE TO FIREBASE STORAGE
                this.saveFileData(fileUpload);

                //HERE WE WILL SET MESSAGE TO FIREBASE CHAT MESSAGE TO GET HISTORIES AND OTHER DATAS
                let fileMessage = new  PublicFileMessage(chatRoomChatUser, time , file_type, fileUpload.url, size, fileUpload.name);

                //let fileMessage = new FileMessage(fromId, groupUuid, toId, uuid,  new Date(), fileUpload.name, MessageType.FILE, dateSeen, downloadURL, fileSize);
                //fileMessage.downloadUrl = fileUpload.url;
                //fileMessage.fileSizeInBytes = this.fileSizeInBytes;

                callback(null, fileMessage);
              });
          });
      }

        private saveFileData(fileUpload: FileUpload) {

            //firebase.database().ref().child(this.basePath).push(fileUpload);
            this.db.list(`${this.basePath}/`).push(fileUpload);
            console.log("FILE SAVE TO DATABASE ............. OK")
        }

        getFileUploads(numberItems): AngularFireList<FileUpload> {
            return this.db.list(this.basePath, ref =>
                ref.limitToLast(numberItems));
        }


        deleteFileUpload(fileUpload: FileUpload) {
            this.deleteFileDatabase(fileUpload.key)
            .then(() => {
              this.deleteFileStorage(fileUpload.name);
            })
            .catch(error => console.log(error));
        }

        private deleteFileDatabase(key: string) {
            return this.db.list(`${this.basePath}/`).remove(key);
        }

        private deleteFileStorage(name: string) {
          const storageRef = firebase.storage().ref();
          storageRef.child(`${this.basePath}/${name}`).delete();
        }


        /**************************************************************************************/
        /*                          DOWNLOAD FILES
        /**************************************************************************************/
        downloadFile(chatMsg): Observable<any> {
          const httpOptions = {
            responseType: 'blob' as 'json',
            headers: new HttpHeaders({
              'Access-Control-Allow-Origin':'*'
            })
        };

          return this.httpClient.get(`${this.BASE_URL}`+  `${chatMsg.downloadUrl}`, httpOptions);
        }

        /************************************************************************************/
        /*                              UTILS
        /************************************************************************************/
        getFormattedDate():string{
          let date = new Date();

          let year = date.getFullYear();
          let month = date.getMonth();
          let date_ = date.getDate();

          let hour = date.getHours();
          let min = date.getMinutes();

          let monthsName = ["Jan", "Fev", "Mars", "Avr", "May", "Jun", "July", "Agust", "Sept", "Nov", "Dec"];
          let month_ = monthsName[month - 1];

          let time = `${hour}` + "H"+ `${min}` + "  /   " +`${date_}` + " "+ `${month_}` + " "+ `${year}`;

          return time;
        }
  }
