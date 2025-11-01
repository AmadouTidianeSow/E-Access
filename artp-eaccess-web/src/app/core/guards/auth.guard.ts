import { Injectable } from '@angular/core';
import {
  CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router
} from '@angular/router';
import { AuthService, UserProfile } from '../../shared/services/auth.service';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  private profile: UserProfile | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.auth.profile$.subscribe(p => this.profile = p);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const expectedRoles: string[] = route.data['roles'] || [];
    if (!this.profile) {
      this.router.navigate(['/landing']);
      return false;
    }
    if (expectedRoles.length && !expectedRoles.includes(this.profile.role)) {
      this.router.navigate(['/landing']);
      return false;
    }
    return true;
  }
}
