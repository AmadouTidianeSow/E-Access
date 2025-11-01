// src/app/agent/notifications/notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { AgentNotificationService, Notification } from '../services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-agent-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private notifService: AgentNotificationService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;
    this.notifService.list().subscribe({
      next: list => {
        // trier du plus récent au plus ancien
        this.notifications = list.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Impossible de charger les notifications';
        this.loading = false;
      },
    });
  }

  markAsRead(n: Notification): void {
    if (n.read) { return; }
    this.notifService.markRead(n.id).subscribe({
      next: () => {
        n.read = true;
        this.snack.open('Notification marquée comme lue', 'OK', { duration: 2000 });
      },
      error: err => {
        console.error(err);
        this.snack.open('Erreur en marquant comme lue', 'OK');
      }
    });
  }
}
