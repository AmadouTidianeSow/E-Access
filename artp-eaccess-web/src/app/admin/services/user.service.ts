// src/app/admin/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  login?: string;
  role: 'admin' | 'agent' | 'employe';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = 'http://localhost:3000/admin/users';

  constructor(private http: HttpClient) {}

  /** Récupérer tous les users */
  listUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  /** Créer un utilisateur (POST /admin/users) */
  createUser(data: {
    nom: string;
    prenom: string;
    login: string;
    password: string;
    role: User['role'];
  }): Observable<User> {
    return this.http.post<User>(this.base, data);
  }

  /**
   * Mettre à jour un utilisateur par son id.
   * Accepts ANY subset of User fields (nom, prenom, login, role).
   * LoopBack renvoie 204 No Content, donc on observe void.
   */
  updateUser(id: string, data: Partial<Omit<User, 'id'>>): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}`, data);
  }

  /** Supprimer un utilisateur (DELETE /admin/users/{id}) */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
