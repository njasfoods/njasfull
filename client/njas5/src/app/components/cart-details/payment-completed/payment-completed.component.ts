import { WINDOW } from '@ng-toolkit/universal';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencySymbolPipe } from '@app/currency-symbol.pipe';
import { AuthService } from '@app/services/auth.service';
import { CommonService } from '@app/services/common.service';
import { GroceriesStoreService } from '@app/services/groceries.service';
import { StorageService } from '@app/services/storage.service';
import { StoreService } from '@app/services/store.service';
import { environment } from '@env/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert2';
import { switchMap } from 'rxjs/operators'; // RxJS v6
import { INgxMyDpOptions } from 'ngx-mydatepicker';
declare var jQuery: any;
declare var Swiper: any;
@Component({
  selector: 'app-payment-completed',
  templateUrl: './payment-completed.component.html',
  styleUrls: ['./payment-completed.component.css']
})
export class PaymentCompletedComponent implements OnInit {
  constructor(
    private store: GroceriesStoreService,
    private storeInternal: StoreService,
    // private modalController: ModalController,
    private spinner: NgxSpinnerService,
    public storageService: StorageService,
    public common: CommonService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private toastr: ToastrService,
    @Inject(WINDOW) private window: Window
  ) {
    if (!this.storageService.localCart$.length) {
      this.router.navigate(['/']);
      return;
    }

    this.getCustomerDetailsCOF();
    $(window).scroll(function() {
      const scroll = $(window).scrollTop();
      // $('.cartFloatingBtn').show();
      $('.category-fixed-btm-top').show();
      $('.selectedCategory-fixed-btm-top').show();
      if (scroll >= 0) {
        setTimeout(function() {
          // $('.cartFloatingBtn').hide();
          $('.category-fixed-btm-top').hide();
          $('.selectedCategory-fixed-btm-top').hide();
        }, 5000);
      } else {
        // $('.cartFloatingBtn').hide();
        $('.category-fixed-btm-top').hide();
        $('.selectedCategory-fixed-btm-top').hide();
      }
    });
    this.appliedCouponDetails = false;
    this.viewMode = 'grid';
    this.cartProducts = [];
    this.specialInstructions = 'N/A';

    // console.log(this.router.url.split('/'));

    this.storeName = environment.groceriesStoreId;

    this.getStoreDetails();

    $(window).resize(function() {});
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
    if (this.cartProducts && this.cartProducts.length) {
      for (let i = 0; i < this.cartProducts.length; i++) {
        if (product.id === this.cartProducts[i].id) {
          flag = true;
          this.prodCount = this.cartProducts[i].quantity;
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
  d = new Date();
  model: any;
  myOptions: INgxMyDpOptions = {
    // other options...
    disableUntil: {
      year: this.d.getFullYear(),
      month: this.d.getMonth() + 1,
      day: this.d.getDate()
    },
    dateFormat: 'dd.mm.yyyy',
    disableWeekends: true,
    minYear: new Date().getFullYear()
  };
  delivery_day: any;

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
     this.storageService.getCartItemsCOF(environment.groceriesStoreId);
    setTimeout(function() {
      $(document).ready(function() {
        (function(window, document) {
          'use strict';
          if (!('localStorage' in window)) return;
          var nightMode = localStorage.getItem('gmtNightMode');
          if (nightMode) {
            document.documentElement.className += ' night-mode';
          }
        })(window, document);

        (function(window, document) {
          'use strict';

          // Feature test
          if (!('localStorage' in window)) return;

          // Get our newly insert toggle
          var nightMode = document.querySelector('#night-mode');
          if (!nightMode) return;

          // When clicked, toggle night mode on or off
          nightMode.addEventListener(
            'click',
            function(event) {
              event.preventDefault();
              document.documentElement.classList.toggle('night-mode');
              if (document.documentElement.classList.contains('night-mode')) {
                localStorage.setItem('gmtNightMode', 'true');
                return;
              }
              localStorage.removeItem('gmtNightMode');
            },
            false
          );
        })(window, document);

        $('#navbarMenu').click(function() {
          $('.navbar-toggler').trigger('click');
        });
      });

      (function($) {
        'use strict';

        // === QTY JS === //
        function wcqib_refresh_quantity_increments() {
          jQuery(
            'div.quantity:not(.buttons_added), td.quantity:not(.buttons_added)'
          ).each(function(a: any, b: any) {
            var c = jQuery(b);
            c.addClass('buttons_added'),
              c
                .children()
                .first()
                .before('<input type="button" value="-" class="minus" />'),
              c
                .children()
                .last()
                .after('<input type="button" value="+" class="plus" />');
          });
        }
        jQuery(document).ready(function() {
          wcqib_refresh_quantity_increments();
        }),
          jQuery(document).on('updated_wc_div', function() {
            wcqib_refresh_quantity_increments();
          }),
          jQuery(document).on('click', '.plus, .minus', function() {
            var a = jQuery(this)
                .closest('.quantity')
                .find('.qty'),
              b = parseFloat(a.val()) ? parseFloat(a.val()) : '',
              c = parseFloat(a.attr('max')) ? parseFloat(a.attr('max')) : '',
              d = parseFloat(a.attr('min')) ? parseFloat(a.attr('min')) : '',
              e = a.attr('step');
            (b && '' !== b && 'NaN' !== b) || (b = 0),
              ('' !== c && 'NaN' !== c) || (c = ''),
              ('' !== d && 'NaN' !== d) || (d = 0),
              ('any' !== e && '' !== e && void 0 !== e && 'NaN' !== e) ||
                (e = 1),
              jQuery(this).is('.plus')
                ? c && b >= c
                  ? a.val(c)
                  : a.val((+b + parseFloat(e)).toFixed(2))
                : d && b <= d
                ? a.val(d)
                : b > 0 && a.val((+b - parseFloat(e)).toFixed(2)),
              a.trigger('change');
          });

        // wishlist script //
        $(document).ready(function() {
          $('.like-icon, .like-button').on('click', function(e: any) {
            e.preventDefault();
            $(this).toggleClass('liked');
            $(this)
              .children('.like-icon')
              .toggleClass('liked');
          });
        });

        // menu script //
        $(document).ready(function() {
          var fixHeight = function() {
            $('.navbar-nav').css(
              'max-height',
              document.documentElement.clientHeight - 8000
            );
          };

          fixHeight();

          $(window).resize(function() {
            fixHeight();
          });

          $('.navbar .navbar-toggler').on('click', function() {
            fixHeight();
          });

          $('.navbar-toggler, .overlay').on('click', function() {
            $('.mobileMenu, .overlay').toggleClass('open');
            console.log('clicked');
          });
        });

        // === Dropdown === //

        $('.ui.dropdown').dropdown();

        $('.dropdown').dropdown({ transition: 'drop', on: 'hover' });

        // === Model === //
        $('.ui.modal')
          .modal({
            blurring: true
          })
          .modal('show');

        // === Tab === //
        $('.menu .item').tab();

        // === checkbox Toggle === //
        $('.ui.checkbox').checkbox();

        // === Toggle === //
        $('.enable.button').on('click', function() {
          $(this)
            .nextAll('.checkbox')
            .checkbox('enable');
        });

        // Payment Method Accordion //
        $('input[name="paymentmethod"]').on('click', function() {
          var $value = $(this).attr('value');
          $('.return-departure-dts').slideUp();
          $('[data-method="' + $value + '"]').slideDown();
        });

        //  Countdown //
        $('.product_countdown-timer').each(function() {
          var $this = $(this);
          $this.countdown($this.data('countdown'), function(event: any) {
            $(this).text(event.strftime('%D days %H:%M:%S'));
          });
        });

        // === Banner Home === //
        $('.offers-banner').owlCarousel({
          loop: true,
          margin: 30,
          nav: false,
          dots: false,
          autoplay: true,
          autoplayTimeout: 3000,
          autoplayHoverPause: true,
          responsive: {
            0: {
              items: 1
            },
            600: {
              items: 2
            },
            1000: {
              items: 2
            },
            1200: {
              items: 3
            },
            1400: {
              items: 3
            }
          }
        });

        // Category Slider
        $('.cate-slider').owlCarousel({
          loop: true,
          margin: 30,
          nav: true,
          dots: false,
          navText: [
            "<i class='uil uil-angle-left'></i>",
            "<i class='uil uil-angle-right'></i>"
          ],
          responsive: {
            0: {
              items: 2
            },
            600: {
              items: 2
            },
            1000: {
              items: 4
            },
            1200: {
              items: 6
            },
            1400: {
              items: 6
            }
          }
        });

        // Featured Slider
        $('.featured-slider').owlCarousel({
          items: 8,
          loop: false,
          margin: 10,
          nav: true,
          dots: false,
          navText: [
            "<i class='uil uil-angle-left'></i>",
            "<i class='uil uil-angle-right'></i>"
          ],
          responsive: {
            0: {
              items: 1
            },
            600: {
              items: 2
            },
            1000: {
              items: 3
            },
            1200: {
              items: 4
            },
            1400: {
              items: 5
            }
          }
        });

        // === Date Slider === //
        $('.date-slider').owlCarousel({
          loop: false,
          margin: 10,
          nav: false,
          dots: false,
          responsive: {
            0: {
              items: 3
            },
            600: {
              items: 4
            },
            1000: {
              items: 5
            },
            1200: {
              items: 6
            },
            1400: {
              items: 7
            }
          }
        });

        // === Banner Home === //
        $('.life-slider').owlCarousel({
          loop: true,
          margin: 30,
          nav: true,
          dots: false,
          autoplay: true,
          autoplayTimeout: 3000,
          autoplayHoverPause: true,
          navText: [
            "<i class='uil uil-angle-left'></i>",
            "<i class='uil uil-angle-right'></i>"
          ],
          responsive: {
            0: {
              items: 1
            },
            600: {
              items: 2
            },
            1000: {
              items: 2
            },
            1200: {
              items: 3
            },
            1400: {
              items: 3
            }
          }
        });

        // === Testimonials Slider === //
        $('.testimonial-slider').owlCarousel({
          loop: true,
          margin: 30,
          nav: true,
          dots: false,
          autoplay: true,
          autoplayTimeout: 3000,
          autoplayHoverPause: true,
          navText: [
            "<i class='uil uil-angle-left'></i>",
            "<i class='uil uil-angle-right'></i>"
          ],
          responsive: {
            0: {
              items: 1
            },
            600: {
              items: 2
            },
            1000: {
              items: 2
            },
            1200: {
              items: 3
            },
            1400: {
              items: 3
            }
          }
        });

        // Category Slider
        $('.team-slider').owlCarousel({
          loop: true,
          margin: 30,
          nav: false,
          dots: false,
          responsive: {
            0: {
              items: 1
            },
            600: {
              items: 2
            },
            1000: {
              items: 3
            },
            1200: {
              items: 4
            },
            1400: {
              items: 4
            }
          }
        });

        $(document).ready(function() {
          var sync1 = $('#sync1');
          var sync2 = $('#sync2');
          var slidesPerPage = 4; //globaly define number of elements per page
          var syncedSecondary = true;

          sync1
            .owlCarousel({
              items: 1,
              slideSpeed: 2000,
              nav: true,
              autoplay: false,
              dots: false,
              loop: true,
              responsiveRefreshRate: 200,
              navText: [
                "<i class='uil uil-angle-left'></i>",
                "<i class='uil uil-angle-right'></i>"
              ]
            })
            .on('changed.owl.carousel', syncPosition);

          sync2
            .on('initialized.owl.carousel', function() {
              sync2
                .find('.owl-item')
                .eq(0)
                .addClass('current');
            })
            .owlCarousel({
              items: slidesPerPage,
              dots: true,
              nav: true,
              smartSpeed: 200,
              slideSpeed: 500,
              slideBy: slidesPerPage, //alternatively you can slide by 1, this way the active slide will stick to the first item in the second carousel
              responsiveRefreshRate: 100
            })
            .on('changed.owl.carousel', syncPosition2);

          function syncPosition(el: any) {
            //if you set loop to false, you have to restore this next line
            //var current = el.item.index;

            //if you disable loop you have to comment this block
            var count = el.item.count - 1;
            var current = Math.round(el.item.index - el.item.count / 2 - 0.5);

            if (current < 0) {
              current = count;
            }
            if (current > count) {
              current = 0;
            }

            //end block

            sync2
              .find('.owl-item')
              .removeClass('current')
              .eq(current)
              .addClass('current');
            var onscreen = sync2.find('.owl-item.active').length - 1;
            var start = sync2
              .find('.owl-item.active')
              .first()
              .index();
            var end = sync2
              .find('.owl-item.active')
              .last()
              .index();

            if (current > end) {
              sync2.data('owl.carousel').to(current, 100, true);
            }
            if (current < start) {
              sync2.data('owl.carousel').to(current - onscreen, 100, true);
            }
          }

          function syncPosition2(el: any) {
            if (syncedSecondary) {
              var number = el.item.index;
              sync1.data('owl.carousel').to(number, 100, true);
            }
          }

          sync2.on('click', '.owl-item', function(e: any) {
            e.preventDefault();
            var number = $(this).index();
            sync1.data('owl.carousel').to(number, 300, true);
          });
        });
      })(jQuery);

      // this.activatedRoute.params.subscribe(res => {
      //   // console.log(res.storeName);
      //   this.storeName = res.storeName;
      //   this.getStoreDetails();
      // });
      $(document).ready(function() {
        window.scrollTo(0, 0);
      });
    }, 5000);
  }
  ngAfterViewInit() {
    // setTimeout(() => {

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
        onOpen: toast => {
          toast.addEventListener('mouseenter', swal.stopTimer);
          toast.addEventListener('mouseleave', swal.resumeTimer);
        }
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
    $('#delivery').click(function() {
      $('.show-address').show();
      $('.show-pickup-total').hide();
      $('#selectedDelivery').val('d');
      $('#delivery-mode').val('d');
      $('#pickup').removeClass('active');
      $('#delivery').addClass('active');
      setDeliveryMode('d');
    });

    $('#pickup').click(function() {
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
  ionViewDidEnter() {}

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
  loader = true;
  getStoreDetails() {
    // this.activatedRoute.params.subscribe(res => {
    //   this.storeName = res.storeName;
    // });
    localStorage.setItem('storeName', environment.groceriesStoreId);
    this.storeName = environment.groceriesStoreId;
    // this.storeName = environment.groceriesStoreId;
    // if (!this.storeName || this.storeName === '') {
    //   window.location.href = 'http://notjusasalad.com';
    //   return;
    // }

    const data = {
      store_name: this.storeName
    };

    this.store.fetchStoreDetails(data).subscribe(
      (res: any) => {
        if (!res.message) {
          this.loader = false;
          this.storeData = [];
          return true;
        }

        this.loader = false;

        this.storeData = res.message;
        this.normalDeliveryCharges = 0;
        this.storeData.store.delivery_charges = 0;
        // this.normalDeliveryCharges = (this.storeData.store.delivery_charges) ? this.storeData.store.delivery_charges : 0;

        // if (this.storeData.delivery_options.length!==0) {
        //   this.normalDeliveryCharges = this.storeData.delivery_options[0];
        //   this.chosedDeliveryOption = this.storeData.delivery_options[0];
        //   this.storeData.store.delivery_charges = (this.chosedDeliveryOption) ? (+this.chosedDeliveryOption.price) : this.normalDeliveryCharges;

        // } else {
        //   this.normalDeliveryCharges = 0;
        // }

        this.storeData.delivery_options = res.delivery_options;
        this.storeData.bank_options = res.bank_options;
        this.storeData.delivery_days = res.delivery_days;

        // dynamic og tags

        // dynamic og tags
        if (this.storeData.sub_categories) {
          //   let [key, value] = Object.entries(this.storeData.sub_categories)[0];
          //  this.selectedCategory = this.storeData.sub_categories[key];
          //   this.categoryProducts = this.storeData.products;
          //   this.changeCategory(key);

          /// for all as default
          // let [key, value] = Object.entries(this.storeData.sub_categories)[0];
          // this.selectedCategory = this.storeData.sub_categories[key];

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

        // this.checkStoreStatus(
        //   this.storeData.store.opening_time,
        //   this.storeData.store.closing_time
        // );

        $(document).ready(function() {
          function setDeliveryMode(deliveryMode: any) {
            if (deliveryMode === 'd') {
              this.swalToastMessage('Ordering mode set to delivery', 'info');
            } else {
              this.swalToastMessage('Ordering mode set to pick up', 'info');
            }
          }

          function notifyMessage(themsg: any, ntype: any) {
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

          $(document).on('click', '.addToCart', function() {
            $('.scrollToCartFloatingButtonArea .ball').addClass('animate');
            $('.scrollToCartFloatingButtonArea .icon-cart').addClass('shake');

            setTimeout(function() {
              $('.scrollToCartFloatingButtonArea .ball').removeClass('animate');
            }, 1000);

            setTimeout(function() {
              $('.scrollToCartFloatingButtonArea .icon-cart').removeClass(
                'shake'
              );
            }, 1000);
          });

          $(document).on('click', '.deductFromCart', function() {
            $('.scrollToCartFloatingButtonArea .ball').addClass('animate-out');

            setTimeout(function() {
              $('.scrollToCartFloatingButtonArea .ball').removeClass(
                'animate-out'
              );
            }, 1000);
          });
          let stickyOffset: any;
          if ($('.container-fluid ul.list-group').offset()) {
            stickyOffset = $('.container-fluid ul.list-group').offset().top;
          }

          $(window).scroll(function() {
            if ($(window).width() <= 991) {
              const sticky = $('.container-fluid ul.list-group');
              const scroll = $(window).scrollTop();

              if (scroll >= stickyOffset) {
                sticky.addClass('fixedOnTop');
              } else {
                sticky.removeClass('fixedOnTop');
              }
            }
          });

          $('.container-fluid ul.list-group li:first').addClass('active');
          $(document).on(
            'click',
            '.container-fluid ul.list-group li',
            function() {
              $('.container-fluid ul.list-group li').removeClass('active');
              $(this).addClass('active');
            }
          );
        });
         this.storageService.getCartItemsCOF(environment.groceriesStoreId);
        this.getCustomerDetailsCOF();
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
    //   return false;
    // } else {
    //   this.router.navigate(['/cart']);
    //   return true;
    // }

    this.router.navigate(['/cart']);
    return true;
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

    this.window.scrollTo(0, 0);

    // this.spinner.hide();
  }

  hideShowCartDiv() {
    $('#cart').toggle();
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
      return false;
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
        this.getCustomerDetailsCOF();
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
          console.log(this.addCustomerDetails);
        } else {
          this.addCustomerDetails = [];
        }
      })
      .catch(err => (this.addCustomerDetails = []));
  }
  // Minus Product Quantity
  minusQuantityCOF(product: any, event: any) {
    this.storageService
      .getStorageCOF(this.storeData.store.name + '-' + 'my-cart-njas')
      .then((products:any) => {
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
      return false;
    }

    if ($('#name').val() == '') {
      this.swalToastMessage('Please enter your name', 'warning');
      return false;
    }

    if ($('#selectedDelivery').val() == 'd') {
      if ($('#address1').val() == '') {
        this.swalToastMessage('Address 1 is required for delivery', 'warning');
        return false;
      }
      if ($('#address2').val() == 'none' || $('#address2').val() == '') {
        this.swalToastMessage('Address 2 is required for delivery', 'warning');
        return false;
      }
      // if ($('#pincode').val()== '') {
      //   this.swalToastMessage("Pincode is required for delivery", "warning");
      //   return false;
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
      return false;
    }

    if ($('#selectedDelivery').val() == 'd') {
      // console.log($('#delivery_option').val());
      if (this.storeData.delivery_options.length !== 0) {
        if ($('#delivery_option').val() == 'none') {
          this.swalToastMessage('Please choose delivery option', 'warning');
          this.spinner.hide();
          return false;
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
        return false;
      }
    }

    if ($('#contactEmail').val() == '') {
      this.swalToastMessage('Please enter your email address', 'warning');
      this.spinner.hide();
      return false;
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
        return false;
      }
    }

    if ($('#contactNo').val() == '') {
      this.swalToastMessage('Please enter your contact number', 'warning');
      this.spinner.hide();
      return false;
    } else {
      const phoneNum = $('#contactNo')
        .val()
        .toString()
        .replace(/[^\d]/g, '');
      if (phoneNum.length > 6 && phoneNum.length < 12) {
      } else {
        this.swalToastMessage('Please enter valid contact number', 'warning');
        this.spinner.hide();
        return false;
      }
    }

    if ($('#name').val() == '') {
      this.swalToastMessage('Please enter your name', 'warning');
      this.spinner.hide();
      return false;
    }

    if ($('#selectedDelivery').val() == 'd') {
      if ($('#address1').val() == '') {
        this.swalToastMessage('Address 1 is required for delivery', 'warning');
        this.spinner.hide();
        return false;
      }

      // if ($('#address2').val()== '') {
      //   this.swalToastMessage("Address 2 is required for delivery", "warning");
      //   this.spinner.hide();
      //   return false;
      // }

      if ($('#address2').val() == 'none' || $('#address2').val() == '') {
        this.swalToastMessage('City is required for delivery', 'warning');
        this.spinner.hide();
        return false;
      }

      // if ($('#pincode').val()== '') {
      //   this.swalToastMessage("Pincode is required for delivery", "warning");
      //   this.spinner.hide();
      //   return false;
      // }
    }

    if (
      this.storeData.delivery_days.length !== 0 &&
      $('#selectedDelivery').val() == 'd'
    ) {
      // if ($('#delivery_day').val()== 'none') {
      //   this.swalToastMessage("Please choose delivery day", "warning");
      //   this.spinner.hide();
      //   return false;
      // }

      if ($('#delivery_day').val() == '') {
        this.swalToastMessage('Please choose delivery date', 'warning');
        this.spinner.hide();
        return false;
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
          delivery_day: this.delivery_day,

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
      items: this.cartProducts
    });

    // console.table(data);
    // this.spinner.hide();
    // return;

    this.spinner.show();
    this.store.placeOrder(data).subscribe(
      (res: any) => {
        console.log(res);

        if (res.status === 'success') {
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

              // old with time
              // if ($('#selectedDelivery').val() == 'd') {
              // 	orderContent = `✅ Delivery Order No : #__ORDER__ID__\nfrom www.store.notjusasalad.com/` + this.storeData.store.name + `\n------\n# | Item(s) | Quantity | Price | Total\n` + itemsList + `------\nNotes : We are open from ` + this.storeData.store.opening_time + ` to ` + this.storeData.store.closing_time + `\n------\nSubtotal : ` + new CurrencySymbolPipe().transform(this.storeData.store.currency_symbol) + " " + this.total.toFixed(2) + `\nTotal(Incl Tax) : ` + new CurrencySymbolPipe().transform(this.storeData.store.currency_symbol) + " " + (this.total + this.total * (18 / 100)).toFixed(2) + `\n------\nStore Details :\nName : ` + this.storeData.store.display_name + `\nContact : ` + this.storeData.store.whatsapp_number + `\nAddress : ` + this.storeData.store.address + `\n------\n` + this.specialInstructions + this.storeData.store.display_name + ` has received your order.\nNow proceed to payment by using Payment Options given below to complete the order.\n\n💳 Payment Options : 💸\n1. We accept cash on delivery\n2. Cash on pick up\n\n------\nCustomer Details For Delivery :\nName : ` + $("#name").val() + `\nContact : ` + $("#contactNo").val() + `\nAddress : ` + $("#address1").val() + `,` + $("#address2").val() + `, Pincode - ` + $("#pincode").val() + `\n------\nHave a nice day, Thank you :)\n`;
              // } else {
              // 	orderContent = `✅ Pickup Order No : #__ORDER__ID__\nfrom www.store.notjusasalad.com/` + this.storeData.store.name + `\n------\n# | Item(s) | Quantity | Price | Total\n` + itemsList + `------\nNotes : We are open from ` + this.storeData.store.opening_time + ` to ` + this.storeData.store.closing_time + `\n------\nSubtotal : ` + new CurrencySymbolPipe().transform(this.storeData.store.currency_symbol) + " " + this.total.toFixed(2) + `\nTotal(Incl Tax) : ` + new CurrencySymbolPipe().transform(this.storeData.store.currency_symbol) + " " + +(this.total + this.total * (18 / 100)).toFixed(2) + `\n------\nStore Details For Pickup:\nName : ` + this.storeData.store.display_name + `\nContact : ` + this.storeData.store.whatsapp_number + `\nAddress : ` + this.storeData.store.address + `\n------\n` + this.specialInstructions + this.storeData.store.display_name + ` has received your order.\nNow proceed to payment by using Payment Options given below to complete the order.\n\n💳 Payment Options : 💸\n1. We accept cash on delivery\n2. Cash on pick up\n\n------\nCustomer Details :\nName : ` + $("#name").val() + `\nContact : ` + $("#contactNo").val() + `\n------\nHave a nice day, Thank you :)\n`;
              // }
              // old with time

              if ($('#selectedDelivery').val() == 'd') {
                const orderContent =
                  `✅ Delivery Order No : #__ORDER__ID__\nfrom www.store.notjusasalad.com/` +
                  this.storeData.store.name +
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
                  `✅ Pickup Order No : #__ORDER__ID__\nfrom www.store.notjusasalad.com/` +
                  this.storeData.store.name +
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
            // if (!this.ref['destroyed']) {
            //   this.ref.detectChanges();
            // }
            // this.openOrderDetails();
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
  // async openOrderDetails() {
  //   // if (!this.ref['destroyed']) {
  //   //   this.ref.detectChanges();
  //   // }

  //   let modal = await this.modalController.create({
  //     component: CreateOrderComponent,
  //     cssClass: 'fullscreen',
  //     componentProps: {
  //       cartArr: this.cartProducts,
  //       storeDetailsArr: this.storeData.store,
  //       customerDetailsArr: this.addCustomerDetails,
  //       totalAmount: this.total,
  //       waHref: this.href,
  //       orderContent: this.orderContent,
  //       accountEmail: this.storeData.store.account_email_id,
  //       storeName: this.storeName,
  //       delivery_charges:
  //         $('#selectedDelivery').val() === 'd'
  //           ? this.storeData.store.delivery_charges
  //           : 0, //new
  //       delivery_options: this.chosedDeliveryOption
  //         ? this.chosedDeliveryOption
  //         : 'false', //new
  //       bank_options: this.storeData.bank_options[$('#bank_option').val()]
  //         ? this.storeData.bank_options[$('#bank_option').val()]
  //         : 'N/A', //new
  //       pickup_day:
  //         $('#pickup_day').val() && $('#pickup_day').val() !== 'none'
  //           ? $('#pickup_day').val()
  //           : 'N/A', //new
  //       delivery_day:
  //         $('#delivery_day').val() &&
  //         $('#delivery_day').val() !== 'none' &&
  //         $('#delivery_day').val() !== ''
  //           ? $('#delivery_day').val()
  //           : 'N/A', //new

  //       is_coupon_applied: this.appliedCouponDetails ? 'true' : 'false', //new
  //       coupon_discount_value: this.appliedCouponDetails
  //         ? (
  //             (this.total * this.appliedCouponDetails.discount_percentage) /
  //             100
  //           ).toFixed(2)
  //         : 0, //new
  //       coupon_details: this.appliedCouponDetails
  //         ? this.appliedCouponDetails
  //         : 'false', //new
  //       payable:
  //         $('#selectedDelivery').val() === 'd'
  //           ? (
  //               this.total +
  //               this.storeData.store.delivery_charges -
  //               (this.appliedCouponDetails
  //                 ? (this.total *
  //                     this.appliedCouponDetails.discount_percentage) /
  //                   100
  //                 : 0)
  //             ).toFixed(2)
  //           : (
  //               this.total -
  //               (this.appliedCouponDetails
  //                 ? (this.total *
  //                     this.appliedCouponDetails.discount_percentage) /
  //                   100
  //                 : 0)
  //             ).toFixed(2), //new
  //       items: this.cartProducts
  //     }
  //   });

  //   this.storageService
  //     .clearStorageValueCOF(this.storeData.store.name + '-' + 'my-cart-njas')
  //     .then(res => {
  //       this.swalToastMessage(
  //         'Your order taken successfully, You will receive call from the ' +
  //           this.storeData.store.display_name +
  //           ' team shortly.',
  //         'success',
  //         6000
  //       );
  //        this.storageService.getCartItemsCOF(environment.groceriesStoreId);
  //       this.appliedCouponDetails = false;
  //       this.couponCode = null;

  //       if (this.addCustomerDetails) {
  //         if (this.addCustomerDetails[0].selectedDelivery === 'd') {
  //           $('.show-address').show();
  //           $('.show-pickup-total').hide();
  //           $('#selectedDelivery').val('d');
  //           $('#delivery-mode').val('d');
  //           $('#pickup').removeClass('active');
  //           $('#delivery').addClass('active');
  //         } else {
  //           $('.show-address').hide();
  //           $('.show-pickup-total').show();
  //           $('#selectedDelivery').val('p');
  //           $('#delivery-mode').val('p');
  //           $('#pickup').addClass('active');
  //           $('#delivery').removeClass('active');
  //         }
  //       }

  //       if (this.storeData.store) {
  //         if (this.storeData.store.order_mode) {
  //           if (
  //             this.storeData.store.order_mode === 'all' ||
  //             this.storeData.store.order_mode === 'delivery'
  //           ) {
  //             // $('#delivery').trigger('click');
  //             $('.show-address').show();
  //             $('.show-pickup-total').hide();
  //             $('#selectedDelivery').val('d');
  //             $('#pickup').removeClass('active');
  //             $('#delivery').addClass('active');
  //           } else {
  //             //$('#pickup').trigger('click');
  //             $('.show-address').hide();
  //             $('.show-pickup-total').show();
  //             $('#selectedDelivery').val('p');
  //             $('#pickup').addClass('active');
  //             $('#delivery').removeClass('active');
  //           }
  //         }
  //       }
  //     });

  //   // this.storageService.clearStorageValueALL().then((res) => {
  //   //   this.swalToastMessage("Your order taken successfully, You will receive call from the " + this.storeData.store.display_name + " team shortly.", "success", 6000);
  //   //    this.storageService.getCartItemsCOF(environment.groceriesStoreId);
  //   //   this.appliedCouponDetails = false;
  //   //   this.couponCode = null;

  //   //   if (this.storeData.store) {
  //   //     if (this.storeData.store.order_mode) {
  //   //       if (this.storeData.store.order_mode === "all" || this.storeData.store.order_mode === "delivery") {
  //   //         $('#delivery').trigger('click');
  //   //       } else {

  //   //         $('#pickup').trigger('click');

  //   //       }
  //   //     }

  //   //   }

  //   // });

  //   modal.dismiss();
  //   return await modal.present();
  // }

  payOnline() {
    const data = {
      total: 10,
      phone: '1234567891',
      email: 'notjusasalad@gmail.com',
      name: 'Njas',
      order_id: 'NJAS001',
      return_url: 'http://notjusasalad.com',
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
        // console.log(err.error);
        this.spinner.hide();
        this.toastr.warning('Something went wrong!');
      }
    );
  }
}
