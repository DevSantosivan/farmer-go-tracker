import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../model/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}



  
  // Register new user
  register(fullname: string, email: string, password: string, contact: string, birthday: string,uid?:string): Observable<void> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        const userRef = doc(this.firestore, `users/${user.uid}`);
        return from(setDoc(userRef, {
          fullname,
          email: user.email,
          contact,
          birthday,
        }));
      })
    );
  }

  // Login existing user
  login(email: string, password: string): Observable<User | null> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        const userRef = doc(this.firestore, `users/${user.uid}`);
        return from(getDoc(userRef)).pipe(
          map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
              email: user.email ?? '',
              uid: user.uid ?? '',
              fullname: data?.['fullname'] ?? '',
              contact: data?.['contact'] ?? '',
              birthday: data?.['birthday'] ?? '',
            };
          })
        );
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    return new Observable((observer) => {
      onAuthStateChanged(this.auth, (firebaseUser) => {
        if (!firebaseUser) {
          observer.next(null);
          observer.complete();
        } else {
          const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
          getDoc(userRef).then((snapshot) => {
            const data = snapshot.data();
            observer.next({
              email: firebaseUser.email ?? '',
              uid: firebaseUser.uid ?? '',
              fullname: data?.['fullname'] ?? '',
              contact: data?.['contact'] ?? '',
              birthday: data?.['birthday'] ?? '',
            });
            observer.complete();
          }).catch(() => {
            observer.next(null);
            observer.complete();
          });
        }
      });
    });
  }

  // Logout the user
  logout(): Observable<void> {
    return from(this.auth.signOut());
  }
}
