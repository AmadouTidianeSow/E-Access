// src/repositories/visite-visiteur.repository.ts

import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {ArtpEAccessDataSource} from '../datasources';
import {
  VisiteVisiteur,
  VisiteVisiteurRelations,
  Visiteur,
} from '../models';
import {VisiteurRepository} from './visiteur.repository';
import {VisiteRepository} from './visite.repository';

export class VisiteVisiteurRepository extends DefaultCrudRepository<
  VisiteVisiteur,
  typeof VisiteVisiteur.prototype.id,
  VisiteVisiteurRelations
> {
  public readonly visiteur: BelongsToAccessor<
    Visiteur,
    typeof VisiteVisiteur.prototype.id
  >;
  public readonly visite: BelongsToAccessor<
    // on importe ici le modèle Visite
    import('../models').Visite,
    typeof VisiteVisiteur.prototype.id
  >;

  constructor(
    @inject('datasources.artpEAccess') dataSource: ArtpEAccessDataSource,
    @repository.getter('VisiteurRepository')
    getVisiteurRepo: Getter<VisiteurRepository>,
    @repository.getter('VisiteRepository')
    getVisiteRepo: Getter<VisiteRepository>,
  ) {
    super(VisiteVisiteur, dataSource);

    // On crée l’accessor belongsTo('visiteur') et on enregistre le resolver
    this.visiteur = this.createBelongsToAccessorFor(
      'visiteur',
      getVisiteurRepo,
    );
    this.registerInclusionResolver(
      'visiteur',
      this.visiteur.inclusionResolver,
    );

    // Pareil pour belongsTo('visite')
    this.visite = this.createBelongsToAccessorFor(
      'visite',
      getVisiteRepo,
    );
    this.registerInclusionResolver(
      'visite',
      this.visite.inclusionResolver,
    );
  }
}
