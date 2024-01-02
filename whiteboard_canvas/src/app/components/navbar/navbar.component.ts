import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';

import {AuthService } from '../../services/auth.service';
import {ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  currentUser: firebase.User = null;
  displayName: string = null;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.displayName = user.displayName ? user.displayName : user.email ? user.email : user.uid;
        if (this.currentUser.isAnonymous) {
          this.displayName = 'Anonymous';
        }
      } else {
        this.currentUser = null;
        this.displayName = null;
      }
    });
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /*sAuthenticatedAsAdmin(): boolean {
    return this.currentUser && this.currentUser.displayName === 'admin';
  }

  loginAnonymously(): void {
    this.authService.loginAnonymously();
  }

  loginWithEmailAndPassword(email: string, password: string): void {
    this.authService.loginWithEmailAndPassword(email, password);
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }*/

  logOut(): void {
    if (window.confirm('Are you sure?')) {
      this.authService.logout();
        this.currentUser = null;
        this.displayName = null;

      this.router.navigateByUrl('/login');
    }
  }

}
