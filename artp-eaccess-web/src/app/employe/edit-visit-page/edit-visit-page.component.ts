import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeService, VisitType, Location, Visit } from '../services/employe.service';

@Component({
  selector: 'app-edit-visit-page',
  templateUrl: './edit-visit-page.component.html',
  styleUrls: ['./edit-visit-page.component.scss']
})
export class EditVisitPageComponent implements OnInit {
  form!: FormGroup;
  visitId!: string;
  types: VisitType[] = [];
  lieux: Location[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: EmployeService,
  ) {}

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get('id')!;
    // construire le form
    this.form = this.fb.group({
      dateDebut: ['', Validators.required],
      typeVisiteId: ['', Validators.required],
      lieuId: ['', Validators.required],
      statut: ['', Validators.required],
    });

    // charger référentiels
    this.service.listVisitTypes().subscribe(t => this.types = t);
    this.service.listLocations().subscribe(l => this.lieux = l);

    // charger la visite existante
    this.service.listPlanning().subscribe(visites => {
      const v = visites.find(x => x.id === this.visitId)!;
      this.form.patchValue({
        dateDebut: v.dateDebut,
        typeVisiteId: v.typeVisiteId,
        lieuId: v.lieuId,
        statut: v.statut,
      });
      this.loading = false;
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }
    this.error = null;
    const payload = {
      dateDebut: new Date(this.form.value.dateDebut).toISOString(),
      typeVisiteId: this.form.value.typeVisiteId,
      lieuId: this.form.value.lieuId,
      statut: this.form.value.statut,
    };
    this.service.updateVisit(this.visitId, payload).subscribe({
      next: () => this.router.navigate(['/employe', 'visites', 'planning']),
      error: err => this.error = err.error?.message ?? 'Échec de la mise à jour',
    });
  }

  cancel(): void {
    this.router.navigate(['/employe', 'visites', 'planning']);
  }
}
