import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { Info } from '../interfaces/info';

@Injectable({
  providedIn : 'root',
})


export class NotifyService {

  private _msgSource = new Subject<Info | null>();

  msg = this._msgSource.asObservable();

  update(content: string, style: 'error' | 'info' | 'success') {
    const msg: Info = { content, style };
    this._msgSource.next(msg);
  }

  clear() {
    this._msgSource.next(null);
  }
}
