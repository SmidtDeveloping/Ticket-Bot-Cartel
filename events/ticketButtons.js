const { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction } = require("discord.js")
const { createTranscript } = require("discord-html-transcripts");
const dataTicket = require("../models/dataTicket");
const dataGuild = require("../models/dataGuild");
const client = require("..");
const { debug } = require("../controllers/logger");
const sendLog = require("../../handler/discordlogger");

/**
 * 
 * @param {CommandInteraction} interaction
 * @returns 
 */
async function func_createTranscript(interaction) {
			const userData = await dataTicket.findOne({
				guildID: interaction.guild.id,
				channelID: interaction.channel.id
			});
			const guildData = await dataGuild.findOne({
				guildID: interaction.guild.id
			});
			if (!userData) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.channel_without_ticket"))
						.setColor("RED")
				], ephemeral: true});
			}
			const transcriptChannel = interaction.guild.channels.cache.get(guildData?.transcriptChannel);
			if (!transcriptChannel) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.transcript_channel_not_found"))
						.setColor("RED")
				], ephemeral: true});
			}

			console.log(interaction.channel);
			
			// const transcript = await createTranscript(interaction.channel, {
			// 	fileName: `transcript-${interaction.channel.name}.html`,
			// 	returnBuffer: false,
			// 	limit: -1,
			// 	}).then(() => {
			// 	debug("Transcript opgeslagen")
			// })

			// console.log(transcript);
			
			const member = interaction.guild.members.cache.get(userData.ownerID);
			await transcriptChannel.send({embeds: [
				new MessageEmbed()
					.setAuthor({name: member.user.tag, iconURL: member.user.displayAvatarURL({dynamic: true})})
					.addField("Ticket Owner", `<@${userData.ownerID}>`, true)
					.addField("Ticket Name", interaction.channel.name, true)
					.setColor("ORANGE")
			],}).then((msg) =>  {
				msg.edit({embeds: [
					msg.embeds[0]
						.addField("Panel Name", `${userData.ticketPanel}`, true)
						// .addField("Direct Transcript", `[Direct Transcript](${msg.attachments.first().url})`, true)
						.addField("Ticket Closed", interaction.user.tag, true)
						.setColor("GREEN")
				]});
			});
}
client.on("interactionCreate", async (interaction) => {
	if (interaction.isButton()) {
		const buttonID = interaction.customId.split("btn-")[1];
		if (buttonID === "close-ticket-opn") {
			await interaction.deferUpdate();
			const userData = await dataTicket.findOne({
				guildID: interaction.guild.id,
				channelID: interaction.channel.id
			});
			if (!userData) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.channel_without_ticket"))
						.setColor("RED")
				], ephemeral: true});
			}
			if (userData.isClosed) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.ticket_already_closed"))
						.setColor("RED")
				], ephemeral: true});
			}
			// interaction.channel.permissionOverwrites.edit(userData.ownerID, {
			// 	VIEW_CHANNEL: true,
			// });
			userData.usersInTicket.forEach((user) => {
				interaction.channel.permissionOverwrites.edit(user, {
					VIEW_CHANNEL: false,
				});
			});
			userData.isClosed = true;
			await userData.save();
			func_createTranscript(interaction)
			sendLog("tussenin", client.languages.__mf("commands.close.log", {
			user_mention: `<@!${interaction.user.id}>`,
			channel: `${interaction.channel.name}`
				}))
			return interaction.channel.send({embeds: [
				new MessageEmbed()
					.setTitle("Ticket System \✅")
					.setDescription(client.languages.__mf("buttons.close.messages.closed_ticket", {
						user_mention: `<@${interaction.user.id}>`,
						user_id: interaction.user.id,
						channel_mention: `<#${interaction.channel.id}>`,
						channel_id: interaction.channel.id
					}))
					.setColor("GREEN"),
				new MessageEmbed()
					.setDescription(client.languages.__("buttons.close.messages.closed_ticket_staff"))
					.setColor("#2f3136")
			], components: [
				new MessageActionRow().addComponents(
					// transcript, open, delete
					// new MessageButton()
					// 	.setCustomId("btn-transcript-ticket")
					// 	.setLabel(client.languages.__("buttons.transcript.text"))
					// 	.setEmoji(client.languages.__("buttons.transcript.emoji"))
					// 	.setStyle(client.languages.__("buttons.transcript.style")),
					new MessageButton()
						.setCustomId("btn-open-ticket")
						.setLabel(client.languages.__("buttons.open.text"))
						.setEmoji(client.languages.__("buttons.open.emoji"))
						.setStyle(client.languages.__("buttons.open.style")),
					new MessageButton()
						.setCustomId("btn-delete-ticket")
						.setLabel(client.languages.__("buttons.delete.text"))
						.setEmoji(client.languages.__("buttons.delete.emoji"))
						.setStyle(client.languages.__("buttons.delete.style"))
				)
			], content: ` <@${userData.ownerID}> Verder nog vragen? Nee, klik "Verwijder"`});
			
		} else if (buttonID === "claim-ticket-opn") {
			await interaction.deferUpdate();
			const userData = await dataTicket.findOne({
				guildID: interaction.guild.id,
				channelID: interaction.channel.id
			});
			if (!userData) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.channel_without_ticket"))
						.setColor("RED")
				], ephemeral: true});
			}
			if (userData.isClaimed) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.ticket_already_claimed"))
						.setColor("RED")
				], ephemeral: true});
			}

			interaction.channel.permissionOverwrites.edit(interaction.user.id, {
				MANAGE_CHANNELS: true,
				VIEW_CHANNEL: true
			});
			
			// userData.staffRoles.forEach((user) => {
			// 	interaction.channel.permissionOverwrites.edit((user), {
			// 		VIEW_CHANNEL: false
			// 	});
			// });

			interaction.channel.send({embeds: [
				new MessageEmbed()
					.setTitle("Ticket System \✅")
					.setDescription(client.languages.__mf("buttons.claim.messages.claimed_ticket", {
						user_mention: `<@${interaction.user.id}>`,
						user_id: interaction.user.id
					}))
					.setColor("GREEN")
			]});
			
			userData.isClaimed = true;
			userData.staffClaimed = interaction.user.id;
			await userData.save();
		} else if (buttonID === "transcript-ticket") {
			// Nee

		} else if (buttonID === "open-ticket") {
			await interaction.deferUpdate();
			const userData = await dataTicket.findOne({
				guildID: interaction.guild.id,
				channelID: interaction.channel.id
			});
			if (!userData) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.channel_without_ticket"))
						.setColor("RED")
				], ephemeral: true});
			}
			if (!userData.isClosed) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.ticket_already_open"))
						.setColor("RED")
				], ephemeral: true});
			}
			
			interaction.channel.permissionOverwrites.edit(userData.ownerID, {
				VIEW_CHANNEL: true
			});
			interaction.channel.send({embeds:[
				new MessageEmbed()
					.setTitle("Ticket System \✅")
					.setDescription(client.languages.__mf("buttons.open.messages.ticket_opened", {
						user_mention: `<@${interaction.user.id}>`,
						user_id: interaction.user.id,
						user_tag: interaction.user.tag
					}))
					.setColor("GREEN")
			]}).then(() => {
				interaction.message.delete();
				userData.isClosed = false;
				userData.save();
			});
		} else if (buttonID === "delete-ticket") {
			await interaction.deferUpdate();
			const userData = await dataTicket.findOne({
				guildID: interaction.guild.id,
				channelID: interaction.channel.id
			});
			if (!userData) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.channel_without_ticket"))
						.setColor("RED")
				], ephemeral: true});
			}
			if (!userData.isClosed) {
				return interaction.followUp({embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.ticket_not_closed"))
						.setColor("RED")
				], ephemeral: true});
			}
			interaction.channel.send({embeds: [
				new MessageEmbed()
					.setTitle("Ticket System \✅")
					.setDescription(client.languages.__mf("buttons.delete.messages.deleting_ticket", {
						time: "5"
					}))
					.setColor("RED")
			]}).then(() => {
				setTimeout(async () => {
					await interaction.channel.delete();
					userData.delete();
				}, 5000);
			});
		}
	}
});
