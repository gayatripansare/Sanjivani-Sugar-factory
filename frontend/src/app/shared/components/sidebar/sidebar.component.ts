import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <!-- BRAND LOGO -->
      <div class="sidebar-brand">
        <div class="brand-badge">
          <span class="brand-icon">🌾</span>
        </div>
        <div class="brand-text">
          <h2 class="brand-name">Sanjivani</h2>
          <span class="brand-sub">AI Farmer Assistant</span>
        </div>
      </div>

      <!-- NAVIGATION LINKS -->
      <nav class="sidebar-nav">
        <span class="nav-heading">MANAGEMENT</span>

        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="9" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="9" rx="1"/>
            <rect x="3" y="16" width="7" height="5" rx="1"/>
          </svg>
          <span class="nav-label">Dashboard</span>
        </a>

        <a routerLink="/ai-assistant" routerLinkActive="active" class="nav-item highlight-item">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.587-1.11L3 22l1.11-4.413A9.96 9.96 0 0 1 2 12 10 10 0 0 1 12 2z"/>
            <path d="M8 12h.01M12 12h.01M16 12h.01"/>
          </svg>
          <span class="nav-label">AI Assistant</span>
          <span class="nav-badge-pill">MCP</span>
        </a>

        <a routerLink="/farmers" routerLinkActive="active" class="nav-item">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span class="nav-label">Farmers Directory</span>
        </a>

        <a routerLink="/payments" routerLinkActive="active" class="nav-item">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <span class="nav-label">Payments Overview</span>
        </a>

        <a routerLink="/analytics" routerLinkActive="active" class="nav-item">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
          <span class="nav-label">Supply Analytics</span>
        </a>

        <span class="nav-heading sys-heading">SYSTEM</span>

        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span class="nav-label">Settings</span>
        </a>
      </nav>

      <!-- USER PROFILE FOOTER -->
      <div class="sidebar-user">
        <div class="user-avatar-wrap">
          <div class="user-avatar">FO</div>
          <span class="user-status-dot"></span>
        </div>
        <div class="user-meta">
          <span class="user-name">Factory Operations</span>
          <span class="user-unit">Kopargaon Unit #1</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      background-color: #FFFFFF;
      border-right: 1px solid #E5EAE2;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      flex-shrink: 0;
      z-index: 100;
    }

    .sidebar-brand {
      padding: 1.5rem 1.4rem;
      display: flex;
      align-items: center;
      gap: 0.9rem;
      border-bottom: 1px solid #E5EAE2;
    }

    .brand-badge {
      width: 44px;
      height: 44px;
      background-color: #174D35;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(23, 77, 53, 0.2);
    }

    .brand-icon {
      font-size: 1.6rem;
    }

    .brand-name {
      font-size: 1.2rem;
      font-weight: 800;
      color: #174D35;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .brand-sub {
      font-size: 0.72rem;
      color: #758078;
      font-weight: 600;
      display: block;
      margin-top: 2px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      overflow-y: auto;
    }

    .nav-heading {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #758078;
      padding: 0.5rem 0.75rem 0.35rem;
      text-transform: uppercase;
    }

    .sys-heading {
      margin-top: 1rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.85rem;
      border-radius: 10px;
      color: #758078;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-svg {
      width: 19px;
      height: 19px;
      transition: stroke 0.2s ease;
    }

    .nav-item:hover {
      background-color: #F7F8F2;
      color: #174D35;
    }

    .nav-item.active {
      background-color: #174D35;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(23, 77, 53, 0.2);
    }

    .nav-item.active .nav-svg {
      stroke: #C7F36B;
    }

    .nav-badge-pill {
      margin-left: auto;
      background-color: #C7F36B;
      color: #174D35;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 9999px;
      letter-spacing: 0.04em;
    }

    .sidebar-user {
      padding: 1.1rem 1.4rem;
      border-top: 1px solid #E5EAE2;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background-color: #F7F8F2;
    }

    .user-avatar-wrap {
      position: relative;
    }

    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background-color: #287A52;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-status-dot {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background-color: #10B981;
      border: 2px solid #FFFFFF;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.84rem;
      font-weight: 700;
      color: #17251C;
    }

    .user-unit {
      font-size: 0.72rem;
      color: #758078;
    }
  `]
})
export class SidebarComponent {}

