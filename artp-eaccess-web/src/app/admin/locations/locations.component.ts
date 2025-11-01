
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationsService, Location } from '../services/locations.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
  locations: Location[] = [];
  createForm!: FormGroup;
  editForm!: FormGroup;
  editingId: string | null = null;

  constructor(
    private svc: LocationsService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.load();
    this.createForm = this.fb.group({
      nom: ['', Validators.required],
    });
  }

  /** Recharge la liste depuis le serveur */
  load() {
    this.svc.list().subscribe(list => this.locations = list);
  }

  /** Créer un nouveau lieu */
  create() {
    if (this.createForm.invalid) return;
    this.svc.create(this.createForm.value).subscribe(() => {
      this.createForm.reset();
      this.load();
    });
  }

  /** Passage en mode édition */
  startEdit(loc: Location) {
    this.editingId = loc.id;
    this.editForm = this.fb.group({
      nom: [loc.nom, Validators.required],
    });
  }

  /** Sauvegarder la modification */
  saveEdit() {
    if (!this.editingId || this.editForm.invalid) return;
    this.svc.update(this.editingId, this.editForm.value).subscribe(() => {
      this.editingId = null;
      this.load();
    });
  }

  /** Annuler l’édition */
  cancelEdit() {
    this.editingId = null;
  }

  /** Supprimer un lieu */
  delete(loc: Location) {
    if (!confirm(`Supprimer le lieu : "${loc.nom}" ?`)) return;
    this.svc.delete(loc.id).subscribe(() => this.load());
  }
}
