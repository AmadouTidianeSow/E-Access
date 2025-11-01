import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgentVisiteService, NewVisitor } from '../services/agent-visite.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-manual',
  templateUrl: './create-manual.component.html',
  styleUrls: ['./create-manual.component.scss'],
})
export class CreateManualComponent implements OnInit {
  form!: FormGroup;
  employees: Array<{id:string, nom:string, prenom:string}> = [];
  visitTypes: Array<{id:string, nom:string}> = [];
  locations: Array<{id:string, nom:string}> = [];
  categories: Array<{id:string, nom:string}> = [];

  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private service: AgentVisiteService,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire
    this.form = this.fb.group({
      mode: ['manual', Validators.required],
      employeId: ['', Validators.required],
      typeVisiteId: ['', Validators.required],
      lieuId: ['', Validators.required],
      visitors: this.fb.array([] as FormGroup[], Validators.required),
    });

    // Charger les listes déroulantes
    this.service.listEmployees().subscribe(e => this.employees = e);
    this.service.listVisitTypes().subscribe(t => this.visitTypes = t);
    this.service.listLocations().subscribe(l => this.locations = l);
    this.service.listVisitorCategories().subscribe(c => this.categories = c);

    // On démarre avec un visiteur vide
    this.addVisitor();
  }

  // Accès rapide au FormArray
  get visitors(): FormArray {
    return this.form.get('visitors') as FormArray;
  }

  // Crée un FormGroup pour un visiteur
  private createVisitorGroup(data?: Partial<NewVisitor>): FormGroup {
    return this.fb.group({
      nom: [data?.nom || '', Validators.required],
      prenom: [data?.prenom || '', Validators.required],
      telephone: [data?.telephone || ''],
      dateNaissance: [data?.dateNaissance || ''],
      pieceType: [data?.pieceType || '', Validators.required],
      pieceNumero: [data?.pieceNumero || '', Validators.required],
      categorieId: [data?.categorieId || '', Validators.required],
    });
  }

  // Ajouter un visiteur au formulaire
  addVisitor(): void {
    this.visitors.push(this.createVisitorGroup());
  }

  // Supprimer un visiteur
  removeVisitor(index: number): void {
    this.visitors.removeAt(index);
  }

  // Soumission du formulaire
  submit(): void {
    if (this.form.invalid) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    this.loading = true;
    this.error = null;
    const payload = {
      ...this.form.value,
      // mode est déjà 'manual'
      visitors: this.visitors.value as NewVisitor[],
    };
    this.service.createManual(payload).subscribe({
      next: visite => {
        this.snack.open('Visite créée avec succès', 'OK', {duration: 3000});
        this.router.navigate(['/agent/visites/pending']);
      },
      error: err => {
        console.error(err);
        this.error = 'Impossible de créer la visite. Réessayez plus tard.';
        this.loading = false;
      }
    });
  }
}
