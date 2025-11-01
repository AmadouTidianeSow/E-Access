import { Component, OnInit } from '@angular/core';
import { EmployeService, Visit } from '../services/employe.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-visites-impromptues',
  templateUrl: './visites-impromptues.component.html',
  styleUrls: ['./visites-impromptues.component.scss'],
})
export class VisitesImpromptuesComponent implements OnInit {
  visits: Visit[] = [];
  loading = false;
  error: string | null = null;

  constructor(private employeService: EmployeService) {}

  ngOnInit(): void {
    this.loadVisits();
  }

  loadVisits(): void {
    this.loading = true;
    this.error = null;
    this.employeService.listImpromptues()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: vs => (this.visits = vs),
        error: err => {
          console.error(err);
          this.error = "Impossible de charger les visites impromptues";
        },
      });
  }

  accept(visit: Visit): void {
    this.employeService.decideVisit(visit.id, 'accept').subscribe({
      next: () => this.removeVisit(visit.id),
      error: err => console.error('Erreur acceptation', err),
    });
  }

  refuse(visit: Visit): void {
    this.employeService.decideVisit(visit.id, 'refuse').subscribe({
      next: () => this.removeVisit(visit.id),
      error: err => console.error('Erreur refus', err),
    });
  }

  private removeVisit(id: string) {
    this.visits = this.visits.filter(v => v.id !== id);
  }
}
