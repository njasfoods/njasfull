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
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

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

  ngOnInit() {

    if (this.router.url.split('/')[2]) {
      this.customerDetailsArr.email = this.router.url.split('/')[2];
    }
  };

  public submitForm(form: any) {
    if (!form.value) {
      this.toastr.warning("Enter valid email address!");
      return;
    }
    this.spinner.show();
    let data = JSON.stringify({
      email: form.value.email
    })

    this.auth.forgotPassword(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        this.auth.user$ = [];
        this.toastr.success(res.message);
        form.reset();
        $(".contact__msg").show();
        $("#resetDiv").hide();

      } else {
        this.auth.user$ = [];
        this.toastr.error(res.message);
      }

    },
      (err: any) => {
        this.spinner.hide();
        this.toastr.warning("Something went wrong!");
      }
    );
  }


}
