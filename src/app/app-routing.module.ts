import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SoccerStatsComponent } from './pages/soccer-stats/soccer-stats.component';
import { TesteTimeComponent } from './pages/teste-time/teste-time.component';
import { InfoPartidaComponent } from './pages/info-partida/info-partida.component';

const routes: Routes = [
  { path: '', redirectTo: 'soccer-stats', pathMatch: 'full' }, // Redireciona para soccer-stats
  { path: 'soccer-stats', component: SoccerStatsComponent },
  { path: 'teste-time', component: TesteTimeComponent },
  { path: 'info-partida', component: InfoPartidaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
