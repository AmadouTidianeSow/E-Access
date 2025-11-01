import { Component } from '@angular/core';
import { ReportsService } from '../services/reports.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  from?: Date;
  to?: Date;
  loading = false;
  error: string | null = null;

  constructor(private reports: ReportsService) {}

  // Export CSV pour une période prédéfinie
  exportPeriod(period: 'daily' | 'weekly' | 'monthly') {
    this.loading = true;
    this.error = null;
    this.reports.exportReport('csv', { period })
      .subscribe({
        next: file => {
          saveAs(file, file.name);
          this.loading = false;
        },
        error: () => {
          this.error = 'Échec de l’export CSV';
          this.loading = false;
        }
      });
  }

  // Export CSV pour période personnalisée
  exportCustom() {
    if (!this.from || !this.to) {
      this.error = 'Veuillez sélectionner une période.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.reports.exportReport('csv', {
      from: this.from.toISOString(),
      to:   this.to.toISOString(),
    }).subscribe({
      next: file => {
        saveAs(file, file.name);
        this.loading = false;
      },
      error: () => {
        this.error = 'Échec de l’export CSV';
        this.loading = false;
      }
    });
  }
}
