// src/controllers/visite.controller.ts

import {
  get,
  post,
  patch,
  param,
  requestBody,
  response,
  HttpErrors,
  RestBindings,
  Request,
  getModelSchemaRef,
} from '@loopback/rest';
import {inject, service} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import multer from 'multer';
import {
  securityId,
  SecurityBindings,
  UserProfile,
} from '@loopback/security';
import {Role} from '../constants';
import {Visite, VisiteWithRelations} from '../models';
import {VisiteVisiteur} from '../models/visitevisiteur.model';
import {VisiteService} from '../services/visite.service';
import {PieceType} from '../services/scanner.service';
import {
  NewVisiteByAgentManualRequest,
  NewVisiteByAgentWithScanRequest,
  ConfirmScanRequest,
  ConfirmPreEnregistrementVisitorRequest,
} from '../controllers/dtos/new-visite-by-agent.dto';

const upload = multer({storage: multer.memoryStorage()});


function parseOcrOnly(
  request: Request,
): Promise<{buffer: Buffer; pieceType: PieceType}> {
  return new Promise((resolve, reject) => {
    const mw = upload.fields([
      {name: 'file', maxCount: 1},
      {name: 'pieceType', maxCount: 1},
    ]);
    // @ts-ignore
    mw(request, {} as any, err => {
      if (err) return reject(err);
      const files = (request as any).files as Record<string, Express.Multer.File[]>;
      const file = files.file?.[0];
      const rawType = (request.body as Record<string, string>).pieceType;
      if (!file?.buffer) {
        return reject(new HttpErrors.BadRequest('Fichier requis pour OCR'));
      }
      if (!rawType || !['CNI','Permis','Passport'].includes(rawType)) {
        return reject(new HttpErrors.BadRequest('Type de pièce invalide'));
      }
      resolve({buffer: file.buffer, pieceType: rawType as PieceType});
    });
  });
}

// Parse form-data pour création scan impromptue
function parseScanForm(request: Request): Promise<{
  buffer: Buffer;
  body: NewVisiteByAgentWithScanRequest;
}> {
  return new Promise((resolve, reject) => {
    const mw = upload.fields([
      {name: 'file', maxCount: 1},
      {name: 'mode', maxCount: 1},
      {name: 'employeId', maxCount: 1},
      {name: 'typeVisiteId', maxCount: 1},
      {name: 'lieuId', maxCount: 1},
      {name: 'pieceType', maxCount: 1},
    ]);
    // @ts-ignore
    mw(request, {} as any, err => {
      if (err) return reject(err);
      const files = (request as any).files as Record<string, Express.Multer.File[]>;
      const file = files.file?.[0];
      if (!file?.buffer) {
        return reject(new HttpErrors.BadRequest('Fichier requis pour scan'));
      }
      const raw = request.body as Record<string, string>;
      const pieceType = raw.pieceType as PieceType;
      if (!['CNI', 'Permis', 'Passport'].includes(pieceType)) {
        return reject(new HttpErrors.BadRequest('Type de pièce invalide'));
      }
      const body: NewVisiteByAgentWithScanRequest = {
        mode: 'scan',
        scanBuffer: file.buffer,
        employeId: raw.employeId,
        typeVisiteId: raw.typeVisiteId,
        lieuId: raw.lieuId,
        pieceType,
      };
      if (!body.employeId || !body.typeVisiteId || !body.lieuId) {
        return reject(new HttpErrors.BadRequest('Champs manquants pour mode scan'));
      }
      resolve({buffer: file.buffer, body});
    });
  });
}

// Parse form-data pour un visiteur planifié
function parseVisitorForm(request: Request): Promise<{
  buffer: Buffer;
  pieceType: PieceType;
}> {
  return new Promise((resolve, reject) => {
    const mw = multer({storage: multer.memoryStorage()}).fields([
      {name: 'file', maxCount: 1},
      {name: 'pieceType', maxCount: 1},
    ]);
    // @ts-ignore
    mw(request, {} as any, err => {
      if (err) return reject(err);
      const files = (request as any).files as Record<string, Express.Multer.File[]>;
      const file = files.file?.[0];
      const pieceType = (request.body.pieceType || '') as PieceType;
      if (!file?.buffer || !['CNI', 'Permis', 'Passport'].includes(pieceType)) {
        return reject(new HttpErrors.BadRequest('Fichier et type de pièce requis'));
      }
      resolve({buffer: file.buffer, pieceType});
    });
  });
}

