import { Component, OnInit } from '@angular/core';
import { User } from '../..//models/user.model';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: []
})
export class NavbarComponent implements OnInit {

  public identity: User;

  constructor( private _userService: UserService, private _router: Router ) { 
    this.identity = this._userService.getIdentity();
  }

  ngOnInit() {
  }

  logout() {
    localStorage.clear();
    this._router.navigate(['/login'])
  }

}
