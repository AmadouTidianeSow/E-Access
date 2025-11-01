// src/controllers/dtos/new-visite-by-agent.dto.ts

/**
 * Requête de création d’une visite en mode scan.
 */
export interface NewVisiteByAgentWithScanRequest {
  mode: 'scan';
  scanBuffer: Buffer;
  employeId: string;
  typeVisiteId: string;
  lieuId: string;
  /** 'CNI' | 'Permis' | 'Passport' */
  pieceType: string;
}

/**
 * Données minimales d’un visiteur pour le mode manuel ou après OCR.
 */
export interface ManualVisiteurData {
  nom: string;
  prenom: string;
  telephone?: string;
  dateNaissance?: string;
  pieceType?: string;
  pieceNumero?: string;
  categorieId?: string;
}

/**
 * Requête de création d’une visite en mode manuel.
 */
export interface NewVisiteByAgentManualRequest {
  mode: 'manual';
  visitors: ManualVisiteurData[];
  employeId: string;
  typeVisiteId: string;
  lieuId: string;
}

/**
 * Requête pour confirmer la création d’une visite impromptue
 * après correction des données OCR (scan).
 */
export interface ConfirmScanRequest {
  employeId: string;
  agentId: string;
  typeVisiteId: string;
  lieuId: string;
  visitors: Array<{
    nom: string;
    prenom: string;
    pieceType: string;
    pieceNumero: string;
  }>;
}

/**
 * Requête pour confirmer la complétion d’un visiteur planifié
 * après correction des données OCR.
 */
export interface ConfirmPreEnregistrementVisitorRequest {
  nom: string;
  prenom: string;
  pieceType: string;
  pieceNumero: string;
}

/**
 * Union pour faciliter l’usage dans le contrôleur/service.
 */
export type NewVisiteByAgentRequest =
  | NewVisiteByAgentWithScanRequest
  | NewVisiteByAgentManualRequest;
