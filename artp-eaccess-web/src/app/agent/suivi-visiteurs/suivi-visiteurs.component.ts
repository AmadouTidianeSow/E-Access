// src/app/agent/suivi-visiteurs/suivi-visiteurs.component.ts

import { Component, OnInit } from '@angular/core';
import { AgentVisiteService, VisitorDetail } from '../services/agent-visite.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-suivi-visiteurs',
  templateUrl: './suivi-visiteurs.component.html',
  styleUrls: ['./suivi-visiteurs.component.scss'],
})
export class SuiviVisiteursComponent implements OnInit {
  visitors: VisitorDetail[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private service: AgentVisiteService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadCheckedIn();
  }

  loadCheckedIn(): void {
    this.loading = true;
    this.error = null;
    this.service.listCheckedInVisitors().subscribe({
      next: list => {
        // Optionnel : ne garder que ceux dont la visite est "en_cours"
        this.visitors = list.filter(v => v.visite?.statut === 'en_cours');
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Impossible de charger les visiteurs check‑in';
        this.snack.open(this.error, 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  checkout(v: VisitorDetail): void {
    this.service.checkOutVisitor(v.id).subscribe({
      next: updated => {
        this.snack.open(`Check‑out effectué pour ${updated.visiteur.prenom}`, 'OK', { duration: 3000 });
        // Retirer de la liste
        this.visitors = this.visitors.filter(x => x.id !== v.id);
      },
      error: err => {
        console.error(err);
        this.snack.open('Échec du check‑out', 'OK');
      },
    });
  }
}
