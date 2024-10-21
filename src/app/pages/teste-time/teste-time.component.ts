import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-teste-time',
  templateUrl: './teste-time.component.html',
  styleUrls: ['./teste-time.component.scss']
})
export class TesteTimeComponent implements OnInit {

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
