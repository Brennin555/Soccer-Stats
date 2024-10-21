import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-partida',
  templateUrl: './info-partida.component.html',
  styleUrls: ['./info-partida.component.scss']
})
export class InfoPartidaComponent implements OnInit {
  // Dados da partida
  match: any = {
    teamA: 'Time A',
    teamB: 'Time B',
    scoreA: 2,
    scoreB: 1,
    date: '2024-10-21',
    time: '18:00',
    stadium: 'Estádio do Futebol',
    goals: [
      { player: 'Jogador A', time: '10\'' },
      { player: 'Jogador B', time: '20\'' },
      { player: 'Jogador C', time: '30\'' }
    ],
    playersA: [
      { name: 'Jogador A', yellowCard: false, redCard: false },
      { name: 'Jogador B', yellowCard: true, redCard: false },
      { name: 'Jogador C', yellowCard: false, redCard: true },
      { name: 'Jogador D', yellowCard: true, redCard: false }
    ],

    playersB: [
      { name: 'Jogador A', yellowCard: false },
      { name: 'Jogador B', yellowCard: true },
      { name: 'Jogador C', yellowCard: false },
      { name: 'Jogador D', yellowCard: true }
    ]
  };

  constructor() {}

  ngOnInit(): void {}
}
