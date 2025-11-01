// src/app/shared/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'agent' | 'employe';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {
    // Optionnel : restaurer le profil si déjà loggé et stocké dans localStorage
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      this.profileSubject.next(JSON.parse(saved));
    }
  }

  login(credentials: { login: string; password: string }) {
    return this.http
      .post<{ token: string; user: UserProfile }>(
        'http://localhost:3000/users/login',
        credentials,
      )
      .pipe(
        tap(({ token, user }) => {
          // 1) Stocker le token
          localStorage.setItem('token', token);
          // 2) Stocker le profil pour persistance
          localStorage.setItem('userProfile', JSON.stringify(user));
          // 3) Émettre le profil
          this.profileSubject.next(user);
        }),
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    this.profileSubject.next(null);
  }

  /** Renvoie immédiatement le profil courant ou null */
  getProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }
}
