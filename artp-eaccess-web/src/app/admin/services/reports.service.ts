// src/app/admin/services/reports.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private base = 'http://localhost:3000/admin';

  /**
   * Télécharge un rapport
   * @param format 'csv' 
   * @param params soit { period } soit { from, to }
   */
  exportReport(
    format: 'csv' | 'pdf',
    params: { period?: 'daily' | 'weekly' | 'monthly'; from?: string; to?: string },
  ): Observable<File> {
    let httpParams = new HttpParams().set('format', format);
    if (params.period) {
      httpParams = httpParams.set('period', params.period);
    } else if (params.from && params.to) {
      httpParams = httpParams.set('from', params.from).set('to', params.to);
    }
    return this.http
      .get(`${this.base}/reports/export`, {
        params: httpParams,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map(res => {
          const cd = res.headers.get('content-disposition') || '';
          const m = /filename="?([^"]+)"?/.exec(cd);
          const filename = m ? m[1] : `report.${format}`;
          return new File([res.body!], filename, { type: res.body!.type });
        })
      );
  }

  constructor(private http: HttpClient) {}
}
