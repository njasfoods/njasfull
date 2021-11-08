import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppRoutingModule, routingComponent } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';

import { CurrencySymbolPipe } from './currency-symbol.pipe';
import { environment } from 'src/environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FireBaseService } from './services/fire-base.service';
import { CartComponent } from './components/cart/cart/cart.component';
import { CheckoutComponent } from './components/cart/checkout/checkout.component';
import { MealCheckoutComponent } from './components/checkout/checkout.component';
import { HeaderComponent } from './includes/header/header.component';
import { LogoutComponent } from './components/logout/logout.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MealProductComponent } from './shared/meal-product/meal-product.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { VerifyComponent } from './components/verify/verify.component';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks } from 'ng-lazyload-image'; // <-- include ScrollHooks

import { WindowService } from './services/window.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { NgtUniversalModule } from '@ng-toolkit/universal';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { AuthGuard } from './services/auth.guard';
import { CreateOrderComponent } from './components/cart-details/create-order/create-order.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { OrderDetailsComponent } from './components/cart-details/order-details/order-details.component';

// import { OrderProductsComponent } from './components/cart-details/order-products/order-products.component';
// import { PaymentCompletedComponent } from './components/cart-details/payment-completed/payment-completed.component';


import * as $ from 'jquery';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { DlDateTimeDateModule, DlDateTimePickerModule } from 'angular-bootstrap-datetimepicker';
import { SubscriptionsComponent } from './components/user/subscriptions/subscriptions.component';
 
@NgModule({
  declarations: [
    AppComponent,

    NavbarComponent,
    routingComponent,
    CartComponent,
    CheckoutComponent,
    MealCheckoutComponent,
    HeaderComponent,
    LogoutComponent,
    LoginComponent,
    ForgotPasswordComponent,
    VerifyComponent,
    ResetPasswordComponent,
    RegisterComponent,
    MealProductComponent,
    CurrencySymbolPipe,
    CreateOrderComponent,
    OrderDetailsComponent,
    CartDetailsComponent,
    SubscriptionsComponent,
    // OrderProductsComponent,
    // PaymentCompletedComponent,
    
  ],
  imports: [
    DlDateTimeDateModule,  // <--- Determines the data type of the model
    DlDateTimePickerModule,
    NgxMyDatePickerModule.forRoot(),
    LazyLoadImageModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    FontAwesomeModule,
    NgxSpinnerModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-left',
      timeOut: 1000,
      maxOpened: 1,
      preventDuplicates: true
    }),
    TransferHttpCacheModule,
    NgtUniversalModule
  ],
  providers: [FireBaseService,
    LoginComponent,
    ForgotPasswordComponent,
    VerifyComponent,
    ResetPasswordComponent,
    NgxSpinnerService, AuthGuard, WindowService,

    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks }
  ],
  exports: [CurrencySymbolPipe, CartComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
