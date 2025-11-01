// src/app/admin/services/settings.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SettingsPayload {
  horaires: { ouverture: string; fermeture: string };
  alertThresholds: { maxConcurrentVisits: number };
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private api = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) {}

  getSettings(): Observable<SettingsPayload> {
    return this.http.get<SettingsPayload>(`${this.api}/settings`);
  }

  updateSettings(data: Partial<SettingsPayload>): Observable<SettingsPayload> {
    return this.http.patch<SettingsPayload>(`${this.api}/settings`, data);
  }
}
