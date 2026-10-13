import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats, Farmer } from '../../core/models/farmer.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <!-- WELCOME HERO BANNER -->
      <section class="welcome-banner">
        <div class="welcome-text">
          <div class="welcome-pill">
            <span class="pill-dot"></span>
            <span>Real-time PostgreSQL Data • Sanjivani Factory</span>
          </div>
          <h1>Welcome to Sanjivani</h1>
          <p class="welcome-sub">Your intelligent agricultural management assistant for sugarcane procurement, farmer records, and financial settlements.</p>
        </div>
        <div class="welcome-actions">
          <a routerLink="/ai-assistant" class="btn-primary">
            <span>Ask AI Assistant</span>
            <span class="btn-icon">⚡</span>
          </a>
          <a routerLink="/farmers" class="btn-secondary">
            <span>View Farmers</span>
          </a>
        </div>
      </section>

      <!-- 4 KEY STATISTICS CARDS -->
      <section class="stats-grid">
        <!-- 1. Total Farmers -->
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-label">Total Registered Farmers</span>
            <div class="stat-icon-wrap icon-forest">
              <span>👨‍🌾</span>
            </div>
          </div>
          <div class="stat-main">
            @if (loading()) {
              <div class="skeleton-val"></div>
            } @else {
              <span class="stat-val">{{ stats()?.totalFarmers || 0 }}</span>
              <span class="stat-unit">Suppliers</span>
            }
          </div>
          <div class="stat-foot">
            <span class="foot-highlight">Across {{ stats()?.villagesCount || 0 }} villages</span>
            <span class="foot-sub">Active factory contract</span>
          </div>
        </div>

        <!-- 2. Total Sugarcane Supplied -->
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-label">Total Sugarcane Supplied</span>
            <div class="stat-icon-wrap icon-lime">
              <span>🌾</span>
            </div>
          </div>
          <div class="stat-main">
            @if (loading()) {
              <div class="skeleton-val"></div>
            } @else {
              <span class="stat-val">{{ stats()?.totalTons | number:'1.2-2' }}</span>
              <span class="stat-unit">Tons</span>
            }
          </div>
          <div class="stat-foot">
            <span class="foot-highlight">Weighbridge verified</span>
            <span class="foot-sub">Direct supply</span>
          </div>
        </div>

        <!-- 3. Total Amount Paid -->
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-label">Total Disbursed (Paid)</span>
            <div class="stat-icon-wrap icon-blue">
              <span>💳</span>
            </div>
          </div>
          <div class="stat-main">
            @if (loading()) {
              <div class="skeleton-val"></div>
            } @else {
              <span class="stat-val">{{ formatCurrency(stats()?.totalPaid) }}</span>
            }
          </div>
          <div class="stat-foot">
            <span class="foot-highlight text-green">Bank transfer complete</span>
          </div>
        </div>

        <!-- 4. Total Pending Payments -->
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-label">Total Pending Settlements</span>
            <div class="stat-icon-wrap icon-amber">
              <span>⏳</span>
            </div>
          </div>
          <div class="stat-main">
            @if (loading()) {
              <div class="skeleton-val"></div>
            } @else {
              <span class="stat-val val-pending">{{ formatCurrency(stats()?.totalPending) }}</span>
            }
          </div>
          <div class="stat-foot">
            <span class="foot-highlight text-amber">Awaiting clearance</span>
          </div>
        </div>
      </section>

      <!-- ANALYTICS PREVIEW & DISTRIBUTION -->
      <section class="analytics-preview-grid">
        <!-- FINANCIAL SETTLEMENT PROGRESS -->
        <div class="content-card progress-card">
          <div class="card-head">
            <div>
              <h3>Payment Settlement Distribution</h3>
              <p class="card-sub">Actual disbursement ratio across all registered suppliers</p>
            </div>
            <a routerLink="/payments" class="card-link">Detailed Overview →</a>
          </div>

          <div class="distribution-visual">
            <div class="progress-bar-container">
              <div class="bar-paid" [style.width.%]="paidPercentage()"></div>
              <div class="bar-pending" [style.width.%]="pendingPercentage()"></div>
            </div>
            <div class="progress-legend">
              <div class="legend-item">
                <span class="legend-dot dot-paid"></span>
                <span class="legend-name">Disbursed ({{ paidPercentage() | number:'1.1-1' }}%)</span>
                <strong class="legend-num">{{ formatCurrency(stats()?.totalPaid) }}</strong>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-pending"></span>
                <span class="legend-name">Pending ({{ pendingPercentage() | number:'1.1-1' }}%)</span>
                <strong class="legend-num val-pending">{{ formatCurrency(stats()?.totalPending) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- TOP SUPPLIERS HIGHLIGHT -->
        <div class="content-card top-suppliers-card">
          <div class="card-head">
            <div>
              <h3>Top Sugarcane Suppliers</h3>
              <p class="card-sub">Leading sugarcane tonnage contributors</p>
            </div>
            <a routerLink="/analytics" class="card-link">View All →</a>
          </div>

          <div class="top-list">
            @for (f of stats()?.topSuppliers; track f.id; let idx = $index) {
              <div class="top-row">
                <div class="top-rank">{{ idx + 1 }}</div>
                <div class="top-info">
                  <span class="top-name">{{ f.name }}</span>
                  <span class="top-village">📍 {{ f.village }}</span>
                </div>
                <div class="top-supply">
                  <strong>{{ f.sugarcane_supply_tons }} T</strong>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- RECENT FARMERS SECTION -->
      <section class="content-card">
        <div class="card-head">
          <div>
            <h3>Farmers Supply Directory Preview</h3>
            <p class="card-sub">Latest registered records from PostgreSQL (<code>farmers</code> table)</p>
          </div>
          <a routerLink="/farmers" class="card-link">Full Directory ({{ stats()?.totalFarmers || 0 }}) →</a>
        </div>

        <div class="table-container">
          <table class="saas-table">
            <thead>
              <tr>
                <th>Farmer Name</th>
                <th>Village</th>
                <th>Sugarcane Supply</th>
                <th>Amount Paid</th>
                <th>Payment Pending</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (farmer of recentFarmers(); track farmer.id) {
                <tr>
                  <td>
                    <div class="farmer-name-cell">
                      <div class="avatar-sm">{{ getInitials(farmer.name) }}</div>
                      <div>
                        <strong>{{ farmer.name }}</strong>
                        <span class="sub-id">#{{ farmer.id }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="village-pill">{{ farmer.village }}</span>
                  </td>
                  <td>
                    <span class="supply-badge">{{ farmer.sugarcane_supply_tons }} Tons</span>
                  </td>
                  <td>{{ formatCurrency(farmer.amount_paid) }}</td>
                  <td>
                    <span class="pending-chip" [class.chip-alert]="+farmer.payment_pending > 50000">
                      {{ formatCurrency(farmer.payment_pending) }}
                    </span>
                  </td>
                  <td class="text-right">
                    <a [routerLink]="['/ai-assistant']" [queryParams]="{ q: 'Give details for farmer ' + farmer.name }" class="btn-ask-table">
                      Ask AI
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      padding: 2rem;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
    }

    /* Welcome Hero */
    .welcome-banner {
      background: linear-gradient(135deg, #174D35 0%, #287A52 100%);
      border-radius: 18px;
      padding: 2rem 2.25rem;
      color: #FFFFFF;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      box-shadow: 0 6px 20px rgba(23, 77, 53, 0.15);
    }

    .welcome-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.76rem;
      font-weight: 700;
      color: #C7F36B;
      margin-bottom: 0.75rem;
    }

    .pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #C7F36B;
    }

    .welcome-text h1 {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 0.4rem 0;
    }

    .welcome-sub {
      font-size: 0.9rem;
      color: #E5EAE2;
      max-width: 620px;
      margin: 0;
      line-height: 1.5;
    }

    .welcome-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-primary {
      background-color: #C7F36B;
      color: #174D35;
      padding: 0.7rem 1.4rem;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.88rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(199, 243, 107, 0.3);
    }

    .btn-primary:hover {
      background-color: #bbf055;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #FFFFFF;
      padding: 0.7rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    @media (max-width: 1100px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: 1fr; }
    }

    .stat-card {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 16px;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    }

    .stat-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .stat-label {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #758078;
    }

    .stat-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .icon-forest { background: #E9F4EE; }
    .icon-lime { background: #F3FDE1; }
    .icon-blue { background: #EFF6FF; }
    .icon-amber { background: #FEF3C7; }

    .stat-main {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
      margin-bottom: 0.75rem;
    }

    .stat-val {
      font-size: 1.7rem;
      font-weight: 800;
      color: #17251C;
      letter-spacing: -0.02em;
    }

    .val-pending {
      color: #D97706;
    }

    .stat-unit {
      font-size: 0.85rem;
      font-weight: 600;
      color: #758078;
    }

    .stat-foot {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.74rem;
      border-top: 1px solid #F7F8F2;
      padding-top: 0.65rem;
    }

    .foot-highlight {
      font-weight: 700;
      color: #174D35;
    }

    .text-green { color: #16A34A; }
    .text-amber { color: #D97706; }

    .foot-sub {
      color: #758078;
    }

    /* Analytics preview */
    .analytics-preview-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 900px) {
      .analytics-preview-grid { grid-template-columns: 1fr; }
    }

    .content-card {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 16px;
      padding: 1.4rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .card-head h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #17251C;
      margin: 0;
    }

    .card-sub {
      font-size: 0.76rem;
      color: #758078;
      margin: 2px 0 0 0;
    }

    .card-link {
      font-size: 0.78rem;
      font-weight: 700;
      color: #174D35;
      text-decoration: none;
    }

    .card-link:hover {
      text-decoration: underline;
    }

    /* Distribution Bar */
    .distribution-visual {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .progress-bar-container {
      height: 16px;
      border-radius: 9999px;
      background-color: #E5EAE2;
      display: flex;
      overflow: hidden;
    }

    .bar-paid {
      background: linear-gradient(90deg, #174D35, #287A52);
      transition: width 0.6s ease;
    }

    .bar-pending {
      background: linear-gradient(90deg, #F59E0B, #D97706);
      transition: width 0.6s ease;
    }

    .progress-legend {
      display: flex;
      gap: 2rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.85rem;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }

    .dot-paid { background: #174D35; }
    .dot-pending { background: #F59E0B; }

    .legend-name { color: #758078; }

    /* Top list */
    .top-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .top-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.55rem 0.75rem;
      border-radius: 10px;
      background: #F7F8F2;
    }

    .top-rank {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: #174D35;
      color: #C7F36B;
      font-weight: 800;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .top-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .top-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #17251C;
    }

    .top-village {
      font-size: 0.72rem;
      color: #758078;
    }

    .top-supply strong {
      font-size: 0.88rem;
      color: #174D35;
    }

    /* SaaS Table */
    .table-container {
      overflow-x: auto;
    }

    .saas-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    .saas-table th {
      padding: 0.75rem 1rem;
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #758078;
      border-bottom: 1px solid #E5EAE2;
    }

    .saas-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #F7F8F2;
      color: #17251C;
    }

    .saas-table tr:hover td {
      background-color: #F7F8F2;
    }

    .farmer-name-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #174D35;
      color: #FFFFFF;
      font-size: 0.74rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sub-id {
      display: block;
      font-size: 0.7rem;
      color: #758078;
    }

    .village-pill {
      background: #F7F8F2;
      border: 1px solid #E5EAE2;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.76rem;
      font-weight: 600;
      color: #174D35;
    }

    .supply-badge {
      background: #E9F4EE;
      color: #174D35;
      font-weight: 700;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      font-size: 0.76rem;
    }

    .pending-chip {
      background: #FEF3C7;
      color: #B45309;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.76rem;
    }

    .chip-alert {
      background: #FEE2E2;
      color: #B91C1C;
    }

    .text-right {
      text-align: right;
    }

    .btn-ask-table {
      background: #F7F8F2;
      border: 1px solid #E5EAE2;
      color: #174D35;
      font-weight: 700;
      font-size: 0.76rem;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-ask-table:hover {
      background: #174D35;
      color: #FFFFFF;
    }

    .skeleton-val {
      width: 100px;
      height: 32px;
      border-radius: 6px;
      background: #E5EAE2;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  stats = signal<DashboardStats | null>(null);
  recentFarmers = signal<Farmer[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.api.getDashboardStats().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.stats.set(res.stats);
        }
      },
      error: () => this.loading.set(false),
    });

    this.api.getFarmers().subscribe({
      next: (res) => {
        if (res.success) {
          this.recentFarmers.set(res.farmers.slice(0, 5));
        }
      },
    });
  }

  paidPercentage(): number {
    const s = this.stats();
    if (!s) return 0;
    const total = s.totalPaid + s.totalPending;
    return total > 0 ? (s.totalPaid / total) * 100 : 0;
  }

  pendingPercentage(): number {
    const s = this.stats();
    if (!s) return 0;
    const total = s.totalPaid + s.totalPending;
    return total > 0 ? (s.totalPending / total) * 100 : 0;
  }

  formatCurrency(val: any): string {
    return this.api.formatCurrency(val);
  }

  getInitials(name: string): string {
    return this.api.getInitials(name);
  }
}

