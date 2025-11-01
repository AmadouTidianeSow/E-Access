// src/app/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';    
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDatepickerToggle } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule }    from '@angular/material/button-toggle';  




import { AdminLayoutComponent } from './layout/admin-layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersRolesComponent } from './users-roles/users-roles.component';
import { CategoriesComponent } from './categories/categories.component';
import { VisitTypesComponent } from './visit-types/visit-types.component';
import { LocationsComponent } from './locations/locations.component';
import { SettingsComponent } from './settings/settings.component';
import { ReportsComponent } from './reports/reports.component';
import { HistoriqueComponent } from './historique/historique.component';


@NgModule({
  declarations: [
    AdminLayoutComponent,
    SidebarComponent,
    DashboardComponent,
    UsersRolesComponent,
    CategoriesComponent,
    VisitTypesComponent,
    LocationsComponent,
    SettingsComponent,
    ReportsComponent,
    HistoriqueComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminRoutingModule,
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
    NgChartsModule,
    MatTooltipModule,
    MatNativeDateModule,
    FormsModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatButtonModule,
    MatButtonToggleModule,
  ],
})
export class AdminModule {}
