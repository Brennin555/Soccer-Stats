import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Estatisticas } from 'src/app/interfaces/estatisticas';
import { Partida } from 'src/app/interfaces/partida';
import { DetalhesPartida } from 'src/app/interfaces/detalhesPartida';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import 'chartjs-plugin-datalabels';
import { min } from 'rxjs';


Chart.register(...registerables);

@Component({
  selector: 'app-info-partida',
  templateUrl: './info-partida.component.html',
  styleUrls: ['./info-partida.component.scss']
})
export class InfoPartidaComponent implements OnInit {
  chart: any
  chartBarA: any
  chartBarB: any
  cor1 = "#2b39ff";
  cor2 = "#ff4a2b";


  public configDonuts: any = {
    type: 'doughnut',
    data: {
      labels: ['Time A', 'Time B'],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: [this.cor1, this.cor2],
          hoverBackgroundColor: [this.cor1, this.cor2]
        },
      ]
    }
  };

  public configHorizontalBar: any = {
    type: 'bar',
    data: {
      labels: ['Total de chutes', 'Chutes a gol', 'Chutes Bloqueados', 'Chutes fora', 'Chutes dentro da área', 'Chutes fora da área'],
      datasets: [
        {
          label: 'Time A',
          data: [],
          backgroundColor: this.cor1,
          borderColor: this.cor1,
          borderWidth: 1,
          borderRadius: 10
        },
        {
          label: 'Time B',
          data: [],
          backgroundColor: this.cor2,
          borderColor: this.cor2,
          borderWidth: 1,
          borderRadius: 10,
        },
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          min: -30,
          max: 30,
          title: {
            display: true,
            text: 'Número de Chutes'
          },
          grid: {
            display: false
          }
        },

      }
    }
  };

  public configHorizontalBar2A: any = {
    type: 'bar',
    data: {
      labels: ['Total de chutes', 'Chutes a gol', 'Chutes Bloqueados', 'Chutes fora'],

      datasets: [
        {
          label: 'Chutes total',
          data: [],
          backgroundColor: this.cor1,
          borderColor: this.cor1,
          borderWidth: 1,
          borderRadius: 10
        },
        {
          label: 'Chutes a gol',
          data: [],
          backgroundColor: this.cor1,
          borderColor: this.cor1,
          borderWidth: 1,
          borderRadius: 10,
        },
        {
          label: 'Chutes Bloqueados',
          data: [],
          backgroundColor: this.cor1,
          borderColor: this.cor1,
          borderWidth: 1,
          borderRadius: 10,
        },
        {
          label: 'Chutes fora',
          data: [],
          backgroundColor: this.cor1,
          borderColor: this.cor1,
          borderWidth: 1,
          borderRadius: 10,
        },
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: false,
          min: -30,
          max: 0,
          title: {
            display: false, // Não exibe o título
          },
          grid: {
            display: false // Não exibe a grade
          },
          ticks: {
            display: false // Não exibe os rótulos dos ticks
          },
        },
        y: {
          grid: {
            display: false // Não exibe a grade do eixo Y
          },
          ticks: {
            display: false // Não exibe os rótulos dos ticks do eixo Y
          },
        }
      },
      plugins: {
        legend: {
          display: false // Não exibe a legenda
        },
        tooltip: {
          enabled: false // Não exibe os tooltips
        }
      },
      elements: {
        bar: {
          borderWidth: 0,
          barPercentage: 0.8,
          categoryPercentage: 2
        }
      },
      backgroundColor: 'transparent' // Define o fundo como transparente
    }
  };

  public configHorizontalBar2B: any = {
    type: 'bar',
    data: {
      labels: ['Total de chutes', 'Chutes a gol', 'Chutes Bloqueados', 'Chutes fora'],

      datasets: [
        {
          label: 'Chutes total',
          data: [],
          backgroundColor: this.cor2,
          borderColor: this.cor2,
          borderWidth: 1,
          borderRadius: 10
        },
        {
          label: 'Chutes a gol',
          data: [],
          backgroundColor: this.cor2,
          borderColor: this.cor2,
          borderWidth: 1,
          borderRadius: 10,
        },
        {
          label: 'Chutes Bloqueados',
          data: [],
          backgroundColor: this.cor2,
          borderColor: this.cor2,
          borderWidth: 1,
          borderRadius: 10,
        },
        {
          label: 'Chutes fora',
          data: [],
          backgroundColor: this.cor2,
          borderColor: this.cor2,
          borderWidth: 1,
          borderRadius: 10,
        },
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: false,
          min: 0,
          max: 30,
          title: {
            display: false, // Não exibe o título
          },
          grid: {
            display: false // Não exibe a grade
          },
          ticks: {
            display: false // Não exibe os rótulos dos ticks
          },
        },
        y: {
          grid: {
            display: false // Não exibe a grade do eixo Y
          },
          ticks: {
            display: false // Não exibe os rótulos dos ticks do eixo Y
          },
        }
      },
      plugins: {
        legend: {
          display: false // Não exibe a legenda
        },
        tooltip: {
          enabled: false // Não exibe os tooltips
        }
      },
      elements: {
        bar: {
          borderWidth: 0,
          barPercentage: 0.8,
          categoryPercentage: 2
        }
      },
      backgroundColor: 'transparent' // Define o fundo como transparente
    }
  };

  estatisticas = {} as Estatisticas;
  partida = {} as Partida;
  detalhesPartida = [] as DetalhesPartida[];

  substituicoes: DetalhesPartida[] = [];
  cartoes: DetalhesPartida[] = [];


  idPartida: string = '';
  constructor(
    private api: ApiService
  ) { }

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
          // console.log('Estatísticas:', this.estatisticas);

          this.configDonuts.data.labels = [this.estatisticas.timeA_nome, this.estatisticas.timeB_nome];
          this.configDonuts.data.datasets[0].data = [parseInt(this.estatisticas.posseBolaA), parseInt(this.estatisticas.posseBolaB)];
          this.chart = new Chart('doughnutChart', this.configDonuts);

          // -----------
          this.configHorizontalBar2A.data.datasets[0].data = [
            -Number(this.estatisticas.totalChutesA),
            -Number(this.estatisticas.chutesGolA),
            -Number(this.estatisticas.chutesBloqA),
            -Number(this.estatisticas.chutesForaA)
          ];

          this.chartBarA = new Chart('horizontalBarChart2', this.configHorizontalBar2A);

          this.configHorizontalBar2B.data.datasets[0].data = [
            Number(this.estatisticas.totalChutesB),
            Number(this.estatisticas.chutesGolB),
            Number(this.estatisticas.chutesBloqB),
            Number(this.estatisticas.chutesForaB)
          ];


          this.chartBarB = new Chart('horizontalBarChart2b', this.configHorizontalBar2B);
          // ------------
          // Adicionando os nomes dos times
          this.configHorizontalBar.labels = [
            'Total de chutes',
            'Chutes a gol',
            'Chutes Bloqueados',
            'Chutes fora',
            'Chutes dentro da área',
            'Chutes fora da área'
          ];

          this.configHorizontalBar.data.datasets[0].label = this.estatisticas.timeA_nome;
          this.configHorizontalBar.data.datasets[1].label = this.estatisticas.timeB_nome;

          // Atribuindo os dados do Time A (valores positivos)
          this.configHorizontalBar.data.datasets[0].data = [
            -Number(this.estatisticas.totalChutesA),
            -Number(this.estatisticas.chutesGolA),
            -Number(this.estatisticas.chutesBloqA),
            -Number(this.estatisticas.chutesForaA),
            -Number(this.estatisticas.chutesDentroAreaA),
            -Number(this.estatisticas.chutesForaAreaA)
          ];

          // Atribuindo os dados do Time B (valores negativos)
          this.configHorizontalBar.data.datasets[1].data = [
            Number(this.estatisticas.totalChutesB),  // Colocando os valores negativos para o Time B
            Number(this.estatisticas.chutesGolB),
            Number(this.estatisticas.chutesBloqB),
            Number(this.estatisticas.chutesForaB),
            Number(this.estatisticas.chutesDentroAreaB),
            Number(this.estatisticas.chutesForaAreaB)
          ];

          this.chart = new Chart('horizontalBarChart', this.configHorizontalBar);
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
