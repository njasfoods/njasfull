import { Component, OnInit } from '@angular/core';
import { temp_cart } from '../temp_cart';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  emptyCart = false

  constructor() { }

  ngOnInit(): void {
  }

}
