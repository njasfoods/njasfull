import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class FireBaseService {

  isLoggedIn = false

  constructor(
    public firebaseAuth: AngularFireAuth,
    private firestore: AngularFirestore
) { }

async signin(email: string, password: string){
  await this.firebaseAuth.signInWithEmailAndPassword(email, password).then(
    res=>{
      this.isLoggedIn = true
      localStorage.setItem('user', JSON.stringify(res.user))
    }
  )
}

async signup(email: string, password: string){
  await this.firebaseAuth.createUserWithEmailAndPassword(email, password).then(
    res=>{
      this.isLoggedIn =true
      localStorage.setItem('user', JSON.stringify(res.user))
    }
  )
}

logout(){
  this.firebaseAuth.signOut()
  localStorage.removeItem('user')
  localStorage.removeItem('redirectURL');
}

getMeals(){
  return this.firestore.collection('meals').snapshotChanges();
}

addMeal(payload:IMeals){
  return this.firestore.collection('meals').add(payload);
}

updateMeal(mealId: string, payload: IMeals){
  return this.firestore.doc('meal/'+ mealId).update(payload);
}

deleteMeal(mealId: string){
  return this.firestore.doc('meal/'+ mealId).delete();
}
}

export interface IMeals {
  id?: string;
  name: string;
  description: string;
  price: number;
}