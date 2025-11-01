// src/controllers/employe.controller.ts

import {
  post,
  patch,
  del,
  get,
  param,
  requestBody,
  response,
  getModelSchemaRef,
} from '@loopback/rest';
import {inject, service} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  securityId,
  SecurityBindings,
  UserProfile,
} from '@loopback/security';
import {Role} from '../constants';
import {Visite, VisiteWithRelations} from '../models';
import {EmployeService} from '../services/employe.service';
import {
  NewVisiteByEmployeRequest,
  UpdateVisiteByEmployeRequest,
  DecisionVisiteRequest,
} from '../controllers/dtos/new-visite-by-employe.dto';

@authenticate('jwt')
@authorize({allowedRoles: [Role.EMPLOYE]})
export class EmployeController {
  constructor(
    @inject(SecurityBindings.USER)
    private currentUser: UserProfile,
    @service(EmployeService)
    private employeService: EmployeService,
  ) {}

  /**
   * 1) Déclarer une visite (mode manuel).
   */
  @post('/employe/visites')
  @response(200, {
    description: 'Créer une visite en mode manuel',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Visite, {includeRelations: true}),
      },
    },
  })
  async createVisite(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['dateDebut','typeVisiteId','lieuId','visitors'],
            properties: {
              dateDebut:    {type: 'string', format: 'date-time'},
              typeVisiteId: {type: 'string'},
              lieuId:       {type: 'string'},
              visitors: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['nom','prenom'],
                  properties: {
                    nom:         {type: 'string'},
                    prenom:      {type: 'string'},
                    telephone:   {type: 'string'},
                    categorieId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    })
    body: NewVisiteByEmployeRequest,
  ): Promise<VisiteWithRelations> {
    const employeId = this.currentUser[securityId] as string;
    return this.employeService.createByEmploye(body, employeId);
  }

  /**
   * 2) Modifier ou annuler une visite (si non terminée).
   */
  @patch('/employe/visites/{id}')
  @response(204, {description: 'Modifier ou annuler une visite'})
  async updateVisite(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              dateDebut:    {type: 'string', format: 'date-time'},
              typeVisiteId: {type: 'string'},
              lieuId:       {type: 'string'},
              statut:       {type: 'string', enum: ['annulee']},
            },
          },
        },
      },
    })
    body: UpdateVisiteByEmployeRequest,
  ): Promise<void> {
    await this.employeService.updateByEmploye(id, body);
  }

  /**
   * 2b) Annuler (alias DELETE).
   */
  @del('/employe/visites/{id}')
  @response(204, {description: 'Annuler une visite'})
  async cancelVisite(@param.path.string('id') id: string): Promise<void> {
    await this.employeService.updateByEmploye(id, {statut: 'annulee'});
  }

  /**
   * 3) Accepter ou refuser une visite impromptue.
   */
  @patch('/employe/visites/{id}/decision')
  @response(204, {description: 'Accepter ou refuser une visite impromptue'})
  async decideVisite(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['decision'],
            properties: {
              decision: {type: 'string', enum: ['accept','refuse']},
            },
          },
        },
      },
    })
    body: DecisionVisiteRequest,
  ): Promise<void> {
    await this.employeService.decideVisit(id, body);
  }

  /**
   * 4) Récupérer le planning (en_attente + en_cours).
   */
  @get('/employe/visites/planning')
  @response(200, {
    description: 'Planning (en_attente + en_cours)',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Visite, {includeRelations: true}),
        },
      },
    },
  })
  async getPlanning(): Promise<VisiteWithRelations[]> {
    const employeId = this.currentUser[securityId] as string;
    return this.employeService.listPlanning(employeId);
  }

  /**
   * 5) Récupérer l’historique (terminée + annulée).
   */
  @get('/employe/visites/history')
  @response(200, {
    description: 'Historique (terminée + annulée)',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Visite, {includeRelations: true}),
        },
      },
    },
  })
  async getHistory(): Promise<VisiteWithRelations[]> {
    const employeId = this.currentUser[securityId] as string;
    return this.employeService.listHistory(employeId);
  }
}
