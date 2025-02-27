# LlamaHair Discord Bot

A Discord bot that integrates with Llamahair.ai for message moderation in Discord servers.

## Features

- Discord message monitoring
- Integration with Llamahair.ai for content moderation
- Webhook endpoint for receiving moderation results
- Configurable logging and environment settings

## Prerequisites

- Node.js (v14 or higher)
- Discord Bot Token
- Llamahair.ai endpoint

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/llamahair/llamahair-example.git
   cd llamahair-example
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   - `DISCORD_TOKEN`: Your Discord bot token
   - `LLAMAHAIR_API_KEY`: Your Llamahair.ai API key
   - Other optional configurations (see `.env.example`)

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## Configuration

The bot can be configured using environment variables:

### Required Variables
- `DISCORD_TOKEN`: Discord bot token
- `LLAMAHAIR_API_KEY`: Llamahair.ai API key
- `SECRET_KEY`: Secret key for signing Llamahair.ai requests

### Optional Variables
- `PORT`: HTTP server port (default: 3000)
- `HOST`: HTTP server host (default: localhost)
- `NODE_ENV`: Environment mode (development/production)
- `LOG_LEVEL`: Logging level (error/warn/info/debug)
- `LLAMAHAIR_API_URL`: Llamahair.ai API URL (default: https://api.llamahair.ai)

## Llamahair.ai Integration

The bot integrates with Llamahair.ai for message moderation:

### Outgoing Requests
When a message is received, the bot sends a request to Llamahair.ai with the following format:
```json
{
    "llama": {
        "id": "channelId-messageId",
        "body": "message content",
        "timestamp": 1740647307,
        "signature": "sha256_hash"
    }
}
```
The signature is generated using: `sha256(id + body + timestamp + SECRET_KEY)`

### Message Processing
1. When a message is received:
   - Generate a unique ID using `channelId-messageId` format
   - Send request to Llamahair.ai with the formatted ID
   - The ID format allows direct message lookup later

2. When a response is received:
   - For "ok" responses: No action taken
   - For "not-ok" responses:
     - Parse channelId and messageId from the response ID
     - Fetch the message using Discord's API
     - Add ❌ reaction to mark inappropriate content

### Incoming Responses
Llamahair.ai sends moderation results to the webhook endpoint. The bot handles two types of incoming requests:

1. Validation Requests: Used to verify the webhook endpoint
2. Moderation Responses: Contains the moderation result with either:
   - `"output": "ok"` - Message is acceptable
   - `"output": "not-ok"` - Message violates rules, marked with ❌

See the API Endpoints section for detailed request/response formats.

## Project Structure

```
.
├── src/
│   ├── bot/          # Discord bot implementation
│   ├── config/       # Configuration management
│   ├── server/       # HTTP server implementation
│   ├── utils/        # Utility functions
│   └── index.js      # Application entry point
├── .env.example      # Example environment variables
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## API Endpoints

### Health Check
- `GET /health`
- Response: `{ "status": "ok" }`

### Webhook
- `POST /webhook`
- Handles two types of requests:

#### 1. Validation Request
- Body:
  ```json
  {
    "type": "validate",
    "timestamp": 1740647307,
    "value": "string value"
  }
  ```
- Response:
  ```json
  {
    "code": "sha256_hash"
  }
  ```

#### 2. Moderation Response
- Body:
  ```json
  {
    "id": "id-1740647307",
    "type": "response",
    "identifier": "discord-moderation",
    "timestamp": 1740647307,
    "response": {
      "output": "ok",
      "reasoning": "Moderation result explanation"
    }
  }
  ```
- Response: `{ "status": "processed" }`

## Logging

Logs are written to:
- `error.log`: Error-level logs
- `combined.log`: All logs
- Console: Based on environment and configuration

## Error Handling

The application includes comprehensive error handling:
- Discord connection errors
- HTTP server errors
- Configuration validation
- Webhook processing errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC
