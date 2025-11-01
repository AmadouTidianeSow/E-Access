// src/app/admin/historique/historique.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VisiteWithRelations {
  id: string;
  dateDebut: string;
  dateFin?: string;
  statut: 'en_attente'|'en_cours'|'terminee'|'annulee';
  nombreVisiteurs: number;
  typeVisiteId: string;
  employeId: string;
  agentId: string;
  lieuId: string;
  visiteursLink?: any[]; // si besoin
}

export interface VisitorDetail {
  id: string;
  visiteId: string;
  visiteurId: string;
  checkIn?: string;
  checkOut?: string;
  statut: 'pending'|'checked_in'|'checked_out';
  visiteur: {
    nom: string;
    prenom: string;
    telephone?: string;
    dateNaissance?: string;
    pieceType?: string;
    pieceNumero?: string;
  };
}

export interface LookupItem { id: string; nom: string }

@Injectable({ providedIn: 'root' })
export class HistoriqueService {
  private base = 'http://localhost:3000/agent/visites';

  constructor(private http: HttpClient) {}

  listVisites(params?: {from?:string; to?:string; statut?:string})
    : Observable<VisiteWithRelations[]> {
    let qp = new HttpParams();
    if (params) {
      if (params.from)   qp = qp.set('from', params.from);
      if (params.to)     qp = qp.set('to', params.to);
      if (params.statut) qp = qp.set('statut', params.statut);
    }
    return this.http.get<VisiteWithRelations[]>(`${this.base}/historique/visites`, {params: qp});
  }

  listVisiteurs(params?: {
    checkInFrom?:string; checkInTo?:string;
    checkOutFrom?:string; checkOutTo?:string;
    statut?:string;
  }): Observable<VisitorDetail[]> {
    let qp = new HttpParams();
    if (params) {
      if (params.checkInFrom)  qp = qp.set('checkInFrom',  params.checkInFrom);
      if (params.checkInTo)    qp = qp.set('checkInTo',    params.checkInTo);
      if (params.checkOutFrom) qp = qp.set('checkOutFrom', params.checkOutFrom);
      if (params.checkOutTo)   qp = qp.set('checkOutTo',   params.checkOutTo);
      if (params.statut)       qp = qp.set('statut',       params.statut);
    }
    return this.http.get<VisitorDetail[]>(`${this.base}/historique/visiteurs`, {params: qp});
  }

  listVisitTypes(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`http://localhost:3000/admin/typevisite`);
  }
  listLocations(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`http://localhost:3000/admin/lieux`);
  }
}
