import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AgentRoutingModule } from './agent-routing.module';
import { AgentLayoutComponent } from './layout/agent-layout.component';
import { AgentSidebarComponent } from './sidebar/agent-sidebar.component';
import { PendingVisitsComponent } from './pending-visits/pending-visits.component';
import { OngoingVisitsComponent } from './ongoing-visits/ongoing-visits.component';
import { VisiteDetailComponent }  from './visite-detail/visite-detail.component';
import { CreateManualComponent } from './create-manual/create-manual.component';
import { CreateScanComponent } from './create-scan/create-scan.component';
import { CompleteEnregistrementComponent } from './complete-enregistrement/complete-enregistrement.component';
import { SuiviVisiteursComponent } from './suivi-visiteurs/suivi-visiteurs.component';
import { HistoriqueComponent } from './historique/historique.component';
import { NotificationsComponent } from './notifications/notifications.component';





import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule }          from '@angular/material/tabs';
import { MatExpansionModule }     from '@angular/material/expansion';import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatButtonToggleModule }from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';


import { MatProgressSpinner } from '@angular/material/progress-spinner';








@NgModule({
  declarations: [
    AgentLayoutComponent,
    AgentSidebarComponent,
    PendingVisitsComponent,
    OngoingVisitsComponent,
    VisiteDetailComponent,
    CreateManualComponent,
    CreateScanComponent,
    CompleteEnregistrementComponent,
    SuiviVisiteursComponent,
    HistoriqueComponent,
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgentRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    FormsModule,
    MatTooltipModule

  ],
})
export class AgentModule {}
