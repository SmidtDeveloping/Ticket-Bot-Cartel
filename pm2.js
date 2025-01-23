const pm2 = require('pm2');

// Bot starten
function startPremiumBot(userId, token) {
  pm2.connect((err) => {
    if (err) {
      console.error('PM2 kon niet verbinden:', err);
      return;
    }

    pm2.start({
      script: 'index.js', // Je bestaande bot.js
      name: `premium-bot-${userId}`, // Unieke naam per gebruiker
      env: {
        TOKEN: token // Token doorgeven als environment variable
      }
    }, (err, apps) => {
      pm2.disconnect(); // Verbreek verbinding met PM2
      if (err) {
        console.error('Fout bij starten bot:', err);
      } else {
        console.log(`Premium bot gestart voor gebruiker: ${userId}`);
      }
    });
  });
}

// Bot stoppen
function stopPremiumBot(userId) {
  pm2.connect((err) => {
    if (err) {
      console.error('PM2 kon niet verbinden:', err);
      return;
    }

    pm2.stop(`premium-bot-${userId}`, (err) => {
      pm2.disconnect();
      if (err) {
        console.error('Fout bij stoppen bot:', err);
      } else {
        console.log(`Premium bot gestopt voor gebruiker: ${userId}`);
      }
    });
  });
}

// Bot herstarten
function restartPremiumBot(userId) {
  pm2.connect((err) => {
    if (err) {
      console.error('PM2 kon niet verbinden:', err);
      return;
    }

    pm2.restart(`premium-bot-${userId}`, (err) => {
      pm2.disconnect();
      if (err) {
        console.error('Fout bij herstarten bot:', err);
      } else {
        console.log(`Premium bot herstart voor gebruiker: ${userId}`);
      }
    });
  });
}

module.exports = {
  startPremiumBot,
  stopPremiumBot,
  restartPremiumBot
};
