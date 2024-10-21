import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost/soccer-stats/api.php'; // URL do PHP

  constructor(private http: HttpClient) { }

  getTimes(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

    // Método POST para adicionar um novo time
    addTime(nome: string): Observable<any> {
      const data = { nome };
      return this.http.post<any>(this.apiUrl, data);
    }
}
