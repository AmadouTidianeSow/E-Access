// src/app/employe/services/notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: string;
  userId: string;
  type: 'visit_request' | 'visit_response' | 'visitor_checkin';
  message: string;
  visitId?: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // endpoints backend réels
  private readonly listUrl     = 'http://localhost:3000/notifications';
  private readonly markReadUrl = 'http://localhost:3000/notifications';

  constructor(private http: HttpClient) {}

  /** Récupère les notifications de l’utilisateur courant */
  list(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.listUrl);
  }

  /** Marquer une notification comme lue */
  markRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.markReadUrl}/${id}/read`, {});
  }
}
