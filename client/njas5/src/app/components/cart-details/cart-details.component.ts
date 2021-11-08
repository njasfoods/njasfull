import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { GroceriesStoreService } from '../../services/groceries.service';
import { StorageService } from '../../services/storage.service';
import { StoreService } from '../../services/store.service';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert2';
import * as $ from 'jquery';
import { CurrencySymbolPipe } from '../../currency-symbol.pipe';
import { AuthService } from '../../services/auth.service';
import { Location } from '@angular/common';
import { DateButton } from 'angular-bootstrap-datetimepicker';
import { IMyDateModel, INgxMyDpOptions } from 'ngx-mydatepicker';
// import { CreateOrderComponent } from './create-order/create-order.component';
// import { OrderDetailsComponent } from './../cart-details/order-details/order-details.component';
// import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {
  private selectFilter(dateButton: DateButton, viewName: string): boolean {
    return dateButton.value <= new Date().getTime();
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

  constructor(

    private toastr: ToastrService,
    private store: GroceriesStoreService,
    // private modalController: ModalController,
    private spinner: NgxSpinnerService,
    public storageService: StorageService,
    public common: CommonService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private location: Location,
    // public matDialog: MatDialog
  ) {
    this.getCustomerDetailsCOF();
    this.appliedCouponDetails = false;
    this.viewMode = 'grid';
    this.spinner.show();
    this.cartProducts = [];
    this.specialInstructions = 'N/A';

    // console.log(this.router.url.split('/'));

    this.storeName = environment.groceriesStoreId;

    this.getStoreDetails();


    setTimeout(() => {
      this.storageService.getCartItemsCOF(environment.groceriesStoreId);
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
      this.loader = false;

      $('.container-fluid ul.list-group li:first').trigger('click');
      this.spinner.hide();

      function swalToastMessage(text: any, icon: any) {
        const Toast = swal.mixin({
          toast: true,
          background: '#2f3542',
          position: 'bottom-start',
          showConfirmButton: false,
          timer: 3000,
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

      function setDeliveryMode(deliveryMode: any) {
        if (deliveryMode === 'd') {
          swalToastMessage('Ordering mode set to delivery', 'info');
        } else {
          swalToastMessage('Ordering mode set to pick up', 'info');
        }
      }
      $('#delivery').click(function () {
        $('.show-address').show();
        $('.show-pickup-total').hide();
        $('#selectedDelivery').val('d');
        $('#delivery-mode').val('d');
        $('#pickup').removeClass('active');
        $('#delivery').addClass('active');
        setDeliveryMode('d');
      });

      $('#pickup').click(function () {
        $('.show-address').hide();
        $('.show-pickup-total').show();
        $('#selectedDelivery').val('p');
        $('#delivery-mode').val('p');
        $('#pickup').addClass('active');
        $('#delivery').removeClass('active');
        setDeliveryMode('p');
      });

      if (this.storeData.store) {
        if (this.storeData.store.order_mode) {
          if (
            this.storeData.store.order_mode === 'all' ||
            this.storeData.store.order_mode === 'delivery'
          ) {
            // $('#delivery').trigger('click');
            // $('#delivery-mode').val('d').change();
            $('.show-address').show();
            $('.show-pickup-total').hide();
            $('#selectedDelivery').val('d');
            $('#pickup').removeClass('active');
            $('#delivery').addClass('active');
            // this.setDeliveryMode('d');
          } else {
            // $('#pickup').trigger('click');
            // $('#delivery-mode').val('p').change();
            $('.show-address').hide();
            $('.show-pickup-total').show();
            $('#selectedDelivery').val('p');
            $('#pickup').addClass('active');
            $('#delivery').removeClass('active');
            // this.setDeliveryMode('p');
          }
        }
      }
    }, 5000);

    $(window).resize(function () { });
  }
  loader: any = true;
  noProducts: any = false;
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
  delivery_day: any;
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

  currentUser: any = [];

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
    data.store_name = this.storeName;

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

              this.storageService.getCartItemsCOF(environment.groceriesStoreId);
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

          this.addCustomerDetails[0].contactEmail = '';
          this.addCustomerDetails[0].contactNo = '';
          this.addCustomerDetails[0].name = '';
          this.addCustomerDetails[0].address2 = '';
          this.addCustomerDetails[0].address1 = '';
          this.addCustomerDetails[0].notes = '';
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

  d = new Date();
  model: any;
  myOptions: INgxMyDpOptions = {
    disableUntil: {
      year: this.d.getFullYear(),
      month: this.d.getMonth() + 1,
      day: this.d.getDate()
    },
    dateFormat: 'dd.mm.yyyy',
    disableWeekdays:['su'],
    // disableWeekends: true,
    minYear: new Date().getFullYear()
  };
  deldate: any;
  onChangeDay(event: any) {
    this.deldate = event.jsdate;
    const date = ('0' + this.deldate.getDate()).slice(-2);
    //const month = ('0' + (this.deldate.getMonth() + 1)).slice(-2);
    const year = this.deldate.getFullYear();

    var weekday = new Array(7);
    weekday[0] = 'Sunday';
    weekday[1] = 'Monday';
    weekday[2] = 'Tuesday';
    weekday[3] = 'Wednesday';
    weekday[4] = 'Thursday';
    weekday[5] = 'Friday';
    weekday[6] = 'Saturday';
    var day = weekday[this.deldate.getDay()];
    var d = new Date();
    var month = new Array();
    month[0] = 'January';
    month[1] = 'February';
    month[2] = 'March';
    month[3] = 'April';
    month[4] = 'May';
    month[5] = 'June';
    month[6] = 'July';
    month[7] = 'August';
    month[8] = 'September';
    month[9] = 'October';
    month[10] = 'November';
    month[11] = 'December';
    var mon = month[d.getMonth()];

    this.delivery_day = day + ', ' + date + ' ' + mon + ',' + year;
    // console.log(this.delivery_day);
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.showLogin = false;
    }
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
      this.storageService.searchSelectedCategoryProducts = this.storageService.selectedCategoryProducts;
    }
    this.storageService.searchSelectedCategoryProducts = this.filterItems(
      this.searchTerm
    );
  }

  filterItems(searchTerm: any) {
    return this.storageService.selectedCategoryProducts.filter((item: any) => {
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
  getStoreDetails() {

    const getStoreName = environment.groceriesStoreId;
    this.storeName = getStoreName;

    const data = {
      store_name: this.storeName
    };

    this.spinner.show();
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
      }
    );
  }

  changeCategory(index: any) {
    // this.spinner.show();

    if (index === 'reviews') {
      if (this.storeData && this.storeData.reviews) {
        if (this.common.sizeOfObj(this.storeData.reviews)) {
          this.selectedCategory = this.storeData.reviews;
          this.storageService.selectedCategoryProducts = [];

          for (const key in this.storeData.reviews) {
            this.storageService.selectedCategoryProducts.push(
              this.storeData.reviews[key]
            );
          }

          this.setFilteredItems();
        }
      } else {
        this.storageService.selectedCategoryProducts = [];
        this.setFilteredItems();
      }

      return;
    } else if (index === 'ALL') {
      if (this.storeData && this.storeData.sub_categories) {
        if (this.common.sizeOfObj(this.storeData.sub_categories)) {
          this.selectedCategory = 'ALL';
          this.storageService.selectedCategoryProducts = [];
          const activeCategories = this.common.getActiveCategories(
            this.storeData.sub_categories
          );

          for (const key in this.categoryProducts) {
            if (
              activeCategories.includes(
                this.categoryProducts[key].sub_category_id.toString()
              )
            ) {
              this.storageService.selectedCategoryProducts.push(
                this.categoryProducts[key]
              );
            }
          }

          this.setFilteredItems();
        }
      }
    } else {
      if (this.storeData && this.storeData.sub_categories) {
        if (this.common.sizeOfObj(this.storeData.sub_categories)) {
          this.selectedCategory = this.storeData.sub_categories[index];
          this.storageService.selectedCategoryProducts = [];

          for (const key in this.categoryProducts) {
            if (
              this.selectedCategory.id ===
              this.categoryProducts[key].sub_category_id
            ) {
              this.storageService.selectedCategoryProducts.push(
                this.categoryProducts[key]
              );
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
        this.storageService.getCartItemsCOF(environment.groceriesStoreId);
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
    this.storageService
      .getStorageCOF(this.storeData.store.name + '-' + 'my-cart-njas')
      .then((products: any) => {
        if (products && products.length) {
          this.cartProducts = products;
          localStorage.setItem(
            'orderSummary',
            JSON.stringify(this.cartProducts)
          );

          this.total = 0;
          for (let i = 0; i < this.cartProducts.length; i++) {
            this.total +=
              this.cartProducts[i].discount_price *
              this.cartProducts[i].quantity;
            this.loader = false;
          }
        } else {
          this.cartProducts = [];
          this.noProducts = true;
          this.loader = false;
        }
      });
  }
  getCustomerDetailsCOF() {
    this.addCustomerDetails[0] = {};
    this.addCustomerDetails[0].contactEmail = this.currentUser.email;
    this.addCustomerDetails[0].contactNo = this.currentUser.mobile;
    this.addCustomerDetails[0].name = this.currentUser.name;
    this.addCustomerDetails[0].address1 = this.currentUser.address1;


    this.currentUser = this.auth.user$;
    console.log(this.currentUser);
    if (this.currentUser) {
      if (this.currentUser.length !== 0) {
        this.addCustomerDetails[0] = {};
        this.addCustomerDetails[0].contactEmail = this.currentUser.email;
        this.addCustomerDetails[0].contactNo = this.currentUser.mobile;
        this.addCustomerDetails[0].name = this.currentUser.name;
        this.addCustomerDetails[0].address1 = this.currentUser.address1;
      }
    }
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
          this.storageService.getCartItemsCOF(environment.groceriesStoreId);
          // this.spinner.hide();
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

  generateOrder() {
    const mode = $('#selectedDelivery').val();

    if ($('#contactNo').val() == '') {
      this.swalToastMessage('Please enter your contact number', 'warning');
      return;
    }

    if ($('#name').val() == '') {
      this.swalToastMessage('Please enter your name', 'warning');
      return;
    }

    if ($('#selectedDelivery').val() == 'd') {
      if ($('#address1').val() == '') {
        this.swalToastMessage('Address 1 is required for delivery', 'warning');
        return;
      }
      if ($('#address2').val() == 'none' || $('#address2').val() == '') {
        this.swalToastMessage('Address 2 is required for delivery', 'warning');
        return;
      }
      // if ($('#pincode').val()== '') {
      //   this.swalToastMessage("Pincode is required for delivery", "warning");
      //   return;
      // }
    }

    // var loadUrl = $('#baseUrl').val() + $('#subDomain').val() + '/cart-order';
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
      this.spinner.show();
      this.storageService.getCartItemsCOF(environment.groceriesStoreId);
      this.spinner.hide();
    }, 300);
  }
  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  // Go to checkout page
  goToCreateOrderOptions() {
    //    console.log("1");
    this.spinner.show();
    const mode = $('#selectedDelivery').val();
    //    console.log("2");

    if ($('#delivery-mode').val() === 'none') {
      this.swalToastMessage('Please choose order preference', 'warning');
      this.spinner.hide();
      return;
    }

    if ($('#selectedDelivery').val() == 'd') {
      // console.log($('#delivery_option').val());
      if (this.storeData.delivery_options.length !== 0) {
        if ($('#delivery_option').val() == 'none') {
          this.swalToastMessage('Please choose delivery option', 'warning');
          this.spinner.hide();
          return;
        }
      }
    }

    if (this.storeData.bank_options.length !== 0) {
      if ($('#bank_option').val() == 'none') {
        this.swalToastMessage(
          'Please choose preferred mode of payment',
          'warning'
        );
        this.spinner.hide();
        return;
      }
    }

    if ($('#contactEmail').val() == '') {
      this.swalToastMessage('Please enter your email address', 'warning');
      this.spinner.hide();
      return;
    } else {
      const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
      if (
        reg.test(
          $('#contactEmail')
            .val()
            .toString()
        ) == false
      ) {
        this.swalToastMessage('Please enter valid email address', 'warning');
        this.spinner.hide();
        return;
      }
    }

    if ($('#contactNo').val() == '') {
      this.swalToastMessage('Please enter your contact number', 'warning');
      this.spinner.hide();
      return;
    } else {
      const phoneNum = $('#contactNo')
        .val()
        .toString()
        .replace(/[^\d]/g, '');
      if (phoneNum.length > 6 && phoneNum.length < 12) {
      } else {
        this.swalToastMessage('Please enter valid contact number', 'warning');
        this.spinner.hide();
        return;
      }
    }

    if ($('#name').val() == '') {
      this.swalToastMessage('Please enter your name', 'warning');
      this.spinner.hide();
      return;
    }

    if ($('#selectedDelivery').val() == 'd') {
      if ($('#address1').val() == '') {
        this.swalToastMessage('Address 1 is required for delivery', 'warning');
        this.spinner.hide();
        return;
      }

      // if ($('#address2').val()== '') {
      //   this.swalToastMessage("Address 2 is required for delivery", "warning");
      //   this.spinner.hide();
      //   return;
      // }

      if ($('#address2').val() == 'none' || $('#address2').val() == '') {
        this.swalToastMessage('City is required for delivery', 'warning');
        this.spinner.hide();
        return;
      }

      // if ($('#pincode').val()== '') {
      //   this.swalToastMessage("Pincode is required for delivery", "warning");
      //   this.spinner.hide();
      //   return;
      // }
    }

    // if (
    //   this.storeData.delivery_days.length !== 0 &&
    //   $('#selectedDelivery').val() == 'd'
    // ) {
    //   // if ($('#delivery_day').val()== 'none') {
    //   //   this.swalToastMessage("Please choose delivery day", "warning");
    //   //   this.spinner.hide();
    //   //   return;
    //   // }

    //   // if ($('#delivery_day').val() == '') {
    //   //   this.swalToastMessage('Please choose delivery date', 'warning');
    //   //   this.spinner.hide();
    //   //   return;
    //   // }
    // }

    const custDetails = {
      selectedDelivery: $('#selectedDelivery').val(),
      name: $('#name').val(),
      contactNo: $('#contactNo').val(),
      contactEmail: $('#contactEmail').val(),
      address1: $('#address1').val(),
      address2: $('#address2').val(),
      bank_option: $('#bank_option').val(),
      // "pincode": $("#pincode").val(),
      pincode: '',
      delivery_day: this.delivery_day,
      notes: $('#notes').val()
    };
    /*write customer details into indexdb*/
    //    console.log("3");

    this.storageService.clearStorageValueCOF('my-customer-njas').then((res: any) => {
      // if (!this.ref['destroyed']) {
      //   this.ref.detectChanges();
      // }
      console.log(res);
      this.storageService.setCustomerStorageValueCOF(
        custDetails,
        'my-customer-njas'
      );
      this.addCustomerDetails[0] = custDetails;
    });
    /*write customer details into indexdb*/
    //   console.log("4");
    let bankOptions = '';
    if ($('#bank_option').val() === 'COD') {
      bankOptions = this.storeData.bank_options['-MJwzblNiNEQX5Dzdy13']
        ? this.storeData.bank_options['-MJwzblNiNEQX5Dzdy13']
        : this.storeData.bank_options['-MLVtZCH6peb8P_AHMIP'];
    } else {
      bankOptions = this.storeData.bank_options['-MKKzFjWRLODL28rIXkn']
        ? this.storeData.bank_options['-MKKzFjWRLODL28rIXkn']
        : this.storeData.bank_options['-MLVtgqnNmGXCHcB2ZJy'];
    }
    const data = JSON.stringify({
      account_id: this.storeData.store.account_email_id,
      store_name: this.storeName,
      email: this.storeData.store.account_email_id,
      selected_delivery: $('#selectedDelivery').val(),
      name: $('#name').val(),
      contact_no: $('#contactNo').val(),
      contact_email: $('#contactEmail').val(),
      address1: $('#address1').val(),
      address2: $('#address2').val(),
      // pincode: $("#pincode").val(),
      pincode: '',
      notes: $('#notes').val(),

      currency_symbol: this.storeData.store.currency_symbol,
      total: this.storageService.cartTotal$,
      delivery_charges:
        $('#selectedDelivery').val() === 'd'
          ? this.storeData.store.delivery_charges
          : 0, // new
      delivery_options: this.chosedDeliveryOption
        ? this.chosedDeliveryOption
        : 'false', // new
      bank_options: bankOptions,
      // bank_options: this.storeData.bank_options[
      //   JSON.stringify($('#bank_option').val())
      // ]
      //   ? this.storeData.bank_options[JSON.stringify($('#bank_option').val())]
      //   : 'N/A', // new

      pickup_day:
        $('#pickup_day').val() && $('#pickup_day').val() !== 'none'
          ? $('#pickup_day').val()
          : 'N/A', // new
          delivery_day: this.delivery_day,

      is_coupon_applied: this.appliedCouponDetails ? 'true' : 'false', // new
      coupon_discount_value: this.discountAmount, // new
      coupon_details: this.appliedCouponDetails
        ? this.appliedCouponDetails
        : 'false', // new
      payable:
        $('#selectedDelivery').val() === 'd'
          ? (
            this.storageService.cartTotal$ +
            (this.storeData.store.delivery_charges
              ? this.storeData.store.delivery_charges
              : 0) -
            this.discountAmount
          ).toFixed(2)
          : (
            this.storageService.cartTotal$ -
            this.discountAmount
          ).toFixed(2), // new
      items: this.storageService.cart$
    });

    // console.table(data);
    // this.spinner.hide();
    // return;
    // console.log(data);

    this.spinner.show();
    this.store.placeOrder(data).subscribe(
      (res: any) => {
        localStorage.setItem('orderKey', res.order_key);
        if (res.status === 'success') {
          localStorage.setItem(
            'orderSummary',
            JSON.stringify(this.storageService.cart$)
          );
          const data = {
            mode: 'WP'
          };
          if (data.mode === 'WP') {
            let orderContent = '';
            this.storageService.getCartItemsCOF(environment.groceriesStoreId);

            if (this.cartProducts && this.cartProducts.length) {
              let itemsList = '';
              for (let i = 0; i < this.cartProducts.length; i++) {
                itemsList =
                  itemsList +
                  '▪️' +
                  this.cartProducts[i].name +
                  ' x ' +
                  this.cartProducts[i].quantity +
                  ' x ' +
                  new CurrencySymbolPipe().transform(
                    this.storeData.store.currency_symbol
                  ) +
                  ' ' +
                  this.cartProducts[i].discount_price +
                  '  = ' +
                  new CurrencySymbolPipe().transform(
                    this.storeData.store.currency_symbol
                  ) +
                  ' ' +
                  this.cartProducts[i].discount_price *
                  this.cartProducts[i].quantity +
                  '\n';
              }

              this.specialInstructions =
                `Special Instructions : ` + $('#notes').val() + `\n------\n`;

              this.orderContent = orderContent;

              this.orderContent = this.orderContent.replace(
                '__ORDER__ID__',
                res.order_id
              );
            }

            this.orderContent = encodeURI(orderContent);
            const isSafari =
              navigator.vendor &&
              navigator.vendor.indexOf('Apple') > -1 &&
              navigator.userAgent &&
              navigator.userAgent.indexOf('CriOS') == -1 &&
              navigator.userAgent.indexOf('FxiOS') == -1;
            if (isSafari) {
              this.href =
                'https://wa.me/' +
                $('#whatsapp').val() +
                '?text=' +
                this.orderContent.toString();
            } else {
              this.href =
                'https://api.whatsapp.com/send?phone=' +
                $('#whatsapp').val() +
                '&text=' +
                this.orderContent.toString();
            }
          } else if (data.mode == 'SMS') {
            this.href =
              'sms://' +
              $('#whatsapp').val() +
              ';?&body=' +
              this.orderContent.toString();
          }
          setTimeout(() => {
            // this.openDialog();
            this.storageService
              .clearStorageValueCOF(
                this.storeData.store.name + '-' + 'my-cart-njas'
              )
              .then((res: any) => {
                this.storageService.getCartItemsCOF(environment.groceriesStoreId);
              });
            // if (!this.ref['destroyed']) {
            //   this.ref.detectChanges();
            // }
            // this.openOrderDetails();
            this.router.navigate(['/order-details', res.order_key]);
            this.spinner.hide();
          }, 1000);
        } else {
          this.swalToastMessage(
            'Unable to create order, try again later!',
            'warning'
          );
        }
      },
      (err: any) => {
        this.spinner.hide();
        this.swalToastMessage(
          'Unable to create order, try again later!',
          'warning'
        );
      }
    );
  }
  openDialog(): void {
    // const dialogRef = this.matDialog.open(CreateOrderComponent, {
    //   width: '100%',
    //   height: '100%',
    //   maxWidth: '100vw',
    //   backdropClass: 'custom-dialog-backdrop-class',
    //   panelClass: 'custom-dialog-panel-class',
    //   data: { pageValue: this.cartProducts, sData: this.storeData }
    // });
  }
  goBack() {
    this.location.back();
  }





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
    data.store_name = environment.groceriesStoreId;

    this.spinner.show();
    this.store.validateCouponCode(data).subscribe(
      (res: any) => {
        this.spinner.hide();

        if (res.status === 'success') {
          this.appliedCouponDetails = res.message[Object.keys(res.message)[0]];
          let total = this.storageService.cartTotal$;
          if (this.appliedCouponDetails) {
            if (this.appliedCouponDetails.type === 'amount') {
              this.discountAmount = (+this.appliedCouponDetails.discount_amount);
            } else {
              this.discountAmount = (+(total * this.appliedCouponDetails.discount_percentage) / 100);

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
}
