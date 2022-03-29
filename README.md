<div align="center">

# Mona Library Bot

[![Mona Mains Discord](https://img.shields.io/discord/780891070862196807?label=chat&style=flat-square)](https://discord.gg/mona)
![GitHub tag](https://img.shields.io/github/v/tag/myuwi/mona-library-bot?label=tag&style=flat-square)

**A Discord bot created for the [Mona Mains](https://discord.gg/mona) server.**

[Features](#features)
•
[Installation](#installation)
•
[Configuration](#configuration)
•
[Updating](#updating)

</div>

## Features

- Display the contents of a Google Docs document in a Discord channel using Discord message embeds
- A simple permission system
- Dynamically generate team comp images from text
- (Partially) Supports multiple servers

## Installation

Node version 16.6.0+ is required

```sh
git clone https://github.com/myuwi/mona-library-bot.git
cd mona-library-bot
yarn
yarn build
```

## Configuration

Copy and rename the `config.json.example` to `config.json`. It should look something like this:

```json
{
    "token": "token_here",
    "documentId": "document_id_here",
    "ownerId": "discord_id_here",
    "defaultPrefix": "m+"
}
```

Set the `token` to your Discord bot's token and `documentId` to the id of the Google Docs document. The `ownerId` should be set to your Discord account's snowflake.

You will be required to register a Service Account on a Google Cloud Platform project by [following this guide (step 5 required only if the document is private)](https://cloud.google.com/docs/authentication/production#create_service_account). You should also grant the project access to the Google Docs API with access to the Google Docs API.

The Service Account credentials should be placed in a file called `service-account-credentials.json` at the root of the project.

## Updating

```sh
git pull
yarn install
yarn build
```

Be sure to also check [CHANGELOG.md](CHANGELOG.md) for breaking changes
