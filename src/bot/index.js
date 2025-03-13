const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');
const { LlamahairClient } = require('@llamahair/client')

let afterLogin;
let llamaClient;

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
    llamaClient = new LlamahairClient({
        apiKeyId: config.llamahair.apiKeyId,
        apiKeySecret: config.llamahair.apiKeySecret
    })
});

client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    try {
        const messageId = `${message.channelId}-${message.id}`;

        // Format request for Llamahair.ai
        const llamaRequest = {
            llama: {
                id: messageId,
                body: message.content,
            }
        };

        // Send request to Llamahair.ai
        await llamaClient.send(config.llamahair.promptUrl, llamaRequest)
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
