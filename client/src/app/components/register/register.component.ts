import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../..//models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: []
})
export class RegisterComponent implements OnInit {

  public loader: boolean;
  public user: User;
  public identity: User;
  public token: string;
  public alertMessage: string;
  public status: string;

  constructor( private _userService: UserService, private _router: Router ) {

    this.user = new User(null, '', '','','','', '');
    this.loader = false;
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();


   }

  ngOnInit() {
    
  }


  isLogued() {
    if(this.token.length > 2 && this.identity && (this.identity.role == 'ROLE_USER' || this.identity.role == 'ROLE_ADMIN')) {
      this._router.navigateByUrl('/home');
    } else {
      return false;
    }
  }

  // registrar un usuario
  register() {
    this.loader = true;
   
    this._userService.register(this.user)
      .subscribe( response => {
        
        if(response.user) {
          this.status = 'success';
          this.alertMessage = 'Urra ! Successfully registered.';
        }

        this.loader = false;
        this.user = new User(null, '', '','','','',''); //vaciar los campos
      }, error => {

        this.status = 'error';
        this.alertMessage = error.error.message;
        this.loader = false;

      } );
  }

}
