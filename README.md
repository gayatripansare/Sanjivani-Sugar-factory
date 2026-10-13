# Sanjivani AI Farmer Assistant — Enterprise Dashboard

A modern, SaaS-grade agricultural intelligence application demonstrating the **Model Context Protocol (MCP)** using the official `@modelcontextprotocol/sdk`, **OpenAI GPT-4o-mini**, **PostgreSQL**, and an enterprise **Angular** dashboard UI.

---

## 📁 Project Architecture

```text
MCP/
├── schema.sql         # SQL script to create table & insert 10 sample farmers
├── server.ts          # MCP Server: connects to Postgres & exposes get_sanjivani_farmers tool
├── client.ts          # Interactive terminal client (preserved)
├── api.ts             # Express REST bridge connecting Angular UI to MCP & OpenAI
├── .env               # Your local credentials (OpenAI key + Postgres password)
├── package.json       # Project scripts and dependencies
├── tsconfig.json      # TypeScript compiler configuration
└── frontend/          # 🌟 Enterprise Angular Application
    ├── src/app/
    │   ├── core/
    │   │   ├── models/farmer.model.ts      # TypeScript interfaces
    │   │   └── services/api.service.ts     # HTTP API & formatting service
    │   ├── shared/
    │   │   ├── components/sidebar/         # Enterprise navigation sidebar
    │   │   └── components/topbar/          # Header with breadcrumbs & system health
    │   ├── pages/
    │   │   ├── dashboard/                  # KPI metrics, disbursement ratio, recent farmers
    │   │   ├── ai-assistant/               # Conversational AI with MCP tool tracing
    │   │   ├── farmers/                    # Search, village filter, sorting, directory table
    │   │   ├── payments/                   # Financial distribution & high-pending settlements
    │   │   ├── analytics/                  # Sugarcane supply comparison & tonnage meters
    │   │   └── settings/                   # Architecture overview & health diagnostics
    │   ├── app.routes.ts                   # Page routing
    │   └── app.ts                          # Shell layout container
    ├── src/styles.css                      # Global theme variables & typography
    └── angular.json
```

---

## 🎨 Design Vision & Color Palette

- **Primary Background:** `#F7F8F2` (Cream / Soft Warm Ivory)
- **Primary Green:** `#174D35` (Deep Forest Green)
- **Secondary Green:** `#287A52` (Agricultural Refined Green)
- **Accent Lime:** `#C7F36B` (Vibrant Lime Accent)
- **White Cards:** `#FFFFFF`
- **Text:** Primary `#17251C`, Secondary `#758078`
- **Borders:** `#E5EAE2`

---

## 🚀 How to Run

### Step 1: PostgreSQL Setup (if not already done)
In pgAdmin or terminal:
```powershell
psql -U postgres -d sanjivani_db -f schema.sql
```

### Step 2: Configure `.env`
Ensure [.env](file:///c:/Users/LENOVO/OneDrive/Desktop/MCP/.env) has your credentials:
```env
OPENAI_API_KEY=your_openai_api_key
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=sanjivani_db
```

### Step 3: Start the Application

#### Option A: One Single Command (Easiest)
```powershell
npm run dev
```
> Runs both the **Backend API** (port 3001) and the **Angular UI** (port 4200) concurrently!

#### Option B: Separate Terminals
- Terminal 1: `npm run api`
- Terminal 2: `npm run ui`

Open your browser at:
👉 **[http://localhost:4200](http://localhost:4200)**

---

## 🌟 Pages & Key Features

1. **Dashboard (`/dashboard`)**:
   - Real-time statistics: Total Farmers (10), Total Supply (1,321 Tons), Total Paid (₹30,30,000), Pending Dues (₹5,21,000).
   - Settlement progress bar (Paid % vs Pending %).
   - Top sugarcane suppliers list.
   - Recent farmers directory table with quick "Ask AI" actions.

2. **AI Farmer Assistant (`/ai-assistant`)**:
   - Conversational AI powered by OpenAI GPT-4o-mini & MCP.
   - Empty state with 6 suggested questions (clickable chips).
   - Auto-scroll, Enter to send, Shift + Enter for new lines.
   - Thinking indicator while querying database.
   - Collapsible MCP tool execution trace showing live PostgreSQL payload.
   - Rich markdown rendering (headings, bullet lists, bold text).

3. **Farmers Directory (`/farmers`)**:
   - Filter by village (dropdown + pill slider).
   - Search by farmer name.
   - Sort by ID, sugarcane supply, pending payments, or amount paid.
   - Indian rupee formatting (`₹`) and tons (`Tons`).

4. **Payments Overview (`/payments`)**:
   - Settlement ratio and financial summaries.
   - Village-wise financial breakdown.
   - High-pending payment indicator (> ₹50,000 alert tag).

5. **Supply Analytics (`/analytics`)**:
   - Sugarcane supply comparison with visual bar meters.
   - Highest and lowest single consignments.
   - Production intake per village region.

6. **System Settings (`/settings`)**:
   - Technical status of MCP Server (`sanjivani-sugar-factory-server`), tool (`get_sanjivani_farmers`), and PostgreSQL connection.

