// import { FireBaseService } from '../src/app/services/fire-base.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '../../../services/store.service';
import { environment } from '../../../../environments/environment';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { AuthService } from '../../../services/auth.service';
import { WindowService } from '../../../services/window.service';
import firebase from 'firebase/app';
import * as $ from "jquery"
@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent implements OnInit {
  windowRef: any;
  phoneNumber: any;
  verificationCode: string;
  user: any;
  public recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  customerDetailsArr: any = [];

  isSignedIn = false

  constructor(
    //public firebaseService: FireBaseService,
    // @Inject(LOCAL_STORAGE) private localStorage: any,
    private win: WindowService,
    private toastr: ToastrService,
    public router: Router,
    public store: StoreService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) { }

  ngOnInit() {


  }

  public uploadImage(event: any): void {
    //    this.spinner.show();
    $("#profilePhoto").attr("src", "./assets/img/loading.gif");


    if (event.target.files && event.target.files[0]) {

      var file = event.target.files[0];
      /*shrink*/

      // Ensure it's an image
      if (file.type.match(/image.*/)) {
        console.log('An image has been loaded');

        // Load the image
        var reader = new FileReader();
        reader.onload = function (readerEvent: any) {
          var image = new Image();
          image.onload = function (imageEvent: any) {

            // Resize the image
            var canvas = document.createElement('canvas'),
              max_size = 544,// TODO : pull max size from a site config
              width = image.width,
              height = image.height;
            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(image, 0, 0, width, height);
            var dataUrl = canvas.toDataURL('image/jpeg');
            var dataURL = dataUrl;



            /* Utility function to convert a canvas to a BLOB */
            var BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
              var parts = dataURL.split(',');
              var contentType = parts[0].split(':')[1];
              var raw = parts[1];

              return new Blob([raw], { type: contentType });
            }

            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
              uInt8Array[i] = raw.charCodeAt(i);
            }

            var resizedImage = new Blob([uInt8Array], { type: contentType });
            /* End Utility function to convert a canvas to a BLOB    */



            // $.event.trigger({
            //   type: "imageResized",
            //   blob: resizedImage,
            //   url: dataUrl
            // });

            return false;
          }
          // $("#profilePhoto").attr("src", readerEvent.target.result);
        }
        reader.readAsDataURL(file);

      } else {
        this.toastr.warning("Invalid file format!");
      }
      /*shrink*/











      this.store.uploadProfileLogo(event).subscribe((res: any) => {
        // this.spinner.hide();



        if (res.status === 'success') {
          $("#profilePhoto").attr("src", res.message);
          this.toastr.success("Profile photo updated!");
          this.customerDetailsArr.photo = res.message;


          localStorage.setItem('currentUserProfile', JSON.stringify(res.data));



          // $(".imageFormLogo")[0].reset();


        } else {
          $("#profilePhoto").attr("src", "./assets/img/logo_w.png");
          this.toastr.error(res.message);
          return;
        }
      },
        (err: any) => {
          this.spinner.hide();
          this.toastr.warning("Something went wrong");
        }
      );
    }

  }

}
