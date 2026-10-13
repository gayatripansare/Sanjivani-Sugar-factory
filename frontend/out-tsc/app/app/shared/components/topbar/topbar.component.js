import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
let TopbarComponent = class TopbarComponent {
    api = inject(ApiService);
    health = signal(null);
    ngOnInit() {
        this.checkHealth();
    }
    checkHealth() {
        this.api.getHealth().subscribe({
            next: (res) => this.health.set(res),
            error: () => this.health.set(null),
        });
    }
};
TopbarComponent = __decorate([
    Component({
        selector: 'app-topbar',
        standalone: true,
        imports: [CommonModule],
        template: `
    <header class="topbar">
      <!-- BREADCRUMB & CONTEXT -->
      <div class="topbar-left">
        <span class="location-context">Sanjivani Sahakari Sakhar Karkhana • Kopargaon</span>
      </div>

      <!-- SEARCH & CONTROLS -->
      <div class="topbar-right">
        <!-- CONNECTIVITY STATUS -->
        <div class="status-indicator" [class.online]="health()?.mcpConnected">
          <span class="status-dot"></span>
          <span class="status-text">
            {{ health()?.mcpConnected ? 'MCP Active' : 'Connecting MCP...' }}
          </span>
        </div>

        <div class="status-indicator online">
          <span class="status-dot"></span>
          <span class="status-text">PostgreSQL: 5432</span>
        </div>

        <!-- REFRESH BUTTON -->
        <button class="topbar-btn" (click)="checkHealth()" title="Refresh System Status">
          <svg class="topbar-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
        </button>

        <!-- NOTIFICATION BELL -->
        <div class="topbar-notification">
          <button class="topbar-btn">
            <svg class="topbar-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notif-badge">10</span>
          </button>
        </div>

        <!-- USER BADGE -->
        <div class="topbar-avatar">
          <span>SM</span>
        </div>
      </div>
    </header>
  `,
        styles: [`
    .topbar {
      height: 64px;
      background-color: #FFFFFF;
      border-bottom: 1px solid #E5EAE2;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .topbar-left {
      display: flex;
      align-items: center;
    }

    .location-context {
      font-size: 0.82rem;
      font-weight: 700;
      color: #174D35;
      background-color: #F7F8F2;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      border: 1px solid #E5EAE2;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      background-color: #F7F8F2;
      border: 1px solid #E5EAE2;
      color: #758078;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #94a3b8;
    }

    .status-indicator.online {
      color: #174D35;
    }

    .status-indicator.online .status-dot {
      background-color: #10B981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
    }

    .topbar-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background-color: #F7F8F2;
      border: 1px solid #E5EAE2;
      color: #17251C;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }

    .topbar-btn:hover {
      background-color: #E5EAE2;
      color: #174D35;
    }

    .topbar-svg {
      width: 17px;
      height: 17px;
    }

    .topbar-notification {
      position: relative;
    }

    .notif-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      background-color: #C7F36B;
      color: #174D35;
      font-size: 0.62rem;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 9999px;
      border: 1px solid #174D35;
    }

    .topbar-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background-color: #174D35;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
    })
], TopbarComponent);
export { TopbarComponent };
