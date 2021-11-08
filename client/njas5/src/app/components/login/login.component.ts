import { Component, OnInit } from '@angular/core';
// import { FireBaseService } from 'src/app/services/fire-base.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '../../services/store.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { AuthService } from '../../services/auth.service';
import * as $ from 'jquery';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isActiveToggleTextPassword: Boolean = true;

  isSignedIn = false
  customerDetailsArr: any = [];
  constructor(
    private toastr: ToastrService,
    public router: Router,
    public store: StoreService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    // public firebaseService: FireBaseService
  ) { }

  ngOnInit() {
    if (localStorage.getItem('user') !== null)
      this.isSignedIn = true
    else
      this.isSignedIn = false
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
    this.spinner.show();
    let data = JSON.stringify({
      email: form.value.email,
      password: form.value.password,
    })

    this.auth.checkMemberAccountExists(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        localStorage.setItem('currentUserProfile', JSON.stringify(res.message));
        this.toastr.success("Welcome! " + res.message.name);
        this.auth.user$ = res.message;
        this.router.navigate(['/user']);



        let redirectURL = JSON.parse(localStorage.getItem('redirectURL'));
        if (redirectURL) {
          this.toastr.info('Proceed to checkout.');
          localStorage.removeItem('redirectURL');
          this.router.navigate([redirectURL]);
          return;
        }


      } else {

        if (res.data) {
          if (res.data === "email_verification_sent") {
            this.auth.user$ = [];
            form.reset();
            $(".contact__msg").show();
            $("#formDiv").hide();
            this.toastr.success("Check your inbox to verify your email address!");

          }
        } else {
          this.auth.user$ = [];
          this.toastr.error(res.message);
        }


      }

    },
      (err: any) => {
        this.spinner.hide();
        this.toastr.warning("Something went wrong!");
      }
    );
  }

  // async onSignin(email:string, password:string){
  //   await this.firebaseService.signup(email,password)
  //   if(this.firebaseService.isLoggedIn)
  //   this.isSignedIn = true
  // }
  // async onSignup(email:string, password:string){
  //   await this.firebaseService.signup(email,password)
  //   if(this.firebaseService.isLoggedIn)
  //   this.isSignedIn = true
  // }
}