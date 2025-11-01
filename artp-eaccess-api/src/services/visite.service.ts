// src/services/visite.service.ts

import {injectable, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Count, Where} from '@loopback/repository';
import {
  VisiteRepository,
  VisiteVisiteurRepository,
  VisiteurRepository,
} from '../repositories';
import {NotificationService} from './notification.service';
import {
  NewVisiteByAgentManualRequest,
} from '../controllers/dtos/new-visite-by-agent.dto';
import {ScannerService, VisitorData, PieceType} from './scanner.service';
import {VisiteVisiteur, VisiteWithRelations} from '../models';

type VisiteStatut = 'en_cours' | 'terminee' | 'annulee' | 'en_attente';
type VisiteurStatut = 'pending' | 'checked_in' | 'checked_out';

@injectable()
export class VisiteService {
  constructor(
    @repository(VisiteRepository)
    private visiteRepo: VisiteRepository,

    @repository(VisiteVisiteurRepository)
    private pivotRepo: VisiteVisiteurRepository,

    @repository(VisiteurRepository)
    private visiteurRepo: VisiteurRepository,

    @inject('services.ScannerService')
    private scannerService: ScannerService,

    @inject('services.NotificationService')
    private notificationService: NotificationService,
  ) {}

  // ----- 1) Impromptue par scan : prévisualisation OCR -----
  async previewScan(buffer: Buffer, pieceType: PieceType): Promise<VisitorData[]> {
    return this.scannerService.scan(buffer, pieceType);
  }

  // ----- 2) Impromptue par scan : confirmation -----
  async confirmScan(data: {
    employeId: string;
    agentId: string;
    typeVisiteId: string;
    lieuId: string;
    visitors: VisitorData[];
  }): Promise<VisiteWithRelations> {
    const now = new Date().toISOString();
    const visite = await this.visiteRepo.create({
      employeId: data.employeId,
      agentId: data.agentId,
      typeVisiteId: data.typeVisiteId,
      lieuId: data.lieuId,
      dateDebut: now,
      statut: 'en_attente',
      nombreVisiteurs: data.visitors.length,
    });

    for (const v of data.visitors) {
      const vis = await this.visiteurRepo.create(v);
      await this.pivotRepo.create({
        visiteId: visite.id!,
        visiteurId: vis.id!,
        checkIn: now,
        statut: 'checked_in' as VisiteurStatut,
      });
    }

    await this.notificationService.notifyVisitRequest(
      data.agentId, data.employeId, visite.id!,
    );
    return this.getVisitById(visite.id!);
  }

  // ----- 3) Planifiée : prévisualisation OCR d’un visiteur -----
  async previewPreEnregistrement(
    visiteId: string,
    buffer: Buffer,
    pieceType: PieceType,
  ): Promise<VisitorData[]> {
    const visite = await this.visiteRepo.findById(visiteId);
    if (visite.statut !== 'en_attente') {
      throw new HttpErrors.BadRequest('Visite non en attente');
    }
    return this.scannerService.scan(buffer, pieceType);
  }

  // ----- 4) Planifiée : confirmation d’un visiteur -----

async confirmPreEnregistrement(
  visiteId: string,
  pivotId: string,
  data: {
    nom: string;
    prenom: string;
    pieceType: PieceType;
    pieceNumero: string;
  },
): Promise<VisiteVisiteur> {
  // ON SUPPRIME TOUT TEST de visiteId & statut

  // 1) Mise à jour des infos du visiteur
  await this.visiteurRepo.updateById(
    (await this.pivotRepo.findById(pivotId)).visiteurId,
    {
      nom: data.nom,
      prenom: data.prenom,
      pieceType: data.pieceType,
      pieceNumero: data.pieceNumero,
    },
  );

  // 2) Passage en checked_in
  const now = new Date().toISOString();
  await this.pivotRepo.updateById(pivotId, {
    checkIn: now,
    statut: 'checked_in' as VisiteurStatut,
  });

  // 3) Notification
  const visite = await this.visiteRepo.findById(visiteId);
  await this.notificationService.notifyVisitorCheckin(
    visite.agentId,
    visite.employeId,
    visiteId,
    `${data.prenom} ${data.nom}`,
  );

   // **Nouvelle logique** : si tous les visiteurs sont désormais check‑in, on démarre la visite
  const pendingCount = await this.pivotRepo.count({
    visiteId,
    statut: 'pending',
  });
  if (pendingCount.count === 0) {
    await this.visiteRepo.updateById(visiteId, {statut: 'en_cours'});
  }

  return this.pivotRepo.findById(pivotId, {include: ['visiteur']});
}
  // ----- 5) Impromptue par saisie manuelle -----
  async createManual(
    data: NewVisiteByAgentManualRequest & {agentId: string},
  ): Promise<VisiteWithRelations> {
    const now = new Date().toISOString();
    const visite = await this.visiteRepo.create({
      employeId: data.employeId,
      agentId: data.agentId,
      typeVisiteId: data.typeVisiteId,
      lieuId: data.lieuId,
      dateDebut: now,
      statut: 'en_attente',
      nombreVisiteurs: data.visitors.length,
    });
    for (const v of data.visitors) {
      const vis = await this.visiteurRepo.create(v);
      await this.pivotRepo.create({
        visiteId: visite.id!,
        visiteurId: vis.id!,
        checkIn: now,
        statut: 'checked_in' as VisiteurStatut,
      });
    }
    await this.notificationService.notifyVisitRequest(
      data.agentId, data.employeId, visite.id!,
    );
    return this.getVisitById(visite.id!);
  }

