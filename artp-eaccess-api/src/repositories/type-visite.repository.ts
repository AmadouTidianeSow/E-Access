import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ArtpEAccessDataSource} from '../datasources';
import {TypeVisite, TypeVisiteRelations} from '../models';

export class TypeVisiteRepository extends DefaultCrudRepository<
  TypeVisite,
  typeof TypeVisite.prototype.id,
  TypeVisiteRelations
> {
  constructor(
    @inject('datasources.artpEAccess') dataSource: ArtpEAccessDataSource,
  ) {
    super(TypeVisite, dataSource);
  }
}
