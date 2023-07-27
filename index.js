const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { TwitterApi } = require('twitter-api-v2');
const Discord = require('discord.js');
const app = express();
const port = 3000;

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
// Route pour poster un tweet avec ou sans média
app.post('/tweet', upload.single('media'), async (req, res) => {
    const gameName = "#" + req.body.gameName;
    const bodyTweet = req.body.bodyTweet;
    const hashtagsPlus = req.body.hashtagsPlus ? "#" + req.body.hashtagsPlus : '';
    const tweetText = `🍕Live ➡ 21h00⏰\nCe soir sur ${gameName}\n${bodyTweet}\n\nhttp://twitch.tv/${process.env.TWITCH_USERNAME}\nhttp://twitch.tv/${process.env.TWITCH_USERNAME}\nhttp://twitch.tv/${process.env.TWITCH_USERNAME}\n\n#twitchfr #pizzamargherita #twitchtv ${hashtagsPlus}`;
  
    // Vérifiez que les champs gameName et bodyTweet sont présents dans req.body
    if (!gameName || !bodyTweet) {
      return res.status(400).json({ error: 'Choix manquants' });
    }
  
    try {
      let tweetId;
      if (!req.file) {
        // Si req.file est undefined (pas de fichier importé), on poste le tweet sans média
        const tweet = await client.v2.tweet(tweetText);
        tweetId = tweet.data.id;
      } else {
        let mimeType;
        // Check the MIME type of the file
        if (req.file.mimetype.startsWith('image/')) {
          mimeType = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
          mimeType = 'video';
        } else {
          // If the file is neither an image nor a video, handle the error
          throw new Error('Unsupported file type.');
        }
  
        // Upload media based on its type (image or video)
        const mediaOptions = mimeType === 'image' ? { mimeType: mimeType } : { mimeType: 'video/mp4' };
        const mediaId = await client.v1.uploadMedia(req.file.path, mediaOptions);
        // Postez le tweet avec la vidéo
        const tweet = await client.v2.tweet({
          text: tweetText,
          media: { media_ids: [mediaId] },
        });
        tweetId = tweet.data.id;

        // Supprimez le fichier d'upload après l'avoir utilisé
        fs.unlinkSync(req.file.path);
      }
      postOnDiscord(tweetId, req);
      console.log('Tweet publié avec succès !');
      return res.json({ success: true });
    } catch (error) {
      console.error('Erreur lors de la publication du tweet :', error);
      return res.status(500).json({ error: 'Erreur lors de la publication du tweet' });
    }
  });

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}: http://localhost:3000`);
});
