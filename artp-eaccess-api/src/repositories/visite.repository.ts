import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {Lieu, TypeVisite, Visite, VisiteRelations, VisiteVisiteur, Visiteur} from '../models';
import {ArtpEAccessDataSource} from '../datasources';
import {VisiteVisiteurRepository} from './visitevisiteur.repository';
import {VisiteurRepository} from './visiteur.repository';
import {LieuRepository} from './lieu.repository';
import {TypeVisiteRepository} from './type-visite.repository';
import {BelongsToAccessor} from '@loopback/repository';

export class VisiteRepository extends DefaultCrudRepository<
  Visite,
  typeof Visite.prototype.id,
  VisiteRelations
> {
  public readonly visiteursLink: HasManyRepositoryFactory<VisiteVisiteur, typeof Visite.prototype.id>;
  public readonly visiteurs: HasManyRepositoryFactory<Visiteur, typeof Visite.prototype.id>;
    // belongsTo...
  public readonly lieu: BelongsToAccessor<Lieu, typeof Visite.prototype.id>;
  public readonly typeVisite: BelongsToAccessor<TypeVisite, typeof Visite.prototype.id>;

  constructor(
    @inject('datasources.artpEAccess') dataSource: ArtpEAccessDataSource,
    @repository.getter('VisiteVisiteurRepository')
    getVisiteVisiteurRepo: Getter<VisiteVisiteurRepository>,
    @repository.getter('VisiteurRepository')
    getVisiteurRepo: Getter<VisiteurRepository>,
        @repository.getter('LieuRepository')
    getLieuRepo: Getter<LieuRepository>,
    @repository.getter('TypeVisiteRepository')
    getTypeVisiteRepo: Getter<TypeVisiteRepository>,
  ) {
    super(Visite, dataSource);

    this.visiteursLink = this.createHasManyRepositoryFactoryFor('visiteursLink', getVisiteVisiteurRepo);
    this.registerInclusionResolver('visiteursLink', this.visiteursLink.inclusionResolver);

    this.visiteurs = this.createHasManyThroughRepositoryFactoryFor(
      'visiteurs',
      getVisiteurRepo,
      getVisiteVisiteurRepo,
    );
    this.registerInclusionResolver('visiteurs', this.visiteurs.inclusionResolver);

     // belongsTo lieu
    this.lieu = this.createBelongsToAccessorFor(
      'lieu',
      getLieuRepo,
    );
    this.registerInclusionResolver('lieu', this.lieu.inclusionResolver);

    // belongsTo typeVisite
    this.typeVisite = this.createBelongsToAccessorFor(
      'typeVisite',
      getTypeVisiteRepo,
    );
    this.registerInclusionResolver('typeVisite', this.typeVisite.inclusionResolver);

    
  }
}
