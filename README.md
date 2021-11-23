# Mona Combo Library Bot

## Installation

Node version 16.6.0+ is required

```sh
git clone https://github.com/myuwi/mona-library-bot.git
cd mona-library-bot
yarn
```

## Configuration

Copy and rename the `config.json.example` to `config.json`. It should look something like this:

```json
{
    "token": "your_token_here",
    "documentId": "document_id_here",
    "ownerId": "your_id_here",
    "defaultPrefix": "m+"
}
```

Set the `token` to your Discord bot's token and `documentId` to the id of the Google Docs document. The `ownerId` should be set to your Discord account's snowflake.

You will also be required to register a Service Account on a Google Cloud Platform project with access to the Google Docs API. Its credentials should be stored at the root folder in a file called `google-api-credentials.json`.
