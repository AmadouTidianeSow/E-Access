// src/controllers/settings.controller.ts

import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  get,
  patch,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Role} from '../constants';

export interface Settings {
  horaires: {
    ouverture: string;   // HH:mm
    fermeture: string;   // HH:mm
  };
  alertThresholds: {
    maxConcurrentVisits: number;
  };
}

const SettingsSchema = {
  type: 'object',
  properties: {
    horaires: {
      type: 'object',
      properties: {
        ouverture: {type: 'string', example: '08:00'},
        fermeture: {type: 'string', example: '18:00'},
      },
      required: ['ouverture', 'fermeture'],
    },
    alertThresholds: {
      type: 'object',
      properties: {
        maxConcurrentVisits: {type: 'number', example: 100},
      },
      required: ['maxConcurrentVisits'],
    },
  },
  required: ['horaires', 'alertThresholds'],
};

@authenticate('jwt')
@authorize({allowedRoles: [Role.ADMIN]})
export class SettingsController {
  // stockage en mémoire pour l'exemple
  private settings: Settings = {
    horaires: {ouverture: '08:00', fermeture: '18:00'},
    alertThresholds: {maxConcurrentVisits: 100},
  };

  /**
   * Récupère les settings actuels
   */
  @get('/admin/settings')
  @response(200, {
    description: 'Current application settings',
    content: {'application/json': {schema: SettingsSchema}},
  })
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  /**
   * Met à jour les settings (en mémoire)
   */
  @patch('/admin/settings')
  @response(200, {
    description: 'Updated settings',
    content: {'application/json': {schema: SettingsSchema}},
  })
  async updateSettings(
    @requestBody({
      description: 'Partial settings to update',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              horaires: {
                type: 'object',
                properties: {
                  ouverture: {type: 'string'},
                  fermeture: {type: 'string'},
                },
              },
              alertThresholds: {
                type: 'object',
                properties: {
                  maxConcurrentVisits: {type: 'number'},
                },
              },
            },
          },
        },
      },
    })
    data: Partial<Settings>,
  ): Promise<Settings> {
    // validation basique
    if (data.horaires) {
      const {ouverture, fermeture} = data.horaires;
      const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (
        (ouverture && !timePattern.test(ouverture)) ||
        (fermeture && !timePattern.test(fermeture))
      ) {
        throw new HttpErrors.BadRequest(
          'Les horaires doivent être au format HH:mm',
        );
      }
      this.settings.horaires = {
        ...this.settings.horaires,
        ...data.horaires,
      };
    }
    if (data.alertThresholds?.maxConcurrentVisits != null) {
      const v = data.alertThresholds.maxConcurrentVisits;
      if (v < 1) {
        throw new HttpErrors.BadRequest(
          'maxConcurrentVisits doit être >= 1',
        );
      }
      this.settings.alertThresholds.maxConcurrentVisits = v;
    }
    return this.settings;
  }
}


//pour les settings j'ai pas mis les donnes en base de donnes elles ne persistent pas dans les futures mises à jour je le ferais.
