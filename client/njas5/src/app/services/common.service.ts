import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment, httpOptions } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private _location: Location
  ) {}

  public goBack() {
    this._location.back();
  }

  public checkValidAuthResponseCode(err: any) {
    if (err.status === 401) {
      localStorage.removeItem('currentUserProfile');
      localStorage.removeItem('loginToken');
      localStorage.removeItem('usernameOrEmail');
      localStorage.removeItem('cartId');
      this.router.navigate(['/signin']);
      return false;
    }
    return true;
  }

  public numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  public sizeOfObj(obj: any) {
    let size = 0,
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        size++;
      }
    }
    return size;
  }

  public getActiveCategories(obj: any) {
    const activeCategories = [];
    let size = 0,
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key].status !== 'inactive') {
          activeCategories.push(obj[key].id.toString());
        }
      }
    }
    return activeCategories;
  }
}
