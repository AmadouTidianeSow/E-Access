// src/services/scanner.service.ts

import {injectable} from '@loopback/core';
import Tesseract, {PSM} from 'tesseract.js';
import {ManualVisiteurData} from '../controllers/dtos/new-visite-by-agent.dto';

export type PieceType = 'CNI' | 'Permis' | 'Passport';

export interface VisitorData extends ManualVisiteurData {
  id?: string;
  pieceType?: PieceType;
  nin?: string;
}

interface PatternSet {
  nom: RegExp;
  prenom: RegExp;
  dob: RegExp;
  numero?: RegExp;
}

@injectable()
export class ScannerService {
  private readonly patterns: Record<PieceType, PatternSet> = {
    CNI: {
      nom:    /Nom\s*[:\-]\s*(.+)/i,
      prenom: /Pr[eé]nom\s*[:\-]\s*(.+)/i,
      dob:    /(N[ée]e le|Naissance)\s*[:\-]\s*(\d{2}\/\d{2}\/\d{4})/i,
    },
    Permis: {
      nom:      /Nom\s*[:\-]\s*(.+)/iu,
      prenom:   /Pr[eé]nom\s*[:\-]\s*(.+)/iu,
      dob:      /(N[ée]e le)\s*[:\-]\s*(\d{2}\/\d{2}\/\d{4})/i,
      numero:   /N°\s*Permis\s*[:\-]\s*([\w\d-]+)/i,
    },
    Passport: {
      nom:      /Surname\s*[:\-]\s*(.+)/i,
      prenom:   /Given\s*Names?\s*[:\-]\s*(.+)/i,
      dob:      /(Date of Birth)\s*[:\-]\s*(\d{2}[\/\s]?[A-Z]{3}[\/\s]?\d{4}|\d{2}\/\d{2}\/\d{4})/i,
      numero:   /N°\s*Passport\s*[:\-]\s*([A-Z0-9]+)/i,
    },
  };

  /**
   * OCR + parsing selon le type de pièce.
   * Ajout de fallback heuristique si les patterns standards échouent.
   * @param buffers [recto, verso?]
   */
  async scan(buffers: Buffer[], pieceType: PieceType): Promise<VisitorData[]> {
    const ocrOptions = { tessedit_pageseg_mode: PSM.SINGLE_LINE } as any;
    // OCR du recto avec PSM.SINGLE_LINE pour nom/prenom
    const {data: {text: frontText}} = await Tesseract.recognize(
      buffers[0], 'fra', ocrOptions
    );

    console.log('OCR frontText:', frontText);

    // OCR du verso pour la CNI (PSM.SINGLE_BLOCK)
    let backText = '';
    if (pieceType === 'CNI' && buffers.length > 1) {
      const res = await Tesseract.recognize(
        buffers[1], 'fra', { tessedit_pageseg_mode: PSM.SINGLE_BLOCK } as any
      );
      backText = res.data.text;
      console.log('OCR backText:', backText);
    }

    // Divise selon retour à la ligne
    const lines = frontText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    console.log('OCR lines:', lines);

    const result: Partial<VisitorData> = { pieceType };
    const pset = this.patterns[pieceType];

    // Extraction par regex
    for (const line of lines) {
      if (!result.nom) {
        const m = line.match(pset.nom);
        if (m) { result.nom = m[1].trim(); continue; }
      }
      if (!result.prenom) {
        const m = line.match(pset.prenom);
        if (m) { result.prenom = m[1].trim(); continue; }
      }
      if (!result.dateNaissance) {
        const m = line.match(pset.dob);
        if (m) { result.dateNaissance = m[2] ? m[2].trim() : m[1].trim(); continue; }
      }
      if (pset.numero && !result.pieceNumero) {
        const m = line.match(pset.numero);
        if (m) { result.pieceNumero = m[1].trim(); continue; }
      }
    }

    // Fallback heuristique pour nom/prenom en majuscules
    if (!result.nom && !result.prenom) {
      for (const line of lines) {
        if (/^[A-ZÉÈÀÂÎÔÛÄËÏÖÜÇ ,]+$/.test(line) && line.split(/\s+/).length >= 2) {
          const parts = line.split(/\s+/);
          result.prenom = parts.shift()!;
          result.nom = parts.join(' ');
          console.log('Fallback name:', result.prenom, result.nom);
          break;
        }
      }
    }

    // Extraction NIN pour CNI
    if (pieceType === 'CNI' && backText) {
      const ninMatch = backText.match(/NIN\s*[:\-]\s*([A-Z0-9]+)/i);
      if (ninMatch) {
        result.nin = ninMatch[1].trim();
      }
    }

    // Validation finale
    const hasId = pieceType === 'CNI' ? !!result.nin : !!result.pieceNumero;
    if (result.nom && result.prenom && hasId) {
      return [result as VisitorData];
    }

    return [];
  }
}
