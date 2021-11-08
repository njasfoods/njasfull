import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '../../services/store.service';
import { environment } from '../../../environments/environment';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { AuthService } from '../../services/auth.service';
import * as $ from 'jquery';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  isActiveToggleTextPassword: Boolean = true;

  customerDetailsArr: any = [];
  constructor(@Inject(LOCAL_STORAGE) private localStorage: any,
    private toastr: ToastrService,
    public router: Router,
    public store: StoreService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
  ) {

  }
  ngOnInit() {

    this.customerDetailsArr.address2 = "none";
  }
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

    if (form.value.mobile.trim() == '') {
      this.toastr.error("Please enter your contact number");
      this.spinner.hide();
      return;
    } else {
      var phoneNum = form.value.mobile.trim().replace(/[^\d]/g, '');
      if (phoneNum.length > 6 && phoneNum.length < 12) { } else {
        this.toastr.error("Please enter valid contact number");
        this.spinner.hide();
        return;
      }
    }


    if (form.value.secondary_mobile) {
      if (form.value.secondary_mobile.trim()) {
        var phoneNum = form.value.secondary_mobile.trim().replace(/[^\d]/g, '');
        if (phoneNum.length > 6 && phoneNum.length < 12) { } else {
          this.toastr.error("Please enter valid seconday contact number");
          this.spinner.hide();
          return;
        }
      }
    }

    this.spinner.show();
    let data = JSON.stringify({
      name: form.value.name,
      mobile: form.value.mobile,
      secondary_mobile: form.value.secondary_mobile,
      address1: form.value.address1,
      email: form.value.email,
      password: form.value.password,
    })


    this.auth.createMemberAccount(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        //localStorage.setItem('currentUserProfile', JSON.stringify(res.message));
        //  this.auth.user$ = res.message.name;
        this.toastr.success("Account created, Please verify your email address!");
        form.reset();
        $(".contact__msg").show();
        $("#formDiv").hide();

      //  this.router.navigate(['/login']);
        return;
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


  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
}
