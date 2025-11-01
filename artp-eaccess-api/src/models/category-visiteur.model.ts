import {Entity, model, property} from '@loopback/repository';

@model()
export class CategoryVisiteur extends Entity {
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


  constructor(data?: Partial<CategoryVisiteur>) {
    super(data);
  }
}

export interface CategoryVisiteurRelations {
  // describe navigational properties here
}

export type CategoryVisiteurWithRelations = CategoryVisiteur & CategoryVisiteurRelations;
