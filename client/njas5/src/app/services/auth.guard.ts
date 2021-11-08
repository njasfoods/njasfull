import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { tap, map, take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toaster: ToastrService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    if (!JSON.parse(localStorage.getItem('currentUserProfile'))) {
      // if (
      //   next.params.storeName === 'food' ||
      //   next.params.storeName === 'groceries'
      // ) {
      //   this.toaster.success(
      //     'You will have to login to access' + ' ' + next.params.storeName
      //   );
      //   this.router.navigate(['/login']);
      //   return false;
      // } else {
      //   this.auth.signOut();
      //   return false;
      // }
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }
}
