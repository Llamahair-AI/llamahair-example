const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');
const { generateSignature, getCurrentTimestamp } = require('../utils/crypto');

let afterLogin;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
    afterLogin();
});

client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    try {
        const timestamp = getCurrentTimestamp();
        const messageId = `${message.channelId}-${message.id}`;

        // Format request for Llamahair.ai
        const llamaRequest = {
            llama: {
                id: messageId,
                body: message.content,
            }
        };

        // Send request to Llamahair.ai
        const response = await axios.post(config.llamahair.apiUrl, llamaRequest, {
            headers: {
                'X-API-KEY': config.llamahair.apiKey,
                'X-Signature': generateSignature(llamaRequest, timestamp),
                'X-Timestamp': timestamp,
                'Content-Type': 'application/json',
            }
        });

        logger.info('Message sent to Llamahair.ai:', {
            messageId,
            channelId: message.channelId,
            author: message.author.tag,
            status: response.status
        });
    } catch (error) {
        logger.error('Error processing message:', error);
        // Don't throw the error to prevent the bot from crashing
    }
});

function initializeBot(startHttp) {
    try {
        afterLogin = startHttp;
        client.login(config.discord.token);
    } catch (error) {
        logger.error('Failed to login to Discord:', error);
        throw error;
    }
}

module.exports = {
    initializeBot,
    client
};
