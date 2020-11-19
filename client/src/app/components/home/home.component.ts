import { Component, OnInit } from '@angular/core';

import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';

import { Chat } from 'src/app/models/chat.model';
import { User } from 'src/app/models/user.model';
import { Member } from '../../models/member.model';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {

  public identity: User;
  public token: string;
  public chats: Chat[];
  public chat: Chat;
  public user: User;
  public loader: boolean;
  public alertMessage: string;
  public status: string;
  public chatSelected: string; // almacenar el id del chat seleccioando
  public members: Member[];

  constructor( private _userService: UserService,
               private _chatService: ChatService ) {

    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.loader = false;
    
  }

  ngOnInit() {
    this.getMyChats();
  }

  // obtener todos mis chats
  getMyChats() { 
    this.loader = true;
    this._chatService.getChats(this.token).subscribe(resp => {
      if(resp.chats) {
        this.status ='success';
        this.chats = resp.chats;
      }
      this.loader = false;
    }, error => {
      this.loader = false;
      this.alertMessage = error.error.message;
      this.status = 'error';
    });
  }


  // al hacer click en un chat
  selectChat(chatId: string) {
    this._chatService.getChatInfo(this.token, chatId)
    .subscribe(resp => {
        if(resp.chat) {
          this.chat = resp.chat;
          this.user = resp.chat.user;
          this.status = 'success';
          this.getMembers(); // obtener los miembros del chat
        }
    }, error => {
      this.status = 'error';
      this.alertMessage = error.error.message;
    });
  }

  
  // enviar los miembros al componente hijo
  getMembers() {
    this._chatService.getChatmembers(this.token, this.chat._id).subscribe(
      resp => {
        if(resp.members) this.members = resp.members;
      },
      error => {
        console.log(error);
      }
    );
  }

}
