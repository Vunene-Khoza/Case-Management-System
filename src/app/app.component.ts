import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      <main class="main-content" style="width: 100%; min-height: 100vh;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {}
