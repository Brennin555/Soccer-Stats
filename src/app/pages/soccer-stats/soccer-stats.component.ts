import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Partida } from 'src/app/interfaces/partida';
import { Time } from 'src/app/interfaces/time';

@Component({
  selector: 'app-soccer-stats',
  templateUrl: './soccer-stats.component.html',
  styleUrls: ['./soccer-stats.component.scss']
})
export class SoccerStatsComponent {

  constructor(private api: ApiService) { }

  partidas: Partida[] = [];
  rodadaEscolhida = '33'

  times: Time[] = [];
  timesTabela: Time[] = [];

  displayedColumns: string[] = ['posicao', 'nome', 'pontos', 'nJogos', 'nVitorias', 'nEmpates', 'nDerrotas', 'nGols'];

  ngOnInit(): void {
    // this.api.atualizaPartidas();
    this.atualizaDados();
  }

  atualizaP(): void {
    this.api.atualizaPartidas();
  }

  atualizaDados(): void {
    this.api.getPartidas().subscribe((data: any) => {
      this.partidas = data;
      this.partidas.forEach((partida) => {
        partida.horario = this.api.tratarHorario(partida.horario);
        partida.rodada = this.api.filtraRodada(partida.rodada);
      });
    });

    this.api.getTimes().subscribe((data: any) => {
      this.times = data;
      this.api.quickSortTimes(this.times, 0, this.times.length - 1);
    });
  }

  mudaRodada(direcao:number): void {
      if(direcao < 0){
        this.rodadaEscolhida = (parseInt(this.rodadaEscolhida) - 1).toString();
      }else{
        this.rodadaEscolhida = (parseInt(this.rodadaEscolhida) + 1).toString();
      }
    }

}
