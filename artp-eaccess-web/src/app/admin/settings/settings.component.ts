// src/app/admin/settings/settings.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, SettingsPayload } from '../services/settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Initialise le form
    this.form = this.fb.group({
      horaires: this.fb.group({
        ouverture: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
        fermeture: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
      }),
      alertThresholds: this.fb.group({
        maxConcurrentVisits: [null, [Validators.required, Validators.min(1)]],
      }),
    });
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.settingsService.getSettings().subscribe({
      next: (s: SettingsPayload) => {
        this.form.patchValue(s);
        this.loading = false;
      },
      error: () => {
        this.snack.open('Échec du chargement des paramètres', 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.snack.open('Veuillez corriger les champs en rouge', 'OK', { duration: 3000 });
      return;
    }
    this.loading = true;
    const payload: Partial<SettingsPayload> = this.form.value;
    this.settingsService.updateSettings(payload).subscribe({
      next: () => {
        this.snack.open('Paramètres mis à jour', 'OK', { duration: 3000 });
        this.loading = false;
      },
      error: () => {
        this.snack.open('Erreur lors de la mise à jour', 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }
}
