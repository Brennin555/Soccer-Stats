import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  mostrarTimes: boolean = false;

  times: any[] = [];  // Mantemos o 'times' como array
  nomeTime: string = '';
  mensagem: string = '';

  constructor(private apiService: ApiService) { }

  async ngOnInit() {
    await this.carregarTimes();  // Carregar os times ao iniciar o componente
  }

  // Método para carregar os times
  async carregarTimes() {
    await this.apiService.getTimes().subscribe(
      (response) => {
        // Verifica se a resposta é um objeto contendo o array
        if (response.times) {
          this.times = response.times;
        } else {
          this.times = response;  // Se for um array diretamente
        }
      },
      (error) => console.error('Erro ao buscar times', error)
    );
  }

  adicionarTime(): void {
    if (this.nomeTime.trim()) {
      this.apiService.addTime(this.nomeTime).subscribe(
        (response) => {
          this.mensagem = response.message;
          this.nomeTime = '';  // Limpa o campo do formulário após adicionar
          this.carregarTimes();  // Atualiza a lista de times após a adição
        },
        (error) => {
          this.mensagem = 'Erro ao adicionar time';
          console.error(error);
        }
      );
    }
  }

  verTimes(): void {
    this.mostrarTimes = !this.mostrarTimes;
    console.log(this.times);
  }
}
