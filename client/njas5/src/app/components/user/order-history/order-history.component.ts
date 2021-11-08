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
import * as $ from 'jquery';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  windowRef: any;
  phoneNumber: any;
  verificationCode: string;
  user: any;
  public recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  customerDetailsArr: any = [];

  isSignedIn = false;
  customerGroceriesArr: any = [];
  ordersObj: any;
  ordersTotal = 0;
  storeName: any;
  currentUser: any;

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
    this.currentUser = JSON.parse(localStorage.getItem('currentUserProfile'));
  }
  storeData: any = [];
  getStoreDetailsByStoreName() {
    let data = {
      store_id: environment.groceriesStoreId,
    };
    this.store.getStoreDetails(data).subscribe((res) => {
      this.storeData = res.message;
    });
  }
  orderDetails: any = [];
  orderId: any;
  getOrderById(id: any) {
    this.spinner.show();
    if (id === '') {
      this.spinner.hide();
      return;
    } else {
      let data = {
        email: this.storeData.store.account_email_id,
        order_id: id,
      };
      this.store.viewStoreOrderDetailsByOrderID(data).subscribe((res) => {
        if (res.message.order) {
          this.orderDetails = res.message.order;
          this.orderId = res.message.id;
          this.spinner.hide();
        } else {
          this.spinner.hide();
          return;
        }
      });
    }
  }
  cancelOrder(id: any, storeId: any) {
    Swal.fire({
      title: 'Cancel Order',
      text: 'Are you sure?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!',
    }).then((result) => {
      if (result.value) {
        this.spinner.show();
        this.store.cancelGroceriesOrder(id, 'cancelled', storeId).subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res.status === 'success') {
              this.toastr.success(res.message);
            } else {
              this.toastr.error(res.message);
              return;
            }
            this.getOrderDetailsByOrderId();
          },
          (err: any) => {
            this.spinner.hide();
            this.toastr.warning('Something went wrong');
          }
        );
      }
    });
  }
  getOrderDetailsByOrderId() { }
  ngOnInit() {
    this.getAllCustomerOrdersByEmailID();
    this.getStoreDetailsByStoreName();
    this.customerDetailsArr = this.auth.user$;
    this.customerDetailsArr.id = this.customerDetailsArr.id;
    this.customerDetailsArr.allergies = this.customerDetailsArr.allergies
      ? this.customerDetailsArr.allergies
      : [
        { id: 0, name: 'Cereals containing gluten', value: 0 },
        { id: 1, name: 'Crustaceans', value: 0 },
        { id: 2, name: 'Eggs', value: 0 },
        { id: 3, name: 'Fish', value: 0 },
        { id: 4, name: 'Peanuts', value: 0 },
        { id: 5, name: 'Soybeans', value: 0 },
        { id: 6, name: 'Milk', value: 0 },
        { id: 7, name: 'Nuts', value: 0 },
        { id: 8, name: 'Celery', value: 0 },
        { id: 9, name: 'Mustard', value: 0 },
        { id: 10, name: 'Sesame seeds', value: 0 },
        { id: 11, name: 'Sulphur dioxide and sulphites', value: 0 },
        { id: 12, name: 'Lupin', value: 0 },
        { id: 13, name: 'Molluscs', value: 0 },
      ];

    this.customerDetailsArr.gender = this.customerDetailsArr.gender
      ? this.customerDetailsArr.gender
      : 'none';
    this.customerDetailsArr.food_type = this.customerDetailsArr.food_type
      ? this.customerDetailsArr.food_type
      : 'none';
    this.customerDetailsArr.body_type = this.customerDetailsArr.body_type
      ? this.customerDetailsArr.body_type
      : 'none';
    this.customerDetailsArr.drinking_habits = this.customerDetailsArr
      .drinking_habits
      ? this.customerDetailsArr.drinking_habits
      : 'none';
    this.customerDetailsArr.smoking_habits = this.customerDetailsArr
      .smoking_habits
      ? this.customerDetailsArr.smoking_habits
      : 'none';
    this.customerDetailsArr.activity_level = this.customerDetailsArr
      .activity_level
      ? this.customerDetailsArr.activity_level
      : 'none';
    this.customerDetailsArr.goal = this.customerDetailsArr.goal
      ? this.customerDetailsArr.goal
      : 'none';
    if (localStorage.getItem('user') !== null) this.isSignedIn = true;
    else this.isSignedIn = false;
  }
  loader = true;
  getAllCustomerOrdersByEmailID() {
    // this.activatedRoute.params.subscribe(res => {
    //   this.storeName = res.storeName;
    //   localStorage.setItem('storeName', this.storeName);
    // });
    const data = {
      store_name: environment.groceriesStoreId,
    };
    // this.spinner.show();
    this.loader = true;
    this.store.getAllCustomerOrdersByEmailID(data).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.ordersObj = res.message;
          this.customerGroceriesArr = [];
          //this.ordersObj = Object["values"](res.message);
          this.ordersTotal = 0;

          Object.keys(this.ordersObj).forEach((key) => {
            this.ordersTotal =
              this.ordersTotal + +this.ordersObj[key].order.payable;
            this.customerGroceriesArr.push(this.ordersObj[key]);
          });

          this.customerGroceriesArr.reverse();
          console.log(this.customerGroceriesArr);

          // this.spinner.hide();
          this.loader = false;
        } else {
          this.customerGroceriesArr = [];
          // this.spinner.hide();
          this.loader = false;
          return;
        }
      },
      (err: any) => {
        // console.log(err.error);
        // this.spinner.hide();
        this.loader = false;
        this.toastr.warning('Something went wrong!');
      }
    );
  }
  public submitForm(form: any) {
    if (!form.value) {
      this.toastr.warning('Please fill in the required details!');
      return;
    }

    if (form.value.mobile.trim() == '') {
      this.toastr.error('Please enter your contact number');
      this.spinner.hide();
      return;
    } else {
      var phoneNum = form.value.mobile.trim().replace(/[^\d]/g, '');
      if (phoneNum.length > 6 && phoneNum.length < 12) {
      } else {
        this.toastr.error('Please enter valid contact number');
        this.spinner.hide();
        return;
      }
    }

    if (form.value.secondary_mobile) {
      if (form.value.secondary_mobile.trim()) {
        var phoneNum = form.value.secondary_mobile.trim().replace(/[^\d]/g, '');
        if (!(phoneNum.length > 6 && phoneNum.length < 12)) {
          this.toastr.error('Please enter valid seconday contact number');
          this.spinner.hide();
          return;
        }
      }
    } else {
      form.value.secondary_mobile = '';
    }

    this.spinner.show();
    // let data = JSON.stringify({
    //   id: form.value.id,
    //   email: this.customerDetailsArr.email,
    //   name: form.value.name,
    //   mobile: form.value.mobile,
    //   secondary_mobile: form.value.secondary_mobile,
    //   address1: form.value.address1
    // });
    let data = form.value;
    console.table(data);
    data.id = this.customerDetailsArr.id;
    data.email = this.customerDetailsArr.email;
    data.name = form.value.name;
    data.mobile = form.value.mobile;
    data.secondary_mobile = form.value.secondary_mobile;
    data.address1 = form.value.address1;
    data.allergies = this.customerDetailsArr.allergies;
    data.activity_level = this.customerDetailsArr.activity_level;
    data.goal = this.customerDetailsArr.goal;
    this.auth.editMemberProfilev1(data).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status === 'success') {
          localStorage.setItem(
            'currentUserProfile',
            JSON.stringify(res.message)
          );
          this.auth.user$ = res.message;
          this.toastr.success('Profile edited!');
          // this.router.navigate(['/signin']);
          return;
        } else {
          //  this.auth.user$ = [];
          this.toastr.error(res.message);
          return;
        }
      },
      (err: any) => {
        this.spinner.hide();
        this.toastr.warning('Something went wrong!');
      }
    );
  }

  public uploadImage(event: any): void {
    //    this.spinner.show();
    $('#profilePhoto').attr('src', './assets/img/loading.gif');

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
              max_size = 544, // TODO : pull max size from a site config
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
          };
          // $("#profilePhoto").attr("src", readerEvent.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        this.toastr.warning('Invalid file format!');
      }
      /*shrink*/

      this.store.uploadProfileLogo(event).subscribe(
        (res: any) => {
          // this.spinner.hide();

          if (res.status === 'success') {
            $('#profilePhoto').attr('src', res.message);
            this.toastr.success('Profile photo updated!');
            this.customerDetailsArr.photo = res.message;

            localStorage.setItem(
              'currentUserProfile',
              JSON.stringify(res.data)
            );

            // $(".imageFormLogo")[0].reset();
          } else {
            $('#profilePhoto').attr('src', './assets/img/logo_w.png');
            this.toastr.error(res.message);
            return;
          }
        },
        (err: any) => {
          this.spinner.hide();
          this.toastr.warning('Something went wrong');
        }
      );
    }
  }
  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  changeAllergy(id: any) {
    if (this.customerDetailsArr.allergies[id].value) {
      this.customerDetailsArr.allergies[id].value = 0;
    } else {
      this.customerDetailsArr.allergies[id].value = 1;
    }
  }

  arrayOne(n: number): any[] {
    return Array(n);
  }
  sendLoginCode(num: any) {
    const appVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
      }
    );
    //const num = this.phoneNumber.e164;

    num = '+1' + num;
    this.spinner.show();
    firebase
      .auth()
      .signInWithPhoneNumber(num, appVerifier)
      .then((result) => {
        this.spinner.hide();
        this.windowRef.confirmationResult = result;
        // this.toastr.error();
        //alert("success");
        //console.log(result);
      })
      .catch((error) => {
        this.spinner.hide();
        this.toastr.error('Invalid phone number!');
        // alert("fail");
        //console.log(error)
        // console.log(result);
      });
  }

  verifyLoginCode() {
    if (!this.verificationCode) {
      this.toastr.error('Enter OTP!');
      return;
    }

    this.windowRef.confirmationResult
      .confirm(this.verificationCode)
      .then((result: { user: any }) => {
        this.user = result.user;
        this.checkMobileVerification();
      })
      .catch((error: any) => {
        // console.log(error, "Incorrect code entered?")
        this.toastr.error('Invalid otp!');
      });
  }

  checkMobileVerification() {
    const data = {
      id: this.customerDetailsArr.id,
      mobile: this.customerDetailsArr.mobile,
    };
    this.spinner.show();
    this.store.checkMobileVerification(data).subscribe(
      (res: any) => {
        //  $("#load").hide();

        if (res.status === 'success') {
          this.customerDetailsArr.mobile_verification = 'true';

          let userdata = JSON.parse(localStorage.getItem('currentUserProfile'));
          userdata.mobile = this.customerDetailsArr.mobile;
          userdata.mobile_verification = 'true';
          // this.auth.user$.mobile_verification = "true";
          localStorage.setItem('currentUserProfile', JSON.stringify(userdata));
          this.auth.user$ = userdata;

          this.spinner.hide();
        } else {
          this.toastr.warning(res.message);
          this.spinner.hide();
          return;
        }
      },
      (err: any) => {
        console.log(err.error);
        this.spinner.hide();
        this.toastr.warning('Something went wrong!');
      }
    );
  }

  // async onSignup(email:string, password:string){
  //   await this.firebaseService.signup(email,password)
  //   if(this.firebaseService.isLoggedIn)
  //   this.isSignedIn = true
  // }
  // async onSignin(email:string, password:string){
  //   await this.firebaseService.signup(email,password)
  //   if(this.firebaseService.isLoggedIn)
  //   this.isSignedIn = true
  // }
}
