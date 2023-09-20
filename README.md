# Tweet Configurator
Welcome to the Tweet Configurator project! This tool allows you to easily configure tweet and schedule it for posting on Twitter & Discord.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [License](#license)

## Introduction
Web application that allows users to compose and schedule tweets for posting on both Twitter and Discord.

## Features
- Checkbox to schedule tweet ( time selector )
- Countdown (/s) if the tweet is scheduled
- Checkbox to mention everyone
- Input box dedicated for hashtag gamename and more
- Import media ( gif, image, video supported )

## Getting Started
These instructions will help you set up and run the project on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- `Node.js: You can download it from nodejs.org.`

- `Discord Webhook: You can create one from your discord server`

### Creating Developer Applications

Before you can use this tool to post tweets, you need to create developer applications on Twitter and Twitch. Follow these steps:

**Twitter Developer Application:**

  - Go to the Twitter Developer Portal.

  - Click on the "Create an App" button and follow the instructions to create a Twitter developer application.

  - Once your Twitter app is created, obtain the API keys and access tokens, and add them to your project's configuration file.

**Twitch Developer Application:***

  - Go to the Twitch Developer Portal.

  - Click on the "Create an App" button and follow the instructions to create a Twitch developer application.

  - After creating your Twitch app, obtain the Client ID and Client Secret, and add them to your project's configuration file.

## Installation

`Clone the repository to your local machine using Git:`

`git clone https://github.com/yourusername/tweecordApp.git`

Navigate to the project directory:

`cd /tweecordApp`

Install the project dependencies using npm (Node Package Manager):

`npm install`

Create an .env in the root project with your personnal token:

```
1. **Twitter API Credentials:**
   - `TWITTER_APP_KEY` - Your Twitter Application Key (API Key)
   - `TWITTER_APP_SECRET` - Your Twitter Application Secret Key (API Secret Key)
   - `TWITTER_ACCESS_TOKEN` - Your Twitter Access Token
   - `TWITTER_ACCESS_SECRET` - Your Twitter Access Token Secret
   - `TWITTER_BEARER_TOKEN` - Your Twitter Bearer Token

2. **Discord Webhook URL:**
   - `DISCORD_WEBHOOK` - Your Discord Webhook URL for sending messages

3. **Optional Twitch Username (if applicable):**
   - `TWITCH_USERNAME` - Your Twitch Username (if you want to integrate Twitch functionality)
```

## Usage

1. Run the project using the following command: `npm start`

2. Open your web browser and go to `http://localhost:3000` to access the Tweet Configurator web interface.

3. Fill in the required information, such as the tweet content, hashtags, and scheduling options.

4. Click the "Post Tweet" button to create your tweet.

You can choose to schedule the tweet for a later time or post it immediately.

## Technologies Used

Javascript, html/css (bootstrap), Node.js (express.js)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

