"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'chat_user',
            password: process.env.DB_PASSWORD || 'chat_password',
            database: process.env.DB_NAME || 'chat_db',
        },
        migrations: {
            directory: './migrations',
        },
    },
};
exports.default = config;
//# sourceMappingURL=knexfile.js.map