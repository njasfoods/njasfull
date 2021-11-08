
import { LoginComponent } from '../login/login.component';
import { ChangeDetectorRef, Inject, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
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
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  couponCode: any;
  constructor(
    public store: GroceriesStoreService,
    public storeInternal: StoreService,
    public spinner: NgxSpinnerService,
    public storageService: StorageService,
    public common: CommonService,
    public ref: ChangeDetectorRef,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public auth: AuthService,
    // public matDialog: MatDialog,
    public toastr: ToastrService,
    @Inject(WINDOW) public window: Window
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // console.log(event.url);
      var _open = $('#navbarSupportedContent').hasClass('show');
      if (_open) {
        $('#navbarSupportedContent').removeClass('show');
      }

      window.scroll(0,0);

    });
    if (localStorage.getItem('currentUserProfile')) {
      this.auth.user$ = JSON.parse(localStorage.getItem('currentUserProfile'));
    } else {
      this.auth.user$ = [];
    }

    this.storageService.getCartItemsCOF(environment.groceriesStoreId);
    // $(document).ready(function () {
    //   $(document).click(function (event) {
    //     var click = $(event.target);
    //     var _open = $('#navbarSupportedContent').hasClass('show');
    //     if (_open === true && !click.hasClass('navbar-toggler')) {
    //       $('.navbar-toggler').trigger('click');
    //       alert("hi")
    //     }
    //   });
    // });
    // $(document).ready(function () {
    //   $(document).click(function (event) {

    //     var click = $(event.target);
    //     var _open = $('.navbar-collapse').hasClass('show');

    //     if (_open === true && !click.hasClass('navbar-toggler')) {
    //       $('.navbar-toggler').trigger('click');
    //     } else {
    //       $('.navbar-toggler').trigger('click');
    //     }
    //   });
    // });
  }
  onClickSubmit(formData: any) {

    // if (!this.auth.isLoggedIn()) {
    //   localStorage.setItem(
    //     'redirectURL',
    //     JSON.stringify(this.router.url)
    //   );
    //   this.toastr.info('Login to continue.');
    //   this.router.navigate(['/login']);
    //   return;
    // }

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
  toggleMobileNav() {
    var _open = $('#navbarSupportedContent').hasClass('show');
    if (_open) {
      $('#navbarSupportedContent').removeClass('show');
    } else {
      $('#navbarSupportedContent').addClass('show');
    }
  }
  isSignedIn = LoginComponent
  ngOnInit(): void {
  }

}
