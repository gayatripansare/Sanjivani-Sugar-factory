export interface Farmer {
  id: number;
  name: string;
  village: string;
  sugarcane_supply_tons: number;
  amount_paid: number;
  payment_pending: number;
  factory_name?: string;
}

export interface VillageStats {
  village: string;
  farmersCount: number;
  supplyTons: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface DashboardStats {
  totalFarmers: number;
  totalTons: number;
  totalPaid: number;
  totalPending: number;
  villagesCount: number;
  villageBreakdown: VillageStats[];
  topSuppliers: Farmer[];
  highestPending: Farmer[];
}

export interface ToolCall {
  name: string;
  arguments: any;
  result: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

export interface HealthStatus {
  status: string;
  mcpConnected: boolean;
  tools: string[];
  hasOpenAiKey: boolean;
}

