// src/models/visite-visiteur.model.ts

import {
  Entity,
  model,
  property,
  belongsTo,
} from '@loopback/repository';
import {Visite} from './visite.model';
import {Visiteur} from './visiteur.model';

@model()
export class VisiteVisiteur extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  // Clé étrangère vers Visite
  @belongsTo(() => Visite)
  visiteId: string;

  // Clé étrangère vers Visiteur
  @belongsTo(() => Visiteur)
  visiteurId: string;

  // Heure d’arrivée (check‑in)
  @property({
    type: 'date',
    jsonSchema: {format: 'date-time'},
  })
  checkIn?: string;

  // Heure de départ (check‑out)
  @property({
    type: 'date',
    jsonSchema: {format: 'date-time'},
  })
  checkOut?: string;

  // Statut local (pour un visiteur particulier)
  @property({
    type: 'string',
    required: true,
    default: 'pending',
    jsonSchema: {
      enum: ['pending', 'checked_in', 'checked_out'],
    },
  })
  statut: 'pending' | 'checked_in' | 'checked_out';

  constructor(data?: Partial<VisiteVisiteur>) {
    super(data);
  }
}

export interface VisiteVisiteurRelations {
  visite?: Visite;
  visiteur?: Visiteur;
}

export type VisiteVisiteurWithRelations =
  VisiteVisiteur & VisiteVisiteurRelations;
