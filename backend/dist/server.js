"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const config_1 = __importDefault(require("./config"));
const PORT = config_1.default.port;
const server = index_1.default.listen(PORT, () => {
    console.log('🚀 SAMS Backend Server Starting...');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${config_1.default.nodeEnv}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    console.log('✅ Server is ready to accept connections!');
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});
process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});
exports.default = server;
//# sourceMappingURL=server.js.map