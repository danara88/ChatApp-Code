import { Component, OnInit } from '@angular/core';
import { User } from '../..//models/user.model';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  public loader: boolean;
  public user: User;
  public identity: User;
  public token: string;
  public alertMessage: string;
  public status: string;

  constructor(  private _userService: UserService, 
                private _router: Router ) { 

    this.user = new User(null, '', '','','','','');
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.loader = false;

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

  onSubmit() {
    this.loader =true;

    this._userService.login(this.user)
      .subscribe( response => {

        if(response.user && response.user._id) {
          let user = response.user;
          
          // guardar en almacenaje local
          localStorage.setItem('identity', JSON.stringify(user));

          // obteenr  token y redireccionar
          this.getToken();

        } else {
          this.status = 'error';
          this.alertMessage = 'Se ha producido un error. Vuelvelo a intentar.';
          this.loader = false;  
        }

      }, error => {

        this.status = 'error';
        this.alertMessage = error.error.message;
        this.loader = false;

      } );
  }

  // obtener el token
  getToken() {
    this._userService.login(this.user, true)
      .subscribe(response => {
        if( response.token ) {
          let token = response.token;
          // guardar el token en localstorage
          localStorage.setItem('token', token);

          // canbiar el contenido del status
          this.status = 'success';

          // redireccionar a la aplicacion
          this._router.navigate(['/home']);
        } else {
          this.status = 'error';
          this.alertMessage = 'Se ha producido un error. Vuelvelo a intentar.';
        }
        this.loader = false; 
      }, error => {

        this.status = 'error';
        this.alertMessage = error.error.message;
        this.loader = false;

      })
  }

}
