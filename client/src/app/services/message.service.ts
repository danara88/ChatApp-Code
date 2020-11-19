import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { global } from './global';
import { map } from 'rxjs/operators';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  public url: string;

  constructor( private _http: HttpClient ) { 

    this.url = global.url;

  }


  // Método para obtener datos del api
  getQuery(endPoint: string, token: string = null) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
      .set('Authorization', token);
    return this._http.get(this.url + '/api/' + endPoint, {headers});  
  }

  // Método para mandar datos al api
  postQuery(endPoint: string, token: string | null = null, data: any) {
    const params = JSON.stringify(data);
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
      .set('Authorization', token);
    return this._http.post(this.url + '/api/message/' + endPoint, params, {headers});  
  }

  // Guardar un nuevo mensaje enviado
  sendMessage(token: string, message: Message): Observable<any> {
    return this.postQuery('save', token, message)
            .pipe(map(resp => resp));
  }

  // Obtener todos los mensajes de un chat
  getMessages(token: string, chatId: string): Observable<any> {
    return this.getQuery('messages/' + chatId, token)
            .pipe(map(resp => resp));
  }

}
