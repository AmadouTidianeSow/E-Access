// src/models/visiteur.model.ts

import {Entity, model, property, hasMany} from '@loopback/repository';
import {VisiteVisiteur} from './visitevisiteur.model';
import {VisiteVisiteurWithRelations} from './visitevisiteur.model';

@model()
export class Visiteur extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({type: 'string', required: true})
  nom: string;

  @property({type: 'string', required: true})
  prenom: string;

  @property({type: 'string'})
  telephone?: string;

  @property({type: 'string'})
  dateNaissance?: string;

  @property({type: 'string', required: false})
  pieceType: string;

  @property({type: 'string', required: false})
  pieceNumero: string;

  @property({type: 'string'})
  categorieId?: string;

  @hasMany(() => VisiteVisiteur)
  visitesLink: VisiteVisiteur[];

  constructor(data?: Partial<Visiteur>) {
    super(data);
  }
}

export interface VisiteurRelations {
  visitesLink?: VisiteVisiteurWithRelations[];
}

export type VisiteurWithRelations = Visiteur & VisiteurRelations;
