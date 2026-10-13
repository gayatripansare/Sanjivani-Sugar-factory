import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
let ApiService = class ApiService {
    http = inject(HttpClient);
    baseUrl = 'http://localhost:3001/api';
    getHealth() {
        return this.http.get(`${this.baseUrl}/health`);
    }
    getFarmers(village) {
        let url = `${this.baseUrl}/farmers`;
        if (village && village !== 'ALL') {
            url += `?village=${encodeURIComponent(village)}`;
        }
        return this.http.get(url);
    }
    getDashboardStats() {
        return this.http.get(`${this.baseUrl}/dashboard/stats`);
    }
    sendMessage(message) {
        return this.http.post(`${this.baseUrl}/chat`, { message });
    }
    // Formatting utility
    formatCurrency(value) {
        const num = Number(value || 0);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(num);
    }
    formatTons(value) {
        const num = Number(value || 0);
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        }).format(num) + ' Tons';
    }
    getInitials(name) {
        if (!name)
            return 'F';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }
};
ApiService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], ApiService);
export { ApiService };
