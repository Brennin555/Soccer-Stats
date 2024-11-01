import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Estatisticas } from 'src/app/interfaces/estatisticas';
import { Partida } from 'src/app/interfaces/partida';
import { DetalhesPartida } from 'src/app/interfaces/detalhesPartida';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexYAxis,
  ApexXAxis,
  ApexPlotOptions,
  ApexTooltip,
  ApexLegend,
  ApexFill
} from "ng-apexcharts";
// Chart.register(...registerables);
@Component({
  selector: 'app-info-partida',
  templateUrl: './info-partida.component.html',
  styleUrls: ['./info-partida.component.scss']
})
export class InfoPartidaComponent implements OnInit {

  cor1 = "#001f3f"; // Azul
  cor2 = "#01290d"; // Verde
  cor3 = "#FF4136"; // Vermelho

  chartOptionsBar: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    grid: ApexGrid;
    colors: string[];
    tooltip: ApexTooltip;
    title: ApexTitleSubtitle;
  };

  chartOptionsDonut: {
    series: number[];
    chart: ApexChart;
    labels: string[];
    colors: string[];
    tooltip: ApexTooltip;
    title: ApexTitleSubtitle;
  };

  ChartOptionsBarGrouped : {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    stroke: ApexStroke;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    colors: string[];
    fill: ApexFill;
    legend: ApexLegend;
  };

  estatisticas = {} as Estatisticas;
  partida = {} as Partida;
  detalhesPartida = [] as DetalhesPartida[];

  substituicoes: DetalhesPartida[] = [];
  cartoes: DetalhesPartida[] = [];


  idPartida: string = '';
  constructor(
    private api: ApiService,
  ) {

    this.chartOptionsBar = {
      title: {
        text: "Chutes",
        align: "center"
      },
      series: [
        {
          name: "Time A",
          data: []
        },
        {
          name: "Time B",
          data: []
        }
      ],
      chart: {
        type: "bar",
        height: 440,
        stacked: true
      },
      colors: [this.cor1, this.cor2],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "50%",
          borderRadius: 10,
        },

      },
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return String(Math.abs(Number(val)));
        }
      },
      stroke: {
        width: 1,
        colors: ["#fff"]
      },

      grid: {
        xaxis: {
          lines: {
            show: false
          }
        }
      },
      yaxis: {
        min: -30,
        max: 30,
      },
      tooltip: {
        shared: false,
        x: {
          formatter: function(val) {
            return val.toString();
          }
        },
        y: {
          formatter: function(val) {
            return String(Math.abs(val));
          }
        }
      },
      xaxis: {
        categories: [
          "Total de Chutes",
          "Chutes a Gol",
          "Chutes Bloqueados",
          "Chutes para Fora",
          "Chutes dentro da Área",
          "Chutes fora da Área"
        ],
        title: {
          text: "Quantidade"
        },
        labels: {
          show: false,
          formatter: function(val) {
            return String(Math.abs(Math.round(parseInt(val, 10))));
          }
        }
      }
    };

    this.chartOptionsDonut = {
      title: { text: "Posse de Bola", align: "center" },
      series: [], // Dados de exemplo
      chart: { type: "donut", height: 300 },
      labels: ["Time A", "Time B"],
      colors: [this.cor1, this.cor2],
      tooltip: {
        y: { formatter: (val) => `${val}%` }
      }
    };

    this.ChartOptionsBarGrouped = {
      yaxis: {
        title: {
          text: "Values"
        }
      },
      series: [
        {
          name: "TimeA Passes certos",
          group: "budget",
          data: [44000]
        },
        {
          name: "TimeA passes errados",
          group: "budget",
          data: [13000]
        },
        {
          name: "TimeA total de passes",
          group: "totalA",
          data: [48000]
        },
        {
          name: "TimeB Passes certos",
          group: "actual",
          data: [48000]
        },
        {
          name: "TimeB passes errados",
          group: "actual",
          data: [20000]
        },

        {
          name: "TimeB total de passes",
          group: "totalB",
          data: [48000]
        },
      ],
      chart: {
        type: "bar",
        height: 350,
        stacked: true
      },
      stroke: {
        width: 1,
        colors: ["#fff"]
      },
      dataLabels: {
        formatter: (val) => {
          return String(val);
        }
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },
      xaxis: {
        categories: [
          "TimeA",
        ],
        labels: {
          formatter: (val) => {
            return (val);
          }
        }
      },
      fill: {
        opacity: 1
      },
      colors: [this.cor2, this.cor3, this.cor1],
      legend: {
        position: "top",
        horizontalAlign: "left"
      }
    };
  }


  ngOnInit(): void {
    this.pegarURL();
    this.atualizaDados();


  }

  // pegar idPartida que esta na url
  pegarURL(): void {
    let url = window.location.href;
    this.idPartida = url.split('info-partida/')[1];
    // console.log('idPartida:', this.idPartida);
  }


  atualizaDados(): void {
    this.api.getEstatisticas(this.idPartida).subscribe(
      (data) => {
        if (data && data[0]) {
          this.estatisticas = data[0];

          this.chartOptionsDonut.labels = [this.estatisticas.timeA_nome, this.estatisticas.timeB_nome];
          this.chartOptionsDonut.series = [parseInt(this.estatisticas.posseBolaA), parseInt(this.estatisticas.posseBolaB)];
          this.chartOptionsDonut.title.text = `Posse de Bola: ${this.estatisticas.posseBolaA}% x ${this.estatisticas.posseBolaB}%`;

          this.chartOptionsBar.series = [
            {
              name: this.estatisticas.timeA_nome,
              data: [
                this.estatisticas.totalChutesA,
                this.estatisticas.chutesGolA,
                this.estatisticas.chutesBloqA,
                this.estatisticas.chutesForaA,
                this.estatisticas.chutesDentroAreaA,
                this.estatisticas.chutesForaAreaA
              ]
            },
            {
              name: this.estatisticas.timeB_nome,
              data: [
                -this.estatisticas.totalChutesB,
                -this.estatisticas.chutesGolB,
                -this.estatisticas.chutesBloqB,
                -this.estatisticas.chutesForaB,
                -this.estatisticas.chutesDentroAreaB,
                -this.estatisticas.chutesForaAreaB
              ]
            }
          ];

          let passesErradosA = this.estatisticas.totalPassesA - this.estatisticas.passesCertosA;
          let passesErradosB = this.estatisticas.totalPassesB - this.estatisticas.passesCertosB;

          this.ChartOptionsBarGrouped.series[0].data = [this.estatisticas.passesCertosA];
          this.ChartOptionsBarGrouped.series[1].data = [passesErradosA];
          this.ChartOptionsBarGrouped.series[2].data = [this.estatisticas.totalPassesA];
          this.ChartOptionsBarGrouped.series[3].data = [this.estatisticas.passesCertosB];
          this.ChartOptionsBarGrouped.series[4].data = [passesErradosB];
          this.ChartOptionsBarGrouped.series[5].data = [this.estatisticas.totalPassesB];

        }
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
        // console.log(this.partida); // Aqui está tudo ok
      },
      (error) => {
        // console.error('Erro ao buscar partida:', error);
      }
    );

    this.api.getDetalhesPartida(this.idPartida).subscribe(
      (data) => {
        this.detalhesPartida = data;
        // console.log('Detalhes da partida:', this.detalhesPartida);
        this.tratarDetalhes();
        this.separarDetalhes();
      },
      (error) => {
        // console.error('Erro ao buscar detalhes da partida:', error);
      }
    );
  }

  tratarDetalhes() {
    // Verifique se detalhesPartida não está vazio
    if (this.detalhesPartida.length === 0) {
      // console.warn('Detalhes da partida estão vazios.');
      return; // Saia da função se não houver dados
    }

    this.detalhesPartida.forEach(detalhe => {
      if (!detalhe.hora) {
        // console.warn('Hora está undefined para este detalhe:', detalhe);
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

      if (restante != '' && restante != 'Card') {
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
