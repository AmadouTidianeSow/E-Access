// src/app/agent/visite-detail/visite-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AgentVisiteService,
  Visit,
  VisitorDetail,
  NewVisitor,
} from '../services/agent-visite.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-visite-detail',
  templateUrl: './visite-detail.component.html',
  styleUrls: ['./visite-detail.component.scss'],
})
export class VisiteDetailComponent implements OnInit {
  visiteId!: string;
  visit?: Visit;
  visitors: VisitorDetail[] = [];
  loading = false;
  error: string | null = null;

  manualData: Record<string, NewVisitor> = {};

  constructor(
    private route: ActivatedRoute,
    private service: AgentVisiteService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.visiteId = this.route.snapshot.paramMap.get('id')!;
    this.loadDetail();
  }

  private loadDetail() {
    this.loading = true;
    this.error = null;
    this.service.getVisit(this.visiteId).subscribe({
      next: visit => {
        this.visit = visit;
        // pivot list comes back in visiteursLink
        this.visitors = (visit as any).visiteursLink as VisitorDetail[];

        // init manualData from nested `visiteur`
        this.visitors.forEach(v => {
          this.manualData[v.id] = {
            nom: v.visiteur.nom,
            prenom: v.visiteur.prenom,
            telephone: v.visiteur.telephone,
            dateNaissance: v.visiteur.dateNaissance || '',
            pieceType: v.visiteur.pieceType || '',
            pieceNumero: v.visiteur.pieceNumero || '',
            categorieId: v.visiteur.categorieId || '',
          };
        });

        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger le détail de la visite';
        this.loading = false;
      },
    });
  }

  onScan(pivotId: string, evt: Event) {
    const input = (evt.target as HTMLInputElement);
    if (!input.files?.length) return;
    const file = input.files[0];
    const form = new FormData();
    form.append('file', file);
    form.append('pieceType', this.manualData[pivotId].pieceType);

    this.service.completeVisitor(pivotId, form).subscribe({
      next: updated => {
        this.snack.open('Visiteur enregistré par OCR', 'OK', { duration: 3000 });
        this.replaceVisitor(pivotId, updated);
      },
      error: () => {
        this.snack.open('Échec de l’OCR, réessayez ou saisie manuelle', 'OK');
      },
    });
  }

  onManual(pivotId: string) {
    const data = this.manualData[pivotId];
    this.service
      .confirmPreEnregistrementVisitor(this.visiteId, pivotId, data)
      .subscribe({
        next: updated => {
          this.snack.open('Saisie manuelle enregistrée', 'OK', { duration: 3000 });
          this.replaceVisitor(pivotId, updated);
        },
        error: () => {
          this.snack.open('Échec de la saisie manuelle', 'OK');
        },
      });
  }

  onCheckout(pivotId: string) {
    this.service.checkOutVisitor(pivotId).subscribe({
      next: updated => {
        this.snack.open('Check‑out effectué', 'OK', { duration: 3000 });
        this.replaceVisitor(pivotId, updated);
      },
      error: () => {
        this.snack.open('Impossible de faire le check‑out', 'OK');
      },
    });
  }

  private replaceVisitor(pivotId: string, updated: VisitorDetail) {
    const idx = this.visitors.findIndex(v => v.id === pivotId);
    if (idx !== -1) this.visitors[idx] = updated;
  }
}
