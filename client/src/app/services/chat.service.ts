import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { global } from './global';
import { map } from 'rxjs/operators';
import { Chat } from '../models/chat.model';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

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
    return this._http.post(this.url + '/api/' + endPoint, params, {headers});  
  }

  // Crear  un nuevo chat
  createChat( token: string, chat: Chat ): Observable<any> {
    return this.postQuery('chat/create', token, chat)
        .pipe(map(response => response));
  }

  // Obtener todos mis chats
  getChats(token: string): Observable<any> {
    return this.getQuery('chats', token)
      .pipe(map(resp => resp));
  }

  // Agregar un miembre a un chat
  addMember(token: string, member: Member): Observable<any> {
    return this.postQuery('chat/member', token, member)
      .pipe(map(resp => resp));
  }

  // Quitar un miembre de un chat
  removeMember(token: string, memberId: string, chatId: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
      .set('Authorization', token);
    return this._http.delete(this.url + '/api/chat/delete-member/' + chatId + '/' + memberId, {headers});
  }

  // obtener información de un chat
  getChatInfo(token: string, chatId: string): Observable<any> {
    return this.getQuery('chat/' + chatId, token)
      .pipe(map(resp => resp));
  }

  // obtener todos los miembros de un chat
  getChatmembers(token: string, chatId: string): Observable<any> {
    return this.getQuery('chat/members/' + chatId, token)
      .pipe(map(resp => resp));
  }
  


}
