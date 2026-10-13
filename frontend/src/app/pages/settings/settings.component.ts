import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { HealthStatus } from '../../core/models/farmer.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-page">
      <!-- HEADER -->
      <div class="page-head">
        <div>
          <h2>System Architecture & Settings</h2>
          <p class="head-sub">Technical configuration for Model Context Protocol (MCP), PostgreSQL, and OpenAI integration</p>
        </div>
        <button class="btn-ping" (click)="testHealth()">
          <span>Test Ping</span>
          <span class="btn-dot" [class.online]="health()?.mcpConnected"></span>
        </button>
      </div>

      <!-- ARCHITECTURE OVERVIEW CARDS -->
      <div class="settings-grid">
        <!-- 1. MCP CONFIGURATION -->
        <div class="config-card">
          <div class="card-title-row">
            <span class="cfg-icon">⚡</span>
            <div>
              <h3>Model Context Protocol (MCP)</h3>
              <p>Official @modelcontextprotocol/sdk</p>
            </div>
            <span class="status-badge" [class.active]="health()?.mcpConnected">
              {{ health()?.mcpConnected ? 'Connected' : 'Offline' }}
            </span>
          </div>

          <div class="cfg-rows">
            <div class="cfg-item">
              <span class="cfg-key">MCP Server Name:</span>
              <code class="cfg-code">sanjivani-sugar-factory-server</code>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">Transport Layer:</span>
              <code class="cfg-code">StdioServerTransport (Node.js Process)</code>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">Registered MCP Tools:</span>
              <div class="tools-pills">
                @for (tool of health()?.tools; track tool) {
                  <span class="tool-pill">🛠️ {{ tool }}</span>
                }
              </div>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">Tool Purpose:</span>
              <span class="cfg-desc">Queries live sugarcane delivery and payment records from PostgreSQL</span>
            </div>
          </div>
        </div>

        <!-- 2. DATABASE CONFIGURATION -->
        <div class="config-card">
          <div class="card-title-row">
            <span class="cfg-icon">🐘</span>
            <div>
              <h3>PostgreSQL Database</h3>
              <p>pgAdmin 4 Managed Server</p>
            </div>
            <span class="status-badge active">Active</span>
          </div>

          <div class="cfg-rows">
            <div class="cfg-item">
              <span class="cfg-key">Database Name:</span>
              <code class="cfg-code">sanjivani_db</code>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">Default Port:</span>
              <code class="cfg-code">5432</code>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">Active Table:</span>
              <code class="cfg-code">farmers (10 seeded records)</code>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">Connection Pool:</span>
              <span class="cfg-desc">Managed via pg.Pool in server.ts</span>
            </div>
          </div>
        </div>

        <!-- 3. AI MODEL CONFIGURATION -->
        <div class="config-card">
          <div class="card-title-row">
            <span class="cfg-icon">🤖</span>
            <div>
              <h3>OpenAI Model Settings</h3>
              <p>Autonomous Tool Calling</p>
            </div>
            <span class="status-badge active">Ready</span>
          </div>

          <div class="cfg-rows">
            <div class="cfg-item">
              <span class="cfg-key">Language Model:</span>
              <code class="cfg-code">gpt-4o-mini</code>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">Function Calling:</span>
              <code class="cfg-code">Automatic Tool Discovery & Execution</code>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">API Key Status:</span>
              <span class="cfg-desc text-green">Loaded securely via server-side .env</span>
            </div>
          </div>
        </div>

        <!-- 4. HTTP API BRIDGE -->
        <div class="config-card">
          <div class="card-title-row">
            <span class="cfg-icon">🌐</span>
            <div>
              <h3>HTTP API Gateway (api.ts)</h3>
              <p>Express REST Service</p>
            </div>
            <span class="status-badge active">Port 3001</span>
          </div>

          <div class="cfg-rows">
            <div class="cfg-item">
              <span class="cfg-key">Base URL:</span>
              <code class="cfg-code">http://localhost:3001/api</code>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">Endpoints:</span>
              <code class="cfg-code">/health, /farmers, /dashboard/stats, /chat</code>
            </div>
            <div class="cfg-item">
              <span class="cfg-key">CORS Origin:</span>
              <code class="cfg-code">http://localhost:4200 (Angular)</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      padding: 2rem;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-head h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #174D35;
      margin: 0 0 2px;
    }

    .head-sub {
      font-size: 0.8rem;
      color: #758078;
      margin: 0;
    }

    .btn-ping {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      color: #174D35;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      transition: all 0.2s ease;
    }

    .btn-ping:hover {
      background: #F7F8F2;
      border-color: #174D35;
    }

    .btn-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94A3B8;
    }

    .btn-dot.online {
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    @media (max-width: 900px) {
      .settings-grid { grid-template-columns: 1fr; }
    }

    .config-card {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .card-title-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      border-bottom: 1px solid #F7F8F2;
      padding-bottom: 1rem;
    }

    .cfg-icon {
      font-size: 1.6rem;
    }

    .card-title-row h3 {
      font-size: 1rem;
      font-weight: 800;
      color: #17251C;
      margin: 0;
    }

    .card-title-row p {
      font-size: 0.76rem;
      color: #758078;
      margin: 2px 0 0 0;
    }

    .status-badge {
      margin-left: auto;
      background: #F1F5F9;
      color: #64748B;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 9999px;
    }

    .status-badge.active {
      background: #E9F4EE;
      color: #174D35;
    }

    .cfg-rows {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .cfg-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .cfg-key {
      font-size: 0.74rem;
      font-weight: 700;
      color: #758078;
    }

    .cfg-code {
      font-family: 'Fira Code', Consolas, monospace;
      font-size: 0.78rem;
      color: #174D35;
      background: #F7F8F2;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #E5EAE2;
      align-self: flex-start;
    }

    .cfg-desc {
      font-size: 0.82rem;
      color: #17251C;
    }

    .text-green { color: #16A34A; }

    .tools-pills {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .tool-pill {
      background: #F3FDE1;
      color: #174D35;
      border: 1px solid #C7F36B;
      font-size: 0.74rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
  `]
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);
  health = signal<HealthStatus | null>(null);

  ngOnInit() {
    this.testHealth();
  }

  testHealth() {
    this.api.getHealth().subscribe({
      next: (res) => this.health.set(res),
      error: () => this.health.set(null),
    });
  }
}

