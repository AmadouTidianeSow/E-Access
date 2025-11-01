import { Component, OnInit } from '@angular/core';
import { AuthService, UserProfile } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

interface SidebarItem {
  title: string;
  icon: string;
  path: string;
  external?: boolean;
}

@Component({
  selector: 'app-agent-sidebar',
  templateUrl: './agent-sidebar.component.html',
  styleUrls: ['./agent-sidebar.component.scss'],
})
export class AgentSidebarComponent implements OnInit {
  user: UserProfile | null = null;

  // Définition des liens de navigation
  menuItems: SidebarItem[] = [
    { title: 'Visites en attente', icon: 'hourglass_empty', path: '/agent/pending' },
    { title: 'Visites en cours', icon: 'play_circle_filled', path: '/agent/ongoing' },
    { title: 'Créer (manuel)',     icon: 'post_add',           path: '/agent/create/manual' },
    { title: 'Créer (scan OCR)',   icon: 'camera_alt',         path: '/agent/create/scan' },
    { title: 'Suivi visiteurs',     icon: 'people',             path: '/agent/checked-in' },
    { title: 'Historique',         icon: 'history',        path: '/agent/historique' },
    { title: 'Notifications',       icon: 'notifications',      path: '/agent/notifications' },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.profile$.subscribe(profile => (this.user = profile));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  isMobileMenu(): boolean {
    // Par exemple via largeur d'écran
    return window.innerWidth < 768;
  }
}
