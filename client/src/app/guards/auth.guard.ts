import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  public identity: User;

  constructor( private _userService: UserService,
               private _router: Router) {

    this.identity = this._userService.getIdentity();

  }

  canActivate():  boolean {

    if(this.identity && (this.identity.role == 'ROLE_ADMIN' || this.identity.role == 'ROLE_USER')) {
      return true;
    } else {
      this._router.navigateByUrl('/login');
      return false;
    }
    
  }
  
}
