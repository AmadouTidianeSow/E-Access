import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Visit {
  id: string;
  dateDebut: string;
  dateFin?: string;
  statut: 'en_cours' | 'terminee' | 'annulee' | 'en_attente';
  nombreVisiteurs: number;
  employeId: string;
  agentId: string;
  typeVisiteId: string;
  lieuId: string;
  visiteurs?: Array<{
    id: string;
    nom: string;
    prenom: string;
    telephone?: string;
    dateNaissance?: string;
    pieceType: string;
    pieceNumero: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class VisitsService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Récupère toutes les visites
  listAll(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.api}/admin/visites`);
  }

  // Filtre par statut
  listByStatus(status: string): Observable<Visit[]> {
    return this.http.get<Visit[]>(
      `${this.api}/admin/visites?filter=${encodeURIComponent(JSON.stringify({where: {statut: status}, include: ['visiteurs']}))}`
    );
  }

  
}
