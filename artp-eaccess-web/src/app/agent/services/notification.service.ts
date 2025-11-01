// src/app/agent/services/notification.service.ts
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
export class AgentNotificationService {
  private base = 'http://localhost:3000/notifications';

  constructor(private http: HttpClient) {}

  list(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.base);
  }

  markRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/read`, {});
  }
}
