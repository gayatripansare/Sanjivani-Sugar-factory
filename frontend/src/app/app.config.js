"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const core_1 = require("@angular/core");
const http_1 = require("@angular/common/http");
exports.appConfig = {
    providers: [
        (0, core_1.provideBrowserGlobalErrorListeners)(),
        (0, http_1.provideHttpClient)(),
    ]
};
