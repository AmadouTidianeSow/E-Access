// src/services/employe.service.ts

import {injectable, BindingScope, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {
  VisiteRepository,
  VisiteVisiteurRepository,
  VisiteurRepository,
} from '../repositories';
import {
  NewVisiteByEmployeRequest,
  UpdateVisiteByEmployeRequest,
  DecisionVisiteRequest,
} from '../controllers/dtos/new-visite-by-employe.dto';
import {NotificationService} from './notification.service';
import {VisiteWithRelations} from '../models';

@injectable({scope: BindingScope.TRANSIENT})
export class EmployeService {
  constructor(
    @repository(VisiteRepository)
    private visiteRepo: VisiteRepository,

    @repository(VisiteVisiteurRepository)
    private pivotRepo: VisiteVisiteurRepository,

    @repository(VisiteurRepository)
    private visiteurRepo: VisiteurRepository,

    @inject('services.NotificationService')
    private notificationService: NotificationService,
  ) {}

  /**
   * 1) Création (mode manuel) par l’employé.
   *    Aucune notification déclenchée.
   */
  async createByEmploye(
    data: NewVisiteByEmployeRequest,
    employeId: string,
  ): Promise<VisiteWithRelations> {
    const {dateDebut, typeVisiteId, lieuId, visitors} = data;
    if (!visitors || visitors.length === 0) {
      throw new HttpErrors.BadRequest('Au moins un visiteur doit être déclaré');
    }

    const visite = await this.visiteRepo.create({
      employeId,
      agentId: '',
      typeVisiteId,
      lieuId,
      dateDebut,
      statut: 'en_attente',
      nombreVisiteurs: visitors.length,
    });

    await Promise.all(
      visitors.map(async v => {
        const vis = await this.visiteurRepo.create(v);
        return this.pivotRepo.create({
          visiteId: visite.id!,
          visiteurId: vis.id!,
          statut: 'pending',
        });
      }),
    );

    return this.visiteRepo.findById(visite.id!, {include: ['visiteurs']});
  }

  /**
   * 2) Modification ou annulation par l’employé de SA visite.
   */
  async updateByEmploye(
    visiteId: string,
    data: UpdateVisiteByEmployeRequest,
  ): Promise<void> {
    const visite = await this.visiteRepo.findById(visiteId).catch(() => null);
    if (!visite) {
      throw new HttpErrors.NotFound(`Visite ${visiteId} introuvable`);
    }
    if (visite.statut === 'terminee') {
      throw new HttpErrors.BadRequest('Visite déjà terminée, non modifiable');
    }
    if (data.statut === 'annulee') {
      await this.visiteRepo.updateById(visiteId, {statut: 'annulee'});
    } else {
      await this.visiteRepo.updateById(visiteId, data);
    }
  }

  /**
   * 3) Acceptation ou refus d’une visite impromptue créée par un agent.
   */
  async decideVisit(
    visiteId: string,
    req: DecisionVisiteRequest,
  ): Promise<void> {
    const visite = await this.visiteRepo.findById(visiteId);
    if (visite.statut !== 'en_attente') {
      throw new HttpErrors.BadRequest('Visite déjà traitée ou non en attente');
    }
    const accepted = req.decision === 'accept';
    const newStatut = accepted ? 'en_cours' : 'annulee';
    await this.visiteRepo.updateById(visiteId, {statut: newStatut});

    await this.notificationService.notifyVisitResponse(
      visite.employeId,
      visite.agentId,
      visiteId,
      accepted,
    );
  }

  /**
   * 4) Récupération du planning (en_attente + en_cours).
   */
  async listPlanning(employeId: string): Promise<VisiteWithRelations[]> {
    return this.visiteRepo.find({
      where: {
        employeId,
        statut: {inq: ['en_attente', 'en_cours']},
      },
      include: ['visiteurs'],
    });
  }

  /**
   * 5) Récupération de l’historique (terminée + annulée).
   */
  async listHistory(employeId: string): Promise<VisiteWithRelations[]> {
    return this.visiteRepo.find({
      where: {
        employeId,
        statut: {inq: ['terminee', 'annulee']},
      },
      include: ['visiteurs'],
    });
  }
}
