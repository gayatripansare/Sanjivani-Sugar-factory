import { __decorate } from "tslib";
import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { ApiService } from '../../core/services/api.service';
let AiAssistantComponent = class AiAssistantComponent {
    scrollContainer;
    api = inject(ApiService);
    sanitizer = inject(DomSanitizer);
    route = inject(ActivatedRoute);
    userInput = '';
    isThinking = signal(false);
    chatHistory = signal([]);
    expandedTraceId = signal(null);
    // Exact 6 suggested questions from instructions
    suggestedQuestions = [
        'Show all farmers from Kopargaon.',
        'Which farmer has supplied the most sugarcane?',
        'Show farmers with pending payments.',
        'What is the total amount paid to farmers?',
        'Compare the sugarcane supply of all farmers.',
        'Show the farmers with the highest pending payments.',
    ];
    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            if (params['q']) {
                this.askPrompt(params['q']);
            }
        });
    }
    ngAfterViewChecked() {
        this.scrollToBottom();
    }
    scrollToBottom() {
        try {
            if (this.scrollContainer) {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            }
        }
        catch {
            // scroll safely
        }
    }
    handleKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }
    askPrompt(text) {
        this.userInput = text;
        this.sendMessage();
    }
    sendMessage() {
        const text = this.userInput.trim();
        if (!text || this.isThinking())
            return;
        this.userInput = '';
        const userMsg = {
            id: 'usr-' + Date.now(),
            sender: 'user',
            text,
            timestamp: new Date(),
        };
        this.chatHistory.update((prev) => [...prev, userMsg]);
        this.isThinking.set(true);
        this.api.sendMessage(text).subscribe({
            next: (res) => {
                this.isThinking.set(false);
                const aiMsg = {
                    id: 'ai-' + Date.now(),
                    sender: 'assistant',
                    text: res.answer,
                    toolCalls: res.executedTools || [],
                    timestamp: new Date(),
                };
                this.chatHistory.update((prev) => [...prev, aiMsg]);
            },
            error: () => {
                this.isThinking.set(false);
                const errMsg = {
                    id: 'err-' + Date.now(),
                    sender: 'assistant',
                    text: '⚠️ **Request Failed:** Could not connect to the MCP backend API. Please ensure `npm run api` is running on port 3001.',
                    timestamp: new Date(),
                };
                this.chatHistory.update((prev) => [...prev, errMsg]);
            },
        });
    }
    toggleTrace(id) {
        if (this.expandedTraceId() === id) {
            this.expandedTraceId.set(null);
        }
        else {
            this.expandedTraceId.set(id);
        }
    }
    formatMarkdown(content) {
        if (!content)
            return '';
        try {
            const parsed = marked.parse(content);
            return this.sanitizer.bypassSecurityTrustHtml(parsed);
        }
        catch {
            return content;
        }
    }
};
__decorate([
    ViewChild('scrollContainer')
], AiAssistantComponent.prototype, "scrollContainer", void 0);
AiAssistantComponent = __decorate([
    Component({
        selector: 'app-ai-assistant',
        standalone: true,
        imports: [CommonModule, FormsModule],
        template: `
    <div class="ai-page">
      <!-- HEADER -->
      <div class="ai-header">
        <div class="ai-header-left">
          <div class="ai-avatar-badge">
            <span>🤖</span>
          </div>
          <div>
            <h2>Sanjivani AI Copilot</h2>
            <p class="ai-sub">Conversational intelligence powered by OpenAI GPT-4o-mini & Model Context Protocol (MCP)</p>
          </div>
        </div>

        <div class="ai-status-pill">
          <span class="status-dot-pulse"></span>
          <span>MCP Server Connected • <code>get_sanjivani_farmers</code></span>
        </div>
      </div>

      <!-- MAIN CHAT CONTAINER -->
      <div class="chat-container">
        <!-- MESSAGES FEED -->
        <div class="messages-feed" #scrollContainer>
          @if (chatHistory().length === 0) {
            <!-- EMPTY STATE WITH 6 SUGGESTED QUESTIONS -->
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <span>🌾</span>
              </div>
              <h3>How can I assist your sugarcane operations today?</h3>
              <p class="empty-desc">
                Select one of the suggested prompts below or type your custom inquiry.
                I connect directly to PostgreSQL via MCP to deliver factual statistics.
              </p>

              <div class="suggested-grid">
                @for (prompt of suggestedQuestions; track prompt) {
                  <button class="suggestion-card" (click)="askPrompt(prompt)">
                    <span class="suggestion-bullet">💡</span>
                    <span class="suggestion-text">{{ prompt }}</span>
                  </button>
                }
              </div>
            </div>
          }

          <!-- MESSAGES -->
          @for (msg of chatHistory(); track msg.id) {
            <div class="message-row" [class.user-row]="msg.sender === 'user'" [class.ai-row]="msg.sender === 'assistant'">
              <div class="msg-avatar">
                {{ msg.sender === 'user' ? '👤' : '🌾' }}
              </div>

              <div class="msg-bubble-card">
                <div class="bubble-header">
                  <span class="bubble-author">{{ msg.sender === 'user' ? 'You' : 'Sanjivani AI Assistant' }}</span>
                  <span class="bubble-time">{{ msg.timestamp | date:'shortTime' }}</span>
                </div>

                <!-- MCP PROTOCOL EXECUTION BADGE (Collapsible) -->
                @if (msg.toolCalls && msg.toolCalls.length > 0) {
                  <div class="mcp-trace-panel">
                    <div class="trace-bar" (click)="toggleTrace(msg.id)">
                      <div class="trace-left">
                        <span class="trace-badge">⚡ MCP PROTOCOL</span>
                        <code class="trace-tool-name">{{ msg.toolCalls[0].name }}</code>
                      </div>
                      <span class="trace-btn-text">
                        {{ expandedTraceId() === msg.id ? 'Hide Details ▲' : 'Inspect Database Payload ▼' }}
                      </span>
                    </div>

                    @if (expandedTraceId() === msg.id) {
                      <div class="trace-details">
                        <div class="trace-block">
                          <span class="block-label">Tool Input Arguments:</span>
                          <pre class="json-box">{{ msg.toolCalls[0].arguments | json }}</pre>
                        </div>
                        <div class="trace-block">
                          <span class="block-label">PostgreSQL Records Retrieved:</span>
                          <pre class="json-box result-json">{{ msg.toolCalls[0].result | json }}</pre>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- RICH MARKDOWN BODY -->
                <div class="markdown-content" [innerHTML]="formatMarkdown(msg.text)"></div>
              </div>
            </div>
          }

          <!-- THINKING INDICATOR -->
          @if (isThinking()) {
            <div class="message-row ai-row">
              <div class="msg-avatar">🌾</div>
              <div class="msg-bubble-card thinking-bubble">
                <div class="thinking-spinner"></div>
                <span class="thinking-text">Querying PostgreSQL via MCP and analyzing records...</span>
              </div>
            </div>
          }
        </div>

        <!-- INPUT BOX AT BOTTOM -->
        <div class="chat-input-container">
          <div class="input-card">
            <textarea
              #inputField
              class="chat-textarea"
              rows="2"
              [(ngModel)]="userInput"
              placeholder="Ask about sugarcane supply, farmer payments, or village statistics (Shift + Enter for new line)..."
              (keydown)="handleKeydown($event)">
            </textarea>

            <div class="input-footer">
              <span class="shortcut-tip">Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line</span>
              <button class="send-btn" [disabled]="isThinking() || !userInput.trim()" (click)="sendMessage()">
                @if (isThinking()) {
                  <span class="btn-spinner"></span>
                  <span>Processing...</span>
                } @else {
                  <span>Send</span>
                  <span class="send-icon">↑</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
        styles: [`
    .ai-page {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 64px);
      background-color: #F7F8F2;
      overflow: hidden;
    }

    /* Header */
    .ai-header {
      padding: 1.25rem 2rem;
      background-color: #FFFFFF;
      border-bottom: 1px solid #E5EAE2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      flex-shrink: 0;
    }

    .ai-header-left {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .ai-avatar-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #174D35;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 10px rgba(23, 77, 53, 0.15);
    }

    .ai-header h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #174D35;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .ai-sub {
      font-size: 0.78rem;
      color: #758078;
      margin: 2px 0 0 0;
    }

    .ai-status-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #F7F8F2;
      border: 1px solid #E5EAE2;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #174D35;
    }

    .status-dot-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10B981;
      box-shadow: 0 0 8px #10B981;
      animation: pulseGlow 2s infinite ease-in-out;
    }

    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.85); opacity: 0.5; }
    }

    /* Container */
    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-width: 1100px;
      width: 100%;
      margin: 0 auto;
    }

    /* Feed */
    .messages-feed {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    /* Empty state */
    .empty-state {
      margin: auto;
      text-align: center;
      max-width: 680px;
      padding: 2rem 1rem;
    }

    .empty-icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: #E9F4EE;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 1rem;
    }

    .empty-state h3 {
      font-size: 1.3rem;
      font-weight: 800;
      color: #174D35;
      margin: 0 0 0.5rem 0;
    }

    .empty-desc {
      font-size: 0.86rem;
      color: #758078;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .suggested-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      text-align: left;
    }

    @media (max-width: 680px) {
      .suggested-grid { grid-template-columns: 1fr; }
    }

    .suggestion-card {
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 12px;
      padding: 0.85rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      text-align: left;
    }

    .suggestion-card:hover {
      border-color: #174D35;
      background: #E9F4EE;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(23, 77, 53, 0.08);
    }

    .suggestion-bullet {
      font-size: 1.1rem;
    }

    .suggestion-text {
      font-size: 0.84rem;
      font-weight: 600;
      color: #17251C;
    }

    /* Message rows */
    .message-row {
      display: flex;
      gap: 0.85rem;
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .user-row {
      flex-direction: row-reverse;
    }

    .msg-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .user-row .msg-avatar {
      background: #E9F4EE;
    }

    .ai-row .msg-avatar {
      background: #174D35;
      color: #FFFFFF;
    }

    .msg-bubble-card {
      max-width: 80%;
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
      border-radius: 16px;
      padding: 1.15rem 1.35rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .user-row .msg-bubble-card {
      background: #174D35;
      color: #FFFFFF;
      border-color: #174D35;
    }

    .user-row .bubble-author,
    .user-row .bubble-time {
      color: #C7F36B;
    }

    .bubble-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.65rem;
    }

    .bubble-author {
      font-size: 0.78rem;
      font-weight: 700;
      color: #174D35;
    }

    .bubble-time {
      font-size: 0.7rem;
      color: #758078;
    }

    /* Markdown styling inside AI bubble */
    .markdown-content {
      font-size: 0.88rem;
      line-height: 1.65;
      color: #17251C;
    }

    .user-row .markdown-content {
      color: #FFFFFF;
    }

    .markdown-content p {
      margin-bottom: 0.65rem;
    }

    .markdown-content p:last-child {
      margin-bottom: 0;
    }

    .markdown-content h1,
    .markdown-content h2,
    .markdown-content h3 {
      color: #174D35;
      font-weight: 800;
      margin: 0.75rem 0 0.4rem;
    }

    .markdown-content ul,
    .markdown-content ol {
      padding-left: 1.25rem;
      margin-bottom: 0.65rem;
    }

    .markdown-content li {
      margin-bottom: 0.35rem;
    }

    .markdown-content strong {
      color: #174D35;
      font-weight: 700;
    }

    .user-row .markdown-content strong {
      color: #C7F36B;
    }

    /* MCP Trace Strip */
    .mcp-trace-panel {
      background: #17251C;
      border-radius: 8px;
      margin-bottom: 0.85rem;
      overflow: hidden;
      border: 1px solid #287A52;
    }

    .trace-bar {
      padding: 0.5rem 0.75rem;
      background: #174D35;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .trace-bar:hover {
      background: #287A52;
    }

    .trace-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .trace-badge {
      background: #C7F36B;
      color: #174D35;
      font-size: 0.62rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .trace-tool-name {
      color: #A7F3D0;
      font-size: 0.75rem;
    }

    .trace-btn-text {
      color: #E5EAE2;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .trace-details {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: #0D1611;
      max-height: 200px;
      overflow-y: auto;
    }

    .block-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: #758078;
      display: block;
      margin-bottom: 2px;
    }

    .json-box {
      background: #070B09;
      color: #A7F3D0;
      padding: 0.45rem;
      border-radius: 6px;
      font-size: 0.72rem;
      margin: 0;
      overflow-x: auto;
    }

    .result-json {
      color: #C7F36B;
    }

    /* Thinking */
    .thinking-bubble {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.2rem;
      background: #FFFFFF;
      border: 1px solid #E5EAE2;
    }

    .thinking-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #E5EAE2;
      border-top-color: #174D35;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .thinking-text {
      font-size: 0.82rem;
      color: #758078;
      font-style: italic;
    }

    /* Input Footer */
    .chat-input-container {
      padding: 1rem 1.5rem 1.5rem;
      background-color: #F7F8F2;
      flex-shrink: 0;
    }

    .input-card {
      background: #FFFFFF;
      border: 1.5px solid #E5EAE2;
      border-radius: 16px;
      padding: 0.85rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .input-card:focus-within {
      border-color: #174D35;
      box-shadow: 0 4px 16px rgba(23, 77, 53, 0.1);
    }

    .chat-textarea {
      width: 100%;
      border: none;
      outline: none;
      resize: none;
      font-family: inherit;
      font-size: 0.9rem;
      color: #17251C;
      line-height: 1.5;
    }

    .input-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #F7F8F2;
      padding-top: 0.5rem;
    }

    .shortcut-tip {
      font-size: 0.72rem;
      color: #758078;
    }

    .send-btn {
      background: #174D35;
      color: #FFFFFF;
      border: none;
      padding: 0.55rem 1.25rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
    }

    .send-btn:hover:not(:disabled) {
      background: #287A52;
      transform: translateY(-1px);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-icon {
      font-size: 1rem;
      font-weight: 800;
    }

    .btn-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  `]
    })
], AiAssistantComponent);
export { AiAssistantComponent };
