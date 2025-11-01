// src/repositories/visiteur.repository.ts

import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {ArtpEAccessDataSource} from '../datasources';
import {Visiteur, VisiteurRelations, VisiteVisiteur} from '../models';
import {VisiteVisiteurRepository} from './visitevisiteur.repository';

export class VisiteurRepository extends DefaultCrudRepository<
  Visiteur,
  typeof Visiteur.prototype.id,
  VisiteurRelations
> {
  public readonly visitesLink: HasManyRepositoryFactory<
    VisiteVisiteur,
    typeof Visiteur.prototype.id
  >;

  constructor(
    @inject('datasources.artpEAccess') dataSource: ArtpEAccessDataSource,
    @repository.getter('VisiteVisiteurRepository')
    protected getVisiteVisiteurRepo: Getter<VisiteVisiteurRepository>,
  ) {
    super(Visiteur, dataSource);

    // Relation hasMany vers la pivot VisiteVisiteur
    this.visitesLink = this.createHasManyRepositoryFactoryFor(
      'visitesLink',
      getVisiteVisiteurRepo,
    );
    this.registerInclusionResolver(
      'visitesLink',
      this.visitesLink.inclusionResolver,
    );
  }
}
