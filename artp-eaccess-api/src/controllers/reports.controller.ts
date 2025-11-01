// src/controllers/reports.controller.ts

import {
  repository,
  Where,
} from '@loopback/repository';
import {
  get,
  param,
  Response,
  RestBindings,
  HttpErrors,
  response,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {Role} from '../constants';
import {VisiteRepository} from '../repositories';
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import PDFDocument from 'pdfkit';

const writeFile = promisify(fs.writeFile);

type Period = 'daily' | 'weekly' | 'monthly';

@authenticate('jwt')
@authorize({allowedRoles: [Role.ADMIN]})
export class ReportsController {
  constructor(
    @repository(VisiteRepository)
    public visiteRepo: VisiteRepository,
  ) {}

  /**
   * Export des visites en CSV ou PDF.
   *
   * Query params :
   * - format: 'csv' | 'pdf' (obligatoire)
   * - period: 'daily' | 'weekly' | 'monthly' (mutuellement exclusif avec from/to)
   * - from, to: ISO dates pour plage personnalisée
   */
  @get('/admin/reports/export')
  @response(200, {
    description: 'Export des visites en CSV ou PDF',
    content: {'application/json': {schema: {type: 'object', properties: {message: {type: 'string'}}}}},
  })
  async export(
    @param.query.string('format', {required: true, schema: {enum: ['csv', 'pdf']}})
    format: 'csv' | 'pdf',

    // on place `response` juste après le paramètre requis
    @inject(RestBindings.Http.RESPONSE) response: Response,

    // puis les optionnels
    @param.query.string('period', {
      description: 'daily | weekly | monthly (alternative à from/to)',
      schema: {enum: ['daily', 'weekly', 'monthly']},
    })
    period?: Period,

    @param.query.string('from', {
      description: 'Date ISO début (ex: 2025-07-01T00:00:00.000Z)',
    })
    from?: string,

    @param.query.string('to', {
      description: 'Date ISO fin (ex: 2025-07-31T23:59:59.999Z)',
    })
    to?: string,
  ): Promise<Response> {
    // --- Calcul de la période ---
    let start: Date, end: Date;
    const now = new Date();
    if (period) {
      switch (period) {
        case 'daily':
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'weekly':
          const d = new Date();
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1);
          start = new Date(d.setDate(diff));
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
      }
    } else if (from && to) {
      start = new Date(from);
      end = new Date(to);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        throw new HttpErrors.BadRequest('Dates invalides pour from/to');
      }
    } else {
      throw new HttpErrors.BadRequest(
        'Vous devez préciser soit `period`, soit `from` et `to`',
      );
    }

    // --- Préparation du dossier temporaire ---
    const tmpDir = path.join(__dirname, '../../.tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, {recursive: true});
    }

    // --- Récupération des visites avec relations ---
    const where: Where = {
      and: [
        {dateDebut: {gte: start.toISOString()}},
        {dateDebut: {lte: end.toISOString()}},
      ],
    };
    const visites = await this.visiteRepo.find({
      where,
      include: [
        {relation: 'visiteurs'},
        {relation: 'lieu'},
        {relation: 'typeVisite'},
      ],
    });

    // --- Génération du fichier ---
    const ts = Date.now();
    let filename: string;
    let filePath: string;

    if (format === 'csv') {
      filename = `visites_${period||'custom'}_${ts}.csv`;
      filePath = path.join(tmpDir, filename);

      // En‑tête CSV
      const header = [
        'ID',
        'DateDebut',
        'DateFin',
        'Statut',
        'NbVisiteurs',
        'EmployeId',
        'AgentId',
        'Lieu',
        'TypeVisite',
        'Visiteurs (Nom Prenom)',
      ].join(',') + '\n';

      // Lignes
      const rows = visites.map(v => {
        const visitorsList = v.visiteurs.map(x => `${x.prenom} ${x.nom}`).join('; ');
        return [
          v.id,
          v.dateDebut,
          v.dateFin ?? '',
          v.statut,
          v.nombreVisiteurs.toString(),
          v.employeId,
          v.agentId ?? '',
          v.lieu?.nom ?? v.lieuId,
          v.typeVisite?.nom ?? v.typeVisiteId,
          `"${visitorsList}"`,
        ].join(',');
      });

      await writeFile(filePath, header + rows.join('\n'), 'utf8');
    } else {
      filename = `visites_${period||'custom'}_${ts}.pdf`;
      filePath = path.join(tmpDir, filename);

      const doc = new PDFDocument({margin: 40, size: 'A4'});
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(18).text(`Rapport des visites (${period||'custom'})`, {align: 'center'});
      doc.moveDown();

      // En‑tête du tableau
      doc.fontSize(10).text(
        [
          'ID'.padEnd(20),
          'Début'.padEnd(20),
          'Fin'.padEnd(20),
          'Statut'.padEnd(12),
          'NbVis'.padEnd(6),
          'Lieu'.padEnd(15),
          'Type'.padEnd(15),
        ].join(''),
        {underline: true},
      );
      doc.moveDown(0.5);

      // Lignes
      visites.forEach(v => {
        doc.text(
          [
            (v.id ?? '').padEnd(20),
            v.dateDebut.padEnd(20),
            (v.dateFin ?? '').padEnd(20),
            v.statut.padEnd(12),
            v.nombreVisiteurs.toString().padEnd(6),
            (v.lieu?.nom ?? v.lieuId).padEnd(15),
            (v.typeVisite?.nom ?? v.typeVisiteId).padEnd(15),
          ].join(''),
          {continued: false},
        );
      });

      doc.end();
      await new Promise<void>((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', err => reject(err));
      });
    }

    // --- Envoi du fichier en téléchargement ---
    response.download(filePath, filename, err => {
      if (err) {
        throw new HttpErrors.InternalServerError(`Échec du téléchargement : ${err.message}`);
      }
    });
    return response;
  }
}
