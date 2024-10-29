import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Estatisticas } from 'src/app/interfaces/estatisticas';
import { Partida } from 'src/app/interfaces/partida';
import { DetalhesPartida } from 'src/app/interfaces/detalhesPartida';

@Component({
  selector: 'app-info-partida',
  templateUrl: './info-partida.component.html',
  styleUrls: ['./info-partida.component.scss']
})
export class InfoPartidaComponent implements OnInit {

  estatisticas = {} as Estatisticas;
  partida = {} as Partida;
  detalhesPartida = [] as DetalhesPartida[];

  substituicoes: DetalhesPartida[] = [];
  cartoes: DetalhesPartida[] = [];


  idPartida: string = '';

  constructor(
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.pegarURL();
    this.atualizaDados();
  }

  // pegar idPartida que esta na url
  pegarURL(): void {
    let url = window.location.href;
    this.idPartida = url.split('info-partida/')[1];
    console.log('idPartida:', this.idPartida);
  }


  atualizaDados(): void {
    this.api.getEstatisticas(this.idPartida).subscribe(
      (data) => {
        this.estatisticas = data[0];
        console.log('Estatísticas:', this.estatisticas);
      },
      (error) => {
        console.error('Erro ao buscar estatísticas:', error);
      }
    );

    this.api.getPartida(this.idPartida).subscribe(
      (data) => {
        this.partida = data[0];
        this.partida = this.api.tratarHorario(this.partida);
        this.partida.rodada = this.api.filtraRodada(this.partida.rodada);
        console.log(this.partida); // Aqui está tudo ok
      },
      (error) => {
        console.error('Erro ao buscar partida:', error);
      }
    );

    this.api.getDetalhesPartida(this.idPartida).subscribe(
      (data) => {
        this.detalhesPartida = data;
        console.log('Detalhes da partida:', this.detalhesPartida);
        this.tratarDetalhes();
        this.separarDetalhes();
      },
      (error) => {
        console.error('Erro ao buscar detalhes da partida:', error);
      }
    );
  }

  tratarDetalhes() {
    // Verifique se detalhesPartida não está vazio
    if (this.detalhesPartida.length === 0) {
      console.warn('Detalhes da partida estão vazios.');
      return; // Saia da função se não houver dados
    }

    this.detalhesPartida.forEach(detalhe => {
      if (!detalhe.hora) {
        console.warn('Hora está undefined para este detalhe:', detalhe);
        return; // Saia se a hora for undefined
      }

      detalhe.hora = detalhe.hora.split(":")[1] + ":" + detalhe.hora.split(":")[2];

      const detalheBase = detalhe.detalheEv ? detalhe.detalheEv.replace(/\d+/g, '').trim() : '';
      let restante = detalhe.detalheEv.split(' ').slice(1).join(' ');

      switch (detalheBase) {
        case 'Yellow Card':
          detalhe.detalheEv = 'Cartão Amarelo';
          break;
        case 'Red Card':
          detalhe.detalheEv = 'Cartão Vermelho';
          break;
        case 'Substitution':
          detalhe.detalheEv = 'Substituição';
          break;
        case 'Goal':
          detalhe.detalheEv = 'Gol';
          break;
        default:
          detalhe.detalheEv = "Detalhe de Evento não encontrado no tratamento";
      }

      if(restante != '' && restante != 'Card'){
        detalhe.detalheEv = detalhe.detalheEv + ' ' + restante;
      }

      switch (detalhe.evento) {
        case 'Card':
          detalhe.evento = 'Cartão';
          break;
        case 'subst':
          detalhe.evento = 'Substituição';
          break;
        case 'Goal':
          detalhe.evento = 'Gol';
          break;
        default:
          detalhe.evento = "Evento não encontrado no tratamento";
      }
    });
  }

  separarDetalhes() {
    this.cartoes = this.detalhesPartida.filter(detalhe =>
      detalhe.detalheEv === 'Cartão Amarelo' || detalhe.detalheEv === 'Cartão Vermelho'
    );

    this.substituicoes = this.detalhesPartida.filter(detalhe =>
      detalhe.detalheEv.startsWith('Substituição') // Verifica se começa com 'Substituição'
    );
  }

}
