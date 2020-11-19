import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { UploadService } from '../../services/upload.service';
import { global } from '../../services/global';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styles: []
})
export class EditUserComponent implements OnInit {

  public identity: User;
  public user: User;
  public token: string;
  public status: string;
  public alertMessage: string;
  public loader: boolean;
  public url: string;

  // capturar el cambio del input
  public filesToUpload: Array<File>;
  public file: File;
  public imgSelected: string | ArrayBuffer;

  constructor( private _userService: UserService, private _uploadService: UploadService ) {

    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.user = this.identity;
    this.loader = false;
    this.url = global.url;

   }

  ngOnInit() {

  }

  // editar la información del usuario
  onSubmit() {
    this.loader = true;

    this._userService.updateUser(this.token, this.user).subscribe(
      resp => {
        if(resp.user) {

          if(this.filesToUpload) {

            this._uploadService.makeFileRequest(this.url + '/api/user/image', [], this.filesToUpload, this.token, 'file0')
              .then((result: User | any) => {

                this.user.image = result.image;
                localStorage.setItem('identity', JSON.stringify(this.user));
                this.status = 'success';
                this.alertMessage = 'Success ! Your data was updated.';

                setTimeout(() => {
                  this.status = null;
                }, 4000);
                

              }).catch(err => {
                this.status = 'error';
                this.alertMessage = 'Something went wrong.';
              })

          } else {

            this.status = 'success';
            this.alertMessage = 'Success ! Your data was updated.';
            this.user = resp.user;
            localStorage.setItem('identity', JSON.stringify(this.user));
            setTimeout(() => {
              this.status = null;
            }, 4000);

          }

        }
        this.loader = false;
      },
      error => {
        this.loader = false;
        this.alertMessage = error.error.message;
        this.status = 'error';
      }
    );
  }

  // configurar el campo de file
  clickFakeInput() {
    const realFileBtn = <HTMLInputElement>document.getElementById('realFile');
    const customText = <HTMLInputElement>document.getElementById('customText');

    realFileBtn.click();

    realFileBtn.addEventListener('change', () => {
      if(realFileBtn.value) {
        customText.innerHTML = realFileBtn.value.match(/[\/\\]([\w\d\s\.\~\(\)]+)$/)[1];
      } else {
        customText.innerHTML = 'No image selected';
      }
    });
  

  }

  // capturando el cambio del input
  fileChange(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
    this.file = <File>fileInput.target.files[0];

    const reader = new FileReader();
    reader.onload = e => { this.imgSelected = reader.result };
    reader.readAsDataURL(this.file);
  }

}
