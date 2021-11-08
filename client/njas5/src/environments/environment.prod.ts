// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  rootFBCloudUrl: 'https://us-central1-notjusasalad-df110.cloudfunctions.net/',
  rootCloudUrl: 'https://us-central1-notjusasalad-df110.cloudfunctions.net/',
  // rootCloudUrl: 'http://127.0.0.1:3000/',
  rootStoreUrl: 'http://groceries.notjusasalad.com/',
  baseStoreUrl: 'notjusasalad.com',
  storeId: 'meals',
  storeEmail: 'meals.notjusasalad@gmail.com',
  cakeStoreId: 'christmascake',
  groceriesStoreId: 'groceries',
  groceriesStoreEmail: 'groceries.notjusasalad@gmail.com',
  mealsStoreId: 'meals',
  cakeStoreEmail: 'christmascake.notjusasalad@gmail.com',
  globalPushNotificationsTopic: 'cof_app',
  //  developer_id: 6813560715,
  // wipay_payment_gateway_url: 'https://wipayjm.com/v1/gateway_live',
  //  payment_return_url: 'http://notjusasalad.com/cart/payment-completed',
  developer_id: 0, //sanbox
  wipay_payment_gateway_url: 'https://sandbox.wipayfinancial.com/v1/gateway', //sanbox
  payment_return_url: 'http://localhost:4200/cart/payment-completed',






  firebaseConfig: {

    apiKey: "AIzaSyAvU4Z-sXJ6XXB0O7HmBgL4GPCOuLhG5Ls",

    authDomain: "njas5-d8181.firebaseapp.com",

    projectId: "njas5-d8181",

    storageBucket: "njas5-d8181.appspot.com",

    messagingSenderId: "635240993867",

    appId: "1:635240993867:web:54a47e31868157b70d29ce",

    measurementId: "G-TX5BMVJ9J6"

  }

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.



import { HttpHeaders } from '@angular/common/http';

export const username = '!njas!';
export const password = '!njas@123!';
export const BasicAuth = 'Basic ' + btoa(username + ':' + password);
export const httpBasicAuthOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: BasicAuth
  })
};


export const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
export const httpBasicOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + btoa('!njas!' + ':' + '!njas@123!')
  })
};
