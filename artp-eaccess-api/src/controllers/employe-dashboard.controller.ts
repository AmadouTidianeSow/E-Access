// src/controllers/employe-dashboard.controller.ts

import {repository} from '@loopback/repository';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  get,
  RestBindings,
  Request,
  response,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import {VisiteRepository, VisiteVisiteurRepository} from '../repositories';
import {securityId, SecurityBindings, UserProfile} from '@loopback/security';
import {Role} from '../constants';

export interface EmployeDashboardSummary {
  todayVisits: number;
  confirmed: number;
  pending: number;
  notifications: number;
}

@authenticate('jwt')
@authorize({allowedRoles: [Role.EMPLOYE]})
export class EmployeDashboardController {
  constructor(
    @repository(VisiteRepository)
    private visiteRepo: VisiteRepository,
    @repository(VisiteVisiteurRepository)
    private pivotRepo: VisiteVisiteurRepository,
    @inject(SecurityBindings.USER)
    private currentUser: UserProfile,
  ) {}

  /**
   * Récupère un résumé pour le dashboard de l'employé courant
   */
  @get('/employe/dashboard/summary')
  @response(200, {
    description: "Résumé pour l'employé (visites d'aujourd'hui, confirmées, en attente, notifications)",
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            todayVisits: {type: 'number'},
            confirmed: {type: 'number'},
            pending: {type: 'number'},
            notifications: {type: 'number'},
          },
        },
      },
    },
  })
  async summary(
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<EmployeDashboardSummary> {
    // Identifiant de l'employé courant
    const employeId = this.currentUser[securityId] as string;

    // Date de début de journée (00:00) et de fin (23:59:59)
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0, 0, 0,
    ).toISOString();
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23, 59, 59,
    ).toISOString();

    // 1) Visites créées aujourd'hui par l'employé
    const todayCount = await this.visiteRepo.count({
      employeId,
      dateDebut: {between: [startOfDay, endOfDay]},
    });

    // 2) Parmi elles, celles confirmées (en_cours)
    const confirmedCount = await this.visiteRepo.count({
      employeId,
      dateDebut: {between: [startOfDay, endOfDay]},
      statut: 'en_cours',
    });

    // 3) Et celles encore en attente
    const pendingCount = await this.visiteRepo.count({
      employeId,
      dateDebut: {between: [startOfDay, endOfDay]},
      statut: 'en_attente',
    });

    // 4) Exemples de "notifications" : visites impromptues (en_attente)
    //    créées il y a moins d'une heure
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const notificationsCount = await this.visiteRepo.count({
      employeId,
      statut: 'en_attente',
      dateDebut: {gte: oneHourAgo},
    });

    return {
      todayVisits: todayCount.count,
      confirmed: confirmedCount.count,
      pending: pendingCount.count,
      notifications: notificationsCount.count,
    };
  }
}
