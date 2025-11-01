import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ArtpEAccessDataSource} from '../datasources';
import {Lieu, LieuRelations} from '../models';

export class LieuRepository extends DefaultCrudRepository<
  Lieu,
  typeof Lieu.prototype.id,
  LieuRelations
> {
  constructor(
    @inject('datasources.artpEAccess') dataSource: ArtpEAccessDataSource,
  ) {
    super(Lieu, dataSource);
  }
}
