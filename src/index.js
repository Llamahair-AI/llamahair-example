require('dotenv').config();
const { initializeBot } = require('./bot');
const { startServer } = require('./server');
const logger = require('./utils/logger');

async function main() {
    try {
        await Promise.all([
            initializeBot(startServer),
        ]);
    } catch (error) {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }
}

main();