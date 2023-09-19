# Tweet Configurator
Welcome to the Tweet Configurator project! This tool allows you to easily generate tweet and schedule it for posting on Twitter & Discord.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#TechnologiesUsed)
- [License](#License)

## Introduction
Web application that allows users to compose and schedule tweets for posting on both Twitter and Discord.

## Features
- Checkbox to schedule tweet ( time selector )
- Checkbox to mention everyone
- Input box dedicated for hashtag gamename and more
- Import media ( gif, image, video supported )

## Getting Started
These instructions will help you set up and run the project on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

`Node.js: You can download it from nodejs.org.`

And you'have created a 

### Creating Developer Applications

Before you can use this tool to post tweets, you need to create developer applications on Twitter and Twitch. Follow these steps:
Twitter Developer Application

  - Go to the Twitter Developer Portal.

  - Click on the "Create an App" button and follow the instructions to create a Twitter developer application.

  - Once your Twitter app is created, obtain the API keys and access tokens, and add them to your project's configuration file.

Twitch Developer Application

  - Go to the Twitch Developer Portal.

  - Click on the "Create an App" button and follow the instructions to create a Twitch developer application.

  - After creating your Twitch app, obtain the Client ID and Client Secret, and add them to your project's configuration file.

## Installation

`Clone the repository to your local machine using Git:`

`git clone https://github.com/yourusername/tweet-generation.git`

Navigate to the project directory:

`cd tweet-generation`

Install the project dependencies using npm (Node Package Manager):

`npm install`

Create an .env in the root project with your personnal token:

```
TWITTER_APP_KEY
TWITTER_APP_SECRET
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_SECRET
TWITTER_BEARER_TOKEN

DISCORD_WEBHOOK

TWITCH_USERNAME
```

## Usage

1. Run the project using the following command:

`npm start`

2. Open your web browser and go to `http://localhost:3000` to access the Tweet Generation web interface.

3. Fill in the required information, such as the tweet content, hashtags, and scheduling options.

4. Click the "Generate Tweet" button to create your tweet.

You can choose to schedule the tweet for a later time or post it immediately.

## Technologies Used

Javascript, html, Node.js (express.js)

## License

This project is licensed under the MIT License

