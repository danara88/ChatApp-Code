import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from './global';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public token: string;
  public identity: User;
  public url: string;

  constructor( private _http: HttpClient ) { 
    this.url = global.url; // url global de la api rest
  }

  // obtener el token
  getToken() {
    let token = localStorage.getItem('token');
    if(token == 'undefined') {
      this.token = null;
    } else {
      this.token = token;
    }
    return this.token;
  }

  // obtener la identidad
  getIdentity() {
    let identity = JSON.parse(localStorage.getItem('identity'));
    if(identity == 'undefined') {
      this.identity = null;
    } else {
      this.identity = identity;
    }
    return this.identity;
  }

  // Método para obtener datos del api
  getQuery(endPoint: string, token: string = null) {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    if(token != null) headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.get(this.url + '/api/user/' + endPoint, {headers});  
  }

  // Método para mandar datos al api
  postQuery(endPoint: string, token: string | null = null, data: any) {
    const params = JSON.stringify(data);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    if(token != null) headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.post(this.url + '/api/user/' + endPoint, params, {headers});  
  }

  // registro de un usuario
  register(user: User): Observable<any> {
    return this.postQuery('register', null, user)
      .pipe( map( (response: any) => {
          delete response.password;
          return response;
      }));
  }

  //  verificar credenciales del usuario
  login(user: any, getToken = null): Observable<any> {
    if(getToken != null) {
      user.getToken = true;
    }
    return this.postQuery('login', null, user)
      .pipe( map( response => response ) );
  }

  // buscar un usuario
  searchUser(term: string, token: string): Observable<any> {
    return this.getQuery('search/' + term, token)
      .pipe(map(response => response));
  }

  // actualizar la información del usuario
  updateUser(token: string, user: User): Observable<any> {
    const params = JSON.stringify(user);
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
                .set('Authorization', token);
    return this._http.put(this.url + '/api/user', params, {headers});
  }


}
