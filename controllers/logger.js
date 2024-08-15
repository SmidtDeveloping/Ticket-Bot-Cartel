const chalk = require('chalk');
const axios = require('axios');
let webhook = "https://discord.com/api/webhooks/1272529822941446164/hr8KvzWqfLlf3ce2uNYTm49mPOCcfCLcou5lD_EnVxYWkmX2PafEMeNTdstiakrxQm5U"

/**
 * 
 * @param {String} message 
 * @returns {void}
 */



function sendMessageToWebhook(message) {
	
		const messagePayload = {
			content: message,
			username: 'Logs', // Optioneel: De naam van de bot die het bericht verstuurt
			avatar_url: 'https://www.cafetariacentrumgroesbeek.nl/wp-content/uploads/2020/04/4960-Bami-Oriental-schijf-bamischijf-_1106x736px_E_NR-1768.jpg' // Optioneel: De avatar URL van de bot
		  };
	
		  axios.post(webhook, messagePayload)
	  .then(response => {
		console.log('Bericht succesvol verzonden:', response.data);
	  })
	  .catch(error => {
		console.error('Fout bij verzenden van bericht:', error);
	  });
}
function debug(message) {
	const date = new Date();
	const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	console.log(chalk.blue(`[${dateString}] [DEBUG] ${message}`));
	sendMessageToWebhook(chalk.blue(`[${dateString}] [DEBUG] ${message}`))
}

/**
 * 
 * @param {String} message 
 * @returns {void}
 */
function warn(message) {
	const date = new Date();
	const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	console.log(chalk.yellow(`[${dateString}] [WARN] ${message}`));
	sendMessageToWebhook(chalk.yellow(`[${dateString}] [WARN] ${message}`))
}
/**
 * 
 * @param {String} message 
 * @returns {void}
 */
function error(message) {
	const date = new Date();
	const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	console.log(chalk.red(`[${dateString}] [ERROR] ${message}`));
	sendMessageToWebhook(chalk.red(`[${dateString}] [ERROR] ${message}`))
}

/**
 * 
 * @param {String} message 
 * @returns {void}
 */
function success(message) {
	const date = new Date();
	const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	console.log(chalk.green(`[${dateString}] [SUCCESS] ${message}`));
	sendMessageToWebhook(chalk.green(`[${dateString}] [SUCCESS] ${message}`));
}

module.exports = {
	debug,
	warn,
	error,
	success
}