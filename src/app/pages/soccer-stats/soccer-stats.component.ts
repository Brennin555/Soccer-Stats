import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Partida } from 'src/app/interfaces/partida';
import { Time } from 'src/app/interfaces/time';
import { Router } from '@angular/router';

@Component({
  selector: 'app-soccer-stats',
  templateUrl: './soccer-stats.component.html',
  styleUrls: ['./soccer-stats.component.scss']
})
export class SoccerStatsComponent {

  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  partidas: Partida[] = [];
  rodadaEscolhida = '34'

  times: Time[] = [];
  timesTabela: Time[] = [];

  displayedColumns: string[] = ['posicao', 'nome', 'pontos', 'nJogos', 'nVitorias', 'nEmpates', 'nDerrotas', 'nGols'];

  async ngOnInit(): Promise<void> {
    await this.atualizaDados();
  }

  atualizaP(): void {
    this.api.atualizaPartidas().subscribe(
      (response) => {
        console.log('Partidas atualizadas com sucesso:', response);
        location.reload();
      },
      (error) => {
        console.error('Erro ao atualizar partidas:', error);
      }
    );
  }
  pegaEscudoTime(partida: Partida): any {
    this.api.getEscudoTime(partida.timeA).subscribe(
      (data) => {
        let escudo = data;
        partida.timeA_escudo = escudo.escudo;
      },
      (error) => {
        console.error('Erro ao buscar escudo do time A:', error);
      }
    );
    this.api.getEscudoTime(partida.timeB).subscribe(
      (data) => {
        let escudo = data;
        partida.timeB_escudo = escudo.escudo;
      },
      (error) => {
        console.error('Erro ao buscar escudo do time B:', error);
      }
    );
  }


  atualizaDados(): void {
    this.api.getPartidas().subscribe((data: any) => {
      this.partidas = data;
      if (this.partidas.length === 0) {
        console.error('A lista de partidas está vazia.');
        return;
      }
      this.partidas.forEach((partida) => {
        partida = this.api.tratarHorario(partida);
        partida.rodada = this.api.filtraRodada(partida.rodada);
        this.pegaEscudoTime(partida);
      });

      this.partidas = this.api.sortPartidas(this.partidas);



    });

    this.api.getTimes().subscribe((data: any) => {
      if (this.partidas.length === 0) {
        return;
      }
      this.times = data;
      this.api.sortTimes(this.times);
    });
  }

  mudaRodada(direcao:number): void {
      if(direcao < 0){
        this.rodadaEscolhida = (parseInt(this.rodadaEscolhida) - 1).toString();
      }else{
        this.rodadaEscolhida = (parseInt(this.rodadaEscolhida) + 1).toString();
      }
    }


    selecionaPartida(partida:Partida) {
      console.log('Partida selecionada:', partida);
      this.router.navigate(['/info-partida', partida.id]);
    }
}
