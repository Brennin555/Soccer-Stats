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

  atualizaPartidas() {
    console.log('Atualizando partidas...');
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

  getPartida(idPartida: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?partida=' + idPartida);
  }

  getJogadores(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?jogadores');
  }

  getJogadoresTime(idTime: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?jogador=' + idTime);
  }

  getJogador(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?jogador=' + id);
  }

  getEstatisticas(idPartida: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?estatisticas=true&idPartida=' + idPartida);
  }

  getDetalhesPartida(idPartida: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?detalhespartida=true&idPartida=' + idPartida);
  }

  getEscudoTime(idTime: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?escudo=true&idTime=' + idTime);
  }

  getPartidasDia(dia: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?partidasdia=' + dia);
  }

  atualizaPartidasDia(dia: string) {
    console.log('Atualizando partidas do dia...');
    // abrir link em uma nova janela
    window.open(this.apiUrlPartidas + '?dia=' + dia, '_blank');
  }

  tratarHorario(partida: Partida) {
    const data = new Date(partida.horario);
    partida.dia = data.toLocaleDateString();

    let horas = data.getHours();
    let minutos = data.getMinutes();

    let correcaoHorario = horas - 3;
    if (horas < 3) {
      partida.dia = new Date(data.setDate(data.getDate() - 1)).toLocaleDateString();
      correcaoHorario = 24 + correcaoHorario;
    }

    partida.horario = correcaoHorario.toString().padStart(2, '0') + "h" + minutos.toString().padStart(2, '0');

    return partida;
  }

  filtraRodada(rodada: string): string {
    rodada = rodada.split("-")[1];
    return rodada.split(" ")[1];
  }

  sortTimes(times: any[]): any[] {
    return times.sort((a, b) => b.pontos - a.pontos);
  }


  sortPartidas(partidas: any[]): any[] {
    return partidas.sort((a, b) => {
      //converte para Date
      const dataA = new Date(a.dia.split("/").reverse().join("-"));
      const dataB = new Date(b.dia.split("/").reverse().join("-"));

      //compara as datas
      if (dataA.getTime() !== dataB.getTime()) {
        return dataA.getTime() - dataB.getTime();
      }

      //compara o horário
      return a.horario.localeCompare(b.horario);
    });
  }

}
