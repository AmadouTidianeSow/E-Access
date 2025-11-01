import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgentVisiteService, Visit } from '../services/agent-visite.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pending-visits',
  templateUrl: './pending-visits.component.html',
  styleUrls: ['./pending-visits.component.scss'],
})
export class PendingVisitsComponent implements OnInit {
  visites: Visit[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private service: AgentVisiteService,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.error = null;
    this.service.listPending().subscribe({
      next: list => {
        this.visites = list;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Échec du chargement des visites en attente';
        this.snack.open(this.error, 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  /** Redirige vers la page de détail (complétion OCR) */
complete(id: string): void {
  // anciennement this.router.navigate(['/agent', 'visites', id]);
  this.router.navigate(['/agent', 'visites', id, 'complete']);
}
}
