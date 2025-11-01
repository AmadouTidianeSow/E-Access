// src/app/admin/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import {
  AdminService,
  Summary,
  BySite,
  StatusDistribution,
  VisitsPerDay,
  HoursPerDay,
  Notification,
  TodayCount,
  TodayHours,
} from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  summary: Summary = {
    totalVisits: 0,
    pendingVisits: 0,
    ongoingVisits: 0,
    completedVisits: 0,
  };
  visitsToday = 0;
  hoursToday = 0;
  bySite: BySite[] = [];
  statusDist: StatusDistribution[] = [];
  visitsPerDay: VisitsPerDay[] = [];
  hoursPerDay: HoursPerDay[] = [];
  notifications: Notification[] = [];

  constructor(private admin: AdminService) {}

  ngOnInit() {
    // 1) summary
    this.admin.getSummary().subscribe(s => (this.summary = s));

    // 2) visits today
    this.admin.getVisitsToday().subscribe((r: TodayCount) => (this.visitsToday = r.count));
  
    // 4) visites par site
    this.admin.getVisitsBySite().subscribe(arr => (this.bySite = arr));

    // 5) répartition par statut
    this.admin.getStatusDistribution().subscribe(arr => (this.statusDist = arr));

    // 6) visites par jour
    this.admin.getVisitsPerDay().subscribe(arr => (this.visitsPerDay = arr));

    // 8) dernières notifications
    this.admin.getLastNotifications().subscribe(n => (this.notifications = n));
  }
}
