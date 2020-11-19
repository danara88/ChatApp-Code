import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';

import { Chat } from 'src/app/models/chat.model';
import { User } from 'src/app/models/user.model';
import { Member } from 'src/app/models/member.model';

@Component({
  selector: 'app-create-chat',
  templateUrl: './create-chat.component.html',
  styles: []
})
export class CreateChatComponent implements OnInit {

  public next1: boolean; // mover al siguiente formulario
  public chat: Chat;
  public token: string;
  public identity: User;
  public alertMessage: string;
  public status: string;
  public users: User[];
  public member: Member;
  public selectedMembers: User[];

  public loader: boolean;
  public loaderAdded: boolean;

  @Output() getAllChats = new EventEmitter();

  constructor( private _chatService: ChatService,
               private _userService: UserService ) {

    this.next1 = false;
    this.chat = new Chat(null, '', '', '', null, '');
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.selectedMembers = [];

    this.loader = false;
    this.loaderAdded = false;

   }

  ngOnInit() {
  }


  // Procesar los formularios
  onSubmit(formName) {
    switch(formName){
      case 'createChat': this.createChat()
      break;
    }
  }

  // Crea el nuevo chat 
  createChat() {
    this.loader = true;
    this.chat.user = this.identity._id;
    console.log(this.token);
    this._chatService.createChat(this.token, this.chat).subscribe( resp => {
      if(resp.chat) {
        this.status = 'success';
        this.alertMessage = 'The chat was created !';
        this.chat = resp.chat;
        
        /* LLAMAR FUNCIÓN EXTERNA PARA OBTENER TODOS LOS CHATS */
        this.getAllChats.emit(this.chat);

        this.chat.description = null;
        this.chat.title = null;

        /* PASAR AL SIGUEINTE FORMULARIO */
        this.next1 = true; 
      }
      this.loader = false;
    }, error => {
      this.alertMessage = error.error.message;
      this.loader = false;
      this.status = 'error';
    });
  }

  // Funcion para buscar usuarios
  searchUsers(term)  {
   this._userService.searchUser(term, this.token).subscribe( resp => {
    if(resp.users) {
      this.status = 'success';
      this.users = resp.users;
    }
   }, error => {
    this.alertMessage = error.error.message;
    this.status = 'error';
   } );
  }

  // agregar un miembro
  addMember(userId: string) {
    this.member = new Member(null, userId, this.chat._id, '');
    this.loaderAdded = true;

    this._chatService.addMember(this.token, this.member).subscribe( resp => {

      // agregar los miembros que vaya seleccionando
      this.selectedMembers.push(resp.member);

      this.loaderAdded = false;
    }, error => {
      this.alertMessage = error.error.message;
      this.status = 'error';
      
      this.loaderAdded = false;
    });
  }

  // eliminar un miembro
  removeMember(memberId) {
    this._chatService.removeMember(this.token, memberId, this.chat._id).subscribe(resp => {
      if(resp.member) {
        this.status = 'success';

        // quitar el miembro seleccionado
        this.selectedMembers.splice(resp.member, 1);
      }
    }, error => {
      this.alertMessage = error.error.message;
      this.status = 'error';
    });
  }

}
