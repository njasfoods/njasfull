import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '../../services/store.service';
import { environment } from '../../../environments/environment';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { AuthService } from '../../services/auth.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import swal from 'sweetalert2';
import * as $ from "jquery";
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class MealCheckoutComponent implements OnInit {
  checkoutFormDisp = true;
  load = false;
  mealMenu: any;
  subscriptionData: any;
  storeArr: any = [];
  customerDetailsArr: any = [];
  plansArr: any = {
    'custom': {},
    '5-day': {},
    '4-week': {}
  };
  constructor(
    @Inject(LOCAL_STORAGE) private localStorage: any,
    private toastr: ToastrService,
    public router: Router,
    public store: StoreService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.appliedCouponDetails = false;

    this.customerDetailsArr.address2 = 'none';
    this.customerDetailsArr.bank_option = 'none';

    if (this.auth.user$) {
      //  this.customerDetailsArr = this.auth.user$;
      this.customerDetailsArr.address1 = this.auth.user$.address1;
      this.customerDetailsArr.contactEmail = this.auth.user$.email;
      this.customerDetailsArr.contactNo = this.auth.user$.mobile;
      this.customerDetailsArr.name = this.auth.user$.name;
      // let allergies = [];
      // if (this.auth.user$.allergies) {
      //   if (this.auth.user$.allergies.length) {
      //     for (var key in this.auth.user$.allergies) {
      //       allergies.push(this.auth.user$.allergies[key].name);
      //     }
      //   }
      // }
      // this.customerDetailsArr.allergies = allergies.join();
      if (this.customerDetailsArr.contactEmail) {
        this.checkoutFormDisp = false;
      }

    }

    /*temp */
    this.checkoutFormDisp = false;
    /*temp */
  }


  ngAfterViewInit() {
    if (this.auth.isLoggedIn()) {
      this.showLogin = false;
    }
  }
  showLogin = false;

  loginToCheckout() {
    if (!this.auth.isLoggedIn()) {
      localStorage.setItem(
        'redirectURL',
        JSON.stringify(this.router.url)
      );
      this.toastr.info('Login to continue.');
      this.router.navigate(['/login']);
      return;
    }
  }

  normalDeliveryCharges = 0;
  chosedDeliveryOption: any;
  discountAmount: any = 0;
  getPlanPriceFoodType(foodTypes: any) {
    let total = 0;
    Object.keys(foodTypes).forEach((key) => {
      if (foodTypes[key] === 'Veg') {
        total = total + this.plansArr[
          this.subscriptionData.plan
        ]['veg_price'];
      } else if (foodTypes[key] === 'Non-Veg') {
        total = total + this.plansArr[
          this.subscriptionData.plan
        ]['non_veg_price'];
      } else {
        total = total + this.plansArr[
          this.subscriptionData.plan
        ]['non_veg_price'];
      }
    });


    //total = total - this.discountAmount;
    return total;
  }

  appliedCouponDetails: any;
  couponCode: any = null;
  public submitCouponForm(form: any) {
    this.toastr.info("Fetching coupon/referral details.");
    if (!form.value) {
      this.toastr.warning(
        'Invalid Coupon Code!'
      );
      return;
    }

    let data = form.value;

    data.plan = this.subscriptionData.plan;
    let payable = +this.subscriptionData.plan_details.price;
    let total = +this.subscriptionData.plan_details.price;
    let delivery_charges_total = (this.storeArr.store.delivery_charges) ? this.storeArr.store.delivery_charges : 0;

    if (this.subscriptionData.plan === 'custom') {
      if ((+this.subscriptionData.booking_days.length) === this.workingDays) {
        delivery_charges_total = 0;
        total = this.plansArr['5-day'].price;
        payable = this.plansArr['5-day'].price;
      } else {
        delivery_charges_total = 0;
        total = this.getPlanPriceFoodType(this.subscriptionData.food_types);
        payable = this.getPlanPriceFoodType(this.subscriptionData.food_types);

      }
    }


    if (this.storeArr.store.delivery_charges) {
      if (this.subscriptionData.plan === 'custom') {
        if ((+this.subscriptionData.booking_days.length) === this.workingDays) {
          total = (+this.plansArr['5-day'].price);
          delivery_charges_total = ((+this.workingDays) * (this.storeArr.store.delivery_charges));
          payable = (+this.plansArr['5-day'].price) + ((+this.workingDays) * (this.storeArr.store.delivery_charges));
        } else {
          total = this.getPlanPriceFoodType(this.subscriptionData.food_types);
          delivery_charges_total = ((+this.subscriptionData.booking_days.length) * (this.storeArr.store.delivery_charges));
          payable = total + ((+this.subscriptionData.booking_days.length) * (this.storeArr.store.delivery_charges));
        }
      } else {

        delivery_charges_total = ((+this.workingDays) * (this.storeArr.store.delivery_charges));
        total = (+this.subscriptionData.plan_details.price);

        payable = (+this.subscriptionData.plan_details.price) + ((+this.workingDays) * (this.storeArr.store.delivery_charges));

        if (this.subscriptionData.plan === '4-week') {
          delivery_charges_total = (4 * (+this.subscriptionData.booking_days.length) * (this.storeArr.store.delivery_charges));
          total = (+this.subscriptionData.plan_details.price);

          payable = (+this.subscriptionData.plan_details.price) + (4 * (+this.subscriptionData.booking_days.length) * (this.storeArr.store.delivery_charges));

        }


      }
    }
    data.payable = total;
    data.store_name = this.storeArr.store.name;
    this.spinner.show();
    this.store.validateCouponCode(data).subscribe(
      (res: any) => {
        this.spinner.hide();

        if (res.status === 'success') {
          this.appliedCouponDetails = res.message[Object.keys(res.message)[0]];
          let total = this.getPlanPriceFoodType(this.subscriptionData.food_types);


          if (this.appliedCouponDetails) {
            if (this.appliedCouponDetails.type === 'amount') {
              this.discountAmount = (+this.appliedCouponDetails.discount_amount);
            } else {
              this.discountAmount = (+(data.payable * this.appliedCouponDetails.discount_percentage) / 100);
            }
          }

          this.toastr.success(
            'Coupon Applied!'
          );


        } else {


          this.toastr.error(
            "Invalid Coupon or Must have Expired!"
          );


        }
      },
      (err: any) => {
        this.spinner.hide();
        this.toastr.warning(
          'Something went wrong!'
        );

      }
    );
  }

  removeCoupon() {
    swal
      .fire({
        title: 'Are you sure?',
        position: 'top',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove applied coupon!'
      })
      .then(result => {
        if (result.value) {
          this.discountAmount = 0;
          this.appliedCouponDetails = null;
        }
      });
  }

  skip() {
    this.checkoutFormDisp = false;
  }
  deliveryOption($event: any) {
    this.chosedDeliveryOption = this.storeArr.delivery_options[
      $event.target.value
    ];
    this.storeArr.store.delivery_charges = this.chosedDeliveryOption
      ? +this.chosedDeliveryOption.price
      : this.normalDeliveryCharges;

    // console.log(this.chosedDeliveryOption.name);
    this.toastr.info(
      'Delivery location changed to ' + (this.chosedDeliveryOption.name)
    );
  }
  workingDays: any = 0;
  ngOnInit() {
    ////////////this.spinner.show();

    this.subscriptionData = JSON.parse(
      this.localStorage.getItem('subscriptionData')
    );


    this.plansArr = this.subscriptionData.packages;


    this.workingDays = this.subscriptionData.working_days;

    this.getStoreDetails();







    if (!this.subscriptionData) {
      this.toastr.error(
        'Please choose meal subscription plan & choice to checkout.'
      );
      this.router.navigate(['/meals']);
    }
  }

  defaultValue = 'none';
  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  public submitOrder(form: any) {

    if (!form.value) {
      this.toastr.warning('Invalid Message!');
      return;
    }
    // let data = form.value;
    if (this.customerDetailsArr.bank_option === 'none') {
      this.toastr.error('Choose Preferred Bank Option!');
      return;
    }

    if (this.customerDetailsArr.address2 === 'none') {
      this.toastr.error('Choose City!');
      return;
    }
    if (this.storeArr.delivery_options[form.value.address2] === 'none') {
      this.toastr.error('Choose City!');
      return;
    }





    let bookingSides: any = [];
    if (
      this.subscriptionData.monday &&
      this.subscriptionData.monday !== 'none' &&
      this.subscriptionData.monday !== ''
    ) {
      bookingSides.push(
        form.value.side_monday ? form.value.side_monday : 'none'
      );
      this.subscriptionData.items.monday.side = form.value.side_monday
        ? form.value.side_monday
        : 'none';
    }

    if (
      this.subscriptionData.tuesday &&
      this.subscriptionData.tuesday !== 'none' &&
      this.subscriptionData.tuesday !== ''
    ) {
      bookingSides.push(
        form.value.side_tuesday ? form.value.side_tuesday : 'none'
      );
      this.subscriptionData.items.tuesday.side = form.value.side_tuesday
        ? form.value.side_tuesday
        : 'none';
    }

    if (
      this.subscriptionData.wednesday &&
      this.subscriptionData.wednesday !== 'none' &&
      this.subscriptionData.wednesday !== ''
    ) {
      bookingSides.push(
        form.value.side_wednesday ? form.value.side_wednesday : 'none'
      );
      this.subscriptionData.items.wednesday.side = form.value.side_wednesday
        ? form.value.side_wednesday
        : 'none';
    }

    if (
      this.subscriptionData.thursday &&
      this.subscriptionData.thursday !== 'none' &&
      this.subscriptionData.thursday !== ''
    ) {
      bookingSides.push(
        form.value.side_thursday ? form.value.side_thursday : 'none'
      );
      this.subscriptionData.items.thursday.side = form.value.side_thursday
        ? form.value.side_thursday
        : 'none';
    }

    if (
      this.subscriptionData.friday &&
      this.subscriptionData.friday !== 'none' &&
      this.subscriptionData.friday !== ''
    ) {
      bookingSides.push(
        form.value.side_friday ? form.value.side_friday : 'none'
      );
      this.subscriptionData.items.friday.side = form.value.side_friday
        ? form.value.side_friday
        : 'none';
    }
    if (
      this.subscriptionData.saturday &&
      this.subscriptionData.saturday !== 'none' &&
      this.subscriptionData.saturday !== ''
    ) {
      bookingSides.push(
        form.value.side_saturday ? form.value.side_saturday : 'none'
      );
      this.subscriptionData.items.saturday.side = form.value.side_saturday
        ? form.value.side_saturday
        : 'none';
    }

    // console.table(this.subscriptionData);
    // return;


    let payable = +this.subscriptionData.plan_details.price;
    let total = +this.subscriptionData.plan_details.price;
    let delivery_charges_total = (this.storeArr.store.delivery_charges) ? this.storeArr.store.delivery_charges : 0;

    if (this.subscriptionData.plan === 'custom') {
      if ((+this.subscriptionData.booking_days.length) === this.workingDays) {
        delivery_charges_total = 0;
        total = this.plansArr['5-day'].price;
        payable = this.plansArr['5-day'].price;
      } else {
        delivery_charges_total = 0;
        total = this.getPlanPriceFoodType(this.subscriptionData.food_types);
        payable = this.getPlanPriceFoodType(this.subscriptionData.food_types);

      }
    }


    if (this.storeArr.store.delivery_charges) {
      if (this.subscriptionData.plan === 'custom') {
        if ((+this.subscriptionData.booking_days.length) === this.workingDays) {
          total = (+this.plansArr['5-day'].price);
          delivery_charges_total = ((+this.workingDays) * (this.storeArr.store.delivery_charges));
          payable = (+this.plansArr['5-day'].price) + ((+this.workingDays) * (this.storeArr.store.delivery_charges));
        } else {
          total = this.getPlanPriceFoodType(this.subscriptionData.food_types);
          delivery_charges_total = ((+this.subscriptionData.booking_days.length) * (this.storeArr.store.delivery_charges));
          payable = total + ((+this.subscriptionData.booking_days.length) * (this.storeArr.store.delivery_charges));
        }
      } else {

        delivery_charges_total = ((+this.workingDays) * (this.storeArr.store.delivery_charges));
        total = (+this.subscriptionData.plan_details.price);

        payable = (+this.subscriptionData.plan_details.price) + ((+this.workingDays) * (this.storeArr.store.delivery_charges));

        if (this.subscriptionData.plan === '4-week') {
          delivery_charges_total = (4 * (+this.subscriptionData.booking_days.length) * (this.storeArr.store.delivery_charges));
          total = (+this.subscriptionData.plan_details.price);

          payable = (+this.subscriptionData.plan_details.price) + (4 * (+this.subscriptionData.booking_days.length) * (this.storeArr.store.delivery_charges));

        }


      }
    }



    let data = JSON.stringify({
      create_member_account: this.createAccountFlag,
      account_id: this.storeArr.store.account_email_id,
      store_name: this.storeArr.store.name,
      email: this.storeArr.store.account_email_id,
      selected_delivery: 'd',
      name: form.value.name,
      contact_no: form.value.contactNo,
      contact_email: form.value.contactEmail,
      address1: form.value.address1,
      address2: this.storeArr.delivery_options[form.value.address2].name,
      pincode: '',
      notes: form.value.notes ? form.value.notes : 'N/A',
      allergies: form.value.allergies ? form.value.allergies : 'N/A',
      currency_symbol: this.storeArr.store.currency_symbol,
      total: total,
      delivery_charges: this.storeArr.store.delivery_charges ? this.storeArr.store.delivery_charges : 0, //new
      delivery_charges_total: (delivery_charges_total) ? delivery_charges_total : 0,
      delivery_options: this.chosedDeliveryOption
        ? this.chosedDeliveryOption
        : 'false', //new
      bank_options: this.storeArr.bank_options[form.value.bank_option]
        ? this.storeArr.bank_options[form.value.bank_option]
        : 'N/A', //new
      pickup_day: 'N/A', //new
      delivery_day: 'N/A', //new
      is_coupon_applied: this.appliedCouponDetails ? 'true' : 'false', //new
      coupon_discount_value: this.discountAmount, //new
      coupon_details: this.appliedCouponDetails
        ? this.appliedCouponDetails
        : 'false', //new
      payable: payable - this.discountAmount, //new
      items: [],
      meals: this.subscriptionData,
      plan: this.subscriptionData.plan,
      plan_food_type: this.subscriptionData.plan_food_type,

      booking_days: this.subscriptionData.booking_days.join(','),

      food_types: this.subscriptionData.food_types.join(','),


      booking_meals: this.subscriptionData.booking_meals.join(','),
      booking_sides: bookingSides.join(','),
      booking_meals_items: this.subscriptionData.booking_meals_items,
      display_price: this.subscriptionData.plan_details.display_price,
      working_days: this.workingDays,
      packages: this.subscriptionData.packages,
      week_start: this.subscriptionData.week_start,
      week_end: this.subscriptionData.week_end,
      meal_booking_week: this.subscriptionData.meal_booking_week,
    });




    this.spinner.show();
    this.load = true;
    this.store.placeSubscriptionWithSideOrder(data).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status === 'success') {
          this.localStorage.removeItem('subscriptionData');
          form.reset();
          $('.contact__msg').show();
          $('#formDiv').hide();
          this.toastr.success(res.message);
        } else {
          this.load = false;
          this.toastr.error(res.message);
        }
      },
      (err: any) => {
        this.load = false;
        this.spinner.hide();
        this.toastr.warning('Something went wrong!');
      }
    );
  }

  sidesDetailsArr: any = [];
  getStoreDetails() {
    const data = {
      store_id: environment.storeId
    };

    //////this.spinner.show();

    if (this.subscriptionData.meal_booking_week === 'subscribe_for_next_week') {
      this.mealMenu = "next_week";
    } else {
      this.mealMenu = "this_week";
    }

    this.store.getStoreDetailsByThisOrNextWeekMenu(data, this.mealMenu).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          if (res.message) {




            this.storeArr = res.message;


            // this.plansArr.custom = this.storeArr.packages.custom;
            // this.plansArr['5-day'] = this.storeArr.packages.five_day;
            // this.plansArr['4-week'] = this.storeArr.packages.four_week;



            this.storeArr.bank_options = res.bank_options;
            this.storeArr.delivery_options = res.delivery_options;
            this.storeArr.delivery_days = res.delivery_days;
            this.storeArr.store.delivery_charges = 0;
            if (res.message.sides) {
              this.sidesDetailsArr = res.message.sides;
            }

            /*trying to eliminated # from url*/
            if (this.router.url.split('/')[2]) {
              this.couponCode = this.router.url.split('/')[2];
              if (this.couponCode) {
                //        $("#couponSubmitBtn").trigger('click');
                let data: any = {};
                data.value = {
                  coupon_code: this.couponCode
                };
                this.submitCouponForm(data);
                // this.testFormElement.nativeElement.submit();
              }
            }
            /*trying to eliminated # from url*/
          } else {
            this.storeArr = [];
          }

          this.spinner.hide();
        } else {
          this.storeArr = [];
          this.toastr.warning('Something went wrong!');
          return;
        }
      },
      (err: any) => {
        this.storeArr = [];
        // console.log(err.error);
        this.spinner.hide();
        this.toastr.warning('Something went wrong!');
      }
    );
  }

  otpEmail: any;

  // login() {
  //   let resp = this.auth.googleSignin();
  // }
  public submitEmailForm(form: any) {
    if (!form.value) {
      this.toastr.warning("Enter valid email address!");
      return;
    }
    this.spinner.show();
    let data = JSON.stringify({
      email: form.value.email
    })

    this.auth.sendEmailOtp(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        $("#formEmailDiv").hide();
        $("#formOtpDiv").show();
        // $("#otpemail").val(form.value.email);
        this.otpEmail = form.value.email;
        this.auth.user$ = [];
        this.toastr.success(res.message);
        form.reset();
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



  public resendOtp() {

    this.spinner.show();
    let data = JSON.stringify({
      email: this.otpEmail
    })

    this.auth.sendEmailOtp(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        $("#formEmailDiv").hide();
        $("#formOtpDiv").show();
        // $("#otpemail").val(form.value.email);
        this.auth.user$ = [];
        this.toastr.success(res.message);
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

  createAccountFlag = false;
  public submitOtpForm(form: any) {
    if (!form.value) {
      this.toastr.warning("Enter valid otp!");
      return;
    }
    this.spinner.show();
    let data = JSON.stringify({
      verification_code: form.value.otp,
      email: this.otpEmail
    })

    this.auth.verifyEmailOtp(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        form.reset();
        console.log(res);
        if (res.data) {
          this.checkoutFormDisp = false;
          this.toastr.success("Signin success!");
          localStorage.setItem(
            'currentUserProfile',
            JSON.stringify(res.data)
          );
          this.auth.user$ = res.data;
          if (this.auth.user$) {
            //  this.customerDetailsArr = this.auth.user$;
            this.customerDetailsArr.address1 = this.auth.user$.address1;
            this.customerDetailsArr.contactEmail = this.auth.user$.email;
            this.customerDetailsArr.contactNo = this.auth.user$.mobile;
            this.customerDetailsArr.name = this.auth.user$.name;


            if (this.customerDetailsArr.contactEmail) {
              this.checkoutFormDisp = false;
            }

          }
        } else {
          this.toastr.success("Enter details to create account!");
          this.customerDetailsArr.email = this.otpEmail;
          $("#formSigninDiv").hide();
          $("#formSignupDiv").show();

        }


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

  public submitSignupForm(form: any) {
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
      create_member_account: true
    })


    this.auth.createMemberAccount(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        //localStorage.setItem('currentUserProfile', JSON.stringify(res.message));
        //  this.auth.user$ = res.message.name;
        this.toastr.success("Account created, Complete your order checkout!");
        //form.reset();
        //$(".contact__msg").show();
        $("#formSignupDiv").hide();
        localStorage.setItem(
          'currentUserProfile',
          JSON.stringify(res.message)
        );
        this.auth.user$ = res.message;
        if (this.auth.user$) {
          //  this.customerDetailsArr = this.auth.user$;
          this.customerDetailsArr.address1 = this.auth.user$.address1;
          this.customerDetailsArr.contactEmail = this.auth.user$.email;
          this.customerDetailsArr.contactNo = this.auth.user$.mobile;
          this.customerDetailsArr.name = this.auth.user$.name;

          if (this.customerDetailsArr.contactEmail) {
            this.checkoutFormDisp = false;
          }

        }

        return;
        //this.router.navigate(['/signin']);
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
