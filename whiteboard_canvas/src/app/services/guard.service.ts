import { ActivatedRouteSnapshot, CanActivate,  RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

import { NotifyService }  from './notify.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';


@Injectable({
  providedIn : 'root',
})



export class GuardService implements CanActivate {

  user:Observable<firebase.User>;
  isLoggedIn:boolean;

    constructor(private authService: AuthService, private userService:UserService, private notify: NotifyService, private router: Router) {
            this.authService.isLoggedIn().subscribe(resp => this.isLoggedIn = !!resp);
     }



    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
      ): Observable<boolean> | Promise<boolean> | boolean {

        if (this.isLoggedIn) {
            return true;
        } else {
          this.notify.update('You must be logged in!', 'error');
          //console.log("............ redirection: You must Log In Before .........")
          this.router.navigate(['/loni']);
            return false;
        }

    }
}
