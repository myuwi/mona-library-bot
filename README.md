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

</div>

## Features

- Display the contents of a Google Docs document in a Discord channel using Discord message embeds
- Dynamically generate team comp images from text
- (Partially) Supports multiple servers

## Installation

Node version 16.6.0+ is required

```sh
git clone https://github.com/myuwi/mona-library-bot.git
cd mona-library-bot
pnpm install
pnpm build
```

## Configuration

Copy `config.example.json` to `config.json` and `.env.example` to `.env` and fill them with correct data.

You will be required to register a Service Account on a Google Cloud Platform project by [following this guide (step 5 required only if the document is private)](https://cloud.google.com/docs/authentication/production#create_service_account). You should also grant the project access to the Google Docs API with access to the Google Docs API.

The Service Account credentials should be placed in a file called `service-account-credentials.json` at the root of the project.
