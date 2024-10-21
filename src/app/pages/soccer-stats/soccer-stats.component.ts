import { Component } from '@angular/core';

interface Match {
  teamA: string;
  teamB: string;
  date: string;
}

interface Team {
  name: string;
}

interface Standing {
  position: number;
  team: string;
  points: number;
  partidas: number;
  v: number;
  e: number;
  d: number;
  sg: number;
}

@Component({
  selector: 'app-soccer-stats',
  templateUrl: './soccer-stats.component.html',
  styleUrls: ['./soccer-stats.component.scss']
})
export class SoccerStatsComponent {

  matches: Match[] = [
    { teamA: 'Time 1', teamB: 'Time 2', date: '2024-10-21' },
    { teamA: 'Time 3', teamB: 'Time 4', date: '2024-10-22' },
  ];

  teams: Team[] = [
    { name: 'Time 1' },
    { name: 'Time 2' },
    { name: 'Time 3' },
    { name: 'Time 4' },
  ];

  standings: Standing[] = [
    { position: 1, team: 'Time 1', points: 10, partidas: 4, v: 3, e: 1, d: 0, sg: 5 },
    { position: 2, team: 'Time 2', points: 9, partidas: 4, v: 3, e: 0, d: 1, sg: 3 },
    { position: 3, team: 'Time 3', points: 8, partidas: 4, v: 2, e: 2, d: 0, sg: 2 },
    { position: 4, team: 'Time 4', points: 7, partidas: 4, v: 2, e: 1, d: 1, sg: 1 },
  ];

  displayedColumns: string[] = ['position', 'team', 'points', 'matches', 'v', 'e', 'd', 'sg'];

}
