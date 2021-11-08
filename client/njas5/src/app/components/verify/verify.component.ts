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
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  customerDetailsArr: any = [];
  constructor(
    @Inject(LOCAL_STORAGE) private localStorage: any,
    private toastr: ToastrService,
    public router: Router,
    public store: StoreService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {}
  id: any;
  ngOnInit() {
    /*trying to eliminated # from url*/
    if (this.router.url.split('/')[2]) {
      this.id = this.router.url.split('/')[2];
    }
    /*trying to eliminated # from url*/

    this.checkEmailVerificationCode();
  }
  checkEmailVerificationCode() {
    const data = {
      verification_code: this.id
    };
    this.spinner.show();
    this.store.checkEmailVerificationCode(data).subscribe(
      (res: any) => {
        $('#load').hide();

        if (res.status === 'success') {
          $('#linksuccess').show();
          $('#linkfail').hide();
          this.spinner.hide();
        } else {
          $('#linksuccess').hide();
          $('#linkfail').show();
          this.spinner.hide();
          return;
        }
      },
      (err: any) => {
        // console.log(err.error);
        this.spinner.hide();
        this.toastr.warning('Something went wrong!');
      }
    );
  }
}
