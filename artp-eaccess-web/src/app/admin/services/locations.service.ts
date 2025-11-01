// src/app/admin/services/locations.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
  id: string;
  nom: string;
}

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private readonly base = 'http://localhost:3000/admin/lieux';

  constructor(private http: HttpClient) {}

  /** Lister tous les lieux */
  list(): Observable<Location[]> {
    return this.http.get<Location[]>(this.base);
  }

  /** Créer un nouveau lieu */
  create(data: {nom: string}): Observable<Location> {
    return this.http.post<Location>(this.base, data);
  }

  /** Mettre à jour un lieu existant */
  update(id: string, data: Partial<Location>): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}`, data);
  }

  /** Supprimer un lieu */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
