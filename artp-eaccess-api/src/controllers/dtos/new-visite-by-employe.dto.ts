// src/controllers/dtos/new-visite-by-employe.dto.ts

/**
 * Pour la création de visite côté employé (mode manuel).
 * L'employeId est injecté côté serveur depuis le JWT, ne fait pas partie du DTO.
 */
export interface NewVisiteByEmployeRequest {
  /** Date et heure de début au format ISO */
  dateDebut: string;
  typeVisiteId: string;
  lieuId: string;
  visitors: Array<{
    nom: string;
    prenom: string;
    telephone?: string;
    categorieId?: string;
    // dateNaissance, pieceType et pieceNumero
    // seront complétés par l'agent plus tard
  }>;
}

/**
 * Pour la modification ou l'annulation d'une visite:
 * - dateDebut si l'employé souhaite reprogrammer,
 * - typeVisiteId ou lieuId pour changer ces infos,
 * - statut = 'annulee' pour annuler.
 */
export interface UpdateVisiteByEmployeRequest {
  dateDebut?: string;
  typeVisiteId?: string;
  lieuId?: string;
  statut?: 'annulee';
}

/**
 * Pour accepter ou refuser une visite impromptue créée par un agent.
 * 'accept' pour accepter, 'refuse' pour refuser.
 */
export interface DecisionVisiteRequest {
  decision: 'accept' | 'refuse';
}
