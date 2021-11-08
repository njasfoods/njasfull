import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

import { MealsComponent } from './components/meals/meals.component';
import { SaladsComponent } from './components/salads/salads.component';
import { HomeComponent } from './components/home/home.component';
import { PastaComponent } from './components/pasta/pasta.component';
import { JuiceComponent } from './components/juice/juice.component';
import { GroceriesComponent } from './components/groceries/groceries.component';
import { RecipesComponent } from './components/recipes/recipes.component';
import { UserComponent } from './components/user/user.component';
import { NutritionComponent } from './components/user/nutrition/nutrition.component';
import { OrderHistoryComponent } from './components/user/order-history/order-history.component';
import { DeliveryLocationsComponent } from './components/user/delivery-locations/delivery-locations.component';
import { SettingsComponent } from './components/user/settings/settings.component';

import { UserMenuComponent } from './components/user/user-menu/user-menu.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MealCheckoutComponent } from './components/checkout/checkout.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { VerifyComponent } from './components/verify/verify.component';

import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CreateOrderComponent } from './components/cart-details/create-order/create-order.component';
import { OrderDetailsComponent } from './components/cart-details/order-details/order-details.component';
import { SubscriptionsComponent } from './components/user/subscriptions/subscriptions.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'salads', component: SaladsComponent },
  { path: 'salads/:id', component: SaladsComponent },
  { path: 'pasta', component: PastaComponent },
  { path: 'pasta/:id', component: PastaComponent },

  { path: 'meals', component: MealsComponent },
  { path: 'meals/:id', component: MealsComponent },

  { path: 'juice', component: JuiceComponent },
  { path: 'groceries', component: GroceriesComponent },
  { path: 'groceries/:id', component: GroceriesComponent },
  // {
  //   path: 'order-details',
  //   component: CreateOrderComponent,
  //   data: {
  //     title: 'Checkout'
  //   },
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'order-details/:id',
    component: OrderDetailsComponent,
    data: {
      title: 'Order Details',
    },
    // canActivate: [AuthGuard],
  },
  { path: 'recipes', component: RecipesComponent },
  { path: 'user', component: UserComponent, canActivate: [AuthGuard] },
  {
    path: 'nutrition',
    component: NutritionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'order-history',
    component: OrderHistoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'subscriptions',
    component: SubscriptionsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delivery-locations',
    component: DeliveryLocationsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },

  { path: 'login', component: LoginComponent },
  { path: 'signup', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-password/:id', component: ForgotPasswordComponent },
  { path: 'reset-password/:id', component: ResetPasswordComponent },
  { path: 'verify/:id', component: VerifyComponent },
  {
    path: 'cart',
    component: CartDetailsComponent,
    data: {
      title: 'Cart',
    },
    // canActivate: [AuthGuard],
  },
  {
    path: 'cart/:coupon_code',
    component: CartDetailsComponent,
    data: {
      title: 'Cart',
    },
    // canActivate: [AuthGuard],
  },
  {
    path: 'checkout',
    component: MealCheckoutComponent,
    data: {
      title: 'Checkout',
    },
  },
  {
    path: 'checkout/:coupon_code',
    component: MealCheckoutComponent,
    data: {
      title: 'Checkout',
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
export const routingComponent = [
  HomeComponent,
  MealsComponent,
  SaladsComponent,
  PastaComponent,
  JuiceComponent,
  GroceriesComponent,
  RecipesComponent,
  UserComponent,
  LoginComponent,
  ForgotPasswordComponent,
  VerifyComponent,
  ResetPasswordComponent,
  RegisterComponent,
  UserMenuComponent,
  OrderDetailsComponent,
  NutritionComponent,
  OrderHistoryComponent,
  DeliveryLocationsComponent,
  SettingsComponent,
];
