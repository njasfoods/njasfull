import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css'],
})
export class SubscriptionsComponent implements OnInit {
  constructor(
    private store: StoreService,
    private spinner: NgxSpinnerService
  ) { }
  subscriptionDetails: any = [];
  subscriptionDetailsArray: any = [];
  orderId: any;
  ngOnInit(): void {
    this.getStoreDetailsByStoreName();
  }
  storeData: any = [];
  getStoreDetailsByStoreName() {
    let data = {
      store_id: environment.groceriesStoreId,
    };
    this.store.getStoreDetails(data).subscribe((res) => {
      this.storeData = res.message;
      this.getSubscriptionDetails();
    });
  }
  loader = true;
  getSubscriptionDetails() {
    this.loader = true;
    // this.spinner.show();
    let data = {
      store_name: environment.mealsStoreId,
    };
    this.store.getAllCustomerMealOrdersByEmailID(data).subscribe((res) => {

      if (res.message) {
        for (const key in Object.values(res.message)) {
          if (
            Object.prototype.hasOwnProperty.call(
              Object.values(res.message),
              key
            )
          ) {
            const element = Object.values(res.message)[key];
            this.subscriptionDetailsArray.push(element);
            this.subscriptionDetailsArray.forEach((elem: any) => {
              this.subscriptionDetails = elem.order;
            });
          }
        }
        // this.spinner.hide();
        this.loader = false;
      } else {
        // this.spinner.hide();
        this.loader = false;
        return;
      }
    });
  }
  getSubscriptionById(id: any) {
    this.spinner.show();

    if (id === '') {
      this.spinner.hide();

      return;
    } else {
      let data = {
        email: this.storeData.store.account_email_id,
        order_id: id,
        store_name: environment.mealsStoreId,
      };
      this.store
        .viewCustomerMealOrderDetailsByOrderID(data)
        .subscribe((res) => {
          console.log(res);
          if (res.message.order) {
            this.subscriptionDetails = res.message.order;
            this.orderId = res.message.id;
            this.spinner.hide();
          } else {
            this.spinner.hide();
            return;
          }
        });
    }
  }
}
