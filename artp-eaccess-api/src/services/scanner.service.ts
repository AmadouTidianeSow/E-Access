// src/services/scanner.service.ts

import {injectable} from '@loopback/core';
import Tesseract from 'tesseract.js';
import {ManualVisiteurData} from '../controllers/dtos/new-visite-by-agent.dto';

export type PieceType = 'CNI' | 'Permis' | 'Passport';

export interface VisitorData extends ManualVisiteurData {
  id?: string;
  pieceType?: PieceType;
  pieceNumero: string;  // stocke CNI → NIN, Permis → numéro, Passport → numéro
}

@injectable()
export class ScannerService {
  /**
   * OCR + extraction nom/prenom/numero suivant type.
   * @param buffer  Image Buffer
   * @param pieceType  'CNI' | 'Permis' | 'Passport'
   */
  async scan(buffer: Buffer, pieceType: PieceType): Promise<VisitorData[]> {
    // OCR
    const { data: { text = '' } } = await Tesseract.recognize(
      buffer,
      'fra',
      { tessedit_pageseg_mode: Tesseract.PSM.AUTO } as any,
    );
    console.log('=== OCR RAW TEXT ===\n', text);

    const lines = text.split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    console.log('=== OCR LINES ===\n', lines);

    let nom = '';
    let prenom = '';
    let numero = '';

    switch (pieceType) {
      case 'Permis':
        // Nom après 'Permis'
        const idxP = lines.findIndex(l => /perm/i.test(l));
        if (idxP !== -1 && lines[idxP + 1]) {
          const cand = lines[idxP + 1]
            .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, ' ')
            .trim()
            .split(/\s+/);
          nom = cand.pop() || '';
        }
        // Prénom sur ligne 'PRÉNOMS'
        for (let i = 0; i < lines.length; i++) {
          if (/PR[ÉE]NOMS?/i.test(lines[i])) {
            prenom = (lines[i + 1] || '').trim();
            break;
          }
        }
        // Numéro 7–13 chiffres
        const mP = text.match(/\b(\d{7,13})\b/);
        if (mP) numero = mP[1];
        break;

      case 'Passport':
        // MRZ via 'P<'
        const idxR = lines.findIndex(l => l.includes('P<'));
        if (idxR !== -1) {
          const l1 = lines[idxR];
          const l2 = lines[idxR + 1] || '';
          const afterP = l1.slice(l1.indexOf('P<') + 2);
          const [surn, giv] = afterP.split('<<');
          nom = surn.replace(/<+/g, '').trim();
          prenom = (giv || '').split('<')[0].replace(/<+/g, '').trim();
          const mR = l2.match(/[A-Z]\d{6,8}/) || l2.match(/\d{7,12}/);
          if (mR) numero = mR[0];
        }
        break;

      case 'CNI':
        // MRZ ligne 'NOM<<'
        const idxC = lines.findIndex(l => /^[A-Z]+<<[A-Z]/.test(l));
        if (idxC !== -1) {
          const [surnC, afterC] = lines[idxC].split('<<', 2);
          nom = surnC.replace(/<+/g, '').trim();
          prenom = afterC.split('<').filter(p => p).join(' ').trim();
        }
        // NIN sur la ligne 'NIN'
        const ninLine = lines.find(l => /^NIN\b/i.test(l));
        if (ninLine) {
          const parts = ninLine.match(/\d+/g) || [];
          numero = parts.join('');
        }
        break;
    }

    if (nom && prenom && numero) {
      return [{ nom, prenom, pieceType, pieceNumero: numero }];
    }
    return [];
  }
}
