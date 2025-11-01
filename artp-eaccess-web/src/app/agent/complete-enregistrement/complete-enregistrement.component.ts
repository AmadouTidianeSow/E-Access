import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AgentVisiteService,
  VisitorDetail,
  NewVisitor,
  Visit,
} from '../services/agent-visite.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-complete-enregistrement',
  templateUrl: './complete-enregistrement.component.html',
  styleUrls: ['./complete-enregistrement.component.scss'],
})
export class CompleteEnregistrementComponent implements OnInit {
  visiteId!: string;
  visit?: Visit;
  visitors: VisitorDetail[] = [];
  loading = false;
  error: string | null = null;

  // Un FormGroup par visiteur pending
  visitorForms: Record<string, FormGroup> = {};

  // Flag pour savoir si on est sur mobile/tablette
  isMobileOrTablet = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );

  constructor(
    private route: ActivatedRoute,
    private service: AgentVisiteService,
    private snack: MatSnackBar,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.visiteId = this.route.snapshot.paramMap.get('id')!;
    this.loadVisit();
  }

  private loadVisit() {
    this.loading = true;
    this.error = null;
    this.service.getVisit(this.visiteId).subscribe({
      next: visit => {
        this.visit = visit;
        this.visitors = visit.visiteursLink.filter(v => v.statut === 'pending');
        this.visitors.forEach(v => {
          const init = v.visiteur;
          this.visitorForms[v.id] = this.fb.group({
            nom: [init.nom, Validators.required],
            prenom: [init.prenom, Validators.required],
            telephone: [init.telephone || ''],
            dateNaissance: [init.dateNaissance || ''],
            pieceType: [init.pieceType || '', Validators.required],
            pieceNumero: [init.pieceNumero || '', Validators.required],
          });
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de récupérer la visite';
        this.loading = false;
      },
    });
  }

  /** Ouvre le dialogue fichier (ou caméra sur mobile) */
  triggerScan(pivotId: string) {
    const el = document.getElementById(`scan-${pivotId}`) as HTMLInputElement;
    if (el) el.click();
  }

  /** Après sélection du fichier, lance la prévisualisation OCR */
  onScan(v: VisitorDetail, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const form = new FormData();
    form.append('file', file);
    form.append('pieceType', this.visitorForms[v.id].get('pieceType')!.value);

    this.service
      .previewPreEnregistrementVisitor(this.visiteId, v.id, form)
      .subscribe({
        next: ([ocr]) => {
          this.visitorForms[v.id].patchValue(ocr);
          this.snack.open('OCR pré-rempli, vérifiez et validez', 'OK', {
            duration: 3000,
          });
        },
        error: () => {
          this.snack.open('OCR illisible, passez en manuel', 'OK');
        },
      });
  }

  /** Valide le formulaire et retire le visiteur de la liste */
  confirm(v: VisitorDetail) {
    const form = this.visitorForms[v.id];
    if (form.invalid) {
      this.snack.open('Champs obligatoires manquants', 'OK');
      return;
    }
    const data: NewVisitor = form.value;
    this.service
      .confirmPreEnregistrementVisitor(this.visiteId, v.id, data)
      .subscribe({
        next: () => {
          this.snack.open('Visiteur complété', 'OK', { duration: 3000 });
          this.visitors = this.visitors.filter(x => x.id !== v.id);
        },
        error: () => {
          this.snack.open('Erreur lors de la validation', 'OK');
        },
      });
  }
}
