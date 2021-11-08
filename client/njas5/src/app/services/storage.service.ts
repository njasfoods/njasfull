import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment, httpOptions } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  storage: any;
  cart$: any = [];
  cartTotal$: any = 0;
  noProducts$: any = false;
  localCart$: any = [];
  loadingItems$ = true;
  searchTerm$: any = '';
  selectedCategoryProducts: any = [];
  searchSelectedCategoryProducts: any = [];
  selectedCategory: any = [];
  categoryProducts: any = [];
  searchBar$ = true;
  orderId$: any;



 
  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private common: CommonService
  ) {
    this.storage = {
      setItem: function(key: any, value: any) {
        return Promise.resolve().then(function() {
          localStorage.setItem(key, JSON.stringify(value));
        });
      },
      getItem: function(key: any) {
        return Promise.resolve().then(function() {
          return JSON.parse(localStorage.getItem(key));
        });
      }
    };
  }

 






  getStorage(ITEMS_KEY: any): Promise<any[]> {
    return this.storage.getItem(ITEMS_KEY);
  }
  setFilteredItems() {
    if (!this.searchTerm$) {
      this.searchSelectedCategoryProducts = this.selectedCategoryProducts;
    }
    this.searchSelectedCategoryProducts = this.filterItems(this.searchTerm$);
  }

  filterItems(searchTerm: any) {
    return this.selectedCategoryProducts.filter((item: any) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }
  setStorageValueOld(product: any, ITEMS_KEY: any): Promise<any> {
    return this.storage.getItem(ITEMS_KEY).then((items: any[]) => {
      if (items) {
        items.push(product);
        return this.storage.setItem(ITEMS_KEY, items);
      } else {
        return this.storage.setItem(ITEMS_KEY, [product]);
      }
    });
  }

  setStorageValue(product: any, ITEMS_KEY: any): Promise<any> {
    return this.storage.getItem(ITEMS_KEY).then((items: any) => {
      if (items) {
        let isNew = true;
        let newItems: any[] = [];
        let k = 0;
        for (const i of items['cartItems']) {
          if (i.productDto.productId === product.id) {
            const newQuantity = i.quantity + 1;
            i.quantity = newQuantity;
            isNew = false;
            product.quantity = newQuantity;
            product = product;
          }
          k++;
        }

        if (isNew) {
          items['cartItems'].push(product);
        }

        newItems = items;

        let cartId = '';
        if (localStorage.getItem('cartId')) {
          cartId = localStorage.getItem('cartId');
        }

        const data = {
          cartId: cartId,
          productId: product.id,
          quantity: product.quantity
        };
        this.addToCart(data).subscribe(
          (res: any) => {
            this.spinner.hide();

            // localStorage.setItem('cartId', res.cartId),
            this.toastr.success('Added to cart!');
            this.cart$ = res;
            return this.storage.setItem(ITEMS_KEY, res);
          },
          (err: any) => {
            this.spinner.hide();
            if (!this.common.checkValidAuthResponseCode(err)) {
              return;
            }

            if (err.error.text) {
              this.toastr.success(err.error.text);
            } else {
              this.toastr.success(err.error.message);
            }
          }
        );
      } else {
        // console.log(ITEMS_KEY);

        let cartId = '';
        if (localStorage.getItem('cartId')) {
          cartId = localStorage.getItem('cartId');
        }

        const data = {
          cartId: cartId,
          productId: product.id,
          quantity: product.quantity
        };
        this.addToCart(data).subscribe(
          (res: any) => {
            //  console.log(res);
            this.spinner.hide();

            localStorage.setItem('cartId', res.cartId),
              this.toastr.success('Added to cart!');
            this.cart$ = res;
            return this.storage.setItem(ITEMS_KEY, res);
          },
          (err: any) => {
            //  console.log(err.error);
            this.spinner.hide();
            if (!this.common.checkValidAuthResponseCode(err)) {
              return;
            }

            if (err.error.text) {
              this.toastr.success(err.error.text);
            } else {
              this.toastr.success(err.error.message);
            }
          }
        );
      }
    });
  }

  updateStorageValue(item: any, ITEMS_KEY: any): Promise<any> {
    return this.storage.getItem(ITEMS_KEY).then((items: any) => {
      const newItems: any[] = [];

      for (const i of items) {
        if (i.productDto.productId === item.id) {
          newItems.push(item);
        } else {
          newItems.push(i);
        }
      }

      let cartId = '';
      if (localStorage.getItem('cartId')) {
        cartId = localStorage.getItem('cartId');
      }

      const data = {
        cartId: cartId,
        productId: item.id,
        quantity: item.quantity
      };
      this.addToCart(data).subscribe(
        (res: any) => {
          // console.log(res);
          this.spinner.hide();
          // localStorage.setItem('cartId', res.cartId),
          this.toastr.success('Updated cart!');
          this.cart$ = newItems;
          return this.storage.setItem(ITEMS_KEY, newItems);
        },
        (err: any) => {
          // console.log(err.error);
          this.spinner.hide();
          if (!this.common.checkValidAuthResponseCode(err)) {
            return;
          }

          if (err.error.text) {
            this.toastr.success(err.error.text);
          } else {
            this.toastr.success(err.error.message);
          }
        }
      );
    });
  }

  removeStorageValueOld(id: number, ITEMS_KEY: any): Promise<any> {
    return this.storage.getItem(ITEMS_KEY).then((items: any[]) => {
      if (!items || items.length === 0) {
        return null;
      }

      const toKeep: any[] = [];

      for (const i of items) {
        if (i.id !== id) {
          toKeep.push(i);
        }
      }
      return this.storage.setItem(ITEMS_KEY, toKeep);
    });
  }

  removeStorageValue(id: number, ITEMS_KEY: any): Promise<any> {
    return this.storage.getItem(ITEMS_KEY).then((items: any[]) => {
      if (!items || items.length === 0) {
        return null;
      }

      let k = 0;
      for (const i of items) {
        if (i.id === id) {
          items.splice(k, 1);
        }
        k++;
      }

      // console.table(items);

      if (!items || items.length === 0) {
        this.cart$ = [];
        return this.storage.remove(ITEMS_KEY);
      } else {
        this.cart$ = items;
        return this.storage.setItem(ITEMS_KEY, items);
      }
    });
  }

  addToCart(data: any): Observable<any> {
    const requestData = JSON.stringify({
      cartId: '',
      discountCode: '',
      offer: false,
      productId: data.productId,
      quantity: data.quantity,
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

    const url = environment.rootCloudUrl + 'store/addToCart';
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

  getStorageCOF(ITEMS_KEY: any): Promise<any[]> {
    return this.storage.getItem(ITEMS_KEY);
  }

  setStorageValueCOF(product: any, ITEMS_KEY: any): Promise<any> {
    return this.storage.getItem(ITEMS_KEY).then((items: any[]) => {
      if (items) {
        let isNew = true;
        let newItems: any[] = [];
        let k = 0;
        for (const i of items) {
          if (i.id === product.id) {
            const newQuantity = i.quantity + 1;
            i.quantity = newQuantity;
            isNew = false;
            product.quantity = newQuantity;
            product = product;
          }
          k++;
        }

        if (isNew) {
          product.quantity = product.min_order_quantity
            ? +product.min_order_quantity
            : product.quantity;

          items.push(product);
        }

    
        newItems = items;
        this.cart$ = newItems;
        return this.storage.setItem(ITEMS_KEY, newItems);
      } else {
        this.cart$ = [product];
        return this.storage.setItem(ITEMS_KEY, [product]);
      }
    });
  }
  getCartItemsCOF(store_name:any) {
    this.loadingItems$ = true;
    this.getStorageCOF(
      store_name + '-' + 'my-cart-njas'
    ).then((products:any) => {
      if (products && products.length) {
        this.cart$ = products;
        this.cartTotal$ = 0;
        for (let i = 0; i < this.cart$.length; i++) {
          this.cartTotal$ +=
            this.cart$[i].discount_price * this.cart$[i].quantity;
        }
        this.noProducts$ = false;
        localStorage.setItem('cart', JSON.stringify(this.cart$));
        this.localCart$ = JSON.parse(localStorage.getItem('cart'));
        setTimeout(() => {
          this.loadingItems$ = false;
        }, 1000);
      } else {
        this.cart$ = [];
        this.noProducts$ = true;
        this.loadingItems$ = false;
      }
    });
  }
  updateStorageValueCOF(item: any, ITEMS_KEY: any): Promise<any> {
    return this.storage.getItem(ITEMS_KEY).then((items: any[]) => {
      if (!items || items.length === 0) {
        return null;
      }

      const newItems: any = [];

      for (const i of items) {
        if (i.id === item.id) {
          newItems.push(item);
        } else {
          newItems.push(i);
        }
      }

      this.cart$=newItems;
      return this.storage.setItem(ITEMS_KEY, newItems);
    });
  }

  removeStorageValueCOF(id: number, ITEMS_KEY: any): Promise<any> {
    return this.storage.getItem(ITEMS_KEY).then((items: any[]) => {
      if (!items || items.length === 0) {
        return null;
      }

      const toKeep: any = [];

      for (const i of items) {
        if (i.id !== id) {
          toKeep.push(i);
        }
      }
      
      this.cart$=toKeep;
      return this.storage.setItem(ITEMS_KEY, toKeep);
    });
  }

  clearStorageValueCOF(ITEMS_KEY: any): Promise<any> {
    return this.storage.setItem(ITEMS_KEY, []);
  }

  clearStorageValueALL(): Promise<any> {
    return this.storage.clear();
  }

  setCustomerStorageValueCOF(
    customerDetails: any,
    ITEMS_KEY: any
  ): Promise<any> {
    return this.storage.setItem(ITEMS_KEY, [customerDetails]);
  }
}



