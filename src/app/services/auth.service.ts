import { Injectable, signal } from '@angular/core';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../app.config';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  user$ = this._user;

  constructor() {
    onAuthStateChanged(auth, (u) => this._user.set(u ?? null));
  }

  signIn(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  signOut(): Promise<void> {
    return signOut(auth);
  }

  isAuthenticated(): boolean {
    return !!this._user();
  }
}
