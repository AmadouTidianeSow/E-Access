// src/app/employe/notifications/notifications.component.ts

import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../services/notification.service';

@Component({
  selector: 'app-employe-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;
  error: string | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;
    this.notificationService.list().subscribe({
      next: notifs => {
        this.notifications = notifs;
        this.loading = false;
      },
      error: err => {
        this.error = 'Impossible de charger les notifications';
        console.error(err);
        this.loading = false;
      }
    });
  }

  markRead(notif: Notification): void {
    if (notif.read) {
      return;
    }
    this.notificationService.markRead(notif.id).subscribe({
      next: () => {
        notif.read = true;
      },
      error: err => {
        console.error('Erreur en marquant comme lu', err);
      }
    });
  }
}
