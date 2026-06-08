import { Injectable, inject } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  user$ = user(this.auth);

  async loginGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      console.error(e);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  checkAuth() {
    this.user$.pipe(take(1)).subscribe(u => {
      if (!u) this.router.navigate(['/login']);
    });
  }

  waitForUser(): Promise<void> {
    return new Promise(resolve => {
      this.user$.pipe(take(1)).subscribe(() => resolve());
    });
  }
}