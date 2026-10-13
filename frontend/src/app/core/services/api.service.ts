import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Farmer, DashboardStats, HealthStatus, ToolCall } from '../models/farmer.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001/api';

  getHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.baseUrl}/health`);
  }

  getFarmers(village?: string): Observable<{ success: boolean; farmers: Farmer[]; error?: string }> {
    let url = `${this.baseUrl}/farmers`;
    if (village && village !== 'ALL') {
      url += `?village=${encodeURIComponent(village)}`;
    }
    return this.http.get<{ success: boolean; farmers: Farmer[]; error?: string }>(url);
  }

  getDashboardStats(): Observable<{ success: boolean; stats: DashboardStats; error?: string }> {
    return this.http.get<{ success: boolean; stats: DashboardStats; error?: string }>(
      `${this.baseUrl}/dashboard/stats`
    );
  }

  sendMessage(message: string): Observable<{
    success: boolean;
    answer: string;
    executedTools?: ToolCall[];
    error?: string;
  }> {
    return this.http.post<{
      success: boolean;
      answer: string;
      executedTools?: ToolCall[];
      error?: string;
    }>(`${this.baseUrl}/chat`, { message });
  }

  // Formatting utility
  formatCurrency(value: number | string | undefined | null): string {
    const num = Number(value || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  }

  formatTons(value: number | string | undefined | null): string {
    const num = Number(value || 0);
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num) + ' Tons';
  }

  getInitials(name: string): string {
    if (!name) return 'F';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
}

