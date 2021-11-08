import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '../../services/store.service';
import { environment } from '../../../environments/environment';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { AuthService } from '../../services/auth.service';
import * as $ from "jquery"
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  isSignedIn = false;
  customerDetailsArr: any = [];
  constructor(
    @Inject(LOCAL_STORAGE) private localStorage: any,
    private toastr: ToastrService,
    public router: Router,
    public store: StoreService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
  ) { }

  id: any;
  ngOnInit() {
    /*trying to eliminated # from url*/
    if (this.router.url.split('/')[2]) {
      this.id = this.router.url.split('/')[2];
    }
    /*trying to eliminated # from url*/

    this.checkResetPasswordCode();


  }
  checkResetPasswordCode() {
    const data = {
      verification_code: this.id
    }
    this.spinner.show();
    this.store.checkResetPasswordCode(data).subscribe((res: any) => {
      $("#load").hide();
      if (res.status === 'success') {
        $("#linksuccess").show();
        $("#linkfail").hide();
        this.spinner.hide();
      } else {
        $("#linksuccess").hide();
        $("#linkfail").show();
        this.spinner.hide();
        return;
      }
    },
      (err: any) => {
        console.log(err.error);
        this.spinner.hide();
        this.toastr.warning("Something went wrong!");

      }
    );
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
      verification_code: this.id,
      new_password: form.value.new_password
    })

    this.auth.resetMemberPassword(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        //localStorage.setItem('currentUserProfile', JSON.stringify(res.message));
        //this.auth.user$ = res.message;
        this.auth.user$ = [];
        this.toastr.success("Password changed, login again!");
        this.router.navigate(['/login']);
        return;
      } else {
        this.auth.user$ = [];
        this.toastr.error(res.message);
        this.router.navigate(['/forgot-password']);
        return;
      }
      return;
    },
      (err: any) => {
        this.spinner.hide();
        this.toastr.warning("Something went wrong!");
      }
    );
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

}
