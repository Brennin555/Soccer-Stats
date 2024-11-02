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
  cor3 = "#d42000"; // Vermelho
  corCartaoAmarelo = "#e6b800"; // Amarelo
  corCartaoVermelho = "#d42000"; // Vermelho

  chartOptionsBarGeral: {
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

  chartOptionsBarChutes: {
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

  chartOptionsBarGroupedPasses : {
    title: ApexTitleSubtitle;
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

  chartOptionsBarGroupedCartoes : {
    title: ApexTitleSubtitle;
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
  gols: DetalhesPartida[] = [];


  idPartida: string = '';
  constructor(
    private api: ApiService,
  ) {

    this.chartOptionsBarGeral = {
      title: {
        text: "Outros números:",
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
          borderRadius: 20,
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
        min: -15,
        max: 15,
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
          "Escanteios", "Impedimentos", "Defesas do Goleiro",
        ],
        labels: {
          show: false,
          formatter: function(val) {
            return String(Math.abs(Math.round(parseInt(val, 10))));
          }
        }
      }
    };

    this.chartOptionsBarChutes = {
      title: {
        text: "Chutes:",
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
        labels: {
          show: false,
          formatter: function(val) {
            return String(Math.abs(Math.round(parseInt(val, 10))));
          }
        }
      }
    };

    this.chartOptionsDonut = {
      title: { text: "Posse de Bola:", align: "center" },
      series: [], // Dados de exemplo
      chart: { type: "donut", height: 300 },
      labels: ["Time A", "Time B"],
      colors: [this.cor2, this.cor1],
      tooltip: {
        y: { formatter: (val) => `${val}%` }
      }
    };

    this.chartOptionsBarGroupedPasses = {
      title: {
        text: "Passes:",
        align: "center",
      },
      yaxis: {
      },
      series: [
        {
          name: "Passes certos",
          group: "budget",
          data: []
        },
        {
          name: "Passes errados",
          group: "budget",
          data: []
        },
        {
          name: "Total de passes",
          group: "totalA",
          data: []
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
        labels: {
          formatter: (val, index) => {
            return index === 0 || index === 1 ? val : '';
          }
        },
        categories: ['x', 'y'],
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

    this.chartOptionsBarGroupedCartoes = {
      title: {
        text: "Cartões",
        align: "center",
      },
      yaxis: {
      },
      series: [
        {
          name: "Cartões Amarelos",
          group: "budget",
          data: []
        },
        {
          name: "Cartões Vermelhos",
          group: "budget",
          data: []
        },
        {
          name: "Faltas",
          group: "faults",
          data: []
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
        labels: {
          formatter: (val, index) => {
            return index === 0 || index === 1 ? val : '';
          }
        },
        categories: ['x', 'y'],
      },
      fill: {
        opacity: 1
      },
      colors: [this.corCartaoAmarelo, this.corCartaoVermelho, this.cor1],
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

  pegaEscudoTime(): any {
    this.api.getEscudoTime(this.partida.timeA).subscribe(
      (data) => {
        let escudo = data;
        this.partida.timeA_escudo = escudo.escudo;
      },
      (error) => {
        console.error('Erro ao buscar escudo do time A:', error);
      }
    );
    this.api.getEscudoTime(this.partida.timeB).subscribe(
      (data) => {
        let escudo = data;
        this.partida.timeB_escudo = escudo.escudo;
      },
      (error) => {
        console.error('Erro ao buscar escudo do time B:', error);
      }
    );
  }


  atualizaDados(): void {
    this.api.getEstatisticas(this.idPartida).subscribe(
      (data) => {
        if (data && data[0]) {
          this.estatisticas = data[0];

          this.chartOptionsDonut.labels = [this.estatisticas.timeB_nome, this.estatisticas.timeA_nome];
          this.chartOptionsDonut.series = [parseInt(this.estatisticas.posseBolaB), parseInt(this.estatisticas.posseBolaA)];
          this.chartOptionsBarChutes.series = [
            {
              name: this.estatisticas.timeA_nome,
              data: [
                -this.estatisticas.totalChutesA,
                -this.estatisticas.chutesGolA,
                -this.estatisticas.chutesBloqA,
                -this.estatisticas.chutesForaA,
                -this.estatisticas.chutesDentroAreaA,
                -this.estatisticas.chutesForaAreaA
              ]
            },
            {
              name: this.estatisticas.timeB_nome,
              data: [
                this.estatisticas.totalChutesB,
                this.estatisticas.chutesGolB,
                this.estatisticas.chutesBloqB,
                this.estatisticas.chutesForaB,
                this.estatisticas.chutesDentroAreaB,
                this.estatisticas.chutesForaAreaB
              ]
            }
          ];

          let passesErradosA = this.estatisticas.totalPassesA - this.estatisticas.passesCertosA;
          let passesErradosB = this.estatisticas.totalPassesB - this.estatisticas.passesCertosB;

          this.chartOptionsBarGroupedPasses.xaxis.categories = [this.estatisticas.timeA_nome, this.estatisticas.timeB_nome];
          this.chartOptionsBarGroupedPasses.series[0].data = [this.estatisticas.passesCertosA, this.estatisticas.passesCertosB];
          this.chartOptionsBarGroupedPasses.series[1].data = [passesErradosA, passesErradosB];
          this.chartOptionsBarGroupedPasses.series[2].data = [this.estatisticas.totalPassesA, this.estatisticas.totalPassesB];

          this.chartOptionsBarGroupedCartoes.xaxis.categories = [this.estatisticas.timeA_nome, this.estatisticas.timeB_nome];
          this.chartOptionsBarGroupedCartoes.series[0].data = [this.estatisticas.cAmarelosA, this.estatisticas.cAmarelosB];
          this.chartOptionsBarGroupedCartoes.series[1].data = [this.estatisticas.cVermelhosA, this.estatisticas.cVermelhosB];
          this.chartOptionsBarGroupedCartoes.series[2].data = [this.estatisticas.faltasA, this.estatisticas.faltasB];

          this.chartOptionsBarGeral.series = [
            {
              name: this.estatisticas.timeA_nome,
              data: [
                -this.estatisticas.escanteiosA,
                -this.estatisticas.impedimentosA,
                -this.estatisticas.defesasGoleiroA,
              ]
            },
            {
              name: this.estatisticas.timeB_nome,
              data: [
                this.estatisticas.escanteiosB,
                this.estatisticas.impedimentosB,
                this.estatisticas.defesasGoleiroB,
              ]
            }
          ];
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
        this.pegaEscudoTime();
        console.log(this.partida); // Aqui está tudo ok
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

        this.detalhesPartida.forEach(detalhe => {
            this.api.getJogadoresTime(detalhe.idJogador1).subscribe(
              (data) => {
                detalhe.nomeJogador1 = data[0].nome;
              },
              (error) => {
                console.error('Erro ao buscar jogadores:', error);
              }
            );
            if (detalhe.idJogador2) {
              this.api.getJogadoresTime(detalhe.idJogador2).subscribe(
                (data) => {
                  detalhe.nomeJogador2 = data[0].nome;
                },
                (error) => {
                  console.error('Erro ao buscar jogadores:', error);
                }
              );
            }
        });
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
      detalhe.hora = String(Number(detalhe.hora) - 3);
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

    this.gols = this.detalhesPartida.filter(detalhe =>
      detalhe.evento === 'Gol'
    );

    console.log(this.gols);
  }

  tiraSubst(palavra: string): string {
    return palavra.split(' ')[1];
  }

}
