import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'layout-meal-product',
  templateUrl: './meal-product.component.html',
  styleUrls: ['./meal-product.component.scss']
})
export class MealProductComponent implements OnInit {
  @Input() storeArr: any = {};
  @Input() productArr: any = {};
  @Input() subscriptionData: any = {};
  @Input() mealsMenuArr: any = {};
  @Input() day: any;
  @Input() mealBookingDayMorning4: any;
  @Input() isMeatChecked: any;
  @Input() isVegChecked: any;
  @Input() plan: any;
  @Input() plansArr: any;
  
// this.plansArr[
//           this.subscriptionData.plan
//         ]['non_veg_price']
//   constructor(public auth: AuthService) {
//     if (localStorage.getItem('currentUserProfile')) {
//       this.auth.user$ = JSON.parse(localStorage.getItem('currentUserProfile'));
//     } else {
//       this.auth.user$ = [];
//     }
//   }
  ngOnInit() { }


  checkDayOpenClose(day: any, mealBookingDayMorning4: any) {

    let flag = false;
    switch (day) {
      case 'monday':
        if (mealBookingDayMorning4 < 1 && mealBookingDayMorning4 !== 0 && mealBookingDayMorning4 !== 6) {
          flag = true;
        }
        break;
      case 'tuesday':
        if (mealBookingDayMorning4 < 2 && mealBookingDayMorning4 !== 0 && mealBookingDayMorning4 !== 6) {
          flag = true;
        }
        break;
      case 'wednesday':
        if (mealBookingDayMorning4 < 3 && mealBookingDayMorning4 !== 0 && mealBookingDayMorning4 !== 6) {
          flag = true;
        }
        break;
      case 'thursday':
        if (mealBookingDayMorning4 < 4 && mealBookingDayMorning4 !== 0 && mealBookingDayMorning4 !== 6) {
          flag = true;
        }
        break;
      case 'friday':
        if (mealBookingDayMorning4 < 5 && mealBookingDayMorning4 !== 0 && mealBookingDayMorning4 !== 6) {
          flag = true;
        }
        break;
      case 'saturday':
        if (mealBookingDayMorning4 < 6 && mealBookingDayMorning4 !== 0 && mealBookingDayMorning4 !== 6) {
          flag = true;
        }
        break;
      default:
        break;
    }

    return flag;

  }
}
