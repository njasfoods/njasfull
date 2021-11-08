import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
// import * as moment from 'moment';

import {
  environment,
  httpBasicAuthOptions,
  httpBasicOptions,
} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  uploadProfileLogo(event: any): Observable<any> {
    const file = event.target.files[0];
    let formData: FormData = new FormData();
    formData.append(
      'id',
      JSON.parse(localStorage.getItem('currentUserProfile')).email
    );
    // formData.append('store_name', JSON.parse(localStorage.getItem('currentUserProfile')).store_name);
    formData.append('photo', file);
    const url =
      environment.rootFBCloudUrl +
      'uploadProfileLogo?id=' +
      JSON.parse(localStorage.getItem('currentUserProfile')).email;
    return this.http
      .post(url, formData)
      .pipe(map((response: Response) => response));
  }

  getStoreDetails(data: any): Observable<any> {
    const requestData = JSON.stringify({
      store_id: data.store_id,
    });
    const url = environment.rootCloudUrl + 'getStoreDetails';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  getStoreDetailsByMenu(data: any, meal_menu: any = null): Observable<any> {
    const requestData = JSON.stringify({
      store_id: data.store_id,
    });
    let url = environment.rootCloudUrl + 'getStoreDetails';
    if (meal_menu) {
      if (meal_menu === 'subscribe_for_this_week') {
        url = environment.rootCloudUrl + 'getThisWeekMealMenuStoreDetails';
      } else {
        url = environment.rootCloudUrl + 'getStoreDetails';
      }
    } else {
      url = environment.rootCloudUrl + 'getStoreDetails';
    }
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }
  validateCouponCode(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'validateCouponCode';

    let requestData = JSON.stringify({
      store_id: data.store_name,
      coupon_code: data.coupon_code,
      plan: data.plan ? data.plan : '',
      payable: data.payable ? data.payable : ''
    });

    return this.http
      .post(url, requestData, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }
  getStoreDetailsByThisOrNextWeekMenu(
    data: any,
    meal_menu: any = null
  ): Observable<any> {
    let meal_plan_menu = 'this_week';
    if (meal_menu === 'subscribe_for_this_week') {
      meal_plan_menu = 'this_week';
    } else {
      meal_plan_menu = 'next_week';
    }

    const requestData = JSON.stringify({
      store_id: data.store_id,
      meal_plan_menu: meal_plan_menu,
    });
    let url = environment.rootCloudUrl + 'getStoreDetailsByMealPlanMenu';

    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  payOnline(data: any): Observable<any> {
    const url = 'https://sandbox.wipayfinancial.com/v1/gateway';
    return this.http.post(url, data).pipe(
      map((response: Response) => {
        response;
      })
    );
  }

  getsubscriptionPeriodDetails(data: any): Observable<any> {
    const requestData = JSON.stringify({
      store_id: data.store_id,
    });
    const url = environment.rootCloudUrl + 'getsubscriptionPeriodDetails';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  getsubscriptionPeriodCurrentWeekAndUpcomingWeekDetails(
    data: any
  ): Observable<any> {
    const requestData = JSON.stringify({
      store_id: data.store_id,
    });
    // const url = environment.rootCloudUrl + 'getsubscriptionPeriodCurrentWeekAndUpcomingWeekDetails';
    const url =
      environment.rootCloudUrl +
      'getsubscriptionPeriodThisWeekAndNextWeekDetails';

    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  getsubscriptionPeriodThisWeekAndNextWeekAutopilotDetails(
    data: any
  ): Observable<any> {
    const requestData = JSON.stringify({
      store_id: data.store_id,
    });
    // const url = environment.rootCloudUrl + 'getsubscriptionPeriodThisWeekAndNextWeekAutopilotDetails';
    const url =
      environment.rootCloudUrl +
      'getsubscriptionPeriodThisWeekAndNextWeekAutopilotDetails';

    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  getsubscriptionSummary(data: any): Observable<any> {
    const requestData = JSON.stringify({
      store_id: data.store_id,
    });
    const url = environment.rootCloudUrl + 'getsubscriptionSummary';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  placeSubscriptionOrder(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'createSubscriptionOrderWithReceipt';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  // placeSubscriptionWithSideOrder(data: any): Observable<any> {
  //   const url = environment.rootCloudUrl + 'createSubscriptionOrderWithPackageWithSideWithReceipt';
  //   return this.http
  //     .post(url, data, httpBasicAuthOptions)
  //     .pipe(map((response: Response) => response));
  // }

  placeSubscriptionWithSideOrder(data: any): Observable<any> {
    const url =
      environment.rootCloudUrl +
      'createSubscriptionOrderWithPackageWithSideWithReceiptv1';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  placeCakeOrder(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'createCakeOrderWithReceipt';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }
  getAllCustomerOrdersByEmailID(data: any): Observable<any> {
    const requestData = JSON.stringify({
      store_name: data.store_name,
      email: JSON.parse(localStorage.getItem('currentUserProfile')).email,
    });
    const url = environment.rootCloudUrl + 'getAllCustomerOrdersByEmailID';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  getAllCustomerMealOrdersByEmailID(data: any): Observable<any> {
    const requestData = JSON.stringify({
      store_name: data.store_name,
      email: JSON.parse(localStorage.getItem('currentUserProfile')).email,
    });
    const url = environment.rootCloudUrl + 'getAllCustomerMealOrdersByEmailID';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  viewCustomerOrderDetailsByOrderID(data: any): Observable<any> {
    const requestData = JSON.stringify({
      order_id: data.order_id,
      store_name: data.store_name,
      email: data.email
      // email: JSON.parse(localStorage.getItem('currentUserProfile')).email ? JSON.parse(localStorage.getItem('currentUserProfile')).email : data.email,
    
    });
    const url = environment.rootCloudUrl + 'viewCustomerOrderDetailsByOrderID';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  checkEmailVerificationCode(data: any): Observable<any> {
    const requestData = JSON.stringify({
      verification_code: data.verification_code,
    });
    const url = environment.rootCloudUrl + 'checkEmailVerificationCode';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  checkMobileVerification(data: any): Observable<any> {
    const requestData = JSON.stringify({
      id: data.id,
      mobile: data.mobile,
    });
    const url = environment.rootCloudUrl + 'checkMobileVerification';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  checkResetPasswordCode(data: any): Observable<any> {
    const requestData = JSON.stringify({
      verification_code: data.verification_code,
    });
    const url = environment.rootCloudUrl + 'checkResetPasswordCode';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  viewCustomerMealOrderDetailsByOrderID(data: any): Observable<any> {
    const requestData = JSON.stringify({
      order_id: data.order_id,
      store_name: data.store_name,
      email: JSON.parse(localStorage.getItem('currentUserProfile')).email,
    });
    const url =
      environment.rootCloudUrl + 'viewCustomerMealOrderDetailsByOrderID';
    return this.http
      .post(url, requestData, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  cancelGroceriesOrder(id: any, status: any, storeId: any): Observable<any> {
    const url =
      environment.rootCloudUrl +
      'cancelGroceriesOrder?store_id=' +
      storeId +
      '&order_id=' +
      id +
      '&order_status=' +
      status;
    return this.http
      .delete(url, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }

  canceMealsOrder(id: any, status: any, storeId: any): Observable<any> {
    const url =
      environment.rootCloudUrl +
      'canceMealsOrder?store_id=' +
      storeId +
      '&order_id=' +
      id +
      '&order_status=' +
      status;
    return this.http
      .delete(url, httpBasicOptions)
      .pipe(map((response: Response) => response));
  }
  getStoreOrderDetailsByEmailID(data: any): Observable<any> {
    let requestData = JSON.stringify({
      email: data.email,
    });
    const url = environment.rootCloudUrl + 'getStoreOrderDetailsByEmailID';
    return this.http
      .post(url, requestData, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }
  viewStoreOrderDetailsByOrderID(data: any): Observable<any> {
    let requestData = JSON.stringify({
      email: data.email,
      order_id: data.order_id,
    });
    const url = environment.rootCloudUrl + 'viewStoreOrderDetailsByOrderID';
    return this.http
      .post(url, requestData, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }
}
