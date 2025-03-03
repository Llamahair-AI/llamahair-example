const crypto = require('crypto');
const config = require('../config');

/**
 * Generate SHA256 signature for Llamahair.ai request
 * @param {string} id - Message ID
 * @param {string} body - Message content
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} SHA256 signature
 */
function generateSignature(id, body, timestamp) {
    const data = `${id}${body}${timestamp}${config.llamahair.secretKey}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate SHA256 signature for validation response
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} value - Value to sign
 * @returns {string} SHA256 signature
 */
function generateValidationSignature(timestamp, value) {
    const data = `${timestamp}${value}`;
    return crypto.createHmac('sha256', config.llamahair.secretKey).update(data).digest('hex');
}

/**
 * Get current timestamp in seconds
 * @returns {number} Current Unix timestamp in seconds
 */
function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
}

module.exports = {
    generateSignature,
    generateValidationSignature,
    getCurrentTimestamp
};