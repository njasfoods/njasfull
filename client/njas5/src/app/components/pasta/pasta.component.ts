


import { ChangeDetectorRef, Inject, Component, OnInit } from '@angular/core';
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
// import { MatDialog } from '@angular/material/dialog';
import { WINDOW } from '@ng-toolkit/universal';
declare var jQuery: any;
declare var Swiper: any;
@Component({
  selector: 'app-pasta',
  templateUrl: './pasta.component.html',
  styleUrls: ['./pasta.component.css']
})
export class PastaComponent implements OnInit {
  mealList:any;
  filter = {
    food_type: 'All'
  }

  constructor(
    private store: GroceriesStoreService,
    private storeInternal: StoreService,
    private spinner: NgxSpinnerService,
    public storageService: StorageService,
    public common: CommonService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    // public matDialog: MatDialog,
    private toastr: ToastrService,
    @Inject(WINDOW) private window: Window
  ) {
    this.storageService.searchBar$ = false;
    this.appliedCouponDetails = false;
    this.viewMode = 'grid';
    this.storageService.cart$ = [];
    this.specialInstructions = 'N/A';
    this.storeName = environment.groceriesStoreId;
    this.getStoreDetails();
    this.getStorePastasByEmailID();
  }
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
  prodCount: any;
  loading = true;
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
    this.prodCount = 0;
    if (this.storageService.cart$ && this.storageService.cart$.length) {
      for (let i = 0; i < this.storageService.cart$.length; i++) {
        if (product.id === this.storageService.cart$[i].id) {
          flag = true;
          this.prodCount = this.storageService.cart$[i].quantity;
          // exit;
        }
      }
    } else {
      flag = false;
      this.prodCount = 0;
    }

    if (this.prodCount) {
      $('.quantityCountProduct' + product.id).html('x' + this.prodCount);
      $('.quantityCountProduct' + product.id).show();
    } else {
      $('.quantityCountProduct' + product.id).hide();
    }

