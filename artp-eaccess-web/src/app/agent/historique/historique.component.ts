import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AgentVisiteService,
  Visit,
  VisitorDetail
} from '../services/agent-visite.service';

interface Lookup { [id: string]: string }

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss'],
})
export class HistoriqueComponent implements OnInit {
  mode: 'visites' | 'visiteurs' = 'visites';
  filterForm: FormGroup;

  visits: Visit[] = [];
  filteredVisits: Visit[] = [];

  visitors: VisitorDetail[] = [];
  filteredVisitors: VisitorDetail[] = [];

  /** Dictionnaires pour les noms */
  typeMap: Lookup = {};
  lieuMap: Lookup = {};

  constructor(
    private fb: FormBuilder,
    private svc: AgentVisiteService,
  ) {
    this.filterForm = this.fb.group({
      from:   [null],
      to:     [null],
      statut: [''],
    });
  }

  ngOnInit(): void {
    // 1) Charger types et lieux
    this.svc.listVisitTypes().subscribe(list =>
      list.forEach(t => this.typeMap[t.id] = t.nom)
    );
    this.svc.listLocations().subscribe(list =>
      list.forEach(l => this.lieuMap[l.id] = l.nom)
    );

    // 2) Charger données historiques
    this.svc.listHistoriqueVisites().subscribe(vs => {
      this.visits = vs;
      this.filteredVisits = [...vs];
    });
    this.svc.listHistoriqueVisiteurs().subscribe(xs => {
      this.visitors = xs;
      this.filteredVisitors = [...xs];
    });
  }

  switchMode(mode: 'visites'|'visiteurs') {
    this.mode = mode;
    this.filterForm.reset({statut: ''});
    this.applyFilter();
  }

  applyFilter() {
    const {from, to, statut} = this.filterForm.value;
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs   = to   ? new Date(to).getTime()   : null;

    if (this.mode === 'visites') {
      this.filteredVisits = this.visits.filter(v => {
        const dt = new Date(v.dateDebut).getTime();
        return (!fromTs || dt >= fromTs)
            && (!toTs   || dt <= toTs)
            && (!statut || v.statut === statut);
      });
    } else {
      this.filteredVisitors = this.visitors.filter(x => {
        const ci = x.checkIn ? new Date(x.checkIn).getTime() : 0;
        return (!fromTs || ci >= fromTs)
            && (!toTs   || ci <= toTs)
            && (!statut || x.statut === statut);
      });
    }
  }

  resetFilter() {
    this.filterForm.reset({statut: ''});
    this.applyFilter();
  }
}
