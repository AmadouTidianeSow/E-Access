// src/app/employe/services/employe.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Visitor {
  id?: string;
  nom: string;
  prenom: string;
  telephone?: string;
  dateNaissance?: string;
  pieceType?: string;    // renseigné plus tard par l’agent
  pieceNumero?: string;  // idem
  categorieId?: string;
}

export interface Visit {
  id: string;
  dateDebut: string;
  dateFin?: string;
  statut: 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
  nombreVisiteurs: number;
  visiteurs: Visitor[];
  typeVisiteId: string;
  lieuId: string;
  agentId?: string; // présent pour les visites impromptues
}

export interface VisitType {
  id: string;
  nom: string;
  description?: string;
}

export interface Location {
  id: string;
  nom: string;
  site?: string;
}

export interface DashboardSummary {
  todayVisits: number;
  confirmed: number;
  pending: number;
  notifications: number;
}


@Injectable({ providedIn: 'root' })
export class EmployeService {
  private readonly base = 'http://localhost:3000/employe';
  private readonly baseVisites   = `${this.base}/visites`;
  private readonly baseDashboard = `${this.base}/dashboard`;
  private readonly baseAdmin     = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) {}

  /**
   * 1) Déclarer une visite (mode manuel).
   *    Le serveur déduit l'employeId du JWT, on n'envoie plus ce champ.
   */
  createVisit(data: {
    dateDebut: string;
    typeVisiteId: string;
    lieuId: string;
    visitors: Visitor[];
  }): Observable<Visit> {
    const payload = {
      dateDebut: data.dateDebut,
      typeVisiteId: data.typeVisiteId,
      lieuId: data.lieuId,
      visitors: data.visitors,
    };
    return this.http.post<Visit>(this.baseVisites, payload);
  }

  /** 2) Modifier ou annuler une visite */
  updateVisit(
    id: string,
    data: Partial<{
      dateDebut: string;
      typeVisiteId: string;
      lieuId: string;
      statut: 'annulee';
    }>
  ): Observable<void> {
    return this.http.patch<void>(`${this.baseVisites}/${id}`, data);
  }

  /** 2b) Alias annulation */
  cancelVisit(id: string): Observable<void> {
    return this.updateVisit(id, { statut: 'annulee' });
  }

  /** 3) Accepter ou refuser une visite impromptue */
  decideVisit(
    id: string,
    decision: 'accept' | 'refuse'
  ): Observable<void> {
    // Le backend attend un PATCH sur /visites/{id}/decision
    return this.http.patch<void>(
      `${this.baseVisites}/${id}/decision`,
      { decision }
    );
  }

  /** 4) Planning (visites en_attente + en_cours) */
  listPlanning(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.baseVisites}/planning`);
  }

  /** 5) Historique (visites terminee + annulee) */
  listHistory(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.baseVisites}/history`);
  }

  /**
   * 6) Visites impromptues (en_attente et créées par un agent)
   *    On récupère toutes les visites en attente puis on filtre celles avec agentId.
   */
  listImpromptues(): Observable<Visit[]> {
    return this.listPlanning().pipe(
      map(visits => visits.filter(v => v.statut === 'en_attente' && !!v.agentId))
    );
  }

  /** 7) Dashboard summary pour l’employé */
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(
      `${this.baseDashboard}/summary`
    );
  }

  /** 8) Charger la liste des types de visite (admin) */
  listVisitTypes(): Observable<VisitType[]> {
    return this.http.get<VisitType[]>(`${this.baseAdmin}/typevisite`);
  }

  /** 9) Charger la liste des lieux (admin) */
  listLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.baseAdmin}/lieux`);
  }


}
