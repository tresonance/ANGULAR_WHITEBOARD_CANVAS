import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss']
})
export class TitleComponent implements OnInit {

  currentUser: firebase.User = null;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.getAuthState().subscribe(user => this.currentUser = user);
  }

  isAuthenticated(): boolean {
    return this.currentUser === null;
  }

}
