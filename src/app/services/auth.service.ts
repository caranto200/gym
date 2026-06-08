import { Injectable, inject } from '@angular/core';
import { Auth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  user$ = user(this.auth);

  constructor() {
    getRedirectResult(this.auth).then(result => {
      if (result?.user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  async loginGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(this.auth, provider);
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  checkAuth() {
    this.user$.pipe(
      take(1)
    ).subscribe(u => {
      if (!u) this.router.navigate(['/login']);
    });
  }

  waitForUser(): Promise<void> {
    return new Promise(resolve => {
      this.user$.pipe(
        take(1)
      ).subscribe(() => {
        resolve();
      });
    });
  }
}