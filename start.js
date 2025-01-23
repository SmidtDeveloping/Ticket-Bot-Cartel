const { startPremiumBot, stopPremiumBot } = require('./pm2');
require("dotenv").config()
const token1 = process.env.TOKEN1
const token2 = process.env.TOKEN2
// Start een bot met userId en token
startPremiumBot('1272523687513292929', token1);
startPremiumBot("", token2)
