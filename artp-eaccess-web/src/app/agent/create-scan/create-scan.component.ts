import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AgentVisiteService, NewVisitor } from '../services/agent-visite.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-scan',
  templateUrl: './create-scan.component.html',
  styleUrls: ['./create-scan.component.scss'],
})
export class CreateScanComponent implements OnInit {
  form!: FormGroup;
  visitorsArray!: FormArray;
  employees: Array<{id: string; nom: string; prenom: string}> = [];
  types: Array<{id: string; nom: string}> = [];
  locations: Array<{id: string; nom: string}> = [];
  previewDone = false;
  loadingPreview = false;
  loadingSubmit = false;

  /** true si on est sur mobile ou tablette */
  isMobileOrTablet = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    .test(navigator.userAgent);

  constructor(
    private fb: FormBuilder,
    private service: AgentVisiteService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // 1) construire le form
    this.form = this.fb.group({
      employeId:    ['', Validators.required],
      typeVisiteId: ['', Validators.required],
      lieuId:       ['', Validators.required],
      pieceType:    ['', Validators.required],
      file:         [null, Validators.required],
      visitors:     this.fb.array([]),
    });
    this.visitorsArray = this.form.get('visitors') as FormArray;

    // 2) charger dropdowns
    this.service.listEmployees().subscribe(list => this.employees = list);
    this.service.listVisitTypes().subscribe(list => this.types     = list);
    this.service.listLocations().subscribe(list => this.locations = list);
  }

  /** appelée au changement du fichier / photo */
  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.form.patchValue({ file });
    this.previewOCR();
  }

  /** appelle le preview OCR */
  previewOCR() {
    if (this.form.invalid) {
      this.snack.open('Veuillez remplir tous les champs avant le scan', 'OK', { duration: 3000 });
      return;
    }
    this.loadingPreview = true;
    const fd = new FormData();
    fd.append('file', this.form.value.file);
    fd.append('pieceType', this.form.value.pieceType);
    this.service.previewScan(fd).subscribe({
      next: (visitors: NewVisitor[]) => {
        this.visitorsArray.clear();
        visitors.forEach(v => {
          this.visitorsArray.push(this.fb.group({
            nom:          [v.nom, Validators.required],
            prenom:       [v.prenom, Validators.required],
            pieceType:    [v.pieceType, Validators.required],
            pieceNumero:  [v.pieceNumero, Validators.required],
            telephone:    [v.telephone || ''],
            dateNaissance:[v.dateNaissance || ''],
            categorieId:  [v.categorieId || ''],
          }));
        });
        this.previewDone = true;
        this.loadingPreview = false;
      },
      error: err => {
        console.error(err);
        this.snack.open('OCR illisible, réessayez ou passez en manuel', 'OK', { duration: 3000 });
        this.loadingPreview = false;
      }
    });
  }

  /** soumet la création de visite après correction éventuelle */
  submit() {
    if (this.form.invalid || this.visitorsArray.length === 0) {
      this.snack.open('Formulaire incomplet', 'OK', { duration: 3000 });
      return;
    }
    this.loadingSubmit = true;
    const payload = {
      employeId:    this.form.value.employeId,
      agentId:      '',
      typeVisiteId: this.form.value.typeVisiteId,
      lieuId:       this.form.value.lieuId,
      visitors:     this.visitorsArray.value as NewVisitor[],
    };
    this.service.confirmScan(payload).subscribe({
      next: () => {
        this.snack.open('Visite créée avec succès', 'OK', { duration: 3000 });
        this.loadingSubmit = false;
      },
      error: err => {
        console.error(err);
        this.snack.open('Erreur lors de la création', 'OK', { duration: 3000 });
        this.loadingSubmit = false;
      }
    });
  }
}
