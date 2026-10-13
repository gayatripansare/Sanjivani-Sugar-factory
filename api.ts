import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:4200", "http://127.0.0.1:4200"] }));
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

let mcpClient: Client | null = null;
let mcpTransport: StdioClientTransport | null = null;

// Initialize MCP Client and connect to server.ts over Stdio
async function initMcpClient(): Promise<Client> {
  if (mcpClient) return mcpClient;

  const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
  mcpTransport = new StdioClientTransport({
    command: cmd,
    args: ["tsx", "server.ts"],
  });

  mcpClient = new Client(
    { name: "sanjivani-web-api-client", version: "1.0.0" },
    { capabilities: {} }
  );

  console.log("🔌 Connecting API server to MCP Server (server.ts)...");
  await mcpClient.connect(mcpTransport);
  console.log("✅ MCP Client connected successfully!");

  return mcpClient;
}

// 1. Health check & status
app.get("/api/health", async (_req, res) => {
  try {
    const client = await initMcpClient();
    const tools = await client.listTools();
    res.json({
      status: "ok",
      mcpConnected: true,
      tools: tools.tools.map((t) => t.name),
      hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Helper to query farmers through MCP Server tool
async function getFarmersFromMcp(village?: string) {
  const client = await initMcpClient();
  const toolResult = await client.callTool({
    name: "get_sanjivani_farmers",
    arguments: village ? { village } : {},
  });

  const textContent = (toolResult.content as Array<{ type: string; text?: string }>)
    ?.find((c) => c.type === "text")?.text;

  return textContent ? JSON.parse(textContent) : [];
}

// 2. Fetch farmers directly through the MCP Server tool
app.get("/api/farmers", async (req, res) => {
  try {
    const village = req.query.village as string | undefined;
    const farmers = await getFarmersFromMcp(village);
    res.json({ success: true, farmers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Real Dashboard Aggregated Statistics from PostgreSQL
app.get("/api/dashboard/stats", async (_req, res) => {
  try {
    const farmers: any[] = await getFarmersFromMcp();

    const totalFarmers = farmers.length;
    const totalTons = farmers.reduce((sum, f) => sum + Number(f.sugarcane_supply_tons || 0), 0);
    const totalPaid = farmers.reduce((sum, f) => sum + Number(f.amount_paid || 0), 0);
    const totalPending = farmers.reduce((sum, f) => sum + Number(f.payment_pending || 0), 0);

    // Grouping by village
    const villageMap: Record<string, { count: number; supply: number; paid: number; pending: number }> = {};
    for (const f of farmers) {
      if (!villageMap[f.village]) {
        villageMap[f.village] = { count: 0, supply: 0, paid: 0, pending: 0 };
      }
      villageMap[f.village].count += 1;
      villageMap[f.village].supply += Number(f.sugarcane_supply_tons || 0);
      villageMap[f.village].paid += Number(f.amount_paid || 0);
      villageMap[f.village].pending += Number(f.payment_pending || 0);
    }

    const villageBreakdown = Object.entries(villageMap).map(([village, stats]) => ({
      village,
      farmersCount: stats.count,
      supplyTons: Number(stats.supply.toFixed(2)),
      paidAmount: stats.paid,
      pendingAmount: stats.pending,
    }));

    // Top suppliers
    const topSuppliers = [...farmers]
      .sort((a, b) => Number(b.sugarcane_supply_tons) - Number(a.sugarcane_supply_tons))
      .slice(0, 5);

    // Highest pending payments
    const highestPending = [...farmers]
      .sort((a, b) => Number(b.payment_pending) - Number(a.payment_pending))
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalFarmers,
        totalTons: Number(totalTons.toFixed(2)),
        totalPaid,
        totalPending,
        villagesCount: Object.keys(villageMap).length,
        villageBreakdown,
        topSuppliers,
        highestPending,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Chat Handler (MCP Client + OpenAI tool calling)
async function handleChat(question: string, res: express.Response) {
  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "message or question is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is not configured in .env",
    });
  }

  const client = await initMcpClient();
  const toolsList = await client.listTools();

  // Map MCP tools to OpenAI function calling format
  const openAiTools: OpenAI.ChatCompletionTool[] = toolsList.tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema as any,
    },
  }));

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are the senior AI agricultural management copilot for Sanjivani Sugar Factory. You provide accurate, authoritative, and polite answers about sugarcane farmers, delivery tonnages, disbursed payments, and pending dues. Always execute the get_sanjivani_farmers tool to query live database records before giving answers. Use Indian rupee formatting (₹). Never invent farmer names or records.",
    },
    {
      role: "user",
      content: question,
    },
  ];

  const initialResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools: openAiTools,
  });

  const responseMsg = initialResponse.choices[0].message;
  const executedTools: Array<{ name: string; arguments: any; result: any }> = [];

  if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
    messages.push(responseMsg);

    for (const toolCall of responseMsg.tool_calls) {
      if (toolCall.type !== "function") continue;

      const args = JSON.parse(toolCall.function.arguments || "{}");
      const mcpResult = await client.callTool({
        name: toolCall.function.name,
        arguments: args,
      });

      const outputText =
        (mcpResult.content as Array<{ type: string; text?: string }>)
          ?.filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("\n") || "";

      let parsedOutput = outputText;
      try {
        parsedOutput = JSON.parse(outputText);
      } catch {
        // Keep string if not json
      }

      executedTools.push({
        name: toolCall.function.name,
        arguments: args,
        result: parsedOutput,
      });

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: outputText,
      });
    }

    const finalResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    return res.json({
      success: true,
      answer: finalResponse.choices[0].message.content,
      executedTools,
    });
  } else {
    return res.json({
      success: true,
      answer: responseMsg.content,
      executedTools: [],
    });
  }
}

// POST /api/chat & POST /api/ask
app.post("/api/chat", async (req, res) => {
  try {
    const text = req.body.message || req.body.question;
    await handleChat(text, res);
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/ask", async (req, res) => {
  try {
    const text = req.body.question || req.body.message;
    await handleChat(text, res);
  } catch (error: any) {
    console.error("Error in /api/ask:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sanjivani Sugar Factory AI API listening on http://localhost:${PORT}`);
});
