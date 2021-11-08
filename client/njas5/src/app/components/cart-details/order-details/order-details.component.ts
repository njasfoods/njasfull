import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencySymbolPipe } from '../../../currency-symbol.pipe';
import { AuthService } from '../../../services/auth.service';
import { CommonService } from '../../../services/common.service';
import { GroceriesStoreService } from '../../../services/groceries.service';
import { StorageService } from '../../../services/storage.service';
import { StoreService } from '../../../services/store.service';
import { environment } from '../../../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert2';

import * as $ from "jquery";
@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  payment_return_url: any;
  developer_id: any;
  wipay_payment_gateway_url: any;
  id: any;
  constructor(
    public store: GroceriesStoreService,
    // private modalController: ModalController,
    public spinner: NgxSpinnerService,
    public storageService: StorageService,
    public common: CommonService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    public store2: StoreService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    this.appliedCouponDetails = false;
    this.viewMode = 'grid';
    //this.spinner.show();
    this.cartProducts = [];
    this.specialInstructions = 'N/A';

    // console.log(this.router.url.split('/'));

    this.storeName = environment.groceriesStoreId;

    this.payment_return_url = environment.payment_return_url;
    this.developer_id = environment.developer_id;
    this.wipay_payment_gateway_url = environment.wipay_payment_gateway_url;

    this.getStoreDetails();

    if (this.router.url.split('/')[2]) {
      this.id = this.router.url.split('/')[2];
    }
    this.viewCustomerOrderDetailsByOrderID();

  }

  orderDetails: any = [];
  viewCustomerOrderDetailsByOrderID() {
    const getStoreName = environment.groceriesStoreId;
    this.storeName = getStoreName;
    this.storageService
      .getStorageCOF('my-customer-njas')
      .then(details => {
        if (details && details.length) {
          this.addCustomerDetails = details;
          if (this.addCustomerDetails[0].selectedDelivery === 'd') {
            $('.show-address').show();
            $('.show-pickup-total').hide();
            $('#selectedDelivery').val('d');
            $('#delivery-mode').val('d');
            $('#pickup').removeClass('active');
            $('#delivery').addClass('active');
          } else {
            $('.show-address').hide();
            $('.show-pickup-total').show();
            $('#selectedDelivery').val('p');
            $('#delivery-mode').val('p');
            $('#pickup').addClass('active');
            $('#delivery').removeClass('active');
          }


          const data = {
            store_name: environment.groceriesStoreId,
            order_id: this.id,
            email: this.addCustomerDetails[0].contactEmail
          };
          // this.spinner.show();
          this.store.viewCustomerOrderDetailsByOrderID(data).subscribe(
            (res: any) => {

              this.loader = false;
              if (res.status === 'success') {
                this.orderDetails = res.message.order;
                this.spinner.hide();
              } else {
                this.orderDetails = [];
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

        } else {
          this.addCustomerDetails = [];
        }
      })
      .catch(
        err => ((this.addCustomerDetails = []), (this.isSomethingWrong = true))
      );



  }

  loader: any = true;
  storeName: any;
  href: any;
  orderContent: any;
  storeOpenStatus: any;
  storeData: any = [];
  cartProducts: any = [];
  selectedCategoryProducts: any = [];
  searchSelectedCategoryProducts: any = [];
  searchTerm = '';
  selectedCategory: any = [];
  categoryProducts: any = [];
  specialInstructions: any;
  viewMode: any;
  couponCode: any;
  appliedCouponDetails: any;
  imgLoaded: any = false;
  orderId: any;
  // Slider Options
  slideOpts = {
    initialSlide: 0,
    loop: true,
    autoplay: true,
    speed: 400,
    pagination: {
      el: '.swiper-pagination',
      dynamicBullets: true
    }
  };
  date: string;
  minDate: any = new Date(
    new Date().setDate(new Date().getDate() + 1)
  ).toISOString();
  maxDate: any = new Date(
    new Date().setDate(new Date().getDate() + 120)
  ).toISOString();

  _daysConfig = [
    {
      date: new Date(2020, 11, 28),
      disable: true
    },
    {
      date: new Date(2020, 11, 31),
      disable: true
    },
    {
      date: new Date(2021, 0, 1),
      disable: true
    }
  ];

  // optionsCalen: CalendarComponentOptions = {
  //   disableWeeks: [0, 6],
  //   from: this.minDate,
  //   to: this.maxDate,
  //   daysConfig: this._daysConfig
  // };

  deldate: any;

  chosedDeliveryOption: any;
  normalDeliveryCharges: any;

  total = 0;
  payable = 0;

  addcartProducts: any = [];

  addCustomerDetails: any = [];

  arrayOne(n: number): any[] {
    return Array(n);
  }
  checkInCart(product: any) {
    let flag = false;
    let prodCount = 0;
    if (this.cartProducts && this.cartProducts.length) {
      for (let i = 0; i < this.cartProducts.length; i++) {
        if (product.id === this.cartProducts[i].id) {
          flag = true;
          prodCount = this.cartProducts[i].quantity;
          // exit;
        }
      }
    } else {
      flag = false;
      prodCount = 0;
    }

    if (prodCount) {
      $('.quantityCountProduct' + product.id).html('x' + prodCount);
      $('.quantityCountProduct' + product.id).show();
    } else {
      $('.quantityCountProduct' + product.id).hide();
    }

    return prodCount;
  }

  checkoutNow() {
    $('#contactNo').focus();
    this.swalToastMessage(
      'Choose your delivery mode & enter required details to create order.',
      'info'
    );
  }

  public submitForm(form: any) {
    // console.log(form.value);
    if (!form.value) {
      this.swalToastMessage('Invalid Coupon Code!', 'warning');
      return;
    }

    const data = form.value;
    data.store_name = environment.groceriesStoreId;

    this.spinner.show();
    this.store.validateCouponCode(data).subscribe(
      (res: any) => {
        // console.log(res);
        this.spinner.hide();

        if (res.status === 'success') {
          // console.log(res.message);
          this.appliedCouponDetails = res.message[Object.keys(res.message)[0]];
          this.swalToastMessage('Coupon Applied!', 'success');
        } else {
          this.swalToastMessage(res.message, 'error');
        }
      },
      (err: any) => {
        this.spinner.hide();
        this.swalToastMessage('Something went wrong!', 'warning');
        this.isSomethingWrong = true;
      }
    );
  }

  clearCart() {
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
          this.storageService
            .clearStorageValueCOF(
              this.storeData.store.name + '-' + 'my-cart-njas'
            )
            .then((res: any) => {
              swal.fire({
                title: 'Cart Cleared!',
                position: 'top',
                text: 'Your cart is empty.',
                icon: 'success'
              });

              this.getCartItemsCOF();

            });
        }
      });
  }

  clearCustomerDetails() {
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
          this.storageService
            .clearStorageValueCOF('my-customer-njas')
            .then((res: any) => {
              swal.fire({
                title: 'Customer details Cleared!',
                position: 'top',
                text: 'Your customer details is deleted.',
                icon: 'success'
              });

              this.getCustomerDetailsCOF();
            });
        }
      });
  }

  preference($event: any) {
    if ($event.target.value) {
      if ($event.target.value === 'd') {
        $('.show-address').show();
        $('.show-pickup-total').hide();
        $('#selectedDelivery').val('d');
        $('#delivery-mode').val('d');
        $('#pickup').removeClass('active');
        $('#delivery').addClass('active');
        this.setDeliveryMode('d');
      } else if ($event.target.value === 'p') {
        $('.show-address').hide();
        $('.show-pickup-total').show();
        $('#selectedDelivery').val('p');
        $('#delivery-mode').val('p');
        $('#pickup').addClass('active');
        $('#delivery').removeClass('active');
        this.setDeliveryMode('p');
      }
    }
  }
  setDeliveryMode(deliveryMode: any) {
    if (deliveryMode === 'd') {
      this.swalToastMessage('Ordering mode set to delivery', 'info');
    } else {
      this.swalToastMessage('Ordering mode set to pick up', 'info');
    }
  }
  onChange($event: any) {
    // console.log($event);
    $('#delivery_day').val($event.format('dddd, DD MMM, yyyy'));
  }
  ngOnInit() {
    this.orderId = localStorage.getItem('orderKey');
    // console.log(this.orderId);
  }

  ionViewDidEnter() { }

  changeView(view: any) {
    if (view === 'list') {
      this.viewMode = 'list';
    } else {
      this.viewMode = 'grid';
    }
  }

  chat(text = 'Hi!') {
    window.open(
      'https://api.whatsapp.com/send?phone=' +
      $('#whatsapp').val() +
      '&text=' +
      text,
      '_blank'
    );
    return;
  }

  setFilteredItems() {
    if (!this.searchTerm) {
      this.searchSelectedCategoryProducts = this.selectedCategoryProducts;
    }
    this.searchSelectedCategoryProducts = this.filterItems(this.searchTerm);
  }

  filterItems(searchTerm: any) {
    return this.selectedCategoryProducts.filter((item: any) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }
  deliveryOption($event: any) {
    this.chosedDeliveryOption = this.storeData.delivery_options[
      $event.target.value
    ];
    this.storeData.store.delivery_charges = this.chosedDeliveryOption
      ? +this.chosedDeliveryOption.price
      : this.normalDeliveryCharges;
  }
  isSomethingWrong = false;
  getStoreDetails() {
    const getStoreName = environment.groceriesStoreId;
    this.storeName = getStoreName;

    const data = {
      store_name: this.storeName
    };

    // this.spinner.show();
    this.store.fetchStoreDetails(data).subscribe(
      (res: any) => {
        if (!res.message) {
          this.spinner.hide();
          this.storeData = [];
          return;
        }

        this.spinner.hide();
        this.storeData = res.message;
        this.normalDeliveryCharges = 0;
        this.storeData.store.delivery_charges = 0;

        this.storeData.delivery_options = res.delivery_options;
        this.storeData.bank_options = res.bank_options;
        this.storeData.delivery_days = res.delivery_days;

        if (this.storeData.sub_categories) {

          this.categoryProducts = this.storeData.products;
          this.changeCategory('ALL');
        }

        if (this.storeData.delivery_options) {
          // set delivery-option 0 as default
          const [key1, value1] = Object.entries(
            this.storeData.delivery_options
          )[0];
          this.chosedDeliveryOption = this.storeData.delivery_options[key1];
          this.storeData.store.delivery_charges = this.chosedDeliveryOption
            ? +this.chosedDeliveryOption.price
            : this.normalDeliveryCharges;
          // set delivery-option 0 as default
        }

      },
      (err: any) => {
        this.spinner.hide();
        this.storeData = [];
        this.isSomethingWrong = true;
      }
    );
  }

  changeCategory(index: any) {
    // this.spinner.show();

    if (index === 'reviews') {
      if (this.storeData && this.storeData.reviews) {
        if (this.common.sizeOfObj(this.storeData.reviews)) {
          this.selectedCategory = this.storeData.reviews;
          this.selectedCategoryProducts = [];

          for (const key in this.storeData.reviews) {
            this.selectedCategoryProducts.push(this.storeData.reviews[key]);
          }

          this.setFilteredItems();
        }
      } else {
        this.selectedCategoryProducts = [];
        this.setFilteredItems();
      }

      return;
    } else if (index === 'ALL') {
      if (this.storeData && this.storeData.sub_categories) {
        if (this.common.sizeOfObj(this.storeData.sub_categories)) {
          this.selectedCategory = 'ALL';
          this.selectedCategoryProducts = [];
          const activeCategories = this.common.getActiveCategories(
            this.storeData.sub_categories
          );

          for (const key in this.categoryProducts) {
            if (
              activeCategories.includes(
                this.categoryProducts[key].sub_category_id.toString()
              )
            ) {
              this.selectedCategoryProducts.push(this.categoryProducts[key]);
            }
          }

          this.setFilteredItems();
        }
      }
    } else {
      if (this.storeData && this.storeData.sub_categories) {
        if (this.common.sizeOfObj(this.storeData.sub_categories)) {
          this.selectedCategory = this.storeData.sub_categories[index];
          this.selectedCategoryProducts = [];

          for (const key in this.categoryProducts) {
            if (
              this.selectedCategory.id ===
              this.categoryProducts[key].sub_category_id
            ) {
              this.selectedCategoryProducts.push(this.categoryProducts[key]);
            }
          }

          this.setFilteredItems();
        }
      }
    }

    // this.spinner.hide();
  }

  hideShowCartDiv() {
    $('#cart').toggle();
  }

  // Add to Cart Function
  addToCartCOF(product: any) {
    //  this.spinner.show();

    if (!this.checkMaxLimitReached(product.id, product.max_order_quantity)) {
      this.swalToastMessage(
        product.name + ' has reached its max order limit!',
        'error'
      );
      return;
    } else {
      this.addcartProducts = {
        id: product.id,
        name: product.name,
        weight: product.weight,
        description: product.description,
        price: product.price,
        discount_price: product.discount_price,
        images: product.images1,
        images1: product.images1,
        size: product.size,
        color: product.color,
        max_order_quantity: product.max_order_quantity,
        min_order_quantity: product.min_order_quantity,
        quantity: 1,
        isWishlist: product.isWishlist
      };

      // Save cart product in storage
      this.storageService.setStorageValueCOF(
        this.addcartProducts,
        this.storeData.store.name + '-' + 'my-cart-njas'
      );
      this.swalToastMessage(product.name + ' added to cart!', 'success');

      setTimeout(() => {
        this.getCartItemsCOF();

        // this.getCustomerDetailsCOF();
        //  this.spinner.hide();
      }, 300);
    }
  }

  checkMaxLimitReached(id: any, max_order_quantity: any) {
    let quantity_in_cart = 0;
    let k = 0;

    if (this.cartProducts) {
      for (const i of this.cartProducts) {
        if (i.id === id) {
          quantity_in_cart = i.quantity;
        }
        k++;
      }
    }

    if (quantity_in_cart >= max_order_quantity) {
      return false;
    } else {
      return true;
    }
  }

  // Get Cart Items From Storage
  getCartItemsCOF() {
    // this.storageService
    //   .getStorageCOF(this.storeData.store.name + '-' + 'my-cart-njas')
    //   .then((products:any) => {
    //     if (products && products.length) {
    this.cartProducts = JSON.parse(localStorage.getItem('orderSummary'));
    this.total = 0;
    if (this.cartProducts.length === 0) {
      this.isSomethingWrong = true;
    } else {
      this.isSomethingWrong = false;
      for (let i = 0; i < this.cartProducts.length; i++) {
        this.total +=
          this.cartProducts[i].discount_price * this.cartProducts[i].quantity;
        // this.loader = false;
      }
    }

    // } else {
    //   this.cartProducts = [];
    // }
    // });
  }
  getCustomerDetailsCOF() {
    this.storageService
      .getStorageCOF('my-customer-njas')
      .then(details => {
        if (details && details.length) {
          this.addCustomerDetails = details;
          if (this.addCustomerDetails[0].selectedDelivery === 'd') {
            $('.show-address').show();
            $('.show-pickup-total').hide();
            $('#selectedDelivery').val('d');
            $('#delivery-mode').val('d');
            $('#pickup').removeClass('active');
            $('#delivery').addClass('active');
          } else {
            $('.show-address').hide();
            $('.show-pickup-total').show();
            $('#selectedDelivery').val('p');
            $('#delivery-mode').val('p');
            $('#pickup').addClass('active');
            $('#delivery').removeClass('active');
          }
        } else {
          this.addCustomerDetails = [];
        }
      })
      .catch(
        err => ((this.addCustomerDetails = []), (this.isSomethingWrong = true))
      );
  }
  // Minus Product Quantity
  minusQuantityCOF(product: any, event: any) {
    this.storageService
      .getStorageCOF(this.storeData.store.name + '-' + 'my-cart-njas')
      .then((products: any) => {
        // this.spinner.show();

        this.cartProducts = products;
        const items = this.cartProducts;
        if (!items || items.length === 0) {
          //  this.spinner.hide();

          this.swalToastMessage(product.name + ' not found in cart!', 'error');
          return null;
        }

        let isNew = true;
        let k = 0;
        for (const i of items) {
          if (i.id === product.id) {
            let newQuantity = i.quantity - 1;

            // for min_order_quantity

            if (product.min_order_quantity) {
              if (newQuantity < product.min_order_quantity) {
                newQuantity = 0;
              }
            }
            // for min_order_quantity

            i.quantity = newQuantity;
            isNew = false;
            product.quantity = newQuantity;
            product = product;
          }
          k++;
        }

        if (!isNew) {
          if (product.quantity >= 1) {
            this.storageService.updateStorageValueCOF(
              product,
              this.storeData.store.name + '-' + 'my-cart-njas'
            );
          } else {
            this.storageService.removeStorageValueCOF(
              product.id,
              this.storeData.store.name + '-' + 'my-cart-njas'
            );
          }
          this.swalToastMessage(
            product.name + ' removed from cart!',
            'success'
          );
        } else {
          this.swalToastMessage(product.name + ' not found in cart!', 'error');
        }

        setTimeout(() => {
          this.getCartItemsCOF();
        }, 300);
      });
  }

  notifyMessage(themsg: any, ntype: any) {
    // $("#notification").clearQueue();
    $('#notification').finish();
    $('#notification').html(themsg);
    $('#notification').removeClass();
    $('#notification').addClass('notification');
    $('#notification').addClass('is-' + ntype);
    $('#notification')
      .fadeIn()
      .delay(800)
      .fadeOut('slow');
  }

  swalToastMessage(text: any, icon: any, timer = 3000) {
    const Toast = swal.mixin({
      toast: true,
      background: '#2f3542',
      position: 'bottom-start',
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      // onOpen: toast => {
      //   toast.addEventListener('mouseenter', swal.stopTimer);
      //   toast.addEventListener('mouseleave', swal.resumeTimer);
      // }
    });
    Toast.fire({
      icon: icon,
      title: text,
      background: '#2f3542'
    });
  }

  
  addQuantityCOF(product: any, index: any) {
    if (product.quantity) {
      product.quantity = product.quantity + 1;
    } else {
      product.quantity = 1;
      product.quantity = product.quantity + 1;
    }
  }

  // Remove Product From Cart
  removeProductCOF(product: any, index: any) {
    this.cartProducts.splice(index, 1);
    this.storageService.removeStorageValueCOF(
      product.id,
      this.storeData.store.name + '-' + 'my-cart-njas'
    );

    setTimeout(() => {
      //     this.spinner.show();
      this.getCartItemsCOF();

      //   this.spinner.hide();
    }, 300);
  }
  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }


  goBack() {
    this.location.back();
  }

}
