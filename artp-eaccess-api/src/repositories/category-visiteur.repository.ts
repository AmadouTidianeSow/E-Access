import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ArtpEAccessDataSource} from '../datasources';
import {CategoryVisiteur, CategoryVisiteurRelations} from '../models';

export class CategoryVisiteurRepository extends DefaultCrudRepository<
  CategoryVisiteur,
  typeof CategoryVisiteur.prototype.id,
  CategoryVisiteurRelations
> {
  constructor(
    @inject('datasources.artpEAccess') dataSource: ArtpEAccessDataSource,
  ) {
    super(CategoryVisiteur, dataSource);
  }
}
