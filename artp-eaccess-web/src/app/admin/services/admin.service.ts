// src/app/admin/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Summary { totalVisits: number; ongoingVisits: number; completedVisits: number; pendingVisits: number; }
export interface BySite { site: string; count: number; }
export interface StatusDistribution { status: string; count: number; }
export interface VisitsPerDay { date: string; count: number; }
export interface HoursPerDay { date: string; totalHours: number; }
export interface VisitorsPerVisit { averageVisitors: number; }
export interface Notification { id: string; userId: string; type: string; message: string; read: boolean; createdAt: string; }
export interface TodayCount { count: number; }
export interface TodayHours { totalHours: number; }

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = 'http://localhost:3000/admin';
  constructor(private http: HttpClient) {}

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.base}/dashboard/summary`);
  }
  getVisitsBySite(): Observable<BySite[]> {
    return this.http.get<BySite[]>(`${this.base}/dashboard/visites-by-site`);
  }
  getStatusDistribution(): Observable<StatusDistribution[]> {
    return this.http.get<StatusDistribution[]>(`${this.base}/dashboard/status-distribution`);
  }
  getVisitsPerDay(): Observable<VisitsPerDay[]> {
    return this.http.get<VisitsPerDay[]>(`${this.base}/dashboard/visits-per-day`);
  }

  getVisitorsPerVisit(): Observable<VisitorsPerVisit> {
    return this.http.get<VisitorsPerVisit>(`${this.base}/dashboard/visitors-per-visit`);
  }
  getLastNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.base}/dashboard/last-notifications`);
  }
   getVisitsToday(): Observable<TodayCount> {
    return this.http.get<TodayCount>(`${this.base}/dashboard/visits-today`);
  }


}
