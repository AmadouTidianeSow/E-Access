// src/app/admin/visit-types/visit-types.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitTypesService, VisitType } from '../services/visit-types.service';

@Component({
  selector: 'app-visit-types',
  templateUrl: './visit-types.component.html',
  styleUrls: ['./visit-types.component.scss'],
})
export class VisitTypesComponent implements OnInit {
  types: VisitType[] = [];
  createForm!: FormGroup;
  editForm!: FormGroup;
  editingId: string | null = null;

  constructor(
    private svc: VisitTypesService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.load();
    this.createForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],    // pas de Validators.required
    });
  }

  load() {
    this.svc.list().subscribe(types => this.types = types);
  }

  create() {
    if (this.createForm.invalid) return;
    this.svc.create(this.createForm.value).subscribe(() => {
      this.createForm.reset();
      this.load();
    });
  }

  startEdit(t: VisitType) {
    this.editingId = t.id;
    this.editForm = this.fb.group({
      nom: [t.nom, Validators.required],
      description: [t.description || ''],
    });
  }

  saveEdit() {
    if (!this.editingId || this.editForm.invalid) return;
    this.svc.update(this.editingId, this.editForm.value).subscribe(() => {
      this.editingId = null;
      this.load();
    });
  }

  cancelEdit() {
    this.editingId = null;
  }

  delete(t: VisitType) {
    if (!confirm(`Supprimer le type "${t.nom}" ?`)) return;
    this.svc.delete(t.id).subscribe(() => this.load());
  }
}
