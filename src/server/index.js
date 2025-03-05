const express = require('express');
const logger = require('../utils/logger');
const config = require('../config');
const { generateValidationSignature } = require('../utils/crypto');
const { client } = require('../bot');

const app = express();
const port = config.server.port;

// Middleware for parsing JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Endpoint for receiving Llamahair.ai responses
app.post('/webhook', async (req, res) => {
    try {
        const { type } = req.body;

        // Handle validation requests
        if (type === 'validate') {
            const { timestamp, value } = req.body;
            if (!timestamp || !value) {
                logger.warn('Invalid validation request received');
                return res.status(400).json({ error: 'Invalid validation request' });
            }

            const code = generateValidationSignature(timestamp, value);
            logger.info('Validation request processed successfully');
            return res.status(200).json({ code });
        }

        // Handle moderation responses
        const { id, identifier, timestamp, response } = req.body;

        if (type !== 'response' || !id || !identifier || !timestamp || !response) {
            logger.warn('Invalid response format received:', req.body);
            return res.status(400).json({ 
                error: 'Invalid response format' 
            });
        }
        
        // Process the moderation result
        logger.info('Received moderation result:', { 
            id, 
            output: response.output,
            reasoning: response.reasoning 
        });

        try {
            const [channelId, messageId] = id.split('-');
            const channel = await client.channels.fetch(channelId);
            if (!channel) {
                throw new Error(`Channel not found: ${channelId}`);
            }

            const message = await channel.messages.fetch(messageId);
            if (!message) {
                throw new Error(`Message not found: ${messageId}`);
            }

            // Create a thread and send both output and reasoning
            const thread = await message.startThread({
                name: 'Llamahair AI Exploration',
                autoArchiveDuration: 60
            });
            // Construct message with all available response fields
            let responseMessage = '';
            if (response.output) {
                responseMessage += `Output: ${response.output}\n`;
            }
            if (response.outputs) {
                responseMessage += `Outputs:\n${response.outputs.map(output => `- ${output}`).join('\n')}\n`;
            }
            if (response.summary) {
                responseMessage += `Summary: ${response.summary}\n`;
            }
            if (response.reasoning) {
                responseMessage += `Reasoning: ${response.reasoning}`;
            }
            if (response.extracted_values) {
                responseMessage += JSON.stringify(response.extracted_values);
            }

            await thread.send(responseMessage);

            logger.info('Created thread for message:', { channelId, messageId });
        } catch (error) {
            logger.error('Failed to process moderation response:', { 
                id, 
                error: error.message,
                action: 'creating thread'
            });
        }

        res.status(200).json({ status: 'processed' });
    } catch (error) {
        logger.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(port, () => {
                logger.info(`HTTP server listening on port ${port}`);
                //resolve(server);
            });

            server.on('error', (error) => {
                logger.error('Server error:', error);
                reject(error);
            });
        } catch (error) {
            logger.error('Failed to start server:', error);
            reject(error);
        }
    });
}

module.exports = {
    startServer
};