    return this.prodCount;
  }
  gotoSpeficCategory(itemKey: any) {
    this.router.navigate(['/']).then(res => {
      this.router.navigate(['/products/' + itemKey]);
    });
  }
  saladInventoryArr: any = [];
  
  saladInventoryBackUpArr: any = [];
  getStorePastasByEmailID() {

    const data = {
      store_id:environment.mealsStoreId
    }


    this.spinner.show();

    this.store.getStorePastasByEmailID(data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status === 'success') {
        if (res.message) {
          this.saladInventoryArr = res.message;
          
          this.saladInventoryBackUpArr = this.saladInventoryArr;
        } else {
          this.saladInventoryArr = [];
        }
      } else {
        this.saladInventoryArr = [];
        this.toastr.warning("Something went wrong!");
        return;
      }
    },
      (err: any) => {
        console.log(err.error);
        this.spinner.hide();
        this.toastr.warning("Something went wrong!");

      }
    );
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
               environment.groceriesStoreId +  '-' + 'my-cart-njas'
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
  onClickSubmit(formData: any) {
 

    // localStorage.setItem(
    //   'subscriptionData',
    //   JSON.stringify(this.subscriptionData)
    // );
    this.spinner.hide();
    /*trying to eliminated # from url*/
    if (this.router.url.split('/')[2]) {
      this.couponCode = this.router.url.split('/')[2];
      if (this.couponCode) {
        this.router.navigate(['/cart', this.couponCode]);
      }
    } else {
      this.router.navigate(['/cart']);
    }
    /*trying to eliminated # from url*/


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

  }
  ngAfterViewInit() {

    $('.container-fluid ul.list-group li:first').trigger('click');
    this.spinner.hide();

    function swalToastMessage(text: any, icon: any) {
      // const Toast = swal.mixin({
      //   toast: true,
      //   background: '#2f3542',
      //   position: 'top-end',
      //   showConfirmButton: false,
      //   timer: 3000,
      //   timerProgressBar: true,
      //   onOpen: toast => {
      //     toast.addEventListener('mouseenter', swal.stopTimer);
      //     toast.addEventListener('mouseleave', swal.resumeTimer);
      //   }
      // });
      // Toast.fire({
      //   icon: icon,
      //   title: text,
      //   background: '#2f3542'
      // });
      alert("bye");
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

    // }, 5000);
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

  goToCategories() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }


  deliveryOption($event: any) {
    this.chosedDeliveryOption = this.storeData.delivery_options[
      $event.target.value
    ];
    this.storeData.store.delivery_charges = this.chosedDeliveryOption
      ? +this.chosedDeliveryOption.price
      : this.normalDeliveryCharges;
  }
  loader = true;
  categoryKey: any;
  categoryName: any;
  getStoreDetails() {
    this.activatedRoute.params.subscribe(res => {
      this.categoryKey = res.categoryKey;
    });

    const data = {
      store_name: environment.mealsStoreId
    };

    this.store.fetchStoreDetails(data).subscribe(
      (res: any) => {
        if (!res.message) {
          this.loader = false;
          this.storeData = [];
          this.loading = false;
          return;
        }

        this.loader = false;

        this.storeData = res.message;
        this.normalDeliveryCharges = 0;
        this.storeData.store.delivery_charges = 0;


        this.storeData.delivery_options = res.delivery_options;
        this.storeData.bank_options = res.bank_options;
        this.storeData.delivery_days = res.delivery_days;


        if (this.storeData.sub_categories) {

          this.categoryProducts = this.storeData.products;
          this.categoryKey = "ALL";
          this.changeCategory(this.categoryKey);
          if (this.categoryKey === 'ALL') {
            this.categoryName = 'ALL';
          } else {
            this.categoryName = this.storeData.sub_categories[
              this.categoryKey
            ].name;
          }
        }

        if (this.storeData.delivery_options) {
          const [key1, value1] = Object.entries(
            this.storeData.delivery_options
          )[0];
          this.chosedDeliveryOption = this.storeData.delivery_options[key1];
          this.storeData.store.delivery_charges = this.chosedDeliveryOption
            ? +this.chosedDeliveryOption.price
            : this.normalDeliveryCharges;
        }


        this.storageService.getCartItemsCOF(environment.groceriesStoreId);
        this.loading = false;
      },
      (err: any) => {
        this.spinner.hide();
        this.storeData = [];
      }
    );
  }
  gotoCart() {
    // if (!JSON.parse(localStorage.getItem('currentUserProfile'))) {
    //   this.router.navigate(['/signin']);
    //   this.toastr.success('You need to login to continue!');
    //   return;
    // } else {
    //   this.router.navigate(['/cart']);
    //   return;
    // }

    this.router.navigate(['/cart']);
    return;
  }
  changeCategory(index: any) {
    // this.spinner.show();
    this.categoryKey = index;
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

          this.storageService.setFilteredItems();
        }
      } else {
        this.storageService.selectedCategoryProducts = [];
        this.storageService.setFilteredItems();
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

          this.storageService.setFilteredItems();
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

          this.storageService.setFilteredItems();
        }
      }
    }
  }

  hideShowCartDiv() {
    $('#cart').toggle();
  }
  openDialog(product: any): void {
    // const dialogRef = this.matDialog.open(ViewCardComponent, {
    //   width: '100%',
    //   height: '100%',
    //   maxWidth: '100vw',
    //   backdropClass: 'custom-dialog-backdrop-class',
    //   panelClass: 'custom-dialog-panel-class',
    //   data: { pageValue: product, sData: this.storeData }
    // });
    alert("hello");
  }
  readMore() {
    const data = {
      store_id: environment.storeId
    };

    this.spinner.show();

    this.storeInternal.getsubscriptionSummary(data).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          var pickListModal = swal
            .fire({
              width: '100%',
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

            })
            .then(isConfirm => {

              if (isConfirm.value) {
              } else {
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
  currCategory = 4;
  next() {
    const keys = Object.keys(this.storeData.sub_categories);
    const len = keys.length;
    let category = document.getElementById('category' + this.currCategory);
    let currentIndex = category;

    if (this.currCategory === len + 1) {
      document
        .getElementById('category')
        .scrollIntoView({ behavior: 'smooth' });
      this.currCategory = 4;
    } else {
      this.currCategory = this.currCategory + 1;
      currentIndex.scrollIntoView({ behavior: 'smooth' });
    }
  }
  previous() {
    this.currCategory = this.currCategory - 1;
    // console.log(this.currCategory);

    let category = document.getElementById('category' + this.currCategory);
    let currentIndex = category;
    if (this.currCategory === 4 || this.currCategory === 0) {
      this.currCategory = 4;
      document
        .getElementById('category')
        .scrollIntoView({ behavior: 'smooth' });
      return;
    }
    currentIndex.scrollIntoView({ behavior: 'smooth' });
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
        environment.groceriesStoreId+ '-' + 'my-cart-njas'
      );
      this.swalToastMessage(product.name + ' added to cart!', 'success');
      setTimeout(() => {
        //this.storageService.getCartItemsCOF(environment.groceriesStoreId);
      }, 300);
    }
  }

  checkMaxLimitReached(id: any, max_order_quantity: any) {
    let quantity_in_cart = 0;
    let k = 0;

    if (this.storageService.cart$) {
      for (const i of this.storageService.cart$) {
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
      .catch(err => (this.addCustomerDetails = []));
  }
  // Minus Product Quantity
  minusQuantityCOF(product: any, event: any) {
    this.storageService
      .getStorageCOF( environment.groceriesStoreId +  '-' + 'my-cart-njas')
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
               environment.groceriesStoreId +  '-' + 'my-cart-njas'
            );
          } else {
            this.storageService.removeStorageValueCOF(
              product.id,
               environment.groceriesStoreId +  '-' + 'my-cart-njas'
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
          //this.storageService.getCartItemsCOF(environment.groceriesStoreId);

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
      position: 'bottom-end',
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      // onOpen: (toast:any) => {
      //   toast.addEventListener('mouseenter', swal.stopTimer);
      //   toast.addEventListener('mouseleave', swal.resumeTimer);
      // }
    });
    Toast.fire({
      icon: icon,
      title: text,
      background: '#2f3542'
    });
    // alert("hi");
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

    }
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
    this.storageService.cart$.splice(index, 1);
    this.storageService.removeStorageValueCOF(
      product.id,
       environment.groceriesStoreId +  '-' + 'my-cart-njas'
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


    }

    if (
      this.storeData.delivery_days.length !== 0 &&
      $('#selectedDelivery').val() == 'd'
    ) {


      if ($('#delivery_day').val() == '') {
        this.swalToastMessage('Please choose delivery date', 'warning');
        this.spinner.hide();
        return;
      }
    }

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
      notes: $('#notes').val()
    };
    /*write customer details into indexdb*/
    //    console.log("3");

    this.storageService.clearStorageValueCOF('my-customer-njas').then(res => {
      // if (!this.ref['destroyed']) {
      //   this.ref.detectChanges();
      // }
      this.storageService.setCustomerStorageValueCOF(
        custDetails,
        'my-customer-njas'
      );
      this.addCustomerDetails[0] = custDetails;
    });
    /*write customer details into indexdb*/
    //   console.log("4");

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
      total: this.total,
      delivery_charges:
        $('#selectedDelivery').val() === 'd'
          ? this.storeData.store.delivery_charges
          : 0, // new
      delivery_options: this.chosedDeliveryOption
        ? this.chosedDeliveryOption
        : 'false', // new
      bank_options: this.storeData.bank_options[
        JSON.stringify($('#bank_option').val())
      ]
        ? this.storeData.bank_options[JSON.stringify($('#bank_option').val())]
        : 'N/A', // new

      pickup_day:
        $('#pickup_day').val() && $('#pickup_day').val() !== 'none'
          ? $('#pickup_day').val()
          : 'N/A', // new
      delivery_day:
        $('#delivery_day').val() &&
          $('#delivery_day').val() !== 'none' &&
          $('#delivery_day').val() !== ''
          ? $('#delivery_day').val()
          : 'N/A', // new

      is_coupon_applied: this.appliedCouponDetails ? 'true' : 'false', // new
      coupon_discount_value: this.appliedCouponDetails
        ? (
          (this.total * this.appliedCouponDetails.discount_percentage) /
          100
        ).toFixed(2)
        : 0, // new
      coupon_details: this.appliedCouponDetails
        ? this.appliedCouponDetails
        : 'false', // new
      payable:
        $('#selectedDelivery').val() === 'd'
          ? (
            this.total +
            (this.storeData.store.delivery_charges
              ? this.storeData.store.delivery_charges
              : 0) -
            (this.appliedCouponDetails
              ? (this.total * this.appliedCouponDetails.discount_percentage) /
              100
              : 0)
          ).toFixed(2)
          : (
            this.total -
            (this.appliedCouponDetails
              ? (this.total * this.appliedCouponDetails.discount_percentage) /
              100
              : 0)
          ).toFixed(2), // new
      items: this.storageService.cart$
    });

    // console.table(data);
    // this.spinner.hide();
    // return;

    this.spinner.show();
    this.store.placeOrder(data).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          const data = {
            mode: 'WP'
          };
          if (data.mode === 'WP') {
            let orderContent = '';
            this.storageService.getCartItemsCOF(environment.groceriesStoreId);

            if (this.storageService.cart$ && this.storageService.cart$.length) {
              let itemsList = '';
              for (let i = 0; i < this.storageService.cart$.length; i++) {
                itemsList =
                  itemsList +
                  '▪️' +
                  this.storageService.cart$[i].name +
                  ' x ' +
                  this.storageService.cart$[i].quantity +
                  ' x ' +
                  new CurrencySymbolPipe().transform(
                    this.storeData.store.currency_symbol
                  ) +
                  ' ' +
                  this.storageService.cart$[i].discount_price +
                  '  = ' +
                  new CurrencySymbolPipe().transform(
                    this.storeData.store.currency_symbol
                  ) +
                  ' ' +
                  this.storageService.cart$[i].discount_price *
                  this.storageService.cart$[i].quantity +
                  '\n';
              }

              this.specialInstructions =
                `Special Instructions : ` + $('#notes').val() + `\n------\n`;
              if ($('#selectedDelivery').val() == 'd') {
                const orderContent =
                  `✅ Delivery Order No : #__ORDER__ID__\nfrom www.store.grociti.com/` +
                     environment.groceriesStoreId + 
                    `\n------\n# | Item(s) | Quantity | Price | Total\n` +
                    itemsList +
                    `\n------\nSubtotal : ` +
                    new CurrencySymbolPipe().transform(
                      this.storeData.store.currency_symbol
                    ) +
                    ' ' +
                    this.total.toFixed(2) +
                    `\n------\nDiscount : -` +
                    new CurrencySymbolPipe().transform(
                      this.storeData.store.currency_symbol
                    ) +
                    ' ' +
                    (this.appliedCouponDetails
                      ? (
                        (this.total *
                          this.appliedCouponDetails.discount_percentage) /
                        100
                      ).toFixed(2)
                      : (0).toFixed(2)) +
                    `\n------\nDelivery Charges : ` +
                    new CurrencySymbolPipe().transform(
                      this.storeData.store.currency_symbol
                    ) +
                    ' ' +
                    (this.storeData.store.delivery_charges
                      ? +this.storeData.store.delivery_charges
                      : 0
                    ).toFixed(2) +
                    `\n------\nPayable : ` +
                    new CurrencySymbolPipe().transform(
                      this.storeData.store.currency_symbol
                    ) +
                    ' ' +
                    ($('#selectedDelivery').val() === 'd'
                      ? (
                        this.total +
                        (this.storeData.store.delivery_charges
                          ? +this.storeData.store.delivery_charges
                          : 0) -
                        (this.appliedCouponDetails
                          ? (this.total *
                            this.appliedCouponDetails.discount_percentage) /
                          100
                          : 0)
                      ).toFixed(2)
                      : (
                        this.total -
                        (this.appliedCouponDetails
                          ? (this.total *
                            this.appliedCouponDetails.discount_percentage) /
                          100
                          : 0)
                      ).toFixed(2)) +
                    `\n------\nDelivery Partner : ` +
                    (this.chosedDeliveryOption
                      ? this.chosedDeliveryOption.name
                      : 'Default') +
                    ' ' +
                    new CurrencySymbolPipe().transform(
                      this.storeData.store.currency_symbol
                    ) +
                    (this.chosedDeliveryOption
                      ? this.chosedDeliveryOption.price
                      : 0) +
                    `\nPreferred mode of payment : ` +
                    (this.storeData.bank_options[
                      JSON.stringify($('#bank_option').val())
                    ]
                      ? this.storeData.bank_options[
                        JSON.stringify($('#bank_option').val())
                      ].name
                      : 'N/A') +
                    `\n------\nPreferred delivery day : ` +
                    ($('#delivery_day').val() &&
                      $('#delivery_day').val() !== 'none' &&
                      $('#delivery_day').val() !== '')
                    ? $('#delivery_day').val()
                    : 'N/A' +
                    `\n------\nStore Details :\nName : ` +
                    this.storeData.store.display_name +
                    `\nContact : ` +
                    this.storeData.store.whatsapp_number +
                    `\nAddress : ` +
                    this.storeData.store.address +
                    `\n------\n` +
                    this.specialInstructions +
                    this.storeData.store.display_name +
                    ` has received your order.\n------\nCustomer Details For Delivery :\nName : ` +
                    $('#name').val() +
                    `\nEmail : ` +
                    $('#contactEmail').val() +
                    `\nContact : ` +
                    $('#contactNo').val() +
                    `\nAddress : ` +
                    $('#address1').val() +
                    `,` +
                    $('#address2').val() +
                    `\n------\nHave a nice day, Thank you :)\n`;
              } else {
                orderContent =
                  `✅ Pickup Order No : #__ORDER__ID__\nfrom www.store.grociti.com/` +
                   environment.groceriesStoreId + 
                  `\n------\n# | Item(s) | Quantity | Price | Total\n` +
                  itemsList +
                  `\n------\nSubtotal : ` +
                  new CurrencySymbolPipe().transform(
                    this.storeData.store.currency_symbol
                  ) +
                  ' ' +
                  this.total.toFixed(2) +
                  `\n------\nDiscount : -` +
                  new CurrencySymbolPipe().transform(
                    this.storeData.store.currency_symbol
                  ) +
                  ' ' +
                  (this.appliedCouponDetails
                    ? (
                      (this.total *
                        this.appliedCouponDetails.discount_percentage) /
                      100
                    ).toFixed(2)
                    : (0).toFixed(2)) +
                  `\n------\nPayable : ` +
                  new CurrencySymbolPipe().transform(
                    this.storeData.store.currency_symbol
                  ) +
                  ' ' +
                  ($('#selectedDelivery').val() === 'd'
                    ? (
                      this.total +
                      this.storeData.store.delivery_charges -
                      (this.appliedCouponDetails
                        ? (this.total *
                          this.appliedCouponDetails.discount_percentage) /
                        100
                        : 0)
                    ).toFixed(2)
                    : (
                      this.total -
                      (this.appliedCouponDetails
                        ? (this.total *
                          this.appliedCouponDetails.discount_percentage) /
                        100
                        : 0)
                    ).toFixed(2)) +
                  `\n------\nPreferred mode of payment : ` +
                  (this.storeData.bank_options[
                    JSON.stringify($('#bank_option').val())
                  ]
                    ? this.storeData.bank_options[
                      JSON.stringify($('#bank_option').val())
                    ].name
                    : 'N/A') +
                  `\n------\nPreferred pickup day : ` +
                  ($('#pickup_day').val() && $('#pickup_day').val() !== 'none'
                    ? $('#pickup_day').val()
                    : 'N/A') +
                  `\n------\nStore Details For Pickup:\nName : ` +
                  this.storeData.store.display_name +
                  `\nContact : ` +
                  this.storeData.store.whatsapp_number +
                  `\nAddress : ` +
                  this.storeData.store.address +
                  `\n------\n` +
                  this.specialInstructions +
                  this.storeData.store.display_name +
                  ` has received your order.\n------\nCustomer Details :\nName : ` +
                  $('#name').val() +
                  `\nEmail : ` +
                  $('#contactEmail').val() +
                  `\nContact : ` +
                  $('#contactNo').val() +
                  `\n------\nHave a nice day, Thank you :)\n`;
              }

              this.orderContent = orderContent;

              this.orderContent = this.orderContent.replace(
                '__ORDER__ID__',
                res.order_id
              );
            }

            // console.log(this.orderContent);

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
            this.storageService.getCartItemsCOF(environment.groceriesStoreId);

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


  payOnline() {
    const data = {
      total: 10,
      phone: '1234567891',
      email: 'grociti@gmail.com',
      name: 'Njas',
      order_id: 'NJAS001',
      return_url: 'http://grociti.com',
      developer_id: 1
    };

    this.spinner.show();

    this.storeInternal.payOnline(data).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          console.log(res);

          if (res.message) {
          } else {
          }

          this.spinner.hide();
        } else {
          this.toastr.warning('Something went wrong!');
          return;
        }
      },
      (err: any) => {
        this.spinner.hide();
        this.toastr.warning('Something went wrong!');
      }
    );
  }

  
  onChangeType(food_type: any) {
    this.filter.food_type = food_type;
    switch (food_type) {
      case 'All':
        this.saladInventoryArr = this.saladInventoryBackUpArr;
        break;
      case 'Veg':
        this.saladInventoryArr = [];

        Object.keys(this.saladInventoryBackUpArr).forEach((key) => {
          if (this.saladInventoryBackUpArr[key].food_symbol === 'Veg') {
            this.saladInventoryArr.push(this.saladInventoryBackUpArr[key]);
          }
        });

        break;
      case 'Non-Veg':
        this.saladInventoryArr = [];
        Object.keys(this.saladInventoryBackUpArr).forEach((key) => {
          if (this.saladInventoryBackUpArr[key].food_symbol === 'Non-Veg') {
            this.saladInventoryArr.push(this.saladInventoryBackUpArr[key]);
          }
        });
        break;
      case 'Fruits':
        this.saladInventoryArr = [];
        Object.keys(this.saladInventoryBackUpArr).forEach((key) => {
          if (this.saladInventoryBackUpArr[key].food_symbol === 'Fruits') {
            this.saladInventoryArr.push(this.saladInventoryBackUpArr[key]);
          }
        });
        break;

      default:
        break;
    }
  }
}