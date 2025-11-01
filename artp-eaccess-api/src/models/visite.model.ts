// src/models/visite.model.ts

import {Entity, model, property, hasMany} from '@loopback/repository';
import {VisiteVisiteur} from './visitevisiteur.model';
import {Visiteur} from './visiteur.model';
import {VisiteVisiteurWithRelations,} from './visitevisiteur.model';
import {VisiteurWithRelations,} from './visiteur.model';
import {Lieu} from './lieu.model';
import {TypeVisite} from './type-visite.model';
import {belongsTo} from '@loopback/repository';


@model()
export class Visite extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

   @property({
    type: 'date',
    required: true,
    jsonSchema: {format: 'date-time'},
  })
  dateDebut: string;

  @property({
    type: 'date',
    jsonSchema: {format: 'date-time'},
  })
  dateFin?: string;

  

@property({
  type: 'string',
  required: true,
  jsonSchema: {enum: ['en_attente','en_cours','terminee','annulee']},
})
statut: 'en_attente'|'en_cours'|'terminee'|'annulee';

  @property({type: 'number', required: true})
  nombreVisiteurs: number;

  // @property({type: 'string', required: true})
  // typeVisiteId: string;

  @property({type: 'string', required: true})
  employeId: string;

  @property({type: 'string', required: false})
  agentId: string;

  // @property({type: 'string', required: true})
  // lieuId: string;

    // <-- belongsTo lieu
  @belongsTo(() => Lieu)
  lieuId: string;

  // <-- belongsTo typeVisite
  @belongsTo(() => TypeVisite)
  typeVisiteId: string;

  /** Relation 1-n vers la pivot VisiteVisiteur */
  @hasMany(() => VisiteVisiteur)
  visiteursLink: VisiteVisiteur[];

  /** Relation through pour récupérer directement les modèles Visiteur */
  @hasMany(() => Visiteur, {through: {model: () => VisiteVisiteur, keyFrom: 'visiteId', keyTo: 'visiteurId'}})
  visiteurs: Visiteur[];

  constructor(data?: Partial<Visite>) {
    super(data);
  }
}

export interface VisiteRelations {
  visiteursLink?: VisiteVisiteurWithRelations[];
  visiteurs?: VisiteurWithRelations[];
  lieu?: Lieu;
  typeVisite?: TypeVisite;
}

export type VisiteWithRelations = Visite & VisiteRelations;
