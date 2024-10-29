import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Estatisticas } from 'src/app/interfaces/estatisticas';

@Component({
  selector: 'app-info-partida',
  templateUrl: './info-partida.component.html',
  styleUrls: ['./info-partida.component.scss']
})
export class InfoPartidaComponent implements OnInit {

  estatisticas = {} as Estatisticas;
  idPartida: string = '';

  constructor(
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.pegarURL();
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

  }

}
