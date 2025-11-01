import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentLayoutComponent } from './layout/agent-layout.component';
import { PendingVisitsComponent } from './pending-visits/pending-visits.component';
import { OngoingVisitsComponent } from './ongoing-visits/ongoing-visits.component';
import { VisiteDetailComponent } from './visite-detail/visite-detail.component';
import { CreateManualComponent } from './create-manual/create-manual.component';
import { CreateScanComponent } from './create-scan/create-scan.component';
import { CompleteEnregistrementComponent } from './complete-enregistrement/complete-enregistrement.component';
import { SuiviVisiteursComponent } from './suivi-visiteurs/suivi-visiteurs.component';
import { HistoriqueComponent } from './historique/historique.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  {
    // NOTE : ici on n’écrit PLUS 'agent'
    path: '',
    component: AgentLayoutComponent,
    children: [
      // défaut /agent → /agent/pending
      { path: '', redirectTo: 'pending', pathMatch: 'full' },

      { path: 'pending', component: PendingVisitsComponent },
      { path: 'ongoing', component: OngoingVisitsComponent },
      { path: 'visites/:id', component: VisiteDetailComponent },
      { path: 'create/manual', component: CreateManualComponent },
      { path: 'create/scan', component: CreateScanComponent },
      { path: 'visites/:id/complete', component: CompleteEnregistrementComponent },
      { path: 'checked-in', component: SuiviVisiteursComponent },
      { path: 'historique',    component: HistoriqueComponent },
      { path: 'notifications', component: NotificationsComponent },

      // wildcard local : redirige vers pending
      { path: '**', redirectTo: 'pending' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentRoutingModule {}
