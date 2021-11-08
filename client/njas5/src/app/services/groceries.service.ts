import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  environment,
  httpBasicAuthOptions,
  httpOptions
} from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GroceriesStoreService {
  viewCustomerOrderDetailsByOrderID(data: any): Observable<any> {
    const requestData = JSON.stringify({
      order_id: data.order_id,
      store_name: data.store_name,
      email: data.email
      // email: JSON.parse(localStorage.getItem('currentUserProfile')).email ? JSON.parse(localStorage.getItem('currentUserProfile')).email : data.email,
    
    });
    const url = environment.rootCloudUrl + 'viewCustomerOrderDetailsByOrderID';
    return this.http
      .post(url, requestData, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  constructor(private http: HttpClient) { }
  // 1.
  fetchStoreDetails(data: any): Observable<any> {
    const requestData = JSON.stringify({
      store_id: data.store_name
    });
    const url = environment.rootCloudUrl + 'getStoreDetails';
    return this.http
      .post(url, requestData, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  getStoreSaladsByEmailID(data: any): Observable<any> {
    let requestData = JSON.stringify({
      store_id: data.store_id
    });
    const url = environment.rootCloudUrl + 'getStoreSaladsByEmailID';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }
  getStorePastasByEmailID(data: any): Observable<any> {
    let requestData = JSON.stringify({
      store_id: data.store_id
    });
    const url = environment.rootCloudUrl + 'getStorePastasByEmailID';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  updatePaymentStatus(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'updatePaymentStatus';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }


  placeOrder(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'createOrderWithReceipt';
    return this.http
      .post(url, data, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  validateCouponCode(data: any): Observable<any> {
    const url = environment.rootCloudUrl + 'validateCouponCode';

    const requestData = JSON.stringify({
      store_id: data.store_name,
      coupon_code: data.coupon_code
    });

    return this.http
      .post(url, requestData, httpBasicAuthOptions)
      .pipe(map((response: Response) => response));
  }

  getOrderSummary(data: any): Observable<any> {
    const requestData = JSON.stringify({
      pageNo: data._page,
      pageSize: data._limit,
      sortOption: 'orderCreationDate',
      sortOrder: 'DESC',
      storeId: localStorage.getItem('storeId'),
      token: {
        fingerprint: {
          createdAt: 0,
          deviceFingerprint: localStorage.getItem('deviceFingerPrint'),
          jsonOtherInfo: '',
          user_id: 0
        },
        loginToken: localStorage.getItem('loginToken')
      }
    });

    const url = environment.rootCloudUrl + 'store/getOrderSummary';
    const t = JSON.parse(localStorage.getItem('currentUserProfile'));
    // headers.append("Authorization", "Bearer " + t);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t.accessToken
      })
    };
    return this.http
      .post(url, requestData, httpOptions)
      .pipe(map((response: Response) => response));
  }

  getOrderDetails(data: any): Observable<any> {
    const requestData = JSON.stringify({
      orderId: data.orderId,
      token: {
        fingerprint: {
          createdAt: 0,
          deviceFingerprint: localStorage.getItem('deviceFingerPrint'),
          jsonOtherInfo: '',
          user_id: 0
        },
        loginToken: localStorage.getItem('loginToken')
      }
    });

    const url = environment.rootCloudUrl + 'store/getOrderDetails';
    const t = JSON.parse(localStorage.getItem('currentUserProfile'));
    // headers.append("Authorization", "Bearer " + t);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t.accessToken
      })
    };
    return this.http
      .post(url, requestData, httpOptions)
      .pipe(map((response: Response) => response));
  }
}
