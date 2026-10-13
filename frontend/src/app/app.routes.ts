import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AiAssistantComponent } from './pages/ai-assistant/ai-assistant.component';
import { FarmersComponent } from './pages/farmers/farmers.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'ai-assistant', component: AiAssistantComponent },
  { path: 'farmers', component: FarmersComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'dashboard' },
];

