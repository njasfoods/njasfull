import { ChangeDetectorRef, Inject, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert2';
import * as $ from 'jquery';
// import { MatDialog } from '@angular/material/dialog';
import { WINDOW } from '@ng-toolkit/universal';
declare var jQuery: any;
declare var Swiper: any;
import { filter } from 'rxjs/operators';
const dateFormat = require('dateformat');
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'njas';

  isShow: boolean;
  topPosToStartShowing = 100;

  @HostListener('window:scroll')
  checkScroll() {
    // window의 scroll top
    // Both window.pageYOffset and document.documentElement.scrollTop returns the same result in all the cases. window.pageYOffset is not supported below IE 9.
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPosition >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }

  // TODO: Cross browsing
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  constructor(
    public spinner: NgxSpinnerService,
    public ref: ChangeDetectorRef,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public toastr: ToastrService,
    @Inject(WINDOW) public window: Window
  ) {

    document.addEventListener('click', (e: any) => this.onClick(e));
    document.addEventListener('scroll', (e: any) => this.onClick(e));
  }
  onClick(e: any) {

    if (e.target.className !== 'navbar-toggler-icon') {
      var _open = $('#navbarSupportedContent').hasClass('show');
      if (_open) {
        $('#navbarSupportedContent').removeClass('show');
      }
    }


  }
}
