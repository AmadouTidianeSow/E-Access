// src/services/notification.service.ts

import {injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {NotificationRepository} from '../repositories';
import {HttpErrors} from '@loopback/rest';
import {Notification, NotificationType} from '../models';

@injectable()
export class NotificationService {
  constructor(
    @repository(NotificationRepository)
    public notificationRepo: NotificationRepository,
  ) {}

  /** envoi générique */
  async create(
    userId: string,
    type: NotificationType,
    message: string,
    visitId?: string,
  ): Promise<Notification> {
    return this.notificationRepo.create({userId, type, message, visitId});
  }

  /** 1) quand agent crée une visite pour un employé */
  async notifyVisitRequest(agentId: string, employeId: string, visitId: string) {
    const msg = `Nouvelle demande de visite (ID=${visitId}) par agent ${agentId}.`;
    return this.create(employeId, 'visit_request', msg, visitId);
  }

  /** 2) quand employé accepte ou refuse une demande */
  async notifyVisitResponse(
    employeId: string,
    agentId: string,
    visitId: string,
    accepted: boolean,
  ) {
    const action = accepted ? 'acceptée' : 'refusée';
    const msg = `Votre visite (${visitId}) a été ${action} par l’employé ${employeId}.`;
    return this.create(agentId, 'visit_response', msg, visitId);
  }

  /** 3) quand un visiteur fait son check‑in */
  async notifyVisitorCheckin(
    agentId: string,
    employeId: string,
    visitId: string,
    visitorName: string,
  ) {
    const msg = `Le visiteur ${visitorName} est arrivé (check‑in) pour la visite ${visitId}.`;
    return this.create(employeId, 'visitor_checkin', msg, visitId);
  }

  /** Liste des notifications pour un utilisateur, triées */
  async findForUser(userId: string) {
    return this.notificationRepo.find({
      where: {userId},
      order: ['createdAt DESC'],
    });
  }

  /** Marquer comme lue */
  async markRead(id: string) {
    const notif = await this.notificationRepo.findById(id);
    if (!notif) throw new HttpErrors.NotFound(`Notification ${id} introuvable`);
    return this.notificationRepo.updateById(id, {read: true});
  }
}
