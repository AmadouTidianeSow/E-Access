// src/controllers/historique.controller.ts

import {
  get,
  param,
  response,
  getModelSchemaRef,
} from '@loopback/rest';
import {inject, service} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Role} from '../constants';
import {VisiteService} from '../services/visite.service';
import {Visite, VisiteWithRelations} from '../models';
import {VisiteVisiteur} from '../models/visitevisiteur.model';

@authenticate('jwt')
// @authorize({allowedRoles: [Role.AGENT]})
@authorize({allowedRoles: [Role.ADMIN, Role.AGENT]})
export class HistoriqueController {
  constructor(
    @inject(SecurityBindings.USER)
    private currentUser: UserProfile,
    @service(VisiteService)
    private visiteService: VisiteService,
  ) {}

  /**
   * 1) Historique des visites (filtrage sur dateDebut et statut uniquement).
   */
  @get('/agent/visites/historique/visites')
  @response(200, {
    description: 'Historique des visites',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Visite, {includeRelations: true}),
        },
      },
    },
  })
  async historiqueVisites(
    @param.query.string('from') from?: string,
    @param.query.string('to')   to?: string,
    @param.query.string('statut') statut?: string,
  ): Promise<VisiteWithRelations[]> {
    const where: any = {};
    if (from)   where.dateDebut = {gte: new Date(from)};
    if (to)     where.dateDebut = {...where.dateDebut, lte: new Date(to)};
    if (statut) where.statut = statut;
    return this.visiteService.findVisitesByFilters(where);
  }

  /**
   * 2) Historique des visiteurs (filtrage sur checkIn, checkOut et statut pivot).
   */
  @get('/agent/visites/historique/visiteurs')
  @response(200, {
    description: 'Historique des visiteurs',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(VisiteVisiteur, {includeRelations: true}),
        },
      },
    },
  })
  async historiqueVisiteurs(
    @param.query.string('checkInFrom')  ciFrom?: string,
    @param.query.string('checkInTo')    ciTo?: string,
    @param.query.string('checkOutFrom') coFrom?: string,
    @param.query.string('checkOutTo')   coTo?: string,
    @param.query.string('statut')       statut?: string,
  ): Promise<VisiteVisiteur[]> {
    const where: any = {};
    if (ciFrom)  where.checkIn  = {gte: new Date(ciFrom)};
    if (ciTo)    where.checkIn  = {...where.checkIn, lte: new Date(ciTo)};
    if (coFrom)  where.checkOut = {gte: new Date(coFrom)};
    if (coTo)    where.checkOut = {...where.checkOut, lte: new Date(coTo)};
    if (statut)  where.statut   = statut;
    return this.visiteService.findVisiteursByFilters(where);
  }
}
