// src/app/employe/employe.module.ts
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { ReactiveFormsModule }from '@angular/forms';
import { RouterModule }       from '@angular/router';

import { EmployeRoutingModule }      from './employe-routing.module';
import { EmployeLayoutComponent }    from './layout/employe-layout.component';
import { EmployeSidebarComponent }   from './sidebar/employe-sidebar.component';
import { DashboardComponent }      from './dashboard/dashboard.component';
import { DeclareVisitComponent }     from './declare-visit/declare-visit.component';
import { PlanningComponent }         from './planning/planning.component';
import { HistoryComponent }          from './history/history.component';
import { EditVisitPageComponent } from './edit-visit-page/edit-visit-page.component';  
import { NotificationsComponent } from './notifications/notifications.component';
import { VisitesImpromptuesComponent } from './visites-impromptues/visites-impromptues.component';


// … Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule }  from '@angular/material/core';







@NgModule({
  declarations: [
    EmployeLayoutComponent,
    EmployeSidebarComponent,
    DashboardComponent,
    DeclareVisitComponent,
    PlanningComponent,
    HistoryComponent,
    EditVisitPageComponent,
    NotificationsComponent,
    VisitesImpromptuesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    EmployeRoutingModule,
     MatButtonModule,
        MatIconModule,
        MatToolbarModule,    
        MatSidenavModule,
        MatListModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        MatSnackBarModule,
        MatSelectModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,  // Nécessaire pour les datepickers
        

  ],
})
export class EmployeModule {}
