// src/app/admin/services/categories.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  nom: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly base = 'http://localhost:3000/admin/categories';

  constructor(private http: HttpClient) {}

  /** Récupérer toutes les catégories */
  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.base);
  }

  /** Créer une nouvelle catégorie */
  create(data: {nom: string}): Observable<Category> {
    return this.http.post<Category>(this.base, data);
  }

  /** Mettre à jour une catégorie */
  update(id: string, data: Partial<Category>): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}`, data);
  }

  /** Supprimer une catégorie */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
