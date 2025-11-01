import {Entity, model, property} from '@loopback/repository';

@model()
export class TypeVisite extends Entity {
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
  description?: string;


  constructor(data?: Partial<TypeVisite>) {
    super(data);
  }
}

export interface TypeVisiteRelations {
  // describe navigational properties here
}

export type TypeVisiteWithRelations = TypeVisite & TypeVisiteRelations;
