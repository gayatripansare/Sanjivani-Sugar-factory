"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const forms_1 = require("@angular/forms");
const http_1 = require("@angular/common/http");
let App = (() => {
    let _classDecorators = [(0, core_1.Component)({
            selector: 'app-root',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule],
            templateUrl: './app.html',
            styleUrl: './app.css',
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var App = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            App = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        http = (0, core_1.inject)(http_1.HttpClient);
        API_BASE = 'http://localhost:3001/api';
        // System status
        mcpStatus = (0, core_1.signal)(null);
        backendOnline = (0, core_1.signal)(false);
        // Farmers Data
        farmers = (0, core_1.signal)([]);
        loadingFarmers = (0, core_1.signal)(false);
        errorMessage = (0, core_1.signal)('');
        // Filters
        selectedVillage = (0, core_1.signal)('ALL');
        searchQuery = (0, core_1.signal)('');
        // AI Chat & MCP
        question = (0, core_1.signal)('Which farmers supplying Sanjivani Sugar Factory have a pending payment of more than 50,000? List their names, villages, and pending amounts.');
        isAsking = (0, core_1.signal)(false);
        chatHistory = (0, core_1.signal)([]);
        expandedTraceId = (0, core_1.signal)(null);
        // Preset quick questions
        presetQuestions = [
            'Which farmers have pending payments greater than ₹50,000?',
            'List all sugarcane farmers from Kopargaon and Rahata village.',
            'Who is the top sugarcane supplier by tonnage?',
            'What is the total sugarcane supply and total pending payment for Sanjivani Sugar Factory?',
        ];
        // Computed Values
        villages = (0, core_1.computed)(() => {
            const list = this.farmers().map((f) => f.village);
            return Array.from(new Set(list)).sort();
        });
        filteredFarmers = (0, core_1.computed)(() => {
            let list = this.farmers();
            const query = this.searchQuery().toLowerCase().trim();
            const village = this.selectedVillage();
            if (village !== 'ALL') {
                list = list.filter((f) => f.village.toLowerCase() === village.toLowerCase());
            }
            if (query) {
                list = list.filter((f) => f.name.toLowerCase().includes(query) ||
                    f.village.toLowerCase().includes(query));
            }
            return list;
        });
        totalTons = (0, core_1.computed)(() => {
            return this.farmers().reduce((sum, f) => sum + Number(f.sugarcane_supply_tons || 0), 0);
        });
        totalPaid = (0, core_1.computed)(() => {
            return this.farmers().reduce((sum, f) => sum + Number(f.amount_paid || 0), 0);
        });
        totalPending = (0, core_1.computed)(() => {
            return this.farmers().reduce((sum, f) => sum + Number(f.payment_pending || 0), 0);
        });
        ngOnInit() {
            this.checkHealth();
            this.fetchFarmers();
        }
        checkHealth() {
            this.http.get(`${this.API_BASE}/health`).subscribe({
                next: (res) => {
                    this.mcpStatus.set(res);
                    this.backendOnline.set(true);
                },
                error: () => {
                    this.backendOnline.set(false);
                },
            });
        }
        fetchFarmers() {
            this.loadingFarmers.set(true);
            this.errorMessage.set('');
            this.http
                .get(`${this.API_BASE}/farmers`)
                .subscribe({
                next: (res) => {
                    this.loadingFarmers.set(false);
                    if (res.success && res.farmers) {
                        this.farmers.set(res.farmers);
                    }
                    else if (res.error) {
                        this.errorMessage.set(res.error);
                    }
                },
                error: (err) => {
                    this.loadingFarmers.set(false);
                    this.errorMessage.set('Unable to connect to API server. Ensure `npm run api` is running on port 3001.');
                },
            });
        }
        setQuestion(q) {
            this.question.set(q);
        }
        askAI() {
            const q = this.question().trim();
            if (!q || this.isAsking())
                return;
            const userMsgId = 'msg-' + Date.now();
            const userMessage = {
                id: userMsgId,
                sender: 'user',
                text: q,
                timestamp: new Date(),
            };
            this.chatHistory.update((prev) => [...prev, userMessage]);
            this.isAsking.set(true);
            this.http
                .post(`${this.API_BASE}/ask`, { question: q })
                .subscribe({
                next: (res) => {
                    this.isAsking.set(false);
                    const aiMsgId = 'msg-ai-' + Date.now();
                    if (res.success) {
                        const aiMessage = {
                            id: aiMsgId,
                            sender: 'assistant',
                            text: res.answer,
                            toolCalls: res.executedTools || [],
                            timestamp: new Date(),
                        };
                        this.chatHistory.update((prev) => [...prev, aiMessage]);
                        if (res.executedTools && res.executedTools.length > 0) {
                            this.expandedTraceId.set(aiMsgId);
                        }
                    }
                    else {
                        this.chatHistory.update((prev) => [
                            ...prev,
                            {
                                id: aiMsgId,
                                sender: 'assistant',
                                text: `❌ Error: ${res.error || 'Failed to get answer from AI'}`,
                                timestamp: new Date(),
                            },
                        ]);
                    }
                },
                error: (err) => {
                    this.isAsking.set(false);
                    this.chatHistory.update((prev) => [
                        ...prev,
                        {
                            id: 'msg-err-' + Date.now(),
                            sender: 'assistant',
                            text: `❌ Network Error: Could not reach backend API server at ${this.API_BASE}/ask.`,
                            timestamp: new Date(),
                        },
                    ]);
                },
            });
        }
        toggleTrace(msgId) {
            if (this.expandedTraceId() === msgId) {
                this.expandedTraceId.set(null);
            }
            else {
                this.expandedTraceId.set(msgId);
            }
        }
        formatCurrency(value) {
            const num = Number(value || 0);
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
            }).format(num);
        }
        askAboutFarmer(farmer) {
            const q = `Provide complete sugarcane supply and payment status details for farmer ${farmer.name} from ${farmer.village}.`;
            this.question.set(q);
            this.askAI();
        }
    };
    return App = _classThis;
})();
exports.App = App;
