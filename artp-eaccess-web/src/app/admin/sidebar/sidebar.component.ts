import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../../shared/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/admin/home' },
    { label: 'Utilisateurs',    icon: 'people',   route: '/admin/users' },
    { label: 'Catégories',      icon: 'category', route: '/admin/categories' },
    { label: 'Types de visite', icon: 'tour',     route: '/admin/types' },
    { label: 'Lieux',           icon: 'place',    route: '/admin/locations' },
    { label: 'Paramètres',      icon: 'settings', route: '/admin/settings' },
    { label: 'Rapports',        icon: 'bar_chart',route: '/admin/reports' },
    { label: 'Historique',      icon: 'history',  route: '/admin/historique' },
  ];

  userName = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const profile: UserProfile | null = this.auth.getProfile();
    if (profile) {
      this.userName = `${profile.prenom} ${profile.nom}`;
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
