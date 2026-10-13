import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
let PaymentsComponent = class PaymentsComponent {
    api = inject(ApiService);
    stats = signal(null);
    ngOnInit() {
        this.api.getDashboardStats().subscribe({
            next: (res) => {
                if (res.success)
                    this.stats.set(res.stats);
            },
        });
    }
    paidRatio() {
        const s = this.stats();
        if (!s)
            return 0;
        const total = s.totalPaid + s.totalPending;
        return total > 0 ? (s.totalPaid / total) * 100 : 0;
    }
    formatCurrency(val) {
        return this.api.formatCurrency(val);
    }
};
PaymentsComponent = __decorate([
    Component({
        selector: 'app-payments',
        standalone: true,
        imports: [CommonModule, RouterModule],
        template: `
    <div class="payments-page">
      <!-- HEADER -->
      <div class="page-head">
        <div>
          <h2>Payments & Financial Settlements</h2>
          <p class="head-sub">Sugarcane procurement financial overview, disbursement tracking, and pending settlements</p>
        </div>
      </div>

      <!-- STATS SUMMARY CARDS -->
      <div class="stats-row">
        <div class="summary-card card-paid">
          <div class="card-meta">
            <span class="meta-label">Total Amount Paid</span>
            <span class="meta-badge">Disbursed</span>
          </div>
          <div class="meta-value">{{ formatCurrency(stats()?.totalPaid) }}</div>
          <div class="meta-foot">Transferred directly to farmers</div>
        </div>

        <div class="summary-card card-pending">
          <div class="card-meta">
            <span class="meta-label">Total Payment Pending</span>
            <span class="meta-badge badge-pending">Action Required</span>
          </div>
          <div class="meta-value val-amber">{{ formatCurrency(stats()?.totalPending) }}</div>
          <div class="meta-foot">Outstanding factory liabilities</div>
        </div>

        <div class="summary-card card-ratio">
          <div class="card-meta">
            <span class="meta-label">Disbursement Ratio</span>
            <span class="meta-badge badge-ratio">Settlement Rate</span>
          </div>
          <div class="meta-value val-green">{{ paidRatio() | number:'1.1-1' }}%</div>
          <div class="meta-foot">{{ 100 - paidRatio() | number:'1.1-1' }}% pending settlement</div>
        </div>
      </div>

      <!-- DISTRIBUTION BAR CARD -->
      <div class="content-box">
        <div class="box-head">
          <h3>Payment Settlement Progress</h3>
          <span class="box-sub">Total Procurement Value: {{ formatCurrency((stats()?.totalPaid || 0) + (stats()?.totalPending || 0)) }}</span>
        </div>

        <div class="visual-bar-wrap">
          <div class="bar-track">
            <div class="fill-paid" [style.width.%]="paidRatio()"></div>
            <div class="fill-pending" [style.width.%]="100 - paidRatio()"></div>
          </div>
          <div class="bar-labels">
            <div class="label-side">
              <span class="dot dot-paid"></span>
              <span>Paid: <strong>{{ formatCurrency(stats()?.totalPaid) }}</strong> ({{ paidRatio() | number:'1.1-1' }}%)</span>
            </div>
            <div class="label-side">
              <span class="dot dot-pending"></span>
              <span>Pending: <strong>{{ formatCurrency(stats()?.totalPending) }}</strong> ({{ 100 - paidRatio() | number:'1.1-1' }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- VILLAGE BREAKDOWN & HIGH PENDING PAYMENTS (2 COLUMNS) -->
      <div class="dual-columns">
        <!-- VILLAGE-WISE FINANCIAL SUMMARY -->
        <div class="content-box">
          <div class="box-head">
            <h3>Settlement by Village</h3>
            <span class="box-sub">Geographical distribution of payments</span>
          </div>

          <div class="village-financial-list">
            @for (v of stats()?.villageBreakdown; track v.village) {
              <div class="village-fin-row">
                <div class="v-fin-name">
                  <strong>📍 {{ v.village }}</strong>
                  <span class="v-fin-count">{{ v.farmersCount }} Farmer(s) • {{ v.supplyTons }} T</span>
                </div>
                <div class="v-fin-amounts">
                  <div class="fin-col">
                    <span class="fin-lbl">Paid</span>
                    <span class="fin-val text-green">{{ formatCurrency(v.paidAmount) }}</span>
                  </div>
                  <div class="fin-col">
                    <span class="fin-lbl">Pending</span>
                    <span class="fin-val text-amber">{{ formatCurrency(v.pendingAmount) }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- HIGH PENDING SETTLEMENTS -->
        <div class="content-box">
          <div class="box-head">
            <h3>Top Pending Settlements</h3>
            <span class="box-sub">Suppliers with pending payments above ₹50,000</span>
          </div>

          <div class="pending-list">
            @for (f of stats()?.highestPending; track f.id) {
              <div class="pending-item">
                <div class="pending-farmer">
                  <strong>{{ f.name }}</strong>
                  <span class="p-sub">📍 {{ f.village }} • {{ f.sugarcane_supply_tons }} Tons</span>
                </div>
                <div class="pending-tag-wrap">
                  <span class="pending-tag" [class.danger]="+f.payment_pending > 50000">
                    {{ formatCurrency(f.payment_pending) }}
                  </span>
                  <a [routerLink]="['/ai-assistant']" [queryParams]="{ q: 'What is the payment status for ' + f.name + '?' }" class="btn-micro">
                    Ask AI
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
        styles: [`
    .payments-page {
      padding: 2rem;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    @media (max-width: 900px) {
      .stats-row { grid-template-columns: 1fr; }
    }

    .summary-card {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 16px;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meta-label {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #758078;
    }

    .meta-badge {
      background: #E9F4EE;
      color: #174D35;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
    }

    .badge-pending {
      background: #FEF3C7;
      color: #B45309;
    }

    .badge-ratio {
      background: #EFF6FF;
      color: #1D4ED8;
    }

    .meta-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: #17251C;
      letter-spacing: -0.02em;
    }

    .val-amber { color: #D97706; }
    .val-green { color: #174D35; }

    .meta-foot {
      font-size: 0.74rem;
      color: #758078;
      border-top: 1px solid #F7F8F2;
      padding-top: 0.4rem;
    }

    .content-box {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 16px;
      padding: 1.4rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .box-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .box-head h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #17251C;
      margin: 0;
    }

    .box-sub {
      font-size: 0.78rem;
      color: #758078;
    }

    .visual-bar-wrap {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .bar-track {
      height: 18px;
      border-radius: 9999px;
      background: #E5EAE2;
      display: flex;
      overflow: hidden;
    }

    .fill-paid {
      background: #174D35;
      transition: width 0.6s ease;
    }

    .fill-pending {
      background: #F59E0B;
      transition: width 0.6s ease;
    }

    .bar-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .label-side {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #758078;
    }

    .label-side strong {
      color: #17251C;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }

    .dot-paid { background: #174D35; }
    .dot-pending { background: #F59E0B; }

    .dual-columns {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 900px) {
      .dual-columns { grid-template-columns: 1fr; }
    }

    .village-financial-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .village-fin-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.7rem 0.85rem;
      background: #F7F8F2;
      border-radius: 10px;
    }

    .v-fin-name {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .v-fin-name strong {
      font-size: 0.86rem;
      color: #17251C;
    }

    .v-fin-count {
      font-size: 0.72rem;
      color: #758078;
    }

    .v-fin-amounts {
      display: flex;
      gap: 1.25rem;
    }

    .fin-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .fin-lbl {
      font-size: 0.68rem;
      color: #758078;
    }

    .fin-val {
      font-size: 0.82rem;
      font-weight: 700;
    }

    .text-green { color: #16A34A; }
    .text-amber { color: #D97706; }

    .pending-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .pending-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.7rem 0.85rem;
      border-radius: 10px;
      background: #F7F8F2;
    }

    .pending-farmer strong {
      font-size: 0.86rem;
      color: #17251C;
      display: block;
    }

    .p-sub {
      font-size: 0.72rem;
      color: #758078;
    }

    .pending-tag-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pending-tag {
      background: #FEF3C7;
      color: #B45309;
      font-weight: 800;
      font-size: 0.8rem;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
    }

    .pending-tag.danger {
      background: #FEE2E2;
      color: #B91C1C;
    }

    .btn-micro {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      color: #174D35;
      font-weight: 700;
      font-size: 0.72rem;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      text-decoration: none;
    }

    .btn-micro:hover {
      background: #174D35;
      color: #FFFFFF;
    }
  `]
    })
], PaymentsComponent);
export { PaymentsComponent };
