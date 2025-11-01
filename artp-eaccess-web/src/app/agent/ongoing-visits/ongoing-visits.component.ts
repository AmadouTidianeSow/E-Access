import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgentVisiteService, Visit } from '../services/agent-visite.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ongoing-visits',
  templateUrl: './ongoing-visits.component.html',
  styleUrls: ['./ongoing-visits.component.scss'],
})
export class OngoingVisitsComponent implements OnInit {
  visites: Visit[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private service: AgentVisiteService,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadOngoing();
  }

  loadOngoing(): void {
    this.loading = true;
    this.error = null;
    this.service.listOngoing().subscribe({
      next: list => {
        this.visites = list;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Échec du chargement des visites en cours';
        this.snack.open(this.error, 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  viewDetail(id: string): void {
    this.router.navigate(['/agent', 'visites', id]);
  }
}
