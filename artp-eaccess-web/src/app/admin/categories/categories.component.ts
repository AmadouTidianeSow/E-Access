

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriesService, Category } from '../services/categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  createForm!: FormGroup;
  editForm!: FormGroup;
  editingId: string | null = null;

  constructor(
    private svc: CategoriesService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.load();
    this.createForm = this.fb.group({
      nom: ['', Validators.required],
    });
  }

  load() {
    this.svc.list().subscribe(list => this.categories = list);
  }

  create() {
    if (this.createForm.invalid) return;
    this.svc.create(this.createForm.value).subscribe(() => {
      this.createForm.reset();
      this.load();
    });
  }

  startEdit(cat: Category) {
    this.editingId = cat.id;
    this.editForm = this.fb.group({
      nom: [cat.nom, Validators.required],
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

  delete(cat: Category) {
    if (!confirm(`Supprimer la catégorie : "${cat.nom}" ?`)) return;
    this.svc.delete(cat.id).subscribe(() => this.load());
  }
}
