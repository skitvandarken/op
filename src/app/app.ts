import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from './layout/menu/menu';
import { Rodape } from './layout/rodape/rodape';

@Component({
  imports: [RouterOutlet, Menu, Rodape],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('op');
}
