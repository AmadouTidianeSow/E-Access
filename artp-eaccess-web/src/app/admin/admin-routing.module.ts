import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersRolesComponent } from './users-roles/users-roles.component';
import { CategoriesComponent } from './categories/categories.component';
import { VisitTypesComponent } from './visit-types/visit-types.component';
import { LocationsComponent } from './locations/locations.component';
import { SettingsComponent } from './settings/settings.component';
import { ReportsComponent } from './reports/reports.component';
import { HistoriqueComponent } from './historique/historique.component';


const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
     children: [
      { path: 'home',       component: DashboardComponent },
      { path: 'users',      component: UsersRolesComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'types',      component: VisitTypesComponent },
      { path: 'locations',  component: LocationsComponent },
      { path: 'settings',   component: SettingsComponent },
      { path: 'reports',    component: ReportsComponent },
      { path: 'historique', component: HistoriqueComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
