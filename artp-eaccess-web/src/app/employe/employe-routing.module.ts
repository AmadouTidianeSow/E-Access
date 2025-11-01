// src/app/employe/employe-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeLayoutComponent } from './layout/employe-layout.component';
import { DeclareVisitComponent } from './declare-visit/declare-visit.component';
import { PlanningComponent } from './planning/planning.component';
import { HistoryComponent } from './history/history.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditVisitPageComponent } from './edit-visit-page/edit-visit-page.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { VisitesImpromptuesComponent } from './visites-impromptues/visites-impromptues.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeLayoutComponent,
    children: [
      { path: 'home', component: DashboardComponent },
      { path: 'visites/new', component: DeclareVisitComponent },
      { path: 'visites/planning', component: PlanningComponent },
      { path: 'visites/history', component: HistoryComponent },
      { path: 'visites/edit/:id', component: EditVisitPageComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'visites/impromptues', component: VisitesImpromptuesComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeRoutingModule {}
