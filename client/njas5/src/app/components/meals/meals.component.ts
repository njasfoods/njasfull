import { Component, OnInit, Inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../services/store.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { Title, Meta } from '@angular/platform-browser';
const dateFormat = require('dateformat');
import swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.css']
})

export class MealsComponent implements OnInit {
  workingDays: any = 0;
  title = 'Not Jus A` Salad | MEAL PLAN REGISTRATION';
  plansArr: any = {
    'custom': {},
    '5-day': {},
    '4-week': {}
  };
  mealsMenuArr: any = {
    monday: {
      category: '',
      products: '',
      serving_status: 'active'
    },
    tuesday: {
      category: '',
      products: '',
      serving_status: 'active'
    },
    wednesday: {
      category: '',
      products: '',
      serving_status: 'active'
    },
    thursday: {
      category: '',
      products: '',
      serving_status: 'active'
    },
    friday: {
      category: '',
      products: '',
      serving_status: 'active'
    },
    saturday: {
      category: '',
      products: '',
      serving_status: 'active'
    },
    friday_special: {
      category: '',
      products: '',
      serving_status: 'active'
    },
    menu_flag_count: 0
  };
  subscriptionData = {
    plan: '',
    plan_food_type: '',
    is_all_vegans: true,
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    friday_special: '',

    items: {
      monday: {
        day: ' ',
        item: ' '
      },
      tuesday: {
        day: ' ',
        item: ' '
      },
      wednesday: {
        day: ' ',
        item: ' '
      },
      thursday: {
        day: ' ',
        item: ' '
      },
      friday: {
        day: ' ',
        item: ' '
      },
      saturday: {
        day: ' ',
        item: ' '
      },
      friday_special: {
        day: ' ',
        item: ' '
      }
    },

    booking_days: '',
    food_types: '',
    booking_meals: '',
    booking_meals_items: '',
    meals_menu: '',
    total: '',
    plan_details: '',
    allergies: '',
    store: '',
    customer_info: {
      name: '',
      email: ''
    },
    packages: {},
    working_days: 0,
    week_start: '',
    week_end: '',
    meal_booking_week: ''
  };

  storeArr: any;

  constructor(
    @Inject(LOCAL_STORAGE) private localStorage: any,
    public store: StoreService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    public router: Router,
    private titleService: Title,
    private metaService: Meta,
    public auth: AuthService
  ) {




    this.clearSelection(0);

  }

  mealMenu: any = null;
  mealBookingDay: any = null;
  mealBookingDayMorning4: any = null;
  ngOnInit() {


    //temp else 	
    //this.subscriptionData.plan = 'custom';	
    //temp else 

    this.titleService.setTitle(this.title);
    this.metaService.addTags([
      {
        name: 'keywords',
        content:
          'organic,food,marketing,shop,product,organic food,farmer,agriculture,fruits,vegetables,healthy food,resposnsive,Fruits Shop, vegetable store, Ecommerce, Stores, Orders, Payments, Groceries, Clothings, Shopping'
      },
      {
        name: 'description',
        content: `Clean, Healthy Lunches Prepared Fresh and Delivered to You Daily (Free Delivery). The Cleanest, Tastiest and Most Diverse Healthy Eating Experience! We're looking forward to having you on board :)`
      },
      { name: 'robots', content: 'index, follow' }
    ]);

    //this.localStorage.removeItem('subscriptionData');

    // if (this.localStorage.getItem('subscriptionData')) {
    //   this.subscriptionData = JSON.parse(this.localStorage.getItem('subscriptionData'));
    // }

    this.getsubscriptionPeriodThisWeekAndNextWeekAutopilotDetails();
    this.getStoreDetails();

  }
  ngOnDestroy() {

    this.localStorage.setItem(
      'subscriptionData',
      JSON.stringify(this.subscriptionData)
    );
  }
  activate = false;
  activateText = 'Fetching time...';
  subscriptionPeriodArr: any;
  now: any;
  end: any;
  date: any;
  week_start: any;
  week_end: any;

