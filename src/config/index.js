const dotenv = require('dotenv');
const logger = require('../utils/logger');

// Load environment variables from .env file
dotenv.config();

const requiredEnvVars = [
    'DISCORD_TOKEN',
    'LLAMAHAIR_API_URL',
    'SECRET_KEY'
];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        logger.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const config = {
    discord: {
        token: process.env.DISCORD_TOKEN,
    },
    server: {
        port: process.env.PORT || 8000,
        host: process.env.HOST || 'localhost',
    },
    environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info',
    },
    llamahair: {
        apiUrl: process.env.LLAMAHAIR_API_URL,
        secretKey: process.env.SECRET_KEY,
    }
};

module.exports = config;
