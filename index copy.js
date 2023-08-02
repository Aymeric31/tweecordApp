const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { TwitterApi } = require('twitter-api-v2');
const Discord = require('discord.js');
const app = express();
const port = 3000;
const { exec } = require('child_process'); // Importez la fonction exec de child_process
require('dotenv').config();

// Remplacez 'webhookUrl' par le webhookUrl de votre bot Discord
const webhookUrl = `https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK}`;

// Utilisez le middleware cors pour autoriser les requêtes cross-origin
app.use(cors());

// Configurer TwitterApi avec vos clés d'API Twitter
const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
  bearerToken: process.env.TWITTER_BEARER_TOKEN,
});

// const rwClient = client.readWrite;

// Configuration pour multer pour gérer l'upload de fichiers
const upload = multer({ dest: 'uploads/' });

// Utilisez le middleware pour analyser les données du corps d'une requête POST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Définissez un dossier public où seront stockés les fichiers statiques (comme index.html, CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Route pour servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '/index.html'));
});

// Fonction pour poster un message sur votre serveur Discord via le webhook
async function postOnDiscord(tweetId, req) {
  try {
    // Créez un nouvel objet WebhookClient avec l'URL du webhook
    const webhookClient = new Discord.WebhookClient({ url: webhookUrl });

    // Créez le lien vers le tweet sur Twitter
    const tweetLink = `https://twitter.com/twitter/status/${tweetId}`;

    // Construct the message to be sent
    let message = `Programme d'aujourd'hui ! : ${tweetLink}`;

    // Check if the checkbox is checked
    const mentionEveryone = req.body.everyoneCheckbox === 'on';
    
    // Check if mentionEveryone is true and add @everyone mention if necessary
    if (mentionEveryone) {
      message = '@everyone ' + message;
    }

    // Postez le message sur le webhook Discord
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
      // Si req.file est undefined (pas de fichier importé), on poste le tweet sans média
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

      // Supprimez le fichier d'upload après l'avoir utilisé
      fs.unlinkSync(req.file.path);
    }

    return tweetId;
  } catch (error) {
    console.error('Erreur lors de la publication du tweet :', error);
    throw new Error('Erreur lors de la publication du tweet');
  }
}

// Route pour poster un tweet avec ou sans média
app.post('/tweet', upload.single('media'), async (req, res) => {
    // Récupérez la valeur de la checkbox (si cochée, req.body.delayCheckbox sera défini à 'on')
    const delayTweet = req.body.delayCheckbox === 'on';
    const gameName = "#" + req.body.gameName;
    const bodyTweet = req.body.bodyTweet;
    const hashtagsPlus = req.body.hashtagsPlus ? "#" + req.body.hashtagsPlus : '';
    const tweetText = `🍕Live ➡ 21h00⏰\nCe soir sur ${gameName}\n${bodyTweet}\n\nhttp://twitch.tv/${process.env.TWITCH_USERNAME}\nhttp://twitch.tv/${process.env.TWITCH_USERNAME}\nhttp://twitch.tv/${process.env.TWITCH_USERNAME}\n\n#twitchfr #pizzamargherita #twitchtv ${hashtagsPlus}`;
  
    // Vérifiez que les champs gameName et bodyTweet sont présents dans req.body
    if (!gameName || !bodyTweet) {
      return res.status(400).json({ error: 'Choix manquants' });
    }
    
    // Si l'utilisateur a choisi de retarder le tweet, calculez le délai et démarrez le setTimeout
    if (delayTweet) {
      // Définir l'heure cible à 19h30
      const targetTime = new Date();
      targetTime.setHours(19);
      targetTime.setMinutes(30);
      targetTime.setSeconds(0);
      targetTime.setMilliseconds(0);

      // Obtenez l'heure actuelle
      const currentTime = new Date().getTime();

      // Calculez la différence entre l'heure cible et l'heure actuelle en millisecondes.
      let timeDifference = targetTime.getTime() - currentTime;
      
      // Check if the target time is already passed
      if (timeDifference <= 0) {
        console.log("L'heure prévue pour le tweet est déjà passée. Le tweet ne sera pas envoyé.");
        return; // Stop the program from continuing
      }
      
      // const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60));
      // const minutesRemaining = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      // const secondsRemaining = Math.floor((timeDifference % (1000 * 60)) / 1000);
      
      // const timeRemaining = `${hoursRemaining.toString().padStart(2, '0')}:${minutesRemaining.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
      
      const intervalId = setInterval(() => {
        timeDifference = targetTime.getTime() - new Date().getTime();
        if (timeDifference <= 0) {
          clearInterval(intervalId); // Stop the interval when target time is reached
          console.log('Le tweet sera envoyé dans 00:00:00');
        } else {
          const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60));
          const minutesRemaining = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
          const secondsRemaining = Math.floor((timeDifference % (1000 * 60)) / 1000);
  
          const timeRemaining = `${hoursRemaining.toString().padStart(2, '0')}:${minutesRemaining.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
          console.log(`Le tweet sera envoyé dans ${timeRemaining}`);
        }
      }, 1000);      

      // console.log(`Le tweet sera envoyé dans ${timeRemaining}`);
      // Démarrez le setTimeout avec la fonction d'action et le délai calculé.
      setTimeout(async () => {
        try {
          // C'est ici que vous pouvez envoyer le tweet et l'envoyer vers Discord à 19h30
          const tweetId = await postTweet(req, tweetText);
          postOnDiscord(tweetId, req);
          console.log(`Tweet envoyé et message posté sur Discord à ${targetTime} !`);
        } catch (error) {
          console.error('Erreur lors de la publication du tweet avec délai :', error);
        }
      }, timeDifference);
    } else {
      try {
        // Si l'utilisateur n'a pas choisi de retarder le tweet, envoyez-le et postez-le sur Discord immédiatement
        // Appel de la fonction postTweet et récupération de l'ID du tweet
        const tweetId = await postTweet(req, tweetText);
        postOnDiscord(tweetId, req);
        console.log('Tweet envoyé et message posté sur Discord immédiatement !');
      } catch (error) {
        console.error('Erreur lors de la publication du tweet immédiat :', error);
      }
    }
  });

// Démarrer le serveur
app.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Serveur démarré sur le port ${port}: ${url}`);
  // Ouvrir automatiquement l'URL dans le navigateur
  exec(`start ${url}`);
});
