// src/controllers/notification.controller.ts

import {
  get,
  param,
  patch,

  response,

} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';

import {inject} from '@loopback/core';
import {securityId, SecurityBindings, UserProfile} from '@loopback/security';

import {NotificationService} from '../services/notification.service';
import {Notification} from '../models';

@authenticate('jwt')
export class NotificationController {
  constructor(
    @inject(SecurityBindings.USER)
    private currentUser: UserProfile,
    @inject('services.NotificationService')
    private notifService: NotificationService,
  ) {}

  /**
   * GET /notifications
   * Récupère la liste des notifications de l'utilisateur connecté.
   */
  @get('/notifications')
  @response(200, {
    description: 'Array of notifications for the current user',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {'x-ts-type': Notification},
        },
      },
    },
  })
  async findForMe(): Promise<Notification[]> {
    const userId = this.currentUser[securityId] as string;
    return this.notifService.findForUser(userId);
  }

  /**
   * PATCH /notifications/{id}/read
   * Marque une notification comme lue.
   */
  @patch('/notifications/{id}/read')
  @response(204, {
    description: 'Mark a notification as read',
  })
  async markRead(
    @param.path.string('id') id: string,
  ): Promise<void> {
    
    return this.notifService.markRead(id);
  }
}
