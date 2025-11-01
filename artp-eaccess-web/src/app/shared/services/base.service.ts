import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable()
export class BaseService {

  serverURL = environment.baseURL;

  headers = new HttpHeaders({
    "content-type": "application/json",
  });

  constructor(private http: HttpClient) {}

  post(url, data): any {
    url = this.serverURL + url;
    
    console.log('URL de la requête :', url);
  
  
    return this.http.post(url, data, { headers: this.headers }).pipe(
        map((res: any) => {
            // Log the response
            console.log('Réponse de la requête :', res);
            return res;
        }),
        catchError((err) => {
            // Log the errors
            console.error('Erreur dans la requête HTTP :', err);
            throw new Error(err);
        })
    );
}

  



  get(url): any {
    url = this.serverURL + url;
    
    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: any) => res),
      catchError((err) => {
         throw new Error(err);
      })
    );
  }

  delete(url): any {
    url = this.serverURL + url;
   
    return this.http.delete(url, { headers: this.headers }).pipe(
      map((res: any) => res),
      catchError((err) => {
         throw new Error(err);
      })
    );
  }

  put(url, data): any {
    url = this.serverURL + url;
   
    return this.http.put(url, data, { headers: this.headers }).pipe(
      map((res: any) => res),
      catchError((err) => {
         throw new Error(err);
      })
    );
  }

  patch(url, data): any {
    url = this.serverURL + url;
   
    return this.http.patch(url, data, { headers: this.headers }).pipe(
      map((res: any) => res),
      catchError((err) => {
         throw new Error(err);
      })
    );
  }
}