@authenticate('jwt')
@authorize({allowedRoles: [Role.AGENT]})
export class VisiteController {
  constructor(
    @inject(SecurityBindings.USER) private currentUser: UserProfile,
    @service(VisiteService) private visiteService: VisiteService,
  ) {}

  // 1. Preview OCR création impromptue
  @post('/agent/visites/scan/preview')
  @response(200, {
    description: 'Preview OCR pour création de visite impromptue',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nom:         {type: 'string'},
              prenom:      {type: 'string'},
              pieceType:   {type: 'string', enum: ['CNI','Permis','Passport']},
              pieceNumero: {type: 'string'},
            },
            required: ['nom','prenom','pieceType','pieceNumero'],
          },
        },
      },
    },
  })
  async previewScan(@inject(RestBindings.Http.REQUEST) req: Request) {
    const {buffer, pieceType} = await parseOcrOnly(req);
    return this.visiteService.previewScan(buffer, pieceType);
  }



  // 2. Confirmation création impromptue
 @post('/agent/visites/scan')
  @response(200, {
    description: 'Créer visite impromptue après validation OCR',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Visite, {includeRelations: true}),
      },
    },
  })
  async confirmScan(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['employeId','typeVisiteId','lieuId','visitors'],
            properties: {
              employeId:    {type: 'string'},
              typeVisiteId: {type: 'string'},
              lieuId:       {type: 'string'},
              visitors: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['nom','prenom','pieceType','pieceNumero'],
                  properties: {
                    nom:         {type: 'string'},
                    prenom:      {type: 'string'},
                    pieceType:   {type: 'string', enum: ['CNI','Permis','Passport']},
                    pieceNumero: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    })
    req: ConfirmScanRequest,
  ): Promise<VisiteWithRelations> {
    const agentId = this.currentUser[securityId] as string;
    const visitors = req.visitors.map(v => ({
      nom: v.nom,
      prenom: v.prenom,
      pieceType: v.pieceType as PieceType,
      pieceNumero: v.pieceNumero,
    }));
    return this.visiteService.confirmScan({
      employeId:    req.employeId,
      agentId,
      typeVisiteId: req.typeVisiteId,
      lieuId:       req.lieuId,
      visitors,
    });
  }


  // 3. Création manuelle impromptue
  @post('/agent/visites/manual')
  @response(200, {
    description: 'Créer visite impromptue en mode manuel',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Visite, {includeRelations: true}),
      },
    },
  })
  async createManual(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['mode','employeId','typeVisiteId','lieuId','visitors'],
            properties: {
              mode:         {type: 'string', enum: ['manual']},
              employeId:    {type: 'string'},
              typeVisiteId: {type: 'string'},
              lieuId:       {type: 'string'},
              visitors: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['nom','prenom','pieceType','pieceNumero'],
                  properties: {
                    nom:         {type: 'string'},
                    prenom:      {type: 'string'},
                    pieceType:   {type: 'string', enum: ['CNI','Permis','Passport']},
                    pieceNumero: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    })
    manual: NewVisiteByAgentManualRequest,
  ): Promise<VisiteWithRelations> {
    if (manual.mode !== 'manual') {
      throw new HttpErrors.BadRequest('Mode “manual” attendu');
    }
    const agentId = this.currentUser[securityId] as string;
    return this.visiteService.createManual({...manual, agentId});
  }
  // 4. Preview OCR visiteur planifié
  @patch('/agent/visites/{visiteId}/visitor/{pivotId}/preview')
  @response(200, {
    description: 'Preview OCR pour visiteur planifié',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nom: {type: 'string'},
              prenom: {type: 'string'},
              pieceType: {type: 'string', enum: ['CNI','Permis','Passport']},
              pieceNumero: {type: 'string'},
            },
            required: ['nom','prenom','pieceType','pieceNumero'],
          },
        },
      },
    },
  })
  async previewPreEnregistrementVisitor(
    @param.path.string('visiteId') visiteId: string,
    @param.path.string('pivotId') pivotId: string,
    @inject(RestBindings.Http.REQUEST) req: Request,
  ) {
    const {buffer, pieceType} = await parseVisitorForm(req);
    return this.visiteService.previewPreEnregistrement(visiteId, buffer, pieceType);
  }

  // 5. Confirmation visiteur planifié
  @patch('/agent/visites/{visiteId}/visitor/{pivotId}/confirm')
  @response(200, {
    description: 'Valide & persiste visiteur planifié',
    content: {
      'application/json': {
        schema: getModelSchemaRef(VisiteVisiteur, {includeRelations: true}),
      },
    },
  })
  async confirmPreEnregistrementVisitor(
    @param.path.string('visiteId') visiteId: string,
    @param.path.string('pivotId') pivotId: string,
    @requestBody() body: ConfirmPreEnregistrementVisitorRequest,
  ): Promise<VisiteVisiteur> {
    return this.visiteService.confirmPreEnregistrement(
      visiteId,
      pivotId,
      {
        nom:         body.nom,
        prenom:      body.prenom,
        pieceType:   body.pieceType as PieceType,
        pieceNumero: body.pieceNumero,
      },
    );
  }

  // 6. Clôturer une visite
  @patch('/agent/visites/{id}/finish')
  @response(204, {description: 'Clôturer la visite'})
  async finishVisite(@param.path.string('id') id: string) {
    await this.visiteService.finishVisite(id, new Date().toISOString());
  }

  // 7. Liste des visites en attente (planifiées par employé)
  @get('/agent/visites/pending')
  @response(200, {
    description: 'Toutes les visites en attente',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Visite, {includeRelations: true}),
        },
      },
    },
  })
  async listPending(): Promise<VisiteWithRelations[]> {
    // On ne tient plus compte de query.filter, on renvoie simplement :
    return this.visiteService.listByStatus('en_attente');
  }

  // 8. Liste des visites en cours pour cet agent
  @get('/agent/visites/ongoing')
  @response(200, {
    description: 'Visites en cours',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Visite, {includeRelations: true}),
        },
      },
    },
  })
  async listOngoing(): Promise<VisiteWithRelations[]> {
    const agentId = this.currentUser[securityId] as string;
    return this.visiteService.listByAgentAndStatus(agentId, 'en_cours');
  }

  // 9. Détail d’une visite
  @get('/agent/visites/{id}')
  @response(200, {
    description: 'Détail d’une visite',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Visite, {includeRelations: true}),
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<VisiteWithRelations> {
    return this.visiteService.getVisitById(id);
  }

  // 10. Liste de tous les visiteurs déjà check‑in (tous agents)
  @get('/agent/visites/checked-in')
  @response(200, {
    description: 'Liste de tous les visiteurs déjà check‑in',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(VisiteVisiteur, {includeRelations: true}),
        },
      },
    },
  })
  async listCheckedIn(): Promise<VisiteVisiteur[]> {
    return this.visiteService.listCheckedInVisitors();
  }

    /**
   * Check‑in manuel d’un visiteur planifié
   */
  @patch('/agent/visites/visitor/{pivotId}/checkin')
  @response(200, {
    description: 'Check‑in manuel du visiteur planifié',
    content: {
      'application/json': {
        schema: getModelSchemaRef(VisiteVisiteur, {includeRelations: true}),
      },
    },
  })
  async checkInVisitor(
    @param.path.string('pivotId') pivotId: string,
  ): Promise<VisiteVisiteur> {
    return this.visiteService.checkInVisitor(pivotId);
  }

  /**
   * Check‑out manuel d’un visiteur planifié
   */
  @patch('/agent/visites/visitor/{pivotId}/checkout')
  @response(200, {
    description: 'Check‑out manuel du visiteur planifié',
    content: {
      'application/json': {
        schema: getModelSchemaRef(VisiteVisiteur, {includeRelations: true}),
      },
    },
  })
  async checkOutVisitor(
    @param.path.string('pivotId') pivotId: string,
  ): Promise<VisiteVisiteur> {
    return this.visiteService.checkOutVisitor(pivotId);
  }
}
