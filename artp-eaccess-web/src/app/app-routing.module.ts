// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './auth/components/landing/landing.component';
import { LoginComponent }   from './auth/components/login/login.component';
import { AuthGuard }        from './core/guards/auth.guard';



const routes: Routes = [
  { path: '',              component: LandingComponent },
  { path: 'landing',       component: LandingComponent },
  { path: 'auth/login',    component: LoginComponent },

  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
      loadChildren: () =>
    import('./admin/admin.module').then(m => m.AdminModule),
  },

  {
    path: 'agent',
    canActivate: [AuthGuard],
    data: { roles: ['agent'] },
    loadChildren: () =>
    import('./agent/agent.module').then(m => m.AgentModule),
    
  },

  {
    path: 'employe',
    canActivate: [AuthGuard],
    data: { roles: ['employe'] },
    loadChildren: () =>
    import('./employe/employe.module').then(m => m.EmployeModule),
  },

  // wildcard doit rester **tout à la fin**
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
