import { FireBaseService } from 'src/app/services/fire-base.service';
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
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  windowRef: any;
  phoneNumber: any;
  verificationCode: string;
  user: any;
  public recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  customerDetailsArr: any = [];

  isSignedIn = false

  constructor(
    //public firebaseService: FireBaseService,
    @Inject(LOCAL_STORAGE) private localStorage: any,
    private win: WindowService,
    private toastr: ToastrService,
    public router: Router,
    public store: StoreService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {



  }

  ngOnInit() {
    this.customerDetailsArr = this.auth.user$;
  }
  isActiveToggleTextPassword: Boolean = true;

  public toggleTextPassword(): void {
    this.isActiveToggleTextPassword = (this.isActiveToggleTextPassword == true) ? false : true;
  }
  public getType() {
    return this.isActiveToggleTextPassword ? 'password' : 'text';
  }
  public getName() {
    return this.isActiveToggleTextPassword ? 'fa fa-eye-slash' : 'fa fa-eye';
  }


  public submitForm(form: any) {
    if (!form.value) {
      this.toastr.warning("Please fill in the required details!");
      return;
    }

    if (form.value.new_password.trim()) {
      var new_password = form.value.new_password.trim();
      if (new_password.length < 6) {
        this.toastr.error("Please enter atleast 6 characters");
        this.spinner.hide();
        return;
      }
    }


    this.spinner.show();
    let data = JSON.stringify({
      id: form.value.id,
      email: this.customerDetailsArr.email,
      password: form.value.password,
      new_password: form.value.new_password
    })

    this.auth.changeMemberPassword(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        //localStorage.setItem('currentUserProfile', JSON.stringify(res.message));
        //this.auth.user$ = res.message;
        // this.auth.user$ = [];
        this.toastr.success("Password changed, login again!");
        // this.router.navigate(['/signin']);
        this.auth.signOut()
      } else {
        //  this.auth.user$ = [];
        this.toastr.error(res.message);
        return;
      }

    },
      (err: any) => {
        this.spinner.hide();
        this.toastr.warning("Something went wrong!");
      }
    );
  }

}
