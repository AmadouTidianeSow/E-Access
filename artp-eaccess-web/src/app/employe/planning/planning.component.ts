// src/app/employe/planning/planning.component.ts

import { Component, OnInit } from '@angular/core';
import { MatDialog }        from '@angular/material/dialog';
import { MatSnackBar }      from '@angular/material/snack-bar';
import {
  EmployeService,
  Visit,
  VisitType,
  Location,
} from '../services/employe.service';



@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss'],
})
export class PlanningComponent implements OnInit {
  visites: Visit[]    = [];
  types:    VisitType[]  = [];
  lieux:    Location[]   = [];
  loading = true;
  columns = ['dateDebut', 'statut', 'nombreVisiteurs', 'actions'];

  constructor(
    private service: EmployeService,
    private dialog:  MatDialog,
    private snack:   MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Charger les référentiels
    this.service.listVisitTypes().subscribe({
      next: types => this.types = types,
      error: err => this.snack.open('Erreur chargement types','OK',{duration:3000}),
    });
    this.service.listLocations().subscribe({
      next: lieux => this.lieux = lieux,
      error: err => this.snack.open('Erreur chargement lieux','OK',{duration:3000}),
    });

    this.loadPlanning();
  }

  loadPlanning(): void {
    this.loading = true;
    this.service.listPlanning().subscribe({
      next: list => {
        this.visites = list;
        this.loading = false;
      },
      error: () => {
        this.snack.open('Erreur de chargement','OK',{duration:3000});
        this.loading = false;
      },
    });
  }



  onCancel(visite: Visit): void {
    if (!confirm('Confirmer annulation ?')) { return; }
    this.service.updateVisit(visite.id, { statut: 'annulee' }).subscribe({
      next: () => {
        this.snack.open('Visite annulée','OK',{duration:2000});
        this.loadPlanning();
      },
      error: () => this.snack.open('Échec annulation','OK',{duration:3000}),
    });
  }
}
