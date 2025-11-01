// src/app/employe/declare-visit/declare-visit.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import {
  EmployeService,
  VisitType,
  Location,
  Visitor,
  Visit,
} from '../services/employe.service';

@Component({
  selector: 'app-declare-visit',
  templateUrl: './declare-visit.component.html',
  styleUrls: ['./declare-visit.component.scss'],
})
export class DeclareVisitComponent implements OnInit {
  visitForm!: FormGroup;
  types: VisitType[] = [];
  lieux: Location[] = [];
  submitting = false;
  result?: Visit;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService,
  ) {}

  ngOnInit(): void {
    this.visitForm = this.fb.group({
      mode:         ['manual', Validators.required],
      typeVisiteId: ['',      Validators.required],
      lieuId:       ['',      Validators.required],
      dateDebut:    [null,    Validators.required], 
      timeDebut:    ['',      Validators.required], 
      visitors:     this.fb.array([], Validators.required),
    });

    this.addVisitor();
    this.loadTypes();
    this.loadLieux();
  }

  get visitors(): FormArray {
    return this.visitForm.get('visitors') as FormArray;
  }

  addVisitor(): void {
    const grp = this.fb.group({
      nom:           ['', Validators.required],
      prenom:        ['', Validators.required],
      telephone:     [''],
      dateNaissance: [''],
      pieceType:     [''],
      pieceNumero:   [''],
      categorieId:   [''],
    });
    this.visitors.push(grp);
  }

  removeVisitor(i: number): void {
    this.visitors.removeAt(i);
  }

  private loadTypes(): void {
    this.employeService.listVisitTypes().subscribe({
      next: types => this.types = types,
      error: err => console.error('Erreur types', err),
    });
  }

  private loadLieux(): void {
    this.employeService.listLocations().subscribe({
      next: lieux => this.lieux = lieux,
      error: err => console.error('Erreur lieux', err),
    });
  }

  submit(): void {
    if (this.visitForm.invalid) {
      this.error = 'Veuillez compléter tous les champs obligatoires.';
      return;
    }
    this.error = null;
    this.submitting = true;
    this.result = undefined;

    // 1) Récupérer la date sélectionnée (objet Date)
    const date: Date = this.visitForm.value.dateDebut;
    // 2) Récupérer l'heure (string "HH:mm")
    const [hours, minutes] = (this.visitForm.value.timeDebut as string)
      .split(':')
      .map(Number);
    // 3) Appliquer l'heure à l'objet Date
    date.setHours(hours, minutes, 0, 0);
    // 4) Transformer en ISO
    const dateDebutIso = date.toISOString();

    const payload = {
      mode:         'manual' as const,
      typeVisiteId: this.visitForm.value.typeVisiteId,
      lieuId:       this.visitForm.value.lieuId,
      dateDebut:    dateDebutIso,
      visitors:     this.visitForm.value.visitors as Visitor[],
    };

    this.employeService.createVisit(payload).subscribe({
      next: visit => {
        this.result = visit;
        this.submitting = false;
      },
      error: err => {
        console.error(err);
        this.error = err.error?.message ?? err.message ?? 'Erreur lors de la création';
        this.submitting = false;
      },
    });
  }
}
