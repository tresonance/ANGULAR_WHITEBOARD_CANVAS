import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MathJackService {

  constructor() { }
  nativeGlobal() { return window }
}
