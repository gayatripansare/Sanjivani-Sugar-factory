import { __decorate } from "tslib";
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
let AnalyticsComponent = class AnalyticsComponent {
    api = inject(ApiService);
    stats = signal(null);
    farmers = signal([]);
    ngOnInit() {
        this.api.getDashboardStats().subscribe({
            next: (res) => {
                if (res.success)
                    this.stats.set(res.stats);
            },
        });
        this.api.getFarmers().subscribe({
            next: (res) => {
                if (res.success)
                    this.farmers.set(res.farmers);
            },
        });
    }
    sortedFarmers = computed(() => {
        return [...this.farmers()].sort((a, b) => Number(b.sugarcane_supply_tons) - Number(a.sugarcane_supply_tons));
    });
    maxFarmer = computed(() => {
        const list = this.sortedFarmers();
        return list.length > 0 ? list[0] : null;
    });
    minFarmer = computed(() => {
        const list = this.sortedFarmers();
        return list.length > 0 ? list[list.length - 1] : null;
    });
    averageTons = computed(() => {
        const count = this.farmers().length;
        if (count === 0)
            return 0;
        const total = this.stats()?.totalTons || 0;
        return total / count;
    });
    getPercentage(tons) {
        const top = this.maxFarmer();
        const max = Number(top?.sugarcane_supply_tons || 250);
        return max > 0 ? (Number(tons) / max) * 100 : 0;
    }
    formatCurrency(val) {
        return this.api.formatCurrency(val);
    }
};
AnalyticsComponent = __decorate([
    Component({
        selector: 'app-analytics',
        standalone: true,
        imports: [CommonModule, RouterModule],
        template: `
    <div class="analytics-page">
      <!-- HEADER -->
      <div class="page-head">
        <div>
          <h2>Sugarcane Supply Analytics</h2>
          <p class="head-sub">Production volume analysis and farmer delivery comparisons from PostgreSQL database</p>
        </div>
      </div>

      <!-- TOP METRIC CARDS -->
      <div class="metrics-grid">
        <div class="metric-box">
          <span class="m-label">Total Cane Procured</span>
          <div class="m-val">{{ stats()?.totalTons | number:'1.2-2' }} <span class="m-unit">Tons</span></div>
          <span class="m-sub">10 verified farmer consignments</span>
        </div>

        <div class="metric-box">
          <span class="m-label">Average Supply per Farmer</span>
          <div class="m-val">{{ averageTons() | number:'1.2-2' }} <span class="m-unit">Tons</span></div>
          <span class="m-sub">Median delivery volume</span>
        </div>

        <div class="metric-box">
          <span class="m-label">Highest Single Consignment</span>
          @if (maxFarmer(); as top) {
            <div class="m-val val-green">{{ top.sugarcane_supply_tons }} <span class="m-unit">Tons</span></div>
            <span class="m-sub">{{ top.name }} ({{ top.village }})</span>
          } @else {
            <div class="m-val">--</div>
          }
        </div>

        <div class="metric-box">
          <span class="m-label">Lowest Single Consignment</span>
          @if (minFarmer(); as low) {
            <div class="m-val">{{ low.sugarcane_supply_tons }} <span class="m-unit">Tons</span></div>
            <span class="m-sub">{{ low.name }} ({{ low.village }})</span>
          } @else {
            <div class="m-val">--</div>
          }
        </div>
      </div>

      <!-- COMPARISON CHARTS (BAR METERS) -->
      <div class="content-box">
        <div class="box-head">
          <div>
            <h3>Farmer Sugarcane Supply Comparison</h3>
            <p class="box-sub">Visual volume ranking across all registered farmers</p>
          </div>
        </div>

        <div class="bars-container">
          @for (farmer of sortedFarmers(); track farmer.id) {
            <div class="bar-row">
              <div class="row-farmer-meta">
                <strong>{{ farmer.name }}</strong>
                <span class="f-village">📍 {{ farmer.village }}</span>
              </div>

              <div class="row-meter-wrap">
                <div class="meter-track">
                  <div
                    class="meter-fill"
                    [style.width.%]="getPercentage(farmer.sugarcane_supply_tons)">
                  </div>
                </div>
              </div>

              <div class="row-tons-meta">
                <strong>{{ farmer.sugarcane_supply_tons }} Tons</strong>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- VILLAGE GEOGRAPHICAL YIELD -->
      <div class="content-box">
        <div class="box-head">
          <h3>Supply Intake by Village Region</h3>
          <p class="box-sub">Aggregate sugarcane deliveries per catchment area</p>
        </div>

        <div class="village-grid">
          @for (v of stats()?.villageBreakdown; track v.village) {
            <div class="v-card">
              <div class="v-card-top">
                <span class="v-name">📍 {{ v.village }}</span>
                <span class="v-tag">{{ v.farmersCount }} Farmer(s)</span>
              </div>
              <div class="v-cane-tons">
                <strong>{{ v.supplyTons }}</strong> <span>Tons</span>
              </div>
              <div class="v-fin">
                <span>Dues: {{ formatCurrency(v.pendingAmount) }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
        styles: [`
    .analytics-page {
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

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    @media (max-width: 1100px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .metrics-grid { grid-template-columns: 1fr; }
    }

    .metric-box {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 16px;
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .m-label {
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #758078;
    }

    .m-val {
      font-size: 1.65rem;
      font-weight: 800;
      color: #17251C;
    }

    .val-green { color: #174D35; }

    .m-unit {
      font-size: 0.85rem;
      font-weight: 600;
      color: #758078;
    }

    .m-sub {
      font-size: 0.72rem;
      color: #758078;
    }

    .content-box {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .box-head h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #17251C;
      margin: 0 0 2px;
    }

    .box-sub {
      font-size: 0.76rem;
      color: #758078;
      margin: 0;
    }

    .bars-container {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      margin-top: 1.25rem;
    }

    .bar-row {
      display: grid;
      grid-template-columns: 220px 1fr 100px;
      align-items: center;
      gap: 1.25rem;
    }

    @media (max-width: 768px) {
      .bar-row {
        grid-template-columns: 1fr;
        gap: 0.4rem;
      }
    }

    .row-farmer-meta {
      display: flex;
      flex-direction: column;
    }

    .row-farmer-meta strong {
      font-size: 0.86rem;
      color: #17251C;
    }

    .f-village {
      font-size: 0.72rem;
      color: #758078;
    }

    .meter-track {
      height: 14px;
      background: #F7F8F2;
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid #E5EAE2;
    }

    .meter-fill {
      height: 100%;
      background: linear-gradient(90deg, #174D35, #287A52);
      border-radius: 9999px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .row-tons-meta {
      text-align: right;
      font-size: 0.86rem;
      color: #174D35;
    }

    .village-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-top: 1.25rem;
    }

    .v-card {
      background: #F7F8F2;
      border: 1px solid #E5EAE2;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .v-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .v-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #17251C;
    }

    .v-tag {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 6px;
      color: #174D35;
    }

    .v-cane-tons strong {
      font-size: 1.35rem;
      color: #174D35;
    }

    .v-cane-tons span {
      font-size: 0.8rem;
      color: #758078;
    }

    .v-fin {
      font-size: 0.74rem;
      color: #758078;
      border-top: 1px solid #E5EAE2;
      padding-top: 0.35rem;
    }
  `]
    })
], AnalyticsComponent);
export { AnalyticsComponent };
