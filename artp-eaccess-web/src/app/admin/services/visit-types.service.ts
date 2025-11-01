// src/app/admin/services/visit-types.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VisitType {
  id: string;
  nom: string;
  description?: string;   // facultatif
}

@Injectable({ providedIn: 'root' })
export class VisitTypesService {
  private readonly base = 'http://localhost:3000/admin/typevisite';

  constructor(private http: HttpClient) {}

  list(): Observable<VisitType[]> {
    return this.http.get<VisitType[]>(this.base);
  }

  create(data: {nom: string; description?: string}): Observable<VisitType> {
    return this.http.post<VisitType>(this.base, data);
  }

  update(id: string, data: Partial<VisitType>): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
