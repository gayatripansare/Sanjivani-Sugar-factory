import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});
let mcpClient = null;
let mcpTransport = null;
// Initialize MCP Client and connect to server.ts over Stdio
async function initMcpClient() {
    if (mcpClient)
        return mcpClient;
    const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
    mcpTransport = new StdioClientTransport({
        command: cmd,
        args: ["tsx", "server.ts"],
    });
    mcpClient = new Client({ name: "sanjivani-web-api-client", version: "1.0.0" }, { capabilities: {} });
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
    }
    catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});
// 2. Fetch farmers directly through the MCP Server tool
app.get("/api/farmers", async (req, res) => {
    try {
        const client = await initMcpClient();
        const village = req.query.village;
        const toolResult = await client.callTool({
            name: "get_sanjivani_farmers",
            arguments: village ? { village } : {},
        });
        const textContent = toolResult.content
            ?.find((c) => c.type === "text")?.text;
        const farmers = textContent ? JSON.parse(textContent) : [];
        res.json({ success: true, farmers });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// 3. Ask AI (MCP Client + OpenAI tool calling)
app.post("/api/ask", async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "question is required" });
        }
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is not configured in .env",
            });
        }
        const client = await initMcpClient();
        const toolsList = await client.listTools();
        // Map MCP tools to OpenAI format
        const openAiTools = toolsList.tools.map((tool) => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));
        const messages = [
            {
                role: "system",
                content: "You are an expert AI assistant for Sanjivani Sugar Factory. You help factory managers and sugarcane farmers analyze supply, payments, and village statistics. Always call the get_sanjivani_farmers tool to query factual data. Present numbers clearly with Indian rupee formatting (₹).",
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
        const executedTools = [];
        if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
            messages.push(responseMsg);
            for (const toolCall of responseMsg.tool_calls) {
                if (toolCall.type !== "function")
                    continue;
                const args = JSON.parse(toolCall.function.arguments || "{}");
                const mcpResult = await client.callTool({
                    name: toolCall.function.name,
                    arguments: args,
                });
                const outputText = mcpResult.content
                    ?.filter((c) => c.type === "text")
                    .map((c) => c.text)
                    .join("\n") || "";
                let parsedOutput = outputText;
                try {
                    parsedOutput = JSON.parse(outputText);
                }
                catch {
                    // keep as string if not JSON
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
                question,
                answer: finalResponse.choices[0].message.content,
                executedTools,
            });
        }
        else {
            return res.json({
                success: true,
                question,
                answer: responseMsg.content,
                executedTools: [],
            });
        }
    }
    catch (error) {
        console.error("Error processing /api/ask:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Sanjivani Sugar Factory AI API listening on http://localhost:${PORT}`);
});
