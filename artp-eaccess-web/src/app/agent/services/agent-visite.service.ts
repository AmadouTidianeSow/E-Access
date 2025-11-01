// src/app/agent/services/agent-visite.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Identité basique d’un visiteur (injection via pivot.visiteur) */
export interface NewVisitor {
  nom: string;
  prenom: string;
  telephone?: string;
  dateNaissance?: string;
  pieceType?: string;
  pieceNumero?: string;
  categorieId?: string;
}

/** Pivot + visiteur embarqué pour check‑in/check‑out */
export interface VisitorDetail {
  id: string;                 // pivotId
  visiteId: string;
  visiteurId: string;
  checkIn?: string;
  checkOut?: string;
  statut: 'pending' | 'checked_in' | 'checked_out';
  visiteur: NewVisitor;
   visite?: {
    id: string;
    dateDebut: string;
    dateFin?: string;
    statut: 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
    // tu peux ajouter d'autres champs si nécessaire
  };
}

/** Visite avec sa relation pivot‑visiteur */
export interface Visit {
  id: string;
  employeId: string;
  agentId: string;
  typeVisiteId: string;
  lieuId: string;
  dateDebut: string;
  dateFin?: string;
  statut: 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
  nombreVisiteurs: number;
  visiteursLink: VisitorDetail[];
}

@Injectable({ providedIn: 'root' })
export class AgentVisiteService {
  private readonly base       = 'http://localhost:3000/agent/visites';
  private readonly baseAdmin  = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) {}

  /** 1) Liste des visites impromptues en attente */
  listPending(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.base}/pending`);
  }

  /** 2) Liste des visites en cours pour cet agent */
  listOngoing(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.base}/ongoing`);
  }

  /** 3) Prévisualisation OCR pour création impromptue */
  previewScan(form: FormData): Observable<NewVisitor[]> {
    return this.http.post<NewVisitor[]>(
      `${this.base}/scan/preview`,
      form
    );
  }

  /** 4) Confirmation création impromptue après correction */
  confirmScan(payload: {
    employeId: string;
    agentId: string;
    typeVisiteId: string;
    lieuId: string;
    visitors: NewVisitor[];
  }): Observable<Visit> {
    return this.http.post<Visit>(
      `${this.base}/scan`,
      payload
    );
  }

  /** 5) Création manuelle impromptue */
  createManual(data: {
    mode: 'manual';
    employeId: string;
    typeVisiteId: string;
    lieuId: string;
    visitors: NewVisitor[];
  }): Observable<Visit> {
    return this.http.post<Visit>(
      `${this.base}/manual`,
      data
    );
  }

  /** 6) Décision employé sur une impromptue (exemple, à déplacer dans EmployeService) */
  decideVisit(id: string, decision: 'accept'|'refuse'): Observable<void> {
    return this.http.patch<void>(
      `${this.base}/${id}/decision`,
      {decision}
    );
  }

  /** 7) Prévisualisation OCR pour compléter un visiteur planifié */
  previewPreEnregistrementVisitor(
    visiteId: string,
    pivotId: string,
    form: FormData
  ): Observable<NewVisitor[]> {
    return this.http.patch<NewVisitor[]>(
      `${this.base}/${visiteId}/visitor/${pivotId}/preview`,
      form
    );
  }

  /** 8) Confirmation manuelle / post‑OCR d’un visiteur planifié */
  confirmPreEnregistrementVisitor(
    visiteId: string,
    pivotId: string,
    data: NewVisitor
  ): Observable<VisitorDetail> {
    return this.http.patch<VisitorDetail>(
      `${this.base}/${visiteId}/visitor/${pivotId}/confirm`,
      data
    );
  }

  /** 9) Check‑in manuel (sans OCR) d’un visiteur planifié */
  checkInVisitor(pivotId: string): Observable<VisitorDetail> {
    return this.http.patch<VisitorDetail>(
      `${this.base}/visitor/${pivotId}/checkin`,
      {}
    );
  }

  /** 10) Check‑out manuel d’un visiteur */
  checkOutVisitor(pivotId: string): Observable<VisitorDetail> {
    return this.http.patch<VisitorDetail>(
      `${this.base}/visitor/${pivotId}/checkout`,
      {}
    );
  }

  /** 11) Clôturer une visite */
  finishVisit(id: string): Observable<void> {
    return this.http.patch<void>(
      `${this.base}/${id}/finish`,
      {}
    );
  }

  /** 12) Récupérer le détail complet d’une visite */
  getVisit(id: string): Observable<Visit> {
    return this.http.get<Visit>(
      `${this.base}/${id}`
    );
  }

  /** 13) Lister tous les visiteurs checked_in (tous agents confondus) */
  listCheckedInVisitors(): Observable<VisitorDetail[]> {
    return this.http.get<VisitorDetail[]>(
      `${this.base}/checked-in`
    );
  }

  /** --- Méthodes admin auxiliaires --- */

  listEmployees(): Observable<{id:string, nom:string, prenom:string}[]> {
    return this.http.get<{id:string, nom:string, prenom:string}[]>(
      `${this.baseAdmin}/users?filter[where][role]=employe`
    );
  }

  listVisitTypes(): Observable<{id:string, nom:string}[]> {
    return this.http.get<{id:string, nom:string}[]>(
      `${this.baseAdmin}/typevisite`
    );
  }

  listLocations(): Observable<{id:string, nom:string}[]> {
    return this.http.get<{id:string, nom:string}[]>(
      `${this.baseAdmin}/lieux`
    );
  }

  listVisitorCategories(): Observable<{id:string, nom:string}[]> {
    return this.http.get<{id:string, nom:string}[]>(
      `${this.baseAdmin}/categories`
    );
  }

    /** 12) OCR + check‑in pour un visiteur planifié */
  completeVisitor(pivotId: string, form: FormData): Observable<VisitorDetail> {
    return this.http.patch<VisitorDetail>(
      `${this.base}/visitor/${pivotId}/complete`,
      form
    );
  }

   /** 14) Historiques : liste des visites selon filtres */
  listHistoriqueVisites(params?: {
    from?: string;
    to?: string;
    statut?: string;
    typeVisiteId?: string;
    lieuId?: string;
  }): Observable<Visit[]> {
    const qp = new URLSearchParams(params as any).toString();
    return this.http.get<Visit[]>(`${this.base}/historique/visites?${qp}`);
  }

  /** 15) Historiques : liste des visiteurs selon filtres */
  listHistoriqueVisiteurs(params?: {
    statut?: string;
    checkInFrom?: string;
    checkInTo?: string;
    checkOutFrom?: string;
    checkOutTo?: string;
  }): Observable<VisitorDetail[]> {
    const qp = new URLSearchParams(params as any).toString();
    return this.http.get<VisitorDetail[]>(`${this.base}/historique/visiteurs?${qp}`);
  }
}
