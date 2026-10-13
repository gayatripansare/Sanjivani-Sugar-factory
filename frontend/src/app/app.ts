import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { TopbarComponent } from './shared/components/topbar/topbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="app-layout">
      <!-- SIDEBAR -->
      <app-sidebar></app-sidebar>

      <!-- MAIN VIEWPORT -->
      <div class="app-main-viewport">
        <!-- TOPBAR -->
        <app-topbar></app-topbar>

        <!-- ROUTED PAGE CONTENT -->
        <main class="app-page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: #F7F8F2;
      color: #17251C;
    }

    .app-main-viewport {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow: hidden;
    }

    .app-page-content {
      flex: 1;
      overflow-y: auto;
      background-color: #F7F8F2;
    }
  `]
})
export class App {}
