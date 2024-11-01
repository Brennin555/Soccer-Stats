import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SoccerStatsComponent } from './pages/soccer-stats/soccer-stats.component';

import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TesteTimeComponent } from './pages/teste-time/teste-time.component';
import { InfoPartidaComponent } from './pages/info-partida/info-partida.component';
import { InfoTimeComponent } from './pages/info-time/info-time.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  declarations: [
    AppComponent,
    SoccerStatsComponent,
    TesteTimeComponent,
    InfoPartidaComponent,
    InfoTimeComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatListModule,
    MatTableModule,
    MatCardModule,
    BrowserAnimationsModule,
    NgApexchartsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }







