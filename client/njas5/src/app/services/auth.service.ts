import {
  environment,
  httpBasicAuthOptions,
  httpBasicOptions
} from '../../environments/environment';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
// import { auth } from 'firebase/app';
// import { AngularFireAuth } from '@angular/fire/auth';
// import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: any = [];
  constructor(
    private http: HttpClient,
    // private afAuth: AngularFireAuth,
    // private afs: AngularFirestore,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService



  ) {
    // Get the auth state, then fetch the Firestore user document or return null
    // this.user$ = this.afAuth.authState.pipe(
    //   switchMap(user => {
    //     // Logged in
    //     if (user) {
    //       return this.afs.doc<any>(`users/${user.uid}`).valueChanges();
    //     } else {
    //       // Logged out
    //       return of(null);
    //     }
    //   })
    // )
  }

  // async googleSignin() {
  //   const provider = new auth.GoogleAuthProvider();
  //   const credential = await this.afAuth.signInWithPopup(provider);

  //   let resp = this.updateUserData(credential.user);

  //   return resp;
  // }


  //   private updateUserData(user: any) {
  //     const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
  //  const data = {
  //       uid: user.uid,
  //       email: user.email,
  //       displayName: user.displayName,
  //       photoURL: user.photoURL
  //     }
  //     this.toastr.success("Authentication Success!");
  //     this.spinner.show();

  //     this.checkAccountExists(data).subscribe((res: any) => {
  //       this.spinner.hide();
  //       if (res.status === 'success') {
  //         if (res.message) {
  //           localStorage.setItem('currentUserProfile', JSON.stringify(res.message));
  //           this.router.navigate(['store-profile']);
  //         } else {

  //           this.spinner.hide();
  //           this.toastr.error("Account not found, please register!");
  //           this.signOut();
  //         }
  //       } else {
  //         this.toastr.warning("Something went wrong!");
  //         return;
  //       }
  //     },
  //       (err: any) => {
  //         console.log(err.error);
  //         this.spinner.hide();
  //         this.toastr.warning("Something went wrong!");

  //       }
  //     );
  //     return userRef.set(data, { merge: true })
  //   }


  checkAccountExists(data: any): Observable<any> {
    let requestData = JSON.stringify({
      "email": data.email
    });
    const url = environment.rootCloudUrl + 'checkAccountExists';
    return this.http.post(url, requestData, httpBasicOptions)
      .pipe(
        map((response: Response) => response)
      );
  }


  /*
    checkAccountExists(data: any): Observable<any> {
      let requestData = JSON.stringify({
        "email": data.email
      });
      const url = environment.rootCloudUrl + 'checkAccountExists';
      return this.http.post(url, requestData, httpBasicOptions)
        .pipe(
          map((response: Response) => response)
        );
    }

    register(data: any): Observable<any> {
      let requestData = JSON.stringify({
        "uid": data.uid,
        "email": data.email,
        "display_name": data.displayName,
        "photo_url": data.photoURL,
        "store_name": data.store_name
      });
      const url = environment.rootCloudUrl + 'createAccountWithWelcome';
      return this.http.post(url, requestData, httpBasicOptions)
        .pipe(
          map((response: Response) => response)
        )
    }


    



    async googleSigninRegister(data: any) {
      const provider = new auth.GoogleAuthProvider();
      const credential = await this.afAuth.signInWithPopup(provider);

      let resp = this.updateUserDataRegister(credential.user, data);

      return resp;
    }




    private updateUserData(user) {
      // Sets user data to firestore on login
      const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

      const data = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }


      // console.log(data);
      //push to cartonfly accounts table
      this.toastr.success("Authentication Success!");
      this.spinner.show();

      this.checkAccountExists(data).subscribe((res: any) => {
        // console.log(res);
        this.spinner.hide();
        if (res.status === 'success') {
          // this.toastr. (res.message);
          if (res.message) {
            //this.spinner.hide();
            //redirect to dashoard
            localStorage.setItem('currentUserProfile', JSON.stringify(res.message));
            this.router.navigate(['user-navigation']);
          } else {
            //redirect to register page

            //push to cartonfly accounts table

            this.spinner.hide();




            this.toastr.error("Account not found, please register!");
            this.router.navigate(['/register']);













          }
        } else {
          this.toastr.warning("Something went wrong!");
          return;
        }
      },
        (err: any) => {
          console.log(err.error);
          this.spinner.hide();
          this.toastr.warning("Something went wrong!");

        }
      );
      return userRef.set(data, { merge: true })
    }


    private updateUserDataRegister(user, store) {
      // Sets user data to firestore on login
      const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

      const data = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        store_name: store.store_name
      }


      console.log(data);
      //push to cartonfly accounts table
      this.toastr.success("Authentication Success!");
      this.spinner.show();


      this.spinner.show();
      this.register(data).subscribe((res: any) => {
        // console.log(res);
        this.spinner.hide();
        if (res.status === 'success') {
          //this.toastr.success(res.message);
          localStorage.setItem('currentUserProfile', JSON.stringify(res.message));
          this.router.navigate(['user-navigation']);

        } else {
          if (res.error) {
            this.toastr.error(res.error);
          } else {
            this.toastr.warning("Something went wrong!");
          }
          return;
        }
      },
        (err: any) => {
          console.log(err.error);
          this.spinner.hide();
          this.toastr.warning("Something went wrong!");

        }
      );


      return userRef.set(data, { merge: true })
    }
  */
  async signOut() {
    // await this.afAuth.signOut();

    this.user$ = [];
    localStorage.removeItem('currentUserProfile');
    this.router.navigate(['/']);
    this.toastr.success('You are logged out!');
  }

  createMemberAccount(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'createMemberAccount';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  checkMemberAccountExists(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'checkMemberAccountExists';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }
  editMemberProfilev1(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'editMemberProfilev1';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  editMemberProfile(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'editMemberProfile';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }
  changeMemberPassword(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'changeMemberPassword';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  resetMemberPassword(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'resetMemberPassword';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  forgotPassword(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'forgotPassword';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  verifyEmailOtp(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'verifyEmailOtp';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  sendEmailOtp(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'sendEmailOtp';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  isLoggedIn() {
    if (!JSON.parse(localStorage.getItem('currentUserProfile'))) {
      return false;
    } else {
      return true;
    }
  }
}