  getsubscriptionPeriodThisWeekAndNextWeekAutopilotDetails() {
    const data = {
      store_id: environment.storeId
    };

    //////this.spinner.show();
    this.store.getsubscriptionPeriodThisWeekAndNextWeekAutopilotDetails(data).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          if (res.message.message) {





            this.subscriptionPeriodArr = res.message.message;



            if (res.meal_plan_menu) {
              this.mealMenu = res.meal_plan_menu;
              //temp else 
              // this.mealMenu = 'subscribe_for_next_week';
              //temp else 
            }

            if (res.current_day) {
              if (this.mealMenu === 'subscribe_for_this_week') {
                this.mealBookingDay = (+res.current_day);
                this.mealBookingDayMorning4 = (+res.current_day);
                this.subscriptionData.plan = 'custom';
                //alert("hi");
              }
            }
            if (this.mealMenu === 'subscribe_for_this_week') {
              this.week_start = res.data.this_week_start;
              this.week_end = res.data.this_week_end;
            } else {
              this.week_start = res.data.next_week_start;
              this.week_end = res.data.next_week_end;
            }


            this.now = res.message.now;
            this.end = res.message.end;
            this.date = res.message.date;


            // res.now_hours = 5;
            if (1) {
              //   console.log(res.now_hours);
              switch (this.mealBookingDay) {
                case 0:
                  this.subscriptionData.monday = 'none';
                  this.subscriptionData.tuesday = 'none';
                  this.subscriptionData.wednesday = 'none';
                  this.subscriptionData.thursday = 'none';
                  this.subscriptionData.friday = 'none';
                  this.subscriptionData.saturday = 'none';
                  break;
                case 1:
                  //monday
                  if (res.data.now_hours <= 5) {
                    this.mealBookingDayMorning4 = (this.mealBookingDayMorning4 - 0.5);
                  } else {
                    this.subscriptionData.monday = 'none';
                    // this.subscriptionData.tuesday = 'none';
                    // this.subscriptionData.wednesday = 'none';
                    // this.subscriptionData.thursday = 'none';
                    // this.subscriptionData.friday = 'none';

                    // this.subscriptionData.saturday = 'none';
                  }


                  break;

                case 2:
                  //tuesday
                  if (res.data.now_hours <= 5) {
                    this.mealBookingDayMorning4 = (this.mealBookingDayMorning4 - 0.5);
                  } else {
                    this.subscriptionData.tuesday = 'none';
                  }

                  this.subscriptionData.monday = 'none';
                  // this.subscriptionData.wednesday = 'none';
                  // this.subscriptionData.thursday = 'none';
                  // this.subscriptionData.friday = 'none';

                  // this.subscriptionData.saturday = 'none';
                  break;


                case 3:
                  //wednesday

                  if (res.data.now_hours <= 5) {
                    this.mealBookingDayMorning4 = (this.mealBookingDayMorning4 - 0.5);
                  } else {
                    this.subscriptionData.wednesday = 'none';

                  }

                  this.subscriptionData.monday = 'none';
                  this.subscriptionData.tuesday = 'none';
                  // this.subscriptionData.thursday = 'none';
                  // this.subscriptionData.friday = 'none';

                  // this.subscriptionData.saturday = 'none';
                  break;

                case 4:

                  //thursday
                  if (res.data.now_hours <= 5) {
                    this.mealBookingDayMorning4 = (this.mealBookingDayMorning4 - 0.5);
                  } else {
                    this.subscriptionData.thursday = 'none';
                  }

                  this.subscriptionData.monday = 'none';
                  this.subscriptionData.tuesday = 'none';
                  this.subscriptionData.wednesday = 'none';

                  // this.subscriptionData.friday = 'none';

                  // this.subscriptionData.saturday = 'none';
                  break;
                case 5:
                  //friday
                  if (res.data.now_hours <= 5) {
                    this.mealBookingDayMorning4 = (this.mealBookingDayMorning4 - 0.5);
                  } else {
                    this.subscriptionData.friday = 'none';
                  }
                  this.subscriptionData.monday = 'none';
                  this.subscriptionData.tuesday = 'none';
                  this.subscriptionData.wednesday = 'none';
                  this.subscriptionData.thursday = 'none';
                  // this.subscriptionData.saturday = 'none';
                  break;
                case 6:
                  //saturday

                  if (res.data.now_hours <= 5) {
                    this.mealBookingDayMorning4 = (this.mealBookingDayMorning4 - 0.5);
                  } else {
                    this.subscriptionData.saturday = 'none';
                  }
                  this.subscriptionData.monday = 'none';
                  this.subscriptionData.tuesday = 'none';
                  this.subscriptionData.wednesday = 'none';
                  this.subscriptionData.thursday = 'none';
                  this.subscriptionData.friday = 'none';


                  break;
                default:
                  break;
              }



            }
            // this.spinner.hide();


            if (this.storeArr && this.mealsMenuArr && this.mealMenu) {

              setTimeout(() => {
                this.spinner.hide();
              }, 1500);

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
            this.spinner.hide();
            this.subscriptionPeriodArr = [];
          }

        } else {
          this.spinner.hide();

          // this.toastr.warning('Something went wrong!');
          return;
        }
      },
      (err: any) => {
        this.spinner.hide();
        //this.toastr.warning('Something went wrong!');
      }
    );
  }


  clearSelection(permission = 1) {

    if (permission) {
      swal
        .fire({
          title: 'Are you sure?',
          position: 'top',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, clear it!'
        })
        .then(result => {
          if (result.value) {
            this.clearTemp();
          }
        });
    } else {
      this.clearTemp();
    }



  }

  clearTemp() {
    //temp
    this.isVegChecked = true;
    this.isMeatChecked = true;

    this.subscriptionData.friday_special = 'none';
    this.subscriptionData.monday = 'none';
    this.subscriptionData.tuesday = 'none';
    this.subscriptionData.wednesday = 'none';
    this.subscriptionData.thursday = 'none';
    this.subscriptionData.friday = 'none';
    this.subscriptionData.saturday = 'none';
    this.subscriptionData.plan = 'custom';

    this.localStorage.removeItem('subscriptionData');

    //temp
  }
  isVegChecked: boolean = true;
  isMeatChecked: boolean = true;

  checkVegValue(event: any) {
    this.isVegChecked = event;
    if (this.isVegChecked) {
      this.toastr.info("Enabling the Veg Meals");
    } else {
      this.toastr.info("Disabling the Veg Meals");
    }

  }
  checkMeatValue(event: any) {
    this.isMeatChecked = event;
    if (this.isMeatChecked) {
      this.toastr.info("Enabling the Non-Veg Meals");
    } else {
      this.toastr.info("Disabling the Non-Veg Meals");
    }
  }



  appliedCouponDetails: any;
  couponCode: any = null;

  discountAmount: any = 0;

  public submitCouponForm(form: any) {
    this.toastr.info("Fetching coupon/referral details.");
    if (!form.value) {
      this.toastr.warning(
        'Invalid Coupon Code!'
      );
      return;
    }

    let data = form.value;
    data.store_name = environment.storeId;

    this.spinner.show();
    this.store.validateCouponCode(data).subscribe(
      (res: any) => {
        this.spinner.hide();

        if (res.status === 'success') {
          this.appliedCouponDetails = res.message[Object.keys(res.message)[0]];

          this.toastr.success(
            'Hooray! You have coupon to avail. Offer: "' + this.appliedCouponDetails.name + '"'
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

  getPlanFoodType(foodTypes: any) {
    let type = 'Veg';
    if (foodTypes.includes('Mix')) {
      type = 'Mix';
    }
    if (foodTypes.includes('Non-Veg')) {
      type = 'Non-Veg';
    }
    return type;
  }

  onClickSubmit(formData: any) {

    if (
      !this.subscriptionData.plan ||
      this.subscriptionData.plan === 'none' ||
      this.subscriptionData.plan === ''
    ) {
      this.toastr.warning('Choose subscription plan!');
      this.spinner.hide();
      return;
    }
    let bookingDays: any;
    let foodTypes: any;
    let bookingMeals: any;
    let bookingMealsItems: any;
    switch (this.subscriptionData.plan.toLowerCase().trim()) {
      case 'custom': {
        foodTypes = [];
        bookingDays = [];
        bookingMeals = [];
        bookingMealsItems = [];
        if (
          this.subscriptionData.monday &&
          this.subscriptionData.monday !== 'none' &&
          this.subscriptionData.monday !== '' &&
          this.mealsMenuArr.monday.serving_status === 'active'
        ) {





          if (this.storeArr.products[this.subscriptionData.monday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.monday].food_symbol);
          }

          bookingDays.push('Monday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.monday].name
          );

          let mealItemList = {
            day: 'Monday',
            item: this.storeArr.products[this.subscriptionData.monday]
          };

          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.monday = mealItemList;
        }
        if (
          this.subscriptionData.tuesday &&
          this.subscriptionData.tuesday !== 'none' &&
          this.subscriptionData.tuesday !== '' &&
          this.mealsMenuArr.tuesday.serving_status === 'active'
        ) {


          if (this.storeArr.products[this.subscriptionData.tuesday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.tuesday].food_symbol);
          }
          bookingDays.push('Tuesday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.tuesday].name
          );

          let mealItemList = {
            day: 'Tuesday',
            item: this.storeArr.products[this.subscriptionData.tuesday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.tuesday = mealItemList;
        }
        if (
          this.subscriptionData.wednesday &&
          this.subscriptionData.wednesday !== 'none' &&
          this.subscriptionData.wednesday !== '' &&
          this.mealsMenuArr.wednesday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.wednesday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.wednesday].food_symbol);
          }
          bookingDays.push('Wednesday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.wednesday].name
          );

          let mealItemList = {
            day: 'Wednesday',
            item: this.storeArr.products[this.subscriptionData.wednesday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.wednesday = mealItemList;
        }
        if (
          this.subscriptionData.thursday &&
          this.subscriptionData.thursday !== 'none' &&
          this.subscriptionData.thursday !== '' &&
          this.mealsMenuArr.thursday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.thursday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.thursday].food_symbol);
          }
          bookingDays.push('Thursday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.thursday].name
          );

          let mealItemList = {
            day: 'Thursday',
            item: this.storeArr.products[this.subscriptionData.thursday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.thursday = mealItemList;
        }
        if (
          this.subscriptionData.friday &&
          this.subscriptionData.friday !== 'none' &&
          this.subscriptionData.friday !== '' &&
          this.mealsMenuArr.friday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.friday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.friday].food_symbol);
          }
          bookingDays.push('Friday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.friday].name
          );

          let mealItemList = {
            day: 'Friday',
            item: this.storeArr.products[this.subscriptionData.friday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.friday = mealItemList;
        }
        if (
          this.subscriptionData.saturday &&
          this.subscriptionData.saturday !== 'none' &&
          this.subscriptionData.saturday !== '' &&
          this.mealsMenuArr.saturday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.saturday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.saturday].food_symbol);
          }
          bookingDays.push('Saturday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.saturday].name
          );

          let mealItemList = {
            day: 'Saturday',
            item: this.storeArr.products[this.subscriptionData.saturday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.saturday = mealItemList;
        }
        if (bookingDays.length === 0) {
          this.toastr.error('Please pick meal to proceed.');
          // this.toastr.info("Picked days - " + bookingDays.join(","));
          this.spinner.hide();
          return;
        }



        //custom package
        // if (bookingDays.length !== 5) {
        if (bookingDays.length !== this.workingDays) {

          if (
            !this.subscriptionData.monday ||
            this.subscriptionData.monday === ''
          ) {
            this.toastr.error('Please Choose Meal or None for Other Days.');
            this.toastr.info('Picked days - ' + bookingDays.join(','));
            this.spinner.hide();
            return;
          }



          if (
            !this.subscriptionData.tuesday ||
            this.subscriptionData.tuesday === ''
          ) {
            this.toastr.error('Please Choose Meal or None for Other Days.');
            this.toastr.info('Picked days - ' + bookingDays.join(','));
            this.spinner.hide();
            return;
          }



          if (
            !this.subscriptionData.wednesday ||
            this.subscriptionData.wednesday === ''
          ) {
            this.toastr.error('Please Choose Meal or None for Other Days.');
            this.toastr.info('Picked days - ' + bookingDays.join(','));
            this.spinner.hide();
            return;
          }


          if (
            !this.subscriptionData.thursday ||
            this.subscriptionData.thursday === ''
          ) {
            this.toastr.error('Please Choose Meal or None for Other Days.');
            this.toastr.info('Picked days - ' + bookingDays.join(','));
            this.spinner.hide();
            return;
          }



          if (
            !this.subscriptionData.friday ||
            this.subscriptionData.friday === ''
          ) {
            this.toastr.error('Please Choose Meal or None for Other Days.');
            this.toastr.info('Picked days - ' + bookingDays.join(','));
            this.spinner.hide();
            return;
          }


          if (
            !this.subscriptionData.saturday ||
            this.subscriptionData.saturday === ''
          ) {
            this.toastr.error('Please Choose Meal or None for Other Days.');
            this.toastr.info('Picked days - ' + bookingDays.join(','));
            this.spinner.hide();
            return;
          }

        }
        //custom package

        if (bookingDays.includes('Friday')) {
          if (
            !this.subscriptionData.friday_special ||
            this.subscriptionData.friday_special === ''
          ) {
            this.toastr.error('Please pick dessert or fruit bowl for friday.');
            this.toastr.info('Picked days - ' + bookingDays.join(','));
            this.spinner.hide();
            return;
          } else {
            if (
              this.subscriptionData.friday_special &&
              this.subscriptionData.friday_special !== 'none' &&
              this.subscriptionData.friday_special !== ''
            ) {
              //  bookingDays.push("Friday Special");
              bookingMeals.push(
                this.storeArr.products[this.subscriptionData.friday_special]
                  .name
              );

              let mealItemList = {
                day: 'Friday Special',
                item: this.storeArr.products[
                  this.subscriptionData.friday_special
                ]
              };
              bookingMealsItems.push(mealItemList);
              this.subscriptionData.items.friday_special = mealItemList;
            }

            // bookingMeals.push(this.subscriptionData.friday_special);
          }
        }

        break;
      }
      case '5-day': {
        foodTypes = [];
        bookingDays = [];
        bookingMeals = [];
        bookingMealsItems = [];
        if (
          this.subscriptionData.monday &&
          this.subscriptionData.monday !== 'none' &&
          this.subscriptionData.monday !== '' &&
          this.mealsMenuArr.monday.serving_status === 'active'
        ) {
          if (this.storeArr.products[this.subscriptionData.monday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.monday].food_symbol);
          }
          bookingDays.push('Monday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.monday].name
          );

          let mealItemList = {
            day: 'Monday',
            item: this.storeArr.products[this.subscriptionData.monday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.monday = mealItemList;
        }
        if (
          this.subscriptionData.tuesday &&
          this.subscriptionData.tuesday !== 'none' &&
          this.subscriptionData.tuesday !== '' &&
          this.mealsMenuArr.tuesday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.tuesday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.tuesday].food_symbol);
          }
          bookingDays.push('Tuesday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.tuesday].name
          );

          let mealItemList = {
            day: 'Tuesday',
            item: this.storeArr.products[this.subscriptionData.tuesday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.tuesday = mealItemList;
        }
        if (
          this.subscriptionData.wednesday &&
          this.subscriptionData.wednesday !== 'none' &&
          this.subscriptionData.wednesday !== '' &&
          this.mealsMenuArr.wednesday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.wednesday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.wednesday].food_symbol);
          }
          bookingDays.push('Wednesday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.wednesday].name
          );

          let mealItemList = {
            day: 'Wednesday',
            item: this.storeArr.products[this.subscriptionData.wednesday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.wednesday = mealItemList;
        }
        if (
          this.subscriptionData.thursday &&
          this.subscriptionData.thursday !== 'none' &&
          this.subscriptionData.thursday !== '' &&
          this.mealsMenuArr.thursday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.thursday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.thursday].food_symbol);
          }
          bookingDays.push('Thursday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.thursday].name
          );

          let mealItemList = {
            day: 'Thursday',
            item: this.storeArr.products[this.subscriptionData.thursday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.thursday = mealItemList;
        }
        if (
          this.subscriptionData.friday &&
          this.subscriptionData.friday !== 'none' &&
          this.subscriptionData.friday !== '' &&
          this.mealsMenuArr.friday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.friday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.friday].food_symbol);
          }
          bookingDays.push('Friday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.friday].name
          );

          let mealItemList = {
            day: 'Friday',
            item: this.storeArr.products[this.subscriptionData.friday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.friday = mealItemList;
        }
        if (
          this.subscriptionData.saturday &&
          this.subscriptionData.saturday !== 'none' &&
          this.subscriptionData.saturday !== '' &&
          this.mealsMenuArr.saturday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.saturday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.saturday].food_symbol);
          }
          bookingDays.push('Saturday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.saturday].name
          );

          let mealItemList = {
            day: 'Saturday',
            item: this.storeArr.products[this.subscriptionData.saturday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.saturday = mealItemList;
        }
        if (bookingDays.length === 0) {
          this.toastr.error('Please pick meals for 5-days Or Change the plan.');
          // this.toastr.info("Picked days - " + bookingDays.join(","));
          this.spinner.hide();
          return;
        }

        // if (bookingDays.length !== 5) {
        if (bookingDays.length !== this.workingDays) {

          this.toastr.error('Please pick meals for 5-days Or Change the plan.');
          this.toastr.info('Picked days - ' + bookingDays.join(','));
          this.spinner.hide();
          return;
        }

        if (bookingDays.includes('Friday')) {
          if (
            !this.subscriptionData.friday_special ||
            this.subscriptionData.friday_special === ''
          ) {
            this.toastr.error('Please pick dessert or fruit bowl for friday.');
            this.toastr.info('Picked days - ' + bookingDays.join(','));
            this.spinner.hide();
            return;
          } else {
            if (
              this.subscriptionData.friday_special &&
              this.subscriptionData.friday_special !== 'none' &&
              this.subscriptionData.friday_special !== ''
            ) {
              //  bookingDays.push("Friday Special");
              bookingMeals.push(
                this.storeArr.products[this.subscriptionData.friday_special]
                  .name
              );

              let mealItemList = {
                day: 'Friday Special',
                item: this.storeArr.products[
                  this.subscriptionData.friday_special
                ]
              };
              bookingMealsItems.push(mealItemList);
              this.subscriptionData.items.friday_special = mealItemList;
            }
          }
        }

        break;
      }
      case '4-week': {
        foodTypes = [];
        bookingDays = [];
        bookingMeals = [];
        bookingMealsItems = [];
        if (
          this.subscriptionData.monday &&
          this.subscriptionData.monday !== 'none' &&
          this.subscriptionData.monday !== '' &&
          this.mealsMenuArr.monday.serving_status === 'active'
        ) {


          if (this.storeArr.products[this.subscriptionData.monday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.monday].food_symbol);
          }
          bookingDays.push('Monday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.monday].name
          );

          let mealItemList = {
            day: 'Monday',
            item: this.storeArr.products[this.subscriptionData.monday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.monday = mealItemList;
        }
        if (
          this.subscriptionData.tuesday &&
          this.subscriptionData.tuesday !== 'none' &&
          this.subscriptionData.tuesday !== '' &&
          this.mealsMenuArr.tuesday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.tuesday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.tuesday].food_symbol);
          }
          bookingDays.push('Tuesday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.tuesday].name
          );

          let mealItemList = {
            day: 'Tuesday',
            item: this.storeArr.products[this.subscriptionData.tuesday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.tuesday = mealItemList;
        }
        if (
          this.subscriptionData.wednesday &&
          this.subscriptionData.wednesday !== 'none' &&
          this.subscriptionData.wednesday !== '' &&
          this.mealsMenuArr.wednesday.serving_status === 'active'
        ) {


          if (this.storeArr.products[this.subscriptionData.wednesday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.wednesday].food_symbol);
          }
          bookingDays.push('Wednesday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.wednesday].name
          );

          let mealItemList = {
            day: 'Wednesday',
            item: this.storeArr.products[this.subscriptionData.wednesday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.wednesday = mealItemList;
        }
        if (
          this.subscriptionData.thursday &&
          this.subscriptionData.thursday !== 'none' &&
          this.subscriptionData.thursday !== '' &&
          this.mealsMenuArr.thursday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.thursday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.thursday].food_symbol);
          }
          bookingDays.push('Thursday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.thursday].name
          );

          let mealItemList = {
            day: 'Thursday',
            item: this.storeArr.products[this.subscriptionData.thursday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.thursday = mealItemList;
        }
        if (
          this.subscriptionData.friday &&
          this.subscriptionData.friday !== 'none' &&
          this.subscriptionData.friday !== '' &&
          this.mealsMenuArr.friday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.friday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.friday].food_symbol);
          }
          bookingDays.push('Friday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.friday].name
          );

          let mealItemList = {
            day: 'Friday',
            item: this.storeArr.products[this.subscriptionData.friday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.friday = mealItemList;
        }
        if (
          this.subscriptionData.saturday &&
          this.subscriptionData.saturday !== 'none' &&
          this.subscriptionData.saturday !== '' &&
          this.mealsMenuArr.saturday.serving_status === 'active'
        ) {

          if (this.storeArr.products[this.subscriptionData.saturday].food_symbol) {
            foodTypes.push(this.storeArr.products[this.subscriptionData.saturday].food_symbol);
          }
          bookingDays.push('Saturday');
          bookingMeals.push(
            this.storeArr.products[this.subscriptionData.saturday].name
          );

          let mealItemList = {
            day: 'Saturday',
            item: this.storeArr.products[this.subscriptionData.saturday]
          };
          bookingMealsItems.push(mealItemList);
          this.subscriptionData.items.saturday = mealItemList;
        }
        if (bookingDays.length === 0) {
          this.toastr.error('Please pick meals for 5-days Or Change the plan.');
          //    this.toastr.info("Picked days - " + bookingDays.join(","));
          this.spinner.hide();
          return;
        }

        // if (bookingDays.length !== 5) {
        if (bookingDays.length !== this.workingDays) {

          this.toastr.error('Please pick meals for 5-days Or Change the plan.');
          this.toastr.info('Picked days - ' + bookingDays.join(','));
          this.spinner.hide();
          return;
        }

        if (bookingDays.includes('Friday')) {
          if (
            !this.subscriptionData.friday_special ||
            this.subscriptionData.friday_special === ''
          ) {
            this.toastr.error('Please pick dessert or fruit bowl for friday.');
            this.toastr.info('Picked days - ' + bookingDays.join(','));
            this.spinner.hide();
            return;
          } else {
            if (
              this.subscriptionData.friday_special &&
              this.subscriptionData.friday_special !== 'none' &&
              this.subscriptionData.friday_special !== ''
            ) {
              //  bookingDays.push("Friday Special");
              bookingMeals.push(
                this.storeArr.products[this.subscriptionData.friday_special]
                  .name
              );

              let mealItemList = {
                day: 'Friday Special',
                item: this.storeArr.products[
                  this.subscriptionData.friday_special
                ]
              };
              bookingMealsItems.push(mealItemList);
              this.subscriptionData.items.friday_special = mealItemList;
            }
          }
        }

        break;
      }
      default:
    }



    console.table(foodTypes);
    this.subscriptionData.plan_food_type = this.getPlanFoodType(foodTypes);
    console.table(this.subscriptionData.plan_food_type);



    this.subscriptionData.booking_days = bookingDays;
    this.subscriptionData.food_types = foodTypes;
    this.subscriptionData.booking_meals = bookingMeals;
    this.subscriptionData.booking_meals_items = bookingMealsItems;
    this.subscriptionData.meals_menu = this.mealsMenuArr;
    this.subscriptionData.is_all_vegans = this.subscriptionData.plan_food_type == 'Veg' ? true : false;
    this.subscriptionData.total = this.plansArr[
      this.subscriptionData.plan
    ].price;

    if (this.subscriptionData.plan_food_type == 'Veg') {

      this.plansArr[
        this.subscriptionData.plan
      ].price = this.plansArr[
      this.subscriptionData.plan
      ]['veg_price'];
      if (this.subscriptionData.plan === 'custom') {

        this.plansArr[
          '5-day'
        ].price = this.plansArr[
        '5-day'
        ]['veg_price'];

        this.plansArr[
          '5-day'
        ].display_price = this.plansArr[
        '5-day'
        ]['currency'] + " " + this.plansArr[
        '5-day'
        ]['veg_price'];



        this.plansArr[
          this.subscriptionData.plan
        ].display_price = this.plansArr[
        this.subscriptionData.plan
        ]['currency'] + " " + this.plansArr[
        this.subscriptionData.plan
        ]['veg_price'] + "/day";
      } else {

        this.plansArr[
          this.subscriptionData.plan
        ].display_price = this.plansArr[
        this.subscriptionData.plan
        ]['currency'] + " " + this.plansArr[
        this.subscriptionData.plan
        ]['veg_price'];
      }



    } else {

      this.plansArr[
        this.subscriptionData.plan
      ].price = this.plansArr[
      this.subscriptionData.plan
      ]['non_veg_price'];

      if (this.subscriptionData.plan === 'custom') {


        this.plansArr[
          '5-day'
        ].price = this.plansArr[
        '5-day'
        ]['non_veg_price'];

        this.plansArr[
          '5-day'
        ].display_price = this.plansArr[
        '5-day'
        ]['currency'] + " " + this.plansArr[
        '5-day'
        ]['non_veg_price'];



        this.plansArr[
          this.subscriptionData.plan
        ].display_price = this.plansArr[
        this.subscriptionData.plan
        ]['currency'] + " " + this.plansArr[
        this.subscriptionData.plan
        ]['non_veg_price'] + "/day";
      } else {
        this.plansArr[
          this.subscriptionData.plan
        ].display_price = this.plansArr[
        this.subscriptionData.plan
        ]['currency'] + " " + this.plansArr[
        this.subscriptionData.plan
        ]['non_veg_price'];
      }


    }


    this.subscriptionData.plan_details = this.plansArr[
      this.subscriptionData.plan
    ];



    this.subscriptionData.packages = this.plansArr;
    this.subscriptionData.working_days = this.workingDays;



    if (this.mealMenu === 'subscribe_for_this_week') {
      this.subscriptionData.week_start = this.week_start;
      this.subscriptionData.week_end = this.week_end;
      this.subscriptionData.meal_booking_week = 'subscribe_for_this_week';
    } else {
      this.subscriptionData.week_start = this.week_start;
      this.subscriptionData.week_end = this.week_end;
      this.subscriptionData.meal_booking_week = 'subscribe_for_next_week';
    }



    this.localStorage.setItem(
      'subscriptionData',
      JSON.stringify(this.subscriptionData)
    );
    this.spinner.hide();


    /*trying to eliminated # from url*/
    if (this.router.url.split('/')[2]) {
      this.couponCode = this.router.url.split('/')[2];
      if (this.couponCode) {
        this.router.navigate(['/checkout', this.couponCode]);
      }
    } else {
      this.router.navigate(['/checkout']);
    }
    /*trying to eliminated # from url*/


  }

  readMore() {
    const data = {
      store_id: environment.storeId
    };

    //////this.spinner.show();

    this.store.getsubscriptionSummary(data).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          var pickListModal = swal
            .fire({
              width: '100%',
              // title: '<strong><u>Njas Meal Plan Subscription:</u></strong>',
              html: res.message
                ? '<div class="text-left">' + res.message + '</div>'
                : 'N/A',
              confirmButtonColor: '#DD6B55',
              showCloseButton: true,
              showConfirmButton: false,
              showCancelButton: false,
              focusConfirm: true,
              confirmButtonText: '<i class="fa fa-download"></i> Download!',
              confirmButtonAriaLabel: 'Thumbs up, great!'
              // cancelButtonText:
              //   '<i class="fa fa-times"></i>',
              // cancelButtonAriaLabel: 'Close'
            })
            .then(isConfirm => {
              // console.log(isConfirm);

              if (isConfirm.value) {
                //   this.getPDF(orderDetails.order_id);
              } else {
                //  swal("Cancelled", "Your imaginary file is safe :)", "error");
              }
            });
          $('.swal2-container').css('background-color', '#fff');
          $('.swal2-container.in').css('background-color', '#fff');


          this.spinner.hide();

        } else {
          this.toastr.warning('Something went wrong!');
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
  getStoreDetails() {
    const data = {
      store_id: environment.storeId
    };

    //////this.spinner.show();

    this.store.getStoreDetailsByThisOrNextWeekMenu(data, this.mealMenu).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          if (res.message) {
            this.storeArr = res.message;
            // this.subscriptionData.store = this.storeArr.store;
            this.mealsMenuArr = this.storeArr.meals_menu_list;

            this.plansArr.custom = this.storeArr.packages.custom;
            this.plansArr['5-day'] = this.storeArr.packages.five_day;
            this.plansArr['4-week'] = this.storeArr.packages.four_week;
            this.workingDays = this.storeArr.working_days;
            console.log(this.workingDays);

            this.mealsMenuArr.menu_flag_count = 1;
          } else {
            this.storeArr = [];
          }
          if (this.storeArr && this.mealsMenuArr && this.mealMenu) {
            // this.spinner.hide();
            setTimeout(() => {
              this.spinner.hide();
            }, 1500);
          }
        } else {
          this.spinner.hide();
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
}
