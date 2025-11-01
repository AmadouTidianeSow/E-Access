import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, UserProfile } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface MenuItem {
  title: string;
  path: string;
  icontype: string;
  type: 'link';
}

@Component({
  selector: 'app-employe-sidebar',
  templateUrl: './employe-sidebar.component.html',
  styleUrls: ['./employe-sidebar.component.scss'],
})
export class EmployeSidebarComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  private sub?: Subscription;

  public menuItems: MenuItem[] = [
    { title: 'Tableau de bord',       path: '/employe/home',             icontype: 'dashboard',     type: 'link' },
    { title: 'Déclarer une visite',   path: '/employe/visites/new',      icontype: 'add_circle',    type: 'link' },
    { title: 'Mon planning',          path: '/employe/visites/planning', icontype: 'schedule',      type: 'link' },
    { title: 'Historique',            path: '/employe/visites/history',  icontype: 'history',       type: 'link' },
    { title: 'Visites impromptues',   path: '/employe/visites/impromptues', icontype: 'event_note',  type: 'link' },
    { title: 'Notifications',         path: '/employe/notifications',    icontype: 'notifications', type: 'link' },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub = this.auth.profile$.subscribe(profile => this.user = profile);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  isMobileMenu(): boolean {
    return window.innerWidth < 768;
  }
}
