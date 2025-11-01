// src/models/notification.model.ts

import {Entity, model, property} from '@loopback/repository';

export type NotificationType =
  | 'visit_request'     // l'agent a créé une visite pour l'employé
  | 'visit_response'    // l'employé a accepté/refusé la visite
  | 'visitor_checkin';  // un visiteur vient de faire son check‑in

@model()
export class Notification extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  /** destinataire de la notification (agent ou employé selon le contexte) */
  @property({type: 'string', required: true})
  userId: string;

  /** message à afficher */
  @property({type: 'string', required: true})
  message: string;

  /** type pour filtrer/afficher différemment */
  @property({
    type: 'string',
    required: true,
    jsonSchema: {enum: ['visit_request', 'visit_response', 'visitor_checkin']},
  })
  type: NotificationType;

  /** référence à la visite concernée */
  @property({type: 'string'})
  visitId?: string;

  /** lisible / non lu */
  @property({type: 'boolean', default: false})
  read?: boolean;

  /** date de création */
  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: string;

  constructor(data?: Partial<Notification>) {
    super(data);
  }
}

export interface NotificationRelations {
  // relations éventuelles
}

export type NotificationWithRelations = Notification & NotificationRelations;
