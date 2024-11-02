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

  atualizaPartidas(){
    console.log('Atualizando partidas...');

    // abrir link em uma nova janela
    window.open(this.apiUrlPartidas, '_blank');
    // return this.http.request('GET', this.apiUrlPartidas);


    // return this.http.get<any>(this.apiUrlPartidas).pipe(
    //   catchError((error) => {
    //     console.error('Erro ao atualizar partidas:', error);
    //     return throwError(error);
    //   })
    // );
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

atualizaPartidasDia(dia: string){
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
  if(horas < 3){
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

  quickSortPartidas(partidas: any[], inicio: number, fim: number): void {
    if (partidas.length === 0) {
      console.error("A lista de partidas está vazia.");
      return;
    }

    if (inicio < fim) {
      const p = this.particaoPartidasPorDia(partidas, inicio, fim);
      this.quickSortPartidas(partidas, inicio, p - 1);
      this.quickSortPartidas(partidas, p + 1, fim);

      // Ordenar as partidas do mesmo dia por horário
      let diaInicio = inicio;
      for (let i = inicio + 1; i <= fim; i++) {
        if (i === fim || partidas[i].dia !== partidas[diaInicio].dia) {
          this.quickSortPartidasPorHorario(partidas, diaInicio, i - 1);
          diaInicio = i;
        }
      }
    }
  }

  particaoPartidasPorDia(partidas: any[], inicio: number, fim: number): number {
    const pivo = partidas[fim].dia;
    let i = inicio - 1;
    for (let j = inicio; j < fim; j++) {
      if (partidas[j].dia < pivo) {
        i++;
        const aux = partidas[i];
        partidas[i] = partidas[j];
        partidas[j] = aux;
      }
    }
    const aux = partidas[i + 1];
    partidas[i + 1] = partidas[fim];
    partidas[fim] = aux;
    return i + 1;
  }

  quickSortPartidasPorHorario(partidas: any[], inicio: number, fim: number): void {
    if (inicio < fim) {
      const p = this.particaoPartidasPorHorario(partidas, inicio, fim);
      this.quickSortPartidasPorHorario(partidas, inicio, p - 1);
      this.quickSortPartidasPorHorario(partidas, p + 1, fim);
    }
  }

  particaoPartidasPorHorario(partidas: any[], inicio: number, fim: number): number {
    const pivo = partidas[fim].horario;
    let i = inicio - 1;
    for (let j = inicio; j < fim; j++) {
      if (partidas[j].horario < pivo) {
        i++;
        const aux = partidas[i];
        partidas[i] = partidas[j];
        partidas[j] = aux;
      }
    }
    const aux = partidas[i + 1];
    partidas[i + 1] = partidas[fim];
    partidas[fim] = aux;
    return i + 1;
  }


}
