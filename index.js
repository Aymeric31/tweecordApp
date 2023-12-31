const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { TwitterApi } = require('twitter-api-v2');
const Discord = require('discord.js');
const app = express();
const port = 3000;
const { exec } = require('child_process');
require('dotenv').config();

// WebhookUrl of Discord bot
const webhookUrl = `https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK}`;

// Use cors middleware to allow cross-origin requests
app.use(cors());

// Configure TwitterApi with your Twitter API keys
const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
  bearerToken: process.env.TWITTER_BEARER_TOKEN,
});

// Configuration for multer to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Use middleware to parse the body data of a POST request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set a public folder where static files will be stored (like index.html, CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '/index.html'));
});

// Function to post a message on your Discord server via webhook
async function postOnDiscord(tweetId, req) {
  try {
    // Create a new WebhookClient with the webhook URL
    const webhookClient = new Discord.WebhookClient({ url: webhookUrl });

    // Create the link to the tweet on Twitter
    const tweetLink = `https://twitter.com/twitter/status/${tweetId}`;

    // Construct the message to be sent
    let message = `Programme d'aujourd'hui ! : ${tweetLink}`;

    // Check if the checkbox is checked
    const mentionEveryone = req.body.everyoneCheckbox === 'on';
    
    // Check if mentionEveryone is true and add @everyone mention if necessary
    if (mentionEveryone) {
      message = '@everyone ' + message;
    }

    // Send the message to the Discord webhook
    await webhookClient.send(message);

    console.log('Message posté sur Discord avec succès !');
  } catch (error) {
    console.error('Erreur lors de la publication du message sur Discord :', error);
  }
}

async function postTweet(req, tweetText) {
  try {
    let tweetId;
    if (!req.file) {
      // If req.file is undefined (no file imported), post the tweet without media
      const tweet = await client.v2.tweet(tweetText);
      tweetId = tweet.data.id;
    } else {
      let mimeType;
      // Check the MIME type of the file
      if (req.file.mimetype.startsWith('image/gif')) {
        mimeType = 'image/gif'; // Assurez-vous que le type MIME est correct pour le GIF
      } else if (req.file.mimetype.startsWith('image/')) {
        mimeType = 'image';
      } else if (req.file.mimetype.startsWith('video/')) {
        mimeType = 'video';
      } else {
        // If the file is neither an image nor a video nor a GIF, handle the error
        throw new Error('Unsupported file type.');
      }

      // Upload media based on its type (image or video)
      const mediaOptions = mimeType === 'image' ? { mimeType: mimeType } : mimeType === 'image/gif' ? { mimeType: 'image/gif' } : { mimeType: 'video/mp4' };
      const mediaId = await client.v1.uploadMedia(req.file.path, mediaOptions);

      // Make sure mediaId is valid
      if (!mediaId) {
        throw new Error('Invalid media ID.');
      }

      // Postez le tweet avec la vidéo
      const tweet = await client.v2.tweet({
        text: tweetText,
        media: { media_ids: [mediaId] },
      });
      tweetId = tweet.data.id;

      // Delete the upload file after using it
      fs.unlinkSync(req.file.path);
    }

    return tweetId;
  } catch (error) {
    console.error('Erreur lors de la publication du tweet :', error);
    throw new Error('Erreur lors de la publication du tweet');
  }
}

// Route to post a tweet with or without media
app.post('/schedule-tweet', upload.single('media'), async (req, res) => {
  try {
    // Get the value of the checkbox (if checked, req.body.delayCheckbox will be set to 'on')
    const delayTweet = req.body.delayCheckbox === 'on';
    const tweetTime = req.body.tweetTime; // Time specified by the user (in "HH:mm" format)
    const gameName = "#" + req.body.gameName;
    const bodyTweet = req.body.bodyTweet;
    const hashtagsPlus = req.body.hashtagsPlus ? "#" + req.body.hashtagsPlus : '';
    const tweetText = `🍕Live ➡ 21h00⏰\nCe soir sur ${gameName}\n${bodyTweet}\n\nhttp://twitch.tv/${process.env.TWITCH_USERNAME}\nhttp://twitch.tv/${process.env.TWITCH_USERNAME}\nhttp://twitch.tv/${process.env.TWITCH_USERNAME}\n\n#twitchfr #pizzamargherita #twitchtv ${hashtagsPlus}`;

    // Check if gameName and bodyTweet fields are present in req.body
    if (!gameName || !bodyTweet) {
      return res.status(400).json({ error: 'Choix manquants' });
    }
    
    // Check if the user specified a scheduling time
    if (delayTweet && tweetTime.trim() !== '') {
      
      // Parse the specified time as a Date object
      const [hours, minutes] = tweetTime.split(':');
      const targetTime = new Date();
      targetTime.setHours(parseInt(hours));
      targetTime.setMinutes(parseInt(minutes));
      targetTime.setSeconds(0);
      targetTime.setMilliseconds(0);

      // Calculate the time difference before sending the tweet
      const timeDifference = targetTime.getTime() - Date.now();

      // Use the calculated delay to schedule the tweet
      setTimeout(async () => {
        try {
          const tweetId = await postTweet(req, tweetText);
          postOnDiscord(tweetId, req);
          console.log(`Tweet envoyé et message posté sur Discord à ${targetTime} !`);
          return res.status(200).json({ message: 'Le tweet a été posté avec succès !' });
        } catch (error) {
          console.error('Erreur lors de la publication du tweet avec délai :', error);
          return res.status(500).json({ error: 'Erreur lors de la publication du tweet avec délai.' });
        }
      }, timeDifference);
    } else {
      try {
        const tweetId = await postTweet(req, tweetText);
        postOnDiscord(tweetId, req);
        console.log('Tweet envoyé et message posté sur Discord immédiatement !');
        return res.status(200).json({ message: 'Le tweet a été posté avec succès !' });
      } catch (error) {
        console.error('Erreur lors de la publication du tweet immédiat :', error);
        return res.status(500).json({ error: 'Erreur lors de la publication du tweet immédiat.' });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la requête :', error);
    return res.status(500).json({ error: 'Erreur lors de la gestion de la requête' });
  }
});

// Start the server
app.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Serveur démarré sur le port ${port}: ${url}`);
  // Automatically open the URL in the browser
  exec(`start ${url}`);
});

