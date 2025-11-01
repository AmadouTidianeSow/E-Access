import {Entity, model, property} from '@loopback/repository';

@model()
export class Lieu extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  nom: string;

  @property({
    type: 'string',
  })
  site?: string;


  constructor(data?: Partial<Lieu>) {
    super(data);
  }
}

export interface LieuRelations {
  // describe navigational properties here
}

export type LieuWithRelations = Lieu & LieuRelations;