  // ----- 6) Décision employé sur impromptue -----
  async decideVisit(
    visiteId: string,
    req: {decision: 'accept' | 'refuse'},
  ): Promise<void> {
    const visite = await this.visiteRepo.findById(visiteId);
    if (visite.statut !== 'en_attente') {
      throw new HttpErrors.BadRequest('Visite déjà traitée');
    }
    const accepted = req.decision === 'accept';
    await this.visiteRepo.updateById(visiteId, {
      statut: accepted ? 'en_cours' : 'annulee',
    });
    await this.notificationService.notifyVisitResponse(
      visite.employeId, visite.agentId, visiteId, accepted,
    );
  }

  // ----- 7) Clôturer une visite -----
  async finishVisite(visiteId: string, dateFin: string): Promise<void> {
    const visite = await this.visiteRepo.findById(visiteId);
    if (visite.statut !== 'en_cours') {
      throw new HttpErrors.BadRequest('Visite non trouvée ou pas en cours');
    }
    await this.visiteRepo.updateById(visiteId, {
      dateFin,
      statut: 'terminee' as VisiteStatut,
    });
    await this.notificationService.notifyVisitResponse(
      visite.employeId, visite.agentId, visiteId, true,
    );
  }

  // ----- 8) Check‑in manuel -----
  async checkInVisitor(pivotId: string): Promise<VisiteVisiteur> {
    const link = await this.pivotRepo.findById(pivotId);
    if (link.statut !== 'pending') {
      throw new HttpErrors.BadRequest('Le visiteur est déjà check‑in ou terminé');
    }
    const now = new Date().toISOString();
    await this.pivotRepo.updateById(pivotId, {
      checkIn: now,
      statut: 'checked_in' as VisiteurStatut,
    });
    // notifier l’employé
    const visite = await this.visiteRepo.findById(link.visiteId);
    const visitor = await this.visiteurRepo.findById(link.visiteurId);
    await this.notificationService.notifyVisitorCheckin(
      visite.agentId,
      visite.employeId,
      link.visiteId,
      `${visitor.prenom} ${visitor.nom}`,
    );
    return this.pivotRepo.findById(pivotId, {include: ['visiteur']});
  }

  /**
   * Check‑out manuel d’un visiteur.
   * Si c’est le dernier visiteur à check‑out, termine aussi la visite.
   */
  async checkOutVisitor(pivotId: string): Promise<VisiteVisiteur> {
    // 1) Récupérer le lien pivot
    const link = await this.pivotRepo.findById(pivotId);
    if (link.statut !== 'checked_in') {
      throw new HttpErrors.BadRequest(
        'Le visiteur doit être checked_in avant le check_out',
      );
    }

    // 2) Passer ce pivot en checked_out
    const now = new Date().toISOString();
    await this.pivotRepo.updateById(pivotId, {
      checkOut: now,
      statut: 'checked_out' as VisiteurStatut,
    });

    // 3) Vérifier s’il reste des visiteurs non check‑out pour cette visite
    const pendingWhere: Where<VisiteVisiteur> = {
      visiteId: link.visiteId,
      statut: {neq: 'checked_out'},
    };
    const pendingCount: Count = await this.pivotRepo.count(pendingWhere);

    // 4) Si tous les visiteurs sont check‑out → terminer la visite
    if (pendingCount.count === 0) {
      await this.visiteRepo.updateById(link.visiteId, {
        statut: 'terminee' as VisiteStatut,
        dateFin: now,
      });
    }

    // 5) Retourner le pivot mis à jour, incluant le visiteur
    return this.pivotRepo.findById(pivotId, {include: ['visiteur']});
  }

  // ----- 10) Détail d’un visiteur -----
  async getVisitorDetail(pivotId: string): Promise<VisiteVisiteur> {
    return this.pivotRepo.findById(pivotId, {include: ['visiteur']});
  }

  // ----- 11) Détail d’une visite (avec pivot + visiteur) -----
  async getVisitById(id: string): Promise<VisiteWithRelations> {
    return this.visiteRepo.findById(id, {
      include: [
        {
          relation: 'visiteursLink',
          scope: {include: ['visiteur']},
        },
      ],
    });
  }

  // ----- 12) Listes par statut (avec pivot + visiteur) -----
  async listByStatus(status: VisiteStatut): Promise<VisiteWithRelations[]> {
    return this.visiteRepo.find({
      where: {statut: status},
      include: [{relation: 'visiteursLink', scope: {include: ['visiteur']}}],
    });
  }

  async listByAgentAndStatus(
    agentId: string,
    status: VisiteStatut,
  ): Promise<VisiteWithRelations[]> {
    return this.visiteRepo.find({
      where: {agentId, statut: status},
      include: [{relation: 'visiteursLink', scope: {include: ['visiteur']}}],
    });
  }

  // ----- 13) Nouvelle : récupérer **tous** les visiteurs en état checked_in -----
  async listCheckedInVisitors(): Promise<VisiteVisiteur[]> {
    return this.pivotRepo.find({
      where: {statut: 'checked_in'},
      include: ['visiteur', 'visite'],
    });
  }

   /** Recherche de visites selon un where dynamique */
  async findVisitesByFilters(where: object): Promise<VisiteWithRelations[]> {
    return this.visiteRepo.find({
      where,
      include: [{relation: 'visiteursLink', scope: {include: ['visiteur']}}],
    });
  }

  /** Recherche de visiteurs selon un where dynamique */
  async findVisiteursByFilters(where: object): Promise<VisiteVisiteur[]> {
    return this.pivotRepo.find({
      where,
      include: ['visiteur', 'visite'],
    });
  }
}
