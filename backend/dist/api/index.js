"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const common_1 = require("@nestjs/common");
const express_1 = __importDefault(require("express"));
const app_module_js_1 = require("../dist/app.module.js");
let cachedApp;
async function bootstrap() {
    if (!cachedApp) {
        const expressApp = (0, express_1.default)();
        const adapter = new platform_express_1.ExpressAdapter(expressApp);
        const app = await core_1.NestFactory.create(app_module_js_1.AppModule, adapter, {
            logger: ['error', 'warn'],
        });
        app.enableCors({
            origin: true,
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.setGlobalPrefix('api');
        await app.init();
        cachedApp = expressApp;
    }
    return cachedApp;
}
exports.default = async (req, res) => {
    try {
        const app = await bootstrap();
        return app(req, res);
    }
    catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'An unexpected error occurred',
        });
    }
};
//# sourceMappingURL=index.js.map