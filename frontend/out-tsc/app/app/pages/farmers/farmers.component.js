import { __decorate } from "tslib";
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
let FarmersComponent = class FarmersComponent {
    api = inject(ApiService);
    farmers = signal([]);
    loading = signal(true);
    error = signal('');
    searchQuery = signal('');
    selectedVillage = signal('ALL');
    sortBy = signal('ID');
    villages = computed(() => {
        const list = this.farmers().map((f) => f.village);
        return Array.from(new Set(list)).sort();
    });
    filteredFarmers = computed(() => {
        let list = [...this.farmers()];
        const query = this.searchQuery().toLowerCase().trim();
        const village = this.selectedVillage();
        const sort = this.sortBy();
        if (village !== 'ALL') {
            list = list.filter((f) => f.village.toLowerCase() === village.toLowerCase());
        }
        if (query) {
            list = list.filter((f) => f.name.toLowerCase().includes(query) ||
                f.village.toLowerCase().includes(query));
        }
        switch (sort) {
            case 'SUPPLY_DESC':
                list.sort((a, b) => Number(b.sugarcane_supply_tons) - Number(a.sugarcane_supply_tons));
                break;
            case 'SUPPLY_ASC':
                list.sort((a, b) => Number(a.sugarcane_supply_tons) - Number(b.sugarcane_supply_tons));
                break;
            case 'PENDING_DESC':
                list.sort((a, b) => Number(b.payment_pending) - Number(a.payment_pending));
                break;
            case 'PAID_DESC':
                list.sort((a, b) => Number(b.amount_paid) - Number(a.amount_paid));
                break;
            default:
                list.sort((a, b) => a.id - b.id);
        }
        return list;
    });
    ngOnInit() {
        this.loadFarmers();
    }
    loadFarmers() {
        this.loading.set(true);
        this.error.set('');
        this.api.getFarmers().subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res.success) {
                    this.farmers.set(res.farmers);
                }
                else {
                    this.error.set(res.error || 'Failed to load farmers');
                }
            },
            error: () => {
                this.loading.set(false);
                this.error.set('Could not connect to PostgreSQL backend');
            },
        });
    }
    resetFilters() {
        this.searchQuery.set('');
        this.selectedVillage.set('ALL');
        this.sortBy.set('ID');
    }
    formatCurrency(val) {
        return this.api.formatCurrency(val);
    }
    getInitials(name) {
        return this.api.getInitials(name);
    }
};
FarmersComponent = __decorate([
    Component({
        selector: 'app-farmers',
        standalone: true,
        imports: [CommonModule, FormsModule, RouterModule],
        template: `
    <div class="farmers-page">
      <!-- PAGE HEADER -->
      <div class="page-head">
        <div>
          <h2>Farmers Directory</h2>
          <p class="head-sub">Complete database of sugarcane suppliers registered with Sanjivani Sugar Factory</p>
        </div>
        <div class="head-stat">
          <span class="count-pill">{{ filteredFarmers().length }} of {{ farmers().length }} Farmers</span>
        </div>
      </div>

      <!-- FILTER AND SEARCH TOOLBAR -->
      <div class="toolbar-card">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="search-input"
            [(ngModel)]="searchQuery"
            placeholder="Search by farmer name or village..." />
          @if (searchQuery()) {
            <button class="btn-clear-search" (click)="searchQuery.set('')">✕</button>
          }
        </div>

        <!-- Village Dropdown -->
        <div class="filter-group">
          <label>Village:</label>
          <select class="select-box" [(ngModel)]="selectedVillage">
            <option value="ALL">All Villages ({{ villages().length }})</option>
            @for (v of villages(); track v) {
              <option [value]="v">{{ v }}</option>
            }
          </select>
        </div>

        <!-- Sort By -->
        <div class="filter-group">
          <label>Sort By:</label>
          <select class="select-box" [(ngModel)]="sortBy">
            <option value="ID">Default (ID)</option>
            <option value="SUPPLY_DESC">Supply: High to Low</option>
            <option value="SUPPLY_ASC">Supply: Low to High</option>
            <option value="PENDING_DESC">Pending: High to Low</option>
            <option value="PAID_DESC">Paid: High to Low</option>
          </select>
        </div>

        <!-- Clear filters button -->
        <button class="btn-reset" (click)="resetFilters()">
          Clear Filters
        </button>
      </div>

      <!-- VILLAGE PILLS -->
      <div class="village-pills-bar">
        <button
          class="v-pill"
          [class.active]="selectedVillage() === 'ALL'"
          (click)="selectedVillage.set('ALL')">
          All Villages
        </button>
        @for (v of villages(); track v) {
          <button
            class="v-pill"
            [class.active]="selectedVillage() === v"
            (click)="selectedVillage.set(v)">
            {{ v }}
          </button>
        }
      </div>

      <!-- TABLE CONTAINER -->
      <div class="table-card">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <span>Loading records from PostgreSQL...</span>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <span>⚠️ {{ error() }}</span>
            <button class="btn-retry" (click)="loadFarmers()">Retry</button>
          </div>
        } @else if (filteredFarmers().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🌾</span>
            <h3>No farmers match your filters</h3>
            <p>Try resetting the search query or selecting "All Villages".</p>
            <button class="btn-reset" (click)="resetFilters()">Reset Filters</button>
          </div>
        } @else {
          <div class="table-scroll">
            <table class="farmers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Farmer Details</th>
                  <th>Village</th>
                  <th>Sugarcane Supply</th>
                  <th>Amount Paid</th>
                  <th>Payment Pending</th>
                  <th>Factory</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (f of filteredFarmers(); track f.id) {
                  <tr>
                    <td class="col-id">#{{ f.id }}</td>
                    <td>
                      <div class="farmer-meta">
                        <div class="farmer-avatar">{{ getInitials(f.name) }}</div>
                        <strong>{{ f.name }}</strong>
                      </div>
                    </td>
                    <td>
                      <span class="village-tag">📍 {{ f.village }}</span>
                    </td>
                    <td>
                      <span class="supply-tag">{{ f.sugarcane_supply_tons }} Tons</span>
                    </td>
                    <td class="col-money">{{ formatCurrency(f.amount_paid) }}</td>
                    <td>
                      <span class="pending-chip" [class.alert-high]="+f.payment_pending > 50000">
                        {{ formatCurrency(f.payment_pending) }}
                      </span>
                    </td>
                    <td class="col-factory">{{ f.factory_name || 'Sanjivani Sugar Factory' }}</td>
                    <td class="text-right">
                      <a [routerLink]="['/ai-assistant']" [queryParams]="{ q: 'What is the payment status and supply history of farmer ' + f.name + '?' }" class="btn-ask-sm">
                        Ask AI →
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
        styles: [`
    .farmers-page {
      padding: 2rem;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
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

    .count-pill {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #174D35;
    }

    .toolbar-card {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 14px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-input-wrap {
      flex: 1;
      min-width: 240px;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #758078;
      font-size: 0.85rem;
    }

    .search-input {
      width: 100%;
      padding: 0.55rem 2rem 0.55rem 2.2rem;
      border: 1.5px solid #E5EAE2;
      border-radius: 10px;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      border-color: #174D35;
    }

    .btn-clear-search {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #758078;
      cursor: pointer;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #17251C;
    }

    .select-box {
      padding: 0.5rem 0.75rem;
      border: 1.5px solid #E5EAE2;
      border-radius: 10px;
      font-size: 0.82rem;
      color: #17251C;
      outline: none;
      background: #FFFFFF;
      cursor: pointer;
    }

    .btn-reset {
      background: #F7F8F2;
      border: 1px solid #E5EAE2;
      color: #758078;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.5rem 0.85rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-reset:hover {
      background: #E5EAE2;
      color: #174D35;
    }

    .village-pills-bar {
      display: flex;
      gap: 0.45rem;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .v-pill {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      padding: 0.35rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #758078;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .v-pill:hover {
      border-color: #174D35;
      color: #174D35;
    }

    .v-pill.active {
      background: #174D35;
      border-color: #174D35;
      color: #FFFFFF;
    }

    .table-card {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .table-scroll {
      overflow-x: auto;
    }

    .farmers-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    .farmers-table th {
      padding: 0.85rem 1rem;
      background: #F7F8F2;
      color: #758078;
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid #E5EAE2;
    }

    .farmers-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #F7F8F2;
      color: #17251C;
    }

    .farmers-table tr:hover td {
      background: #F7F8F2;
    }

    .col-id {
      color: #758078;
      font-weight: 700;
    }

    .farmer-meta {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .farmer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #174D35;
      color: #FFFFFF;
      font-size: 0.72rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .village-tag {
      background: #F7F8F2;
      border: 1px solid #E5EAE2;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 600;
      color: #174D35;
    }

    .supply-tag {
      background: #E9F4EE;
      color: #174D35;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.76rem;
    }

    .col-money {
      font-weight: 600;
    }

    .pending-chip {
      background: #FEF3C7;
      color: #B45309;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.76rem;
    }

    .alert-high {
      background: #FEE2E2;
      color: #B91C1C;
    }

    .col-factory {
      font-size: 0.74rem;
      color: #758078;
    }

    .text-right {
      text-align: right;
    }

    .btn-ask-sm {
      background: #F7F8F2;
      border: 1px solid #E5EAE2;
      color: #174D35;
      font-weight: 700;
      font-size: 0.74rem;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-ask-sm:hover {
      background: #174D35;
      color: #FFFFFF;
    }

    .loading-state,
    .empty-state,
    .error-state {
      padding: 3rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: #758078;
    }

    .empty-icon {
      font-size: 2.5rem;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #E5EAE2;
      border-top-color: #174D35;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn-retry {
      background: #174D35;
      color: #FFFFFF;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }
  `]
    })
], FarmersComponent);
export { FarmersComponent };
