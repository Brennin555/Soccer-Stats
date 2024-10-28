import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Partida } from '../interfaces/partida';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost/soccer-stats/api.php';
  private apiUrlPartidas = 'http://localhost/soccer-stats/addPartidas.php';

  constructor(private http: HttpClient) { }

  atualizaPartidas(): Observable<any> {
    return this.http.get<any>(this.apiUrlPartidas).pipe(
      catchError((error) => {
        console.error('Erro ao atualizar partidas:', error);
        return throwError(error);
      })
    );
  }

  getTimes(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?times');
  }

  getPartidas(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?partidas');
  }

  getJogadores(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?jogadores');
  }

  tratarHorario(horario: string): string {
    const data = new Date(horario);
    return data.toLocaleDateString() + ' ' + data.toLocaleTimeString();
  }

  filtraRodada(rodada: string): string {
      rodada = rodada.split("-")[1];
      return rodada.split(" ")[1];
  }

  quickSortTimes(times: any[], inicio: number, fim: number): void {
    if (times.length === 0) {
      console.error("A lista de times está vazia.");
      return;
  }

    if (inicio < fim) {
      const p = this.particao(times, inicio, fim);
      this.quickSortTimes(times, inicio, p - 1);
      this.quickSortTimes(times, p + 1, fim);
    }
  }

  particao(times: any[], inicio: number, fim: number): number {
    const pivo = times[fim].pontos;
    let i = inicio - 1;
    for (let j = inicio; j < fim; j++) {
      if (times[j].pontos > pivo) {
        i++;
        const aux = times[i];
        times[i] = times[j];
        times[j] = aux;
      }
    }
    const aux = times[i + 1];
    times[i + 1] = times[fim];
    times[fim] = aux;
    return i + 1;
  }


}
